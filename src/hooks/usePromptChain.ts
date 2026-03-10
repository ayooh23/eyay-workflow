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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setOutputs(stored ? JSON.parse(stored) : {});
    } catch {
      setOutputs({});
    }
  }, [storageKey]);

  useEffect(() => {
    if (Object.keys(outputs).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(outputs));
    }
  }, [outputs, storageKey]);

  const setOutput = useCallback((promptId: string, output: string) => {
    setOutputs(prev => ({ ...prev, [promptId]: output }));
  }, []);

  const getOutput = useCallback((promptId: string) => outputs[promptId], [outputs]);

  const getPreviousOutput = useCallback((
    currentPromptIndex: number,
    prompts: Prompt[]
  ) => {
    for (let i = currentPromptIndex - 1; i >= 0; i--) {
      const prompt = prompts[i];
      const promptId = prompt.id || `prompt-${i}`;
      const output = outputs[promptId];
      if (output) return { promptTitle: prompt.title, output };
    }
    return undefined;
  }, [outputs]);

  const clearChain = useCallback(() => {
    setOutputs({});
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { outputs, setOutput, getOutput, getPreviousOutput, clearChain };
}
