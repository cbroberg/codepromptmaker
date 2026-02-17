import { getFirstProfile } from '@cpm/db';
import { PromptGenerator } from '@/components/prompt-generator';

export default function HomePage() {
  const profile = getFirstProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Prompt Contract</h1>
        <p className="mt-2 text-muted-foreground">
          Describe what you want Claude Code to build, and get a structured Prompt Contract.
        </p>
      </div>
      <PromptGenerator profileId={profile?.id ?? null} />
    </div>
  );
}
