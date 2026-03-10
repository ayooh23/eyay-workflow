// src/hooks/useProject.ts
// Project state management with localStorage persistence

import { useState, useEffect, useCallback } from 'react';
import type { Project, UseProjectReturn } from '../types';

const STORAGE_KEY = 'eyay-projects';
const ACTIVE_PROJECT_KEY = 'eyay-active-project';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function loadActiveProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

function saveActiveProjectId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

export function useProject(): UseProjectReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    
    const activeId = loadActiveProjectId();
    if (activeId && loaded.some(p => p.id === activeId)) {
      setActiveProjectIdState(activeId);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
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
      const updated = prev.map(p => {
        if (p.id === activeProjectId) {
          return { ...p, ...updates, updatedAt: Date.now() };
        }
        return p;
      });
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
    if (!project) return '';
    return JSON.stringify(project, null, 2);
  }, [projects]);

  const importProject = useCallback((json: string): Project | null => {
    try {
      const imported = JSON.parse(json) as Project;
      // Generate new ID to avoid conflicts
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


// ═══════════════════════════════════════════════════════════════════════════
// src/hooks/usePhaseProgress.ts
// Decision gate progress tracking
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DecisionGate, UsePhaseProgressReturn } from '../types';

function getStorageKey(phaseId: string, serviceId: string, projectId?: string): string {
  const base = `eyay-gate-${phaseId}-${serviceId}`;
  return projectId ? `${base}-${projectId}` : base;
}

export function usePhaseProgress(
  gate: DecisionGate | undefined,
  projectId?: string
): UsePhaseProgressReturn {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const storageKey = gate ? getStorageKey(gate.phaseId, gate.serviceId, projectId) : null;

  // Load from localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCompletedItems(JSON.parse(stored));
      } else {
        setCompletedItems([]);
      }
    } catch {
      setCompletedItems([]);
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(completedItems));
  }, [completedItems, storageKey]);

  const toggleItem = useCallback((itemId: string) => {
    setCompletedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, []);

  const progress = useMemo(() => ({
    completed: completedItems.length,
    total: gate?.items.length || 0,
  }), [completedItems.length, gate?.items.length]);

  const isComplete = gate ? gate.items.every(item => completedItems.includes(item.id)) : false;

  const resetProgress = useCallback(() => {
    setCompletedItems([]);
  }, []);

  return {
    completedItems,
    toggleItem,
    isComplete,
    progress,
    resetProgress,
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// src/hooks/usePromptChain.ts
// Prompt chaining state management
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import type { ChainOutputs, Prompt, UsePromptChainReturn } from '../types';

function getStorageKey(phaseId: string, serviceId: string, projectId?: string): string {
  const base = `eyay-chain-${phaseId}-${serviceId}`;
  return projectId ? `${base}-${projectId}` : base;
}

export function usePromptChain(
  phaseId: string,
  serviceId: string,
  projectId?: string
): UsePromptChainReturn {
  const [outputs, setOutputs] = useState<ChainOutputs>({});

  const storageKey = getStorageKey(phaseId, serviceId, projectId);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setOutputs(JSON.parse(stored));
      } else {
        setOutputs({});
      }
    } catch {
      setOutputs({});
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (Object.keys(outputs).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(outputs));
    }
  }, [outputs, storageKey]);

  const setOutput = useCallback((promptId: string, output: string) => {
    setOutputs(prev => ({
      ...prev,
      [promptId]: output,
    }));
  }, []);

  const getOutput = useCallback((promptId: string): string | undefined => {
    return outputs[promptId];
  }, [outputs]);

  const getPreviousOutput = useCallback((
    currentPromptIndex: number,
    prompts: Prompt[]
  ): { promptTitle: string; output: string } | undefined => {
    // Look backwards for the most recent prompt with saved output
    for (let i = currentPromptIndex - 1; i >= 0; i--) {
      const prompt = prompts[i];
      const promptId = prompt.id || `prompt-${i}`;
      const output = outputs[promptId];
      if (output) {
        return {
          promptTitle: prompt.title,
          output,
        };
      }
    }
    return undefined;
  }, [outputs]);

  const clearChain = useCallback(() => {
    setOutputs({});
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    outputs,
    setOutput,
    getOutput,
    getPreviousOutput,
    clearChain,
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// src/hooks/index.ts
// Export all hooks
// ═══════════════════════════════════════════════════════════════════════════

export { useProject } from './useProject';
export { usePhaseProgress } from './usePhaseProgress';
export { usePromptChain } from './usePromptChain';
