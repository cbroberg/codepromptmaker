import { notFound } from 'next/navigation';
import { findPromptById, findTagsByPromptId } from '@cpm/db';
import { PromptDetailView } from '@/components/prompt-detail-view';

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prompt = findPromptById(id);

  if (!prompt) {
    notFound();
  }

  const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);

  return (
    <div className="mx-auto max-w-3xl">
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
        createdAt={prompt.createdAt}
      />
    </div>
  );
}
