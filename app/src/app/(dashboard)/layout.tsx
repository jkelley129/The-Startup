'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  apiKey: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchProjects = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        if (data.projects.length > 0 && !currentProject) {
          setCurrentProject(data.projects[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  }, [currentProject]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchProjects(token);
  }, [router, fetchProjects]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/alerts', label: 'Alerts', icon: '🔔' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-200 flex-shrink-0`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-slate-900">PulseAI</span>}
          </Link>
        </div>

        {/* Project Selector */}
        {sidebarOpen && projects.length > 0 && (
          <div className="p-4 border-b border-slate-200">
            <select
              value={currentProject}
              onChange={(e) => setCurrentProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname === item.href
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-700 text-sm w-full text-left px-3 py-2"
          >
            {sidebarOpen ? '◀ Collapse' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {navItems.find((i) => i.href === pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700 transition"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {projects.length === 0 ? (
            <EmptyState onProjectCreated={() => fetchProjects(localStorage.getItem('token') || '')} />
          ) : (
            <ProjectContext.Provider value={{ projectId: currentProject, projects }}>
              {children}
            </ProjectContext.Provider>
          )}
        </main>
      </div>
    </div>
  );
}

// Project Context
import { createContext, useContext } from 'react';

interface ProjectContextType {
  projectId: string;
  projects: Project[];
}

export const ProjectContext = createContext<ProjectContextType>({
  projectId: '',
  projects: [],
});

export function useProject() {
  return useContext(ProjectContext);
}

// Empty State Component
function EmptyState({ onProjectCreated }: { onProjectCreated: () => void }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName('');
        onProjectCreated();
      }
    } catch (e) {
      console.error('Failed to create project:', e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your first project</h2>
        <p className="text-slate-600 mb-6">
          Set up a project to start monitoring your API. You&apos;ll get an API key to integrate with your app.
        </p>
        <form onSubmit={createProject} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My API Project"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
