# Reset Password Page

Centered card password reset page with Layout wrapper. Validates reset code and username from URL parameters (?code=&username=). Features new password input with confirmation and show/hide toggle. Uses useAuth hook from auth-core for password reset.

## Exports

**Components:** ResetPasswordPage, default

## Usage

```tsx
import ResetPasswordPage from '@/modules/reset-password-page';

<ResetPasswordPage />

• Installed at: src/modules/reset-password-page/
• Customize text: src/modules/reset-password-page/lang/*.json
• Uses useAuth() hook from auth-core:
  const { resetPassword } = useAuth();
  await resetPassword(username, code, newPassword);
• Expects ?code= and ?username= URL parameters from email link
• Add to your router as a page component
```

## Dependencies

- auth-core
- api

