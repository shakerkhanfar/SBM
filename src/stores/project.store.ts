import { create } from 'zustand';

import { TransformedProject } from '@/features/auth/types/projects.types';

interface ProjectState {
  projectsList: TransformedProject[] | null;
  selectedProject: TransformedProject | null;
  defaultApiKey: string | null;
  actions: {
    setProjectsList: (projects: TransformedProject[]) => void;
    setSelectedProject: (project: TransformedProject) => void;
    setDefaultApiKey: (apiKey: string | null) => void;
    clearProjects: () => void;
    clearDefaultApiKey: () => void;
    clearAll: () => void;
  };
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projectsList: null,
  selectedProject: null,
  defaultApiKey: null,
  actions: {
    setProjectsList: (projects) => set({ projectsList: projects }),
    setSelectedProject: (project) => set({ selectedProject: project }),
    setDefaultApiKey: (apiKey) => set({ defaultApiKey: apiKey }),
    clearProjects: () => set({ projectsList: null, selectedProject: null }),
    clearDefaultApiKey: () => set({ defaultApiKey: null }),
    clearAll: () =>
      set({ projectsList: null, selectedProject: null, defaultApiKey: null }),
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout-event', () => {
    useProjectStore.getState().actions.clearAll();
  });
}
