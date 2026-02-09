'use client';

import { useState } from 'react';
import { useProject } from '@/lib/project-context';

export default function SettingsPage() {
  const { projectId, projects } = useProject();
  const currentProject = projects.find((p) => p.id === projectId);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyApiKey() {
    if (currentProject) {
      navigator.clipboard.writeText(currentProject.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Project Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              defaultValue={currentProject?.name || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono text-slate-600"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">API Key</h3>
        <p className="text-sm text-slate-600 mb-4">
          Use this API key to authenticate requests from your application SDK.
        </p>
        <div className="flex gap-2">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={currentProject?.apiKey || ''}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-mono bg-slate-50 text-slate-700"
            readOnly
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={copyApiKey}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* SDK Integration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Integration</h3>
        <p className="text-sm text-slate-600 mb-4">
          Add the following code to your application to start sending events:
        </p>
        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm">
            <code className="text-green-400">{'// Using fetch to send events\n'}</code>
            <code className="text-slate-300">{`fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/api/events', {\n`}</code>
            <code className="text-slate-300">{'  method: \'POST\',\n'}</code>
            <code className="text-slate-300">{'  headers: {\n'}</code>
            <code className="text-slate-300">{`    'x-api-key': '${showApiKey ? currentProject?.apiKey || 'YOUR_API_KEY' : 'YOUR_API_KEY'}',\n`}</code>
            <code className="text-slate-300">{'    \'Content-Type\': \'application/json\'\n'}</code>
            <code className="text-slate-300">{'  },\n'}</code>
            <code className="text-slate-300">{'  body: JSON.stringify({\n'}</code>
            <code className="text-slate-300">{'    method: \'GET\',\n'}</code>
            <code className="text-slate-300">{'    path: \'/api/users\',\n'}</code>
            <code className="text-slate-300">{'    statusCode: 200,\n'}</code>
            <code className="text-slate-300">{'    responseTimeMs: 45\n'}</code>
            <code className="text-slate-300">{'  })\n'}</code>
            <code className="text-slate-300">{'});\n'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
