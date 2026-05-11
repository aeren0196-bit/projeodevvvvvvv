import { useCallback, useEffect, useRef } from "react";
import {
  useAuthStore,
  type User,
  type AuthTokens,
} from "./auth-store";
import { customerClient } from "@/modules/api";

// Refresh token 1 minute before expiry
const REFRESH_BUFFER_MS = 60 * 1000;

export function useAuth() {
  const {
    user,
    tokens,
    isAuthenticated,
    setAuth,
    updateTokens,
    clearAuth,
    isTokenExpired,
    getTimeUntilExpiry,
  } = useAuthStore();

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  // Refresh token using the refresh token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const currentTokens = useAuthStore.getState().tokens;

    // Don't refresh if no refresh token exists
    if (!currentTokens?.refreshToken || isRefreshingRef.current) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      // Use the typed refreshToken method
      const response = await customerClient.auth.refreshToken({
        refreshToken: currentTokens.refreshToken,
      });

      const { accessToken, refreshToken, expiresIn } = response;

      // Validate response has required data
      if (!accessToken) {
        return false;
      }

      const newTokens: AuthTokens = {
        accessToken,
        // Self-auth rotates refresh tokens — always use the new one
        refreshToken: refreshToken || currentTokens.refreshToken,
        idToken: currentTokens.idToken, // Preserve existing idToken
        encryptionKey: currentTokens.encryptionKey, // Preserve existing encryptionKey
        expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
      };

      customerClient.setToken(accessToken);
      updateTokens(newTokens);

      return true;
    } catch (error) {
      // Self-auth rotates refresh tokens — if refresh fails, the old token
      // is already invalidated. Clear auth and force re-login.
      customerClient.setToken(null);
      clearAuth();
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [updateTokens, clearAuth]);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const timeUntilExpiry = getTimeUntilExpiry();

    // Only schedule if we have an expiry time and a refresh token
    if (timeUntilExpiry === null || !tokens?.refreshToken) {
      return;
    }

    // Calculate when to refresh (REFRESH_BUFFER_MS before expiry)
    const refreshIn = Math.max(timeUntilExpiry - REFRESH_BUFFER_MS, 0);

    // Don't schedule if expiry is too far in the future (> 24 hours)
    if (refreshIn > 24 * 60 * 60 * 1000) {
      return;
    }

    refreshTimeoutRef.current = setTimeout(async () => {
      const success = await refreshAccessToken();
      if (success) {
        // Reschedule for the new token
        scheduleTokenRefresh();
      }
    }, refreshIn);
  }, [getTimeUntilExpiry, tokens?.refreshToken, refreshAccessToken]);

  // Sync token with API client and set up refresh on mount and token changes
  useEffect(() => {
    if (tokens?.accessToken) {
      customerClient.setToken(tokens.accessToken);

      // Only try to refresh if we have a refresh token AND token is expired
      if (isTokenExpired() && tokens.refreshToken) {
        refreshAccessToken().then((success) => {
          if (success) {
            scheduleTokenRefresh();
          }
        });
      } else if (tokens.refreshToken) {
        // Only schedule refresh if we have a refresh token
        scheduleTokenRefresh();
      }
    } else {
      customerClient.setToken(null);
    }

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [
    tokens?.accessToken,
    tokens?.refreshToken,
    isTokenExpired,
    refreshAccessToken,
    scheduleTokenRefresh,
  ]);

  // Set up axios interceptor for 401 responses (token expired during request)
  useEffect(() => {
    const interceptorId = customerClient.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip refresh for self-auth endpoints to prevent infinite loops
        const isAuthEndpoint = originalRequest?.url?.includes("/self-auth/");

        // If we get a 401 and haven't retried yet, try to refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          tokens?.refreshToken &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;

          const success = await refreshAccessToken();
          if (success) {
            // Retry the original request with new token
            const newTokens = useAuthStore.getState().tokens;
            if (newTokens?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return customerClient.axios(originalRequest);
            }
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      customerClient.axios.interceptors.response.eject(interceptorId);
    };
  }, [tokens?.refreshToken, refreshAccessToken]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await customerClient.auth.login({ username, password });

    const newTokens: AuthTokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      idToken: response.idToken,
      encryptionKey: response.encryptionKey,
      expiresAt: response.expiresIn
        ? Date.now() + response.expiresIn * 1000
        : undefined,
    };

    const newUser: User = {
      username,
    };

    customerClient.setToken(newTokens.accessToken);
    setAuth(newUser, newTokens);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await customerClient.auth.register({ username, email, password });
    },
    [],
  );

  const me = useCallback(async () => {
    return customerClient.auth.me();
  }, []);

  // TODO: Backend self-auth altinda implement edilince aktif edilecek
  const confirmEmail = useCallback(async (username: string, code: string) => {
    await customerClient.auth.confirm({ username, code });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await customerClient.auth.forgotPassword({ email });
  }, []);

  const resetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      await customerClient.auth.resetPassword({ email, code, newPassword });
    },
    [],
  );

  // TODO: Backend self-auth altinda implement edilince aktif edilecek
  const resendCode = useCallback(async (username: string) => {
    return customerClient.auth.resendCode({ username });
  }, []);

  const logout = useCallback(async () => {
    // Clear any scheduled refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Self-auth logout requires refresh_token in body
    const currentTokens = useAuthStore.getState().tokens;
    try {
      if (currentTokens?.refreshToken) {
        await customerClient.auth.logout({
          refreshToken: currentTokens.refreshToken,
        });
      }
    } catch {
      // Proceed with client-side cleanup even if backend call fails
    }

    customerClient.setToken(null);
    clearAuth();
  }, [clearAuth]);

  return {
    user,
    token: tokens?.accessToken ?? null,
    tokens,
    isAuthenticated,
    api: customerClient,
    login,
    register,
    me,
    confirmEmail,
    forgotPassword,
    resetPassword,
    resendCode,
    logout,
    refreshAccessToken,
  };
}
