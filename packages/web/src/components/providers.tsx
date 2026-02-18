'use client';

import { createContext, useContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

const AuthEnabledContext = createContext(false);

export function useAuthEnabled() {
  return useContext(AuthEnabledContext);
}

interface ProvidersProps {
  children: React.ReactNode;
  authEnabled?: boolean;
}

export function Providers({ children, authEnabled = false }: ProvidersProps) {
  const content = (
    <AuthEnabledContext.Provider value={authEnabled}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </AuthEnabledContext.Provider>
  );

  if (!authEnabled) return content;

  return <SessionProvider>{content}</SessionProvider>;
}
