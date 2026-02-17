import { findAllPrompts, findTagsByPromptId, findPromptsWithoutEmbeddings, findAllDistinctTags } from '@cpm/db';
import { SemanticSearch } from '@/components/semantic-search';
import { BackfillBanner } from '@/components/backfill-banner';
import { PromptListClient } from '@/components/prompt-list-client';
import { Separator } from '@/components/ui/separator';

export default function PromptsPage() {
	const allPrompts = findAllPrompts();
	const unembeddedCount = findPromptsWithoutEmbeddings().length;
	const allTags = findAllDistinctTags();

	const promptsWithTags = allPrompts.map(({ embedding: _embedding, ...prompt }) => {
		const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);
		return { ...prompt, tags, rating: prompt.rating ?? null };
	});

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
				<p className="mt-2 text-muted-foreground">
					Your saved Prompt Contracts.
				</p>
			</div>

			<BackfillBanner count={unembeddedCount} />

			<SemanticSearch />

			<Separator />

			<PromptListClient prompts={promptsWithTags} allTags={allTags} />
		</div>
	);
}
