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
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:4001/api/v1/service-requests?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
        const total = data.pagination.total;
        const open = data.data.filter((r: any) => r.status === 'NEW').length;
        const inProgress = data.data.filter((r: any) => ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length;
        const completed = data.data.filter((r: any) => r.status === 'COMPLETED').length;
        setStats({ total, open, inProgress, completed });
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/requests/new">+ New Request</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <StatCard title="Total Requests" value={stats.total} icon="📋" />
        <StatCard title="Open" value={stats.open} icon="🔵" />
        <StatCard title="In Progress" value={stats.inProgress} icon="🟡" />
        <StatCard title="Completed" value={stats.completed} icon="🟢" />
      </div>

      {/* Recent Requests */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Recent Service Requests</h2>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-gray-500">No service requests yet</p>
            <Button asChild>
              <Link href="/requests/new">Create your first request</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="block rounded-lg border p-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-gray-500">{request.requestNo}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {requests.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/requests" className="text-sm text-primary hover:underline">
              View all requests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
}
