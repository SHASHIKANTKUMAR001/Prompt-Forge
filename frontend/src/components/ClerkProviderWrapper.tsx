import { ClerkProvider } from '@clerk/clerk-react';

// Clerk publishable key - this is a PUBLIC key, safe to embed in client code.
// Replace with your actual Clerk publishable key from https://dashboard.clerk.com
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!CLERK_PUBLISHABLE_KEY) {
    // Render children without Clerk if key is not configured
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

