'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { UserNav } from '@/components/user-nav';
import { OrgSwitcher } from '@/components/org-switcher';
import { getPageTitle } from '@/lib/nav-config';

function Crosshair({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className ?? ''}`}>
      {/* vertical line */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
      {/* horizontal line */}
      <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-border" />
    </div>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="relative flex h-12 shrink-0 items-center border-b border-border">
      <Crosshair className="-left-2 -bottom-2 w-4 h-4" />
      <Crosshair className="-right-2 -bottom-2 w-4 h-4" />
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {title && (
          <h1 className="text-sm font-semibold leading-none truncate">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2 px-4">
        <OrgSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
