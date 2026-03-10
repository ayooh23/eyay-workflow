import type { Phase } from '../types';

export const PHASES: Phase[] = [
  { id: 'idea',  label: 'Discover', color: '#0000FF' },
  { id: 'prd',   label: 'Define',   color: '#0000FF' },
  { id: 'build', label: 'Build',    color: '#0000FF' },
  { id: 'qa',    label: 'Validate', color: '#0000FF' },
  { id: 'close', label: 'Ship',     color: '#0000FF' },
];

export const PHASE_LABELS: Record<string, string> = Object.fromEntries(
  PHASES.map(p => [p.id, p.label])
);

export const PHASE_COLORS: Record<string, string> = Object.fromEntries(
  PHASES.map(p => [p.id, p.color])
);
