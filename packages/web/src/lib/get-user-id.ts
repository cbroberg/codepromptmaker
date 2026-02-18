import { auth } from '@/lib/auth';
import { isAuthEnabled, LOCAL_USER_ID } from '@/lib/auth-mode';

export async function getUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return LOCAL_USER_ID;
  const session = await auth();
  return session?.user?.id ?? null;
}
