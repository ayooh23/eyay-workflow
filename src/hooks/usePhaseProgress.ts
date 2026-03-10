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

  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = localStorage.getItem(storageKey);
      setCompletedItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCompletedItems([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(completedItems));
  }, [completedItems, storageKey]);

  const toggleItem = useCallback((itemId: string) => {
    setCompletedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const progress = useMemo(() => ({
    completed: completedItems.length,
    total: gate?.items.length || 0,
  }), [completedItems.length, gate?.items.length]);

  const isComplete = gate ? gate.items.every(item => completedItems.includes(item.id)) : false;

  const resetProgress = useCallback(() => setCompletedItems([]), []);

  return { completedItems, toggleItem, isComplete, progress, resetProgress };
}
