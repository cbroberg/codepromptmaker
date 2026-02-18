import { getProfileByUserId } from '@cpm/db';
import { ProfileForm } from '@/components/profile-form';
import { getUserId } from '@/lib/get-user-id';
import type { DeveloperProfile } from '@cpm/shared';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const userId = await getUserId();
  const row = userId ? getProfileByUserId(userId) : null;
  const profile = row ? (row as DeveloperProfile) : null;

  return (
    <div className="animate-fade-in">
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
