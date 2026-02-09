'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '../layout';

interface Alert {
  id: string;
  name: string;
  conditionType: string;
  threshold: number;
  isActive: boolean;
  _count: { alertEvents: number };
  alertEvents: Array<{
    id: string;
    message: string;
    severity: string;
    resolved: boolean;
    triggeredAt: string;
  }>;
}

export default function AlertsPage() {
  const { projectId } = useProject();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!projectId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/alerts?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
      }
    } catch (e) {
      console.error('Alerts fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const conditionLabels: Record<string, string> = {
    response_time_avg: 'Avg Response Time',
    error_rate: 'Error Rate',
    request_count: 'Request Count',
    p95_latency: 'P95 Latency',
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Alert Rules</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
        >
          + Create Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <CreateAlertForm
          projectId={projectId}
          onCreated={() => {
            setShowCreate(false);
            fetchAlerts();
          }}
        />
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No alerts configured</h3>
          <p className="text-slate-600">Create an alert rule to get notified about anomalies in your API.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <h4 className="font-semibold text-slate-900">{alert.name}</h4>
                </div>
                <span className="text-sm text-slate-500">
                  {alert._count.alertEvents} events triggered
                </span>
              </div>
              <div className="text-sm text-slate-600 mb-3">
                Trigger when <strong>{conditionLabels[alert.conditionType] || alert.conditionType}</strong> exceeds{' '}
                <strong>{alert.threshold}</strong>
              </div>

              {/* Recent Alert Events */}
              {alert.alertEvents.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="text-xs font-medium text-slate-500 uppercase">Recent Events</div>
                  {alert.alertEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[event.severity] || severityColors.info}`}>
                          {event.severity}
                        </span>
                        <span className="text-slate-700">{event.message}</span>
                      </div>
                      <span className="text-slate-400 text-xs">
                        {new Date(event.triggeredAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateAlertForm({
  projectId,
  onCreated,
}: {
  projectId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [conditionType, setConditionType] = useState('response_time_avg');
  const [threshold, setThreshold] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          name,
          conditionType,
          threshold: parseFloat(threshold),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create alert');
        return;
      }

      onCreated();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alert Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
            placeholder="High latency alert"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
          <select
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
          >
            <option value="response_time_avg">Avg Response Time (ms)</option>
            <option value="error_rate">Error Rate (%)</option>
            <option value="request_count">Request Count</option>
            <option value="p95_latency">P95 Latency (ms)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Threshold</label>
          <input
            type="number"
            step="any"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
            placeholder="500"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Alert'}
        </button>
      </div>
    </form>
  );
}
