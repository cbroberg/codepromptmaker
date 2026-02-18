import { notFound } from 'next/navigation';
import { findPromptById, findTagsByPromptId } from '@cpm/db';
import { PromptDetailView } from '@/components/prompt-detail-view';
import { getUserId } from '@/lib/get-user-id';

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = (await getUserId()) ?? 'local';
  const { id } = await params;
  const prompt = findPromptById(id, userId);

  if (!prompt) {
    notFound();
  }

  const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);

  return (
    <div className="max-w-4xl animate-fade-in">
      <PromptDetailView
        id={prompt.id}
        title={prompt.title}
        description={prompt.description}
        fullPrompt={prompt.fullPrompt}
        goal={prompt.goal}
        constraints={prompt.constraints}
        format={prompt.format}
        failureConditions={prompt.failureConditions}
        language={prompt.language}
        tags={tags}
        rating={prompt.rating ?? null}
        notes={prompt.notes ?? null}
        profileId={prompt.profileId ?? null}
        createdAt={prompt.createdAt}
      />
    </div>
  );
}
