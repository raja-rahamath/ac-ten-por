import { NextRequest } from 'next/server';
import { authApi } from '@/lib/api-client';
import { getAccessToken, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const response = await authApi.getProfile(token);
    return successResponse(response.data);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return errorResponse(
      error.message || 'Failed to get profile',
      error.statusCode || 500
    );
  }
}
