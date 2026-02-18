'use client';

import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthEnabled } from '@/components/providers';

function AccountTabInner() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Not signed in.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const user = session.user;
  const initials = (user.name ?? user.email ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your account information from your OAuth provider.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Plan</p>
            <p className="text-sm text-muted-foreground">Your current subscription plan</p>
          </div>
          <Badge variant="secondary">Free</Badge>
        </div>

        <Separator />

        <div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountTab() {
  const authEnabled = useAuthEnabled();

  if (!authEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Running in local mode — no authentication configured.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <AccountTabInner />;
}
