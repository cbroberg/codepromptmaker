import { findAllPrompts, findTagsByPromptId } from '@cpm/db';
import { PromptCard } from '@/components/prompt-card';

export default function PromptsPage() {
  const allPrompts = findAllPrompts();

  const promptsWithTags = allPrompts.map((prompt) => {
    const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);
    return { ...prompt, tags };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Bank</h1>
        <p className="mt-2 text-muted-foreground">
          Your saved Prompt Contracts.
        </p>
      </div>

      {promptsWithTags.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No prompts yet. Generate your first Prompt Contract from the home page.
        </p>
      ) : (
        <div className="space-y-4">
          {promptsWithTags.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.description}
              tags={prompt.tags}
              createdAt={prompt.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
