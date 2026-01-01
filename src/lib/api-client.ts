/**
 * API Client for server-side calls to Tenant API
 * Used by Next.js API routes (BFF layer)
 */

const TENANT_API_URL = process.env.TENANT_API_URL || 'http://localhost:4001';
const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8003';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.message || 'Request failed',
      data.error?.code
    );
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async (token: string) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/auth/me`, {
      token,
    });
  },

  refreshToken: async (refreshToken: string) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// Service Requests API
export const serviceRequestsApi = {
  getAll: async (token: string, params?: { limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `${TENANT_API_URL}/api/v1/service-requests${queryString ? `?${queryString}` : ''}`;

    return fetchWithAuth(url, { token });
  },

  getById: async (token: string, id: string) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/service-requests/${id}`, {
      token,
    });
  },

  create: async (
    token: string,
    data: {
      title: string;
      description?: string;
      complaintTypeId: string;
      priority: string;
      propertyId?: string;
    }
  ) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/service-requests`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },
};

// Complaint Types API
export const complaintTypesApi = {
  getAll: async (token: string) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/complaint-types`, {
      token,
    });
  },
};

// Properties API
export const propertiesApi = {
  getMyProperties: async (token: string) => {
    return fetchWithAuth(`${TENANT_API_URL}/api/v1/properties/my`, {
      token,
    });
  },
};

// Chat API (to AI service)
export const chatApi = {
  sendMessage: async (
    token: string,
    data: {
      message: string;
      sessionId?: string;
      language?: string;
    }
  ) => {
    return fetchWithAuth(`${AI_API_URL}/api/v1/chat`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        message: data.message,
        session_id: data.sessionId,
        language: data.language || 'en',
      }),
    });
  },

  getSessionHistory: async (token: string, sessionId: string) => {
    return fetchWithAuth(`${AI_API_URL}/api/v1/chat/session/${sessionId}`, {
      token,
    });
  },
};

export { ApiError };
