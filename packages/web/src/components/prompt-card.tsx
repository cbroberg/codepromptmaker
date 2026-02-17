import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export function PromptCard({ id, title, description, tags, createdAt }: PromptCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/prompts/${id}`}>
      <Card className="transition-colors hover:border-foreground/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{date}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-3">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
