import { Sparkles, FileText, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Create',
    items: [
      { title: 'Generate Prompt Contract', href: '/generate', icon: Sparkles },
    ],
  },
  {
    label: 'Library',
    items: [
      { title: 'Prompts', href: '/prompts', icon: FileText },
    ],
  },
  {
    label: 'Settings',
    items: [
      { title: 'Developer Profile', href: '/profile', icon: UserCog },
    ],
  },
];

/** Look up page title from pathname */
export function getPageTitle(pathname: string): string | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        if (pathname !== item.href && item.href === '/prompts') {
          return 'Prompt Detail';
        }
        return item.title;
      }
    }
  }
  return null;
}
