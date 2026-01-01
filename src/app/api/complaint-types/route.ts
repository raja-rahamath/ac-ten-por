import { NextRequest } from 'next/server';
import { complaintTypesApi } from '@/lib/api-client';
import { getAccessToken, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const response = await complaintTypesApi.getAll(token);
    return successResponse(response.data);
  } catch (error: any) {
    console.error('Get complaint types error:', error);
    return errorResponse(
      error.message || 'Failed to fetch complaint types',
      error.statusCode || 500
    );
  }
}
