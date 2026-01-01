import { clearAuthCookies, successResponse } from '@/lib/auth';

export async function POST() {
  await clearAuthCookies();
  return successResponse({ message: 'Logged out successfully' });
}
