import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
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
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
