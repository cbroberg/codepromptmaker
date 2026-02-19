'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Machine Size Tiers (Fly.io) ──────────────────────────────────────────

const MACHINE_SIZES = [
  { value: 'free', label: 'Free', specs: 'Development only', price: '$0' },
  { value: 'micro', label: 'Micro', specs: '1 shared CPU / 256MB', price: '~$2/mo' },
  { value: 'small', label: 'Small', specs: '1 shared CPU / 1GB', price: '~$7/mo' },
  { value: 'medium', label: 'Medium', specs: '2 shared CPU / 2GB', price: '~$15/mo' },
  { value: 'large', label: 'Large', specs: '4 shared CPU / 4GB', price: '~$31/mo' },
  { value: 'xl', label: 'XL', specs: '1 dedicated CPU / 2GB', price: '~$32/mo' },
] as const;

// ─── Regions ───────────────────────────────────────────────────────────────

const REGIONS = [
  { value: 'iad', label: 'US East (Virginia)', flag: '🇺🇸' },
  { value: 'lax', label: 'US West (Los Angeles)', flag: '🇺🇸' },
  { value: 'ams', label: 'Europe West (Amsterdam)', flag: '🇳🇱' },
  { value: 'fra', label: 'Europe Central (Frankfurt)', flag: '🇩🇪' },
  { value: 'arn', label: 'Europe North (Stockholm)', flag: '🇸🇪' },
  { value: 'lhr', label: 'Europe (London)', flag: '🇬🇧' },
  { value: 'sin', label: 'Asia Pacific (Singapore)', flag: '🇸🇬' },
  { value: 'gru', label: 'South America (Sao Paulo)', flag: '🇧🇷' },
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string | null;
  machineSize: string;
  region: string;
  status: string;
  promptCount: number;
}

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isPersonal: boolean;
  role: string;
}

interface ProjectsContentProps {
  org: Org;
  initialProjects: Project[];
}

// ─── Cookie helper ─────────────────────────────────────────────────────────

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ProjectsContent({ org, initialProjects }: ProjectsContentProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMachineSize, setNewMachineSize] = useState('free');
  const [newRegion, setNewRegion] = useState('arn');

  const enterProject = useCallback((project: Project) => {
    setCookie('cpm-project', project.id);
    window.dispatchEvent(new CustomEvent('cpm-project-change', { detail: project.id }));
    router.push('/generate');
  }, [router]);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [projects, search]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: org.id,
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          machineSize: newMachineSize,
          region: newRegion,
        }),
      });
      if (res.ok) {
        resetForm();
        setDialogOpen(false);
        // Refresh project list
        const listRes = await fetch(`/api/projects?orgId=${org.id}`);
        if (listRes.ok) {
          setProjects(await listRes.json());
        }
      }
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setNewName('');
    setNewDescription('');
    setNewMachineSize('free');
    setNewRegion('arn');
  }

  const regionLabel = (code: string) => REGIONS.find((r) => r.value === code);
  const machineSizeLabel = (value: string) => MACHINE_SIZES.find((m) => m.value === value);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New project
        </Button>
      </div>

      {projects.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 && !search && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderKanban className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No projects yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Create your first project to get started.</p>
          <Button size="sm" className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <button
            key={project.id}
            onClick={() => enterProject(project)}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{project.name}</p>
                {project.description && (
                  <p className="truncate text-xs text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs uppercase">
                {project.status}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase">
                {machineSizeLabel(project.machineSize)?.label ?? project.machineSize}
              </Badge>
              {regionLabel(project.region) && (
                <span className="text-xs text-muted-foreground">
                  {regionLabel(project.region)!.flag} {regionLabel(project.region)!.value.toUpperCase()}
                </span>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                {project.promptCount}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="text-sm text-muted-foreground">No projects matching &ldquo;{search}&rdquo;</p>
      )}

      {/* ─── Create Project Dialog ──────────────────────────────────────── */}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Organization (read-only) */}
            <div className="grid gap-2">
              <Label>Organization</Label>
              <p className="text-sm text-muted-foreground">{org.isPersonal ? 'Personal' : org.name}</p>
            </div>

            {/* Project name */}
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="My Awesome App"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="project-description">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="project-description"
                placeholder="A brief description of your project..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Machine size */}
            <div className="grid gap-2">
              <Label>Machine size</Label>
              <Select value={newMachineSize} onValueChange={setNewMachineSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MACHINE_SIZES.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      <span className="font-medium">{tier.label}</span>
                      <span className="ml-2 text-muted-foreground">{tier.specs}</span>
                      <span className="ml-2 text-muted-foreground">{tier.price}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="grid gap-2">
              <Label>Region</Label>
              <Select value={newRegion} onValueChange={setNewRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <span className="mr-2">{r.flag}</span>
                      <span>{r.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Create project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
