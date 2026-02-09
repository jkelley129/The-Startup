'use client';

import { createContext, useContext } from 'react';

interface Project {
  id: string;
  name: string;
  apiKey: string;
}

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
