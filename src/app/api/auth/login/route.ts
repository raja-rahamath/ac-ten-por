import { NextRequest } from 'next/server';
import { authApi } from '@/lib/api-client';
import { setAuthCookies, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const response = await authApi.login(email, password);

    // Set HTTP-only cookies for tokens
    await setAuthCookies(response.data.accessToken, response.data.refreshToken);

    // Return user data (tokens are in cookies)
    return successResponse({
      user: response.data.user,
      // Also return tokens for backward compatibility during transition
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(
      error.message || 'Login failed',
      error.statusCode || 500
    );
  }
}
