import { NextRequest } from 'next/server';
import { chatApi } from '@/lib/api-client';
import { getAccessToken, errorResponse, successResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { message, sessionId, language } = body;

    if (!message) {
      return errorResponse('Message is required', 400);
    }

    const response = await chatApi.sendMessage(token, {
      message,
      sessionId,
      language,
    });

    return successResponse({
      sessionId: response.session_id,
      response: response.response,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return errorResponse(
      error.message || 'Failed to send message',
      error.statusCode || 500
    );
  }
}
