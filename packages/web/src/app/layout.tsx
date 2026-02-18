import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsent } from '@/components/cookie-consent';
import { isAuthEnabled } from '@/lib/auth-mode';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodePromptMaker',
  description: 'Transform descriptions into Prompt Contracts for Claude Code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers authEnabled={isAuthEnabled()}>
          {children}
          <CookieConsent />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
