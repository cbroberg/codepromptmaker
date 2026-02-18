'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown, Check, Plus, LayoutDashboard } from 'lucide-react';
import { useAuthEnabled } from '@/components/providers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Org {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

function OrgSwitcherInner() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const data: Org[] = await res.json();
        setOrgs(data);

        // Restore from cookie or default to personal
        const saved = getCookie('cpm-org');
        const match = data.find((o) => o.id === saved);
        if (match) {
          setCurrentOrgId(match.id);
        } else {
          const personal = data.find((o) => o.isPersonal);
          if (personal) {
            setCurrentOrgId(personal.id);
            setCookie('cpm-org', personal.id);
          }
        }
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  // Listen for org changes from other components (e.g. dashboard cards)
  useEffect(() => {
    function handleOrgChange(e: Event) {
      const orgId = (e as CustomEvent).detail as string;
      setCurrentOrgId(orgId);
    }
    function handleOrgCreated() {
      fetchOrgs();
    }
    window.addEventListener('cpm-org-change', handleOrgChange);
    window.addEventListener('cpm-org-created', handleOrgCreated);
    return () => {
      window.removeEventListener('cpm-org-change', handleOrgChange);
      window.removeEventListener('cpm-org-created', handleOrgCreated);
    };
  }, [fetchOrgs]);

  if (!loaded || orgs.length === 0) return null;

  const current = orgs.find((o) => o.id === currentOrgId);
  const displayName = current?.isPersonal ? 'Personal' : (current?.name ?? 'Select org');

  function handleSelect(org: Org) {
    setCurrentOrgId(org.id);
    setCookie('cpm-org', org.id);
    window.dispatchEvent(new CustomEvent('cpm-org-change', { detail: org.id }));
    router.push('/generate');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[120px] truncate">{displayName}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {orgs.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => handleSelect(org)}>
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{org.isPersonal ? 'Personal' : org.name}</span>
            {org.id === currentOrgId && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
          All Organizations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
          New organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrgSwitcher() {
  const authEnabled = useAuthEnabled();
  if (!authEnabled) return null;
  return <OrgSwitcherInner />;
}
