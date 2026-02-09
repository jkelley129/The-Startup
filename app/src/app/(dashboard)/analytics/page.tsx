'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/lib/project-context';

interface TimeseriesPoint {
  timestamp: string;
  value: number;
}

export default function AnalyticsPage() {
  const { projectId } = useProject();
  const [metric, setMetric] = useState('requests');
  const [period, setPeriod] = useState('24h');
  const [data, setData] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeseries = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `/api/analytics/timeseries?projectId=${projectId}&metric=${metric}&period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const json = await res.json();
        setData(json.timeseries);
      }
    } catch (e) {
      console.error('Timeseries fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId, metric, period]);

  useEffect(() => {
    fetchTimeseries();
  }, [fetchTimeseries]);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const metricLabels: Record<string, string> = {
    requests: 'Request Count',
    avg_response_time: 'Avg Response Time (ms)',
    error_rate: 'Error Rate (%)',
    p95_response_time: 'P95 Response Time (ms)',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
          {['requests', 'avg_response_time', 'error_rate', 'p95_response_time'].map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-4 py-2 text-sm font-medium transition ${
                metric === m
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>

        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
          {['1h', '6h', '24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 text-sm font-medium transition ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {metricLabels[metric]} — Last {period}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            No data available for this period
          </div>
        ) : (
          <div className="h-64 flex items-end gap-1">
            {data.map((point, i) => {
              const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 group relative"
                  title={`${new Date(point.timestamp).toLocaleString()}: ${point.value}`}
                >
                  <div
                    className="bg-primary-500 hover:bg-primary-600 rounded-t transition-all cursor-pointer"
                    style={{ height: `${Math.max(height, 1)}%` }}
                  ></div>
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap z-10">
                    {point.value} — {new Date(point.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Total" value={data.reduce((s, d) => s + d.value, 0)} />
          <SummaryCard
            title="Average"
            value={Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)}
          />
          <SummaryCard title="Peak" value={Math.max(...data.map((d) => d.value))} />
          <SummaryCard title="Data Points" value={data.length} />
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-xl font-bold text-slate-900">{value.toLocaleString()}</div>
    </div>
  );
}
