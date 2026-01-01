import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'ac_token';
const REFRESH_TOKEN_COOKIE_NAME = 'ac_refresh_token';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Set auth tokens in HTTP-only cookies (server-side)
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    ...cookieOptions,
    maxAge: 60 * 15, // 15 minutes
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear auth cookies (logout)
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
}

/**
 * Get access token from cookie or Authorization header
 */
export async function getAccessToken(request?: NextRequest): Promise<string | null> {
  // First try Authorization header (for client-side requests during transition)
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
  }

  // Then try cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME);
  return token?.value || null;
}

/**
 * Get refresh token from cookie
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME);
  return token?.value || null;
}

/**
 * Helper to create error response
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    { success: false, error: { message } },
    { status }
  );
}

/**
 * Helper to create success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return Response.json({ success: true, data }, { status });
}
