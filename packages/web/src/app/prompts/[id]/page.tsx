export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold tracking-tight">Prompt Detail</h1>
      <p className="mt-4 text-muted-foreground">Prompt ID: {id}</p>
    </main>
  );
}
