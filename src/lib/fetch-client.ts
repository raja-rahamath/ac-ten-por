/**
 * Client-side fetch helper for calling Next.js API routes
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class FetchError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Get stored access token from localStorage
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Fetch wrapper that handles auth and errors
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if not skipping auth
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new FetchError(
      response.status,
      data.error?.message || 'Request failed'
    );
  }

  return data;
}

// Auth API
export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }),

    register: (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone?: string;
    }) =>
      fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        skipAuth: true,
      }),

    logout: () =>
      fetchApi('/api/auth/logout', {
        method: 'POST',
      }),

    getProfile: () => fetchApi('/api/auth/me'),
  },

  requests: {
    getAll: (params?: { limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      const query = searchParams.toString();
      return fetchApi(`/api/requests${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => fetchApi(`/api/requests/${id}`),

    create: (data: {
      title: string;
      description?: string;
      complaintTypeId: string;
      priority: string;
      propertyId?: string;
    }) =>
      fetchApi('/api/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  complaintTypes: {
    getAll: () => fetchApi('/api/complaint-types'),
  },

  chat: {
    sendMessage: (data: { message: string; sessionId?: string; language?: string }) =>
      fetchApi('/api/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  public: {
    getServices: () =>
      fetchApi('/api/public/services', {
        skipAuth: true,
      }),
  },
};

export { FetchError };
