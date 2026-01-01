import { NextRequest } from 'next/server';
import { serviceRequestsApi } from '@/lib/api-client';
import { getAccessToken, errorResponse, successResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');

    const response = await serviceRequestsApi.getAll(token, {
      limit: limit ? parseInt(limit) : undefined,
      status: status || undefined,
    });

    return successResponse(response.data, 200);
  } catch (error: any) {
    console.error('Get requests error:', error);
    return errorResponse(
      error.message || 'Failed to fetch requests',
      error.statusCode || 500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { title, description, complaintTypeId, priority, propertyId } = body;

    if (!title || !complaintTypeId || !priority) {
      return errorResponse('Title, complaint type, and priority are required', 400);
    }

    const response = await serviceRequestsApi.create(token, {
      title,
      description,
      complaintTypeId,
      priority,
      propertyId,
    });

    return successResponse(response.data, 201);
  } catch (error: any) {
    console.error('Create request error:', error);
    return errorResponse(
      error.message || 'Failed to create request',
      error.statusCode || 500
    );
  }
}
