'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '../layout';

interface OverviewStats {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  changes: {
    requests: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

interface Endpoint {
  method: string;
  path: string;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
}

export default function DashboardPage() {
  const { projectId } = useProject();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, endpointsRes] = await Promise.all([
        fetch(`/api/analytics/overview?projectId=${projectId}`, { headers }),
        fetch(`/api/analytics/endpoints?projectId=${projectId}`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (endpointsRes.ok) {
        const data = await endpointsRes.json();
        setEndpoints(data.endpoints);
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={stats?.totalRequests?.toLocaleString() || '0'}
          change={stats?.changes?.requests || 0}
          suffix=" (24h)"
        />
        <StatCard
          title="Error Rate"
          value={`${stats?.errorRate || 0}%`}
          change={stats?.changes?.errorRate || 0}
          invertColor
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats?.avgResponseTime || 0}ms`}
          change={stats?.changes?.avgResponseTime || 0}
          invertColor
        />
        <StatCard
          title="P95 Response Time"
          value={`${stats?.p95ResponseTime || 0}ms`}
          change={0}
        />
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Top Endpoints (24h)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Endpoint</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Requests</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Error Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Avg Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">P95 Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {endpoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No API events recorded yet. Integrate the SDK to start tracking.
                  </td>
                </tr>
              ) : (
                endpoints.slice(0, 10).map((ep, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                        methodColors[ep.method] || 'bg-slate-100 text-slate-700'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-sm text-slate-900 font-mono">{ep.path}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-700">
                      {ep.totalRequests.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-sm">
                      <span className={ep.errorRate > 5 ? 'text-red-600 font-medium' : 'text-slate-700'}>
                        {ep.errorRate}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-700">
                      {ep.avgResponseTime}ms
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-700">
                      {ep.p95ResponseTime}ms
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

function StatCard({
  title,
  value,
  change,
  suffix,
  invertColor,
}: {
  title: string;
  value: string;
  change: number;
  suffix?: string;
  invertColor?: boolean;
}) {
  const isPositive = invertColor ? change <= 0 : change >= 0;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-sm text-slate-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-900">
        {value}
        {suffix && <span className="text-sm font-normal text-slate-500">{suffix}</span>}
      </div>
      {change !== 0 && (
        <div className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}% vs previous period
        </div>
      )}
    </div>
  );
}
