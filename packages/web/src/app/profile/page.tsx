import { getFirstProfile } from '@cpm/db';
import { ProfileForm } from '@/components/profile-form';
import type { DeveloperProfile } from '@cpm/shared';

export default function ProfilePage() {
  const row = getFirstProfile();
  const profile = row ? (row as DeveloperProfile) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Configure your stack, rules, and preferences. These get injected into every Prompt Contract.
        </p>
      </div>
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
