// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Service Request types
export interface ServiceRequest {
  id: string;
  requestNo: string;
  title: string;
  description?: string;
  status: ServiceRequestStatus;
  priority: Priority;
  source: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  propertyId?: string;
  zoneId?: string;
  property?: {
    id: string;
    name: string;
    address?: string;
  };
  complaintType?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

export type ServiceRequestStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CreateServiceRequestInput {
  title: string;
  description?: string;
  complaintTypeId: string;
  priority: Priority;
  propertyId?: string;
}

// Complaint Type
export interface ComplaintType {
  id: string;
  name: string;
  description?: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
}
