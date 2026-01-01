import { NextRequest } from 'next/server';
import { authApi } from '@/lib/api-client';
import { setAuthCookies, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone } = body;

    if (!firstName || !lastName || !email || !password) {
      return errorResponse('All fields are required', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    const response = await authApi.register({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    // Set HTTP-only cookies for tokens
    await setAuthCookies(response.data.accessToken, response.data.refreshToken);

    // Return user data
    return successResponse({
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return errorResponse(
      error.message || 'Registration failed',
      error.statusCode || 500
    );
  }
}
