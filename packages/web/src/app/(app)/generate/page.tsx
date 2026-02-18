import { getFirstProfile } from '@cpm/db';
import { PromptGenerator } from '@/components/prompt-generator';

export default function HomePage() {
  const profile = getFirstProfile();

  return (
    <div className="max-w-5xl animate-fade-in">
      <PromptGenerator profileId={profile?.id ?? null} />
    </div>
  );
}
