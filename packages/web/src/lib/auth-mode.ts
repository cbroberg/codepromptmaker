export function isAuthEnabled(): boolean {
  if (process.env.CPM_LOCAL === '1') return false;
  return !!process.env.AUTH_SECRET;
}

export const LOCAL_USER_ID = 'local';
