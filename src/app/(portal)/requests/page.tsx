'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@agentcare/ui';

interface ServiceRequest {
  id: string;
  requestNo: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  complaintType?: {
    name: string;
  };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:4001/api/v1/service-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

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
      LOW: 'text-gray-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Service Requests</h1>
        <Button asChild>
          <Link href="/requests/new">+ New Request</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">No requests found</p>
            <Button asChild>
              <Link href="/requests/new">Create a new request</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="block p-6 transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{request.title}</h3>
                      <span className={`text-sm ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{request.requestNo}</span>
                      {request.complaintType && <span>{request.complaintType.name}</span>}
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
