# Register Page

Centered card registration page with Layout wrapper. Features username, email, password fields with confirmation, success state after registration. Uses useAuth hook from auth-core for API calls.

## Exports

**Components:** RegisterPage, default

## Usage

```tsx
import RegisterPage from '@/modules/register-page';

<RegisterPage />

• Installed at: src/modules/register-page/
• Customize text: src/modules/register-page/lang/*.json
• Uses useAuth() hook from auth-core:
  const { register } = useAuth();
  await register(username, email, password);
• Shows success state after registration
• Redirects authenticated users to home
• Add to your router as a page component
```

## Dependencies

- auth-core
- api

