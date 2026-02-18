import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card className="bg-card border-border hover:border-indigo-500/30 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {rating != null && (
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
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
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
