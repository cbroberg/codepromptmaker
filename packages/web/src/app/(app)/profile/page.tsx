import { getFirstProfile } from '@cpm/db';
import { ProfileForm } from '@/components/profile-form';
import type { DeveloperProfile } from '@cpm/shared';

export default function ProfilePage() {
  const row = getFirstProfile();
  const profile = row ? (row as DeveloperProfile) : null;

  return (
    <div className="animate-fade-in">
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
