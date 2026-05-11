export function getErrorMessage(
  err: unknown,
  fallback: string = "An error occurred",
): string {
  if (err && typeof err === "object") {
    const e = err as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };
    return (
      e.response?.data?.message ||
      e.response?.data?.error ||
      e.message ||
      fallback
    );
  }
  return fallback;
}
