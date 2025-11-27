'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@agentcare/ui';

interface ComplaintType {
  id: string;
  name: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([
    { id: 'cmig5s2o7000vx4l3nm9n6umz', name: 'Plumbing' },
    { id: 'cmig5s2o7000xx4l39b7mvagf', name: 'AC Maintenance' },
    { id: 'cmig5s2o7000yx4l3t4qh7ijr', name: 'Electrical' },
  ]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:4001/api/v1/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          complaintTypeId: formData.get('complaintTypeId'),
          priority: formData.get('priority'),
          customerId: 'demo-customer-001', // In real app, get from context
          propertyId: 'demo-property-1',
          zoneId: 'ZONE-JUF',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create request');
      }

      router.push(`/requests/${data.data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold">New Service Request</h1>

      <div className="rounded-xl bg-white p-8 shadow-sm">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-2 block font-medium">
              What do you need help with?
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., AC not cooling, Leaking faucet"
            />
          </div>

          <div>
            <label htmlFor="complaintTypeId" className="mb-2 block font-medium">
              Service Type
            </label>
            <select
              id="complaintTypeId"
              name="complaintTypeId"
              required
              className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select a service type</option>
              {complaintTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="mb-2 block font-medium">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="LOW">Low - Can wait a few days</option>
              <option value="MEDIUM">Medium - Within 24-48 hours</option>
              <option value="HIGH">High - Same day if possible</option>
              <option value="URGENT">Urgent - Emergency service needed</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Please describe the issue in detail..."
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
