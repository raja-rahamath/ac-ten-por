import { NextRequest } from 'next/server';
import { serviceRequestsApi } from '@/lib/api-client';
import { getAccessToken, errorResponse, successResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAccessToken(request);

    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const response = await serviceRequestsApi.getById(token, id);

    return successResponse(response.data);
  } catch (error: any) {
    console.error('Get request detail error:', error);
    return errorResponse(
      error.message || 'Failed to fetch request',
      error.statusCode || 500
    );
  }
}
