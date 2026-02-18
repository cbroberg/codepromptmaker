import { findAllPrompts, findTagsByPromptId, findPromptsWithoutEmbeddings, findAllDistinctTags } from '@cpm/db';
import { SemanticSearch } from '@/components/semantic-search';
import { BackfillBanner } from '@/components/backfill-banner';
import { PromptListClient } from '@/components/prompt-list-client';
import { Separator } from '@/components/ui/separator';
import { getUserId } from '@/lib/get-user-id';

export const dynamic = 'force-dynamic';

export default async function PromptsPage() {
	const userId = (await getUserId()) ?? 'local';
	const allPrompts = findAllPrompts(userId);
	const unembeddedCount = findPromptsWithoutEmbeddings(userId).length;
	const allTags = findAllDistinctTags(userId);

	const promptsWithTags = allPrompts.map(({ embedding: _embedding, ...prompt }) => {
		const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);
		return { ...prompt, tags, rating: prompt.rating ?? null };
	});

	return (
		<div className="max-w-4xl space-y-6 animate-fade-in">
			<BackfillBanner count={unembeddedCount} />

			<SemanticSearch />

			<Separator />

			<PromptListClient prompts={promptsWithTags} allTags={allTags} />
		</div>
	);
}
