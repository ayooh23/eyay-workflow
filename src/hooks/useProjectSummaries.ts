import { useState, useCallback } from 'react';
import type { Project } from '../types';
import {
  generateSummaryForProject,
  type GeneratedProjectSummary,
} from '../lib/generateSummary';

const CACHE_KEY = 'eyay-project-summaries';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedSummary extends GeneratedProjectSummary {
  projectId: string;
  cachedAt: number;
}

export interface UseProjectSummariesReturn {
  summaries: Record<string, GeneratedProjectSummary>;
  isLoading: Record<string, boolean>;
  generateSummary: (projectId: string, project: Project) => Promise<void>;
  refreshAll: (projects: Project[]) => Promise<void>;
}

function readCache(): Record<string, CachedSummary> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, CachedSummary>;
    const now = Date.now();
    const valid: Record<string, CachedSummary> = {};
    for (const [id, entry] of Object.entries(parsed)) {
      if (now - (entry as CachedSummary).cachedAt < CACHE_TTL) {
        valid[id] = entry as CachedSummary;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CachedSummary>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function useProjectSummaries(): UseProjectSummariesReturn {
  const initialCache = readCache();

  const [summaries, setSummaries] = useState<Record<string, GeneratedProjectSummary>>(
    () => {
      const next: Record<string, GeneratedProjectSummary> = {};
      for (const [id, entry] of Object.entries(initialCache)) {
        const { projectId: _pid, cachedAt: _ts, ...rest } =
          entry as CachedSummary;
        next[id] = rest;
      }
      return next;
    }
  );

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const generateSummary = useCallback(
    async (projectId: string, project: Project) => {
      setIsLoading(prev => ({ ...prev, [projectId]: true }));
      try {
        const summary = generateSummaryForProject(project);

        setSummaries(prev => {
          const updated = { ...prev, [projectId]: summary };

          const cache: Record<string, CachedSummary> = {};
          for (const [id, s] of Object.entries(updated)) {
            cache[id] = {
              ...(s as GeneratedProjectSummary),
              projectId: id,
              cachedAt: Date.now(),
            };
          }
          writeCache(cache);

          return updated;
        });
      } finally {
        setIsLoading(prev => ({ ...prev, [projectId]: false }));
      }
    },
    []
  );

  const refreshAll = useCallback(
    async (projects: Project[]) => {
      await Promise.all(
        projects.map(p => generateSummary(p.id, p))
      );
    },
    [generateSummary]
  );

  return {
    summaries,
    isLoading,
    generateSummary,
    refreshAll,
  };
}

