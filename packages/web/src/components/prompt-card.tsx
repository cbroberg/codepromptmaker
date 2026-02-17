import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  rating?: number | null;
  createdAt: string;
}

export function PromptCard({ id, title, description, tags, rating, createdAt }: PromptCardProps) {
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
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {rating != null && (
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              )}
              <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
            </div>
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
