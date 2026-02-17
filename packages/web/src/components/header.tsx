import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-lg font-bold">CPM</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Generate
          </Link>
          <Link
            href="/prompts"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Prompt Bank
          </Link>
          <Link
            href="/profile"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Profile
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
