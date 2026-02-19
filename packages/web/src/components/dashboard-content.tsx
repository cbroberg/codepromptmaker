'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Search, FolderKanban, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isPersonal: boolean;
  role: string;
  projectCount: number;
}

interface DashboardContentProps {
  initialOrgs: Org[];
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function DashboardContent({ initialOrgs }: DashboardContentProps) {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  const enterOrg = useCallback((org: Org) => {
    setCookie('cpm-org', org.id);
    // Clear any previously selected project when entering a new org
    document.cookie = 'cpm-project=;path=/;max-age=0';
    window.dispatchEvent(new CustomEvent('cpm-org-change', { detail: org.id }));
    router.push('/dashboard');
    router.refresh();
  }, [router]);

  const filtered = useMemo(() => {
    if (!search) return orgs;
    const q = search.toLowerCase();
    return orgs.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.slug.toLowerCase().includes(q),
    );
  }, [orgs, search]);

  async function handleCreate() {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      if (res.ok) {
        setNewOrgName('');
        setDialogOpen(false);
        // Refresh org list
        const listRes = await fetch('/api/organizations');
        if (listRes.ok) {
          setOrgs(await listRes.json());
        }
        // Notify org switcher to refresh
        window.dispatchEvent(new CustomEvent('cpm-org-created'));
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Organizations</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New organization
        </Button>
      </div>

      {orgs.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((org) => (
          <button
            key={org.id}
            onClick={() => enterOrg(org)}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{org.name}</p>
                <p className="truncate text-xs text-muted-foreground">{org.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {org.plan}
              </Badge>
              {org.isPersonal && (
                <Badge variant="outline" className="text-xs">
                  <Crown className="mr-1 h-3 w-3" />
                  Personal
                </Badge>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <FolderKanban className="h-3 w-3" />
                {org.projectCount}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="text-sm text-muted-foreground">No organizations matching &ldquo;{search}&rdquo;</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create organization</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                placeholder="My Team"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newOrgName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
