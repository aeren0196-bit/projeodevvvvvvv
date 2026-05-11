# Login Page

Login page with username/password form, forgot password link, and create account link. Centered card layout with responsive design. Uses useAuth hook from auth-core for authentication.

## Exports

**Components:** LoginPage, default

## Usage

```tsx
import LoginPage from '@/modules/login-page';

<LoginPage />

• Installed at: src/modules/login-page/
• Customize text: src/modules/login-page/lang/*.json
• Uses useAuth() hook from auth-core:
  const { login } = useAuth();
  await login(username, password);
• On success, redirects to previous page or home
• Add to your router as a page component
```

## Dependencies

- auth-core
- api

