import { useState, useEffect, useCallback } from 'react';
import type { Project, UseProjectReturn } from '../types';

const STORAGE_KEY = 'eyay-projects';
const ACTIVE_PROJECT_KEY = 'eyay-active-project';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function loadActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

function saveActiveProjectId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

export function useProject(): UseProjectReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    const activeId = loadActiveProjectId();
    if (activeId && loaded.some(p => p.id === activeId)) {
      setActiveProjectIdState(activeId);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const createProject = useCallback((name: string, serviceId: string): Project => {
    const now = Date.now();
    const newProject: Project = {
      id: generateId(),
      name,
      serviceId,
      createdAt: now,
      updatedAt: now,
      currentPhase: 'idea',
      gateProgress: {},
      chainOutputs: {},
      notes: '',
    };
    setProjects(prev => {
      const updated = [...prev, newProject];
      saveProjects(updated);
      return updated;
    });
    setActiveProjectIdState(newProject.id);
    saveActiveProjectId(newProject.id);
    return newProject;
  }, []);

  const updateProject = useCallback((updates: Partial<Project>): void => {
    if (!activeProjectId) return;
    setProjects(prev => {
      const updated = prev.map(p =>
        p.id === activeProjectId ? { ...p, ...updates, updatedAt: Date.now() } : p
      );
      saveProjects(updated);
      return updated;
    });
  }, [activeProjectId]);

  const deleteProject = useCallback((projectId: string): void => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      saveProjects(updated);
      return updated;
    });
    if (activeProjectId === projectId) {
      setActiveProjectIdState(null);
      saveActiveProjectId(null);
    }
  }, [activeProjectId]);

  const setActiveProject = useCallback((projectId: string): void => {
    if (projects.some(p => p.id === projectId)) {
      setActiveProjectIdState(projectId);
      saveActiveProjectId(projectId);
    }
  }, [projects]);

  const exportProject = useCallback((projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? JSON.stringify(project, null, 2) : '';
  }, [projects]);

  const importProject = useCallback((json: string): Project | null => {
    try {
      const imported = JSON.parse(json) as Project;
      imported.id = generateId();
      imported.updatedAt = Date.now();
      setProjects(prev => {
        const updated = [...prev, imported];
        saveProjects(updated);
        return updated;
      });
      setActiveProjectIdState(imported.id);
      saveActiveProjectId(imported.id);
      return imported;
    } catch {
      return null;
    }
  }, []);

  return {
    projects,
    activeProject,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    exportProject,
    importProject,
  };
}
