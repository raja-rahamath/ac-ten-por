'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@agentcare/ui';

interface ServiceRequest {
  id: string;
  requestNo: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  property?: { name: string; address?: string };
  complaintType?: { name: string };
  assignedTo?: { firstName: string; lastName: string };
  timeline?: { id: string; action: string; description: string; createdAt: string }[];
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  async function fetchRequest() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:4001/api/v1/service-requests/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setRequest(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getPriorityColor(priority: string) {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  function getStatusStep(status: string) {
    const steps = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    return steps.indexOf(status);
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  if (!request) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="mb-4 text-gray-500">Request not found</p>
        <Button asChild>
          <Link href="/requests">Back to Requests</Link>
        </Button>
      </div>
    );
  }

  const statusSteps = [
    { key: 'NEW', label: 'Submitted' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
  ];
  const currentStep = getStatusStep(request.status);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold">{request.requestNo}</h1>
          <p className="text-gray-500">{request.title}</p>
        </div>
      </div>

      {/* Status Progress */}
      {request.status !== 'CANCELLED' && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Request Status</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                      index <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <p className={`mt-2 text-sm ${index <= currentStep ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`mx-2 h-1 flex-1 ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Request Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p className="whitespace-pre-wrap">{request.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Priority</label>
                  <p>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Type</label>
                  <p>{request.complaintType?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Submitted</label>
                  <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
            {request.timeline && request.timeline.length > 0 ? (
              <div className="space-y-4">
                {request.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                      {index < request.timeline!.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No timeline events</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property */}
          {request.property && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Property</h3>
              <p className="font-medium">{request.property.name}</p>
              {request.property.address && (
                <p className="text-sm text-gray-500">{request.property.address}</p>
              )}
            </div>
          )}

          {/* Assigned Technician */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Assigned Technician</h3>
            {request.assignedTo ? (
              <p className="font-medium">
                {request.assignedTo.firstName} {request.assignedTo.lastName}
              </p>
            ) : (
              <p className="text-gray-500">Not yet assigned</p>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Need Help?</h3>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/chat">Chat with AI Assistant</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
