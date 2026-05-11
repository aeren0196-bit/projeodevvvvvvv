# Forgot Password Page

Centered card password recovery page with Layout wrapper. Two-step flow: request reset code then enter code with new password. Uses useAuth hook from auth-core for API calls.

## Exports

**Components:** ForgotPasswordPage, default

## Usage

```tsx
import ForgotPasswordPage from '@/modules/forgot-password-page';

<ForgotPasswordPage />

• Installed at: src/modules/forgot-password-page/
• Customize text: src/modules/forgot-password-page/lang/*.json
• Uses useAuth() hook from auth-core:
  const { forgotPassword, resetPassword } = useAuth();
  await forgotPassword(username);
  await resetPassword(username, code, newPassword);
• Two-step flow: request code -> enter code with new password
• Add to your router as a page component
```

## Dependencies

- auth-core
- api

