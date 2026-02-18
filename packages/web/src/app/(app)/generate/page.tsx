import { getProfileByUserId } from '@cpm/db';
import { PromptGenerator } from '@/components/prompt-generator';
import { getUserId } from '@/lib/get-user-id';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const userId = (await getUserId()) ?? 'local';
  const profile = getProfileByUserId(userId);

  return (
    <div className="max-w-5xl animate-fade-in">
      <PromptGenerator profileId={profile?.id ?? null} />
    </div>
  );
}
