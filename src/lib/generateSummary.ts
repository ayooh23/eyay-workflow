import type { Project } from '../types';
import { GATES } from '../data/gates';
import { PHASE_LABELS } from '../data/phases';

export type SummaryStatus =
  | 'on_track'
  | 'blocked'
  | 'ready_to_proceed'
  | 'stale';

export interface GeneratedProjectSummary {
  summary: string;
  status: SummaryStatus;
  blocker: string | null;
  nextAction: string;
  generatedAt: string;
}

function getGateContext(project: Project) {
  const gatesForService = GATES.filter(
    g => g.serviceId === project.serviceId
  );

  let completedItems = 0;
  let totalItems = 0;

  for (const gate of gatesForService) {
    const key = `${gate.phaseId}-${gate.serviceId}`;
    const done = project.gateProgress[key] || [];
    completedItems += done.length;
    totalItems += gate.items.length;
  }

  const currentGate = GATES.find(
    g => g.phaseId === project.currentPhase && g.serviceId === project.serviceId
  );

  const currentKey = currentGate
    ? `${currentGate.phaseId}-${currentGate.serviceId}`
    : null;
  const currentCompleted = currentKey
    ? (project.gateProgress[currentKey] || []).length
    : 0;
  const currentTotal = currentGate ? currentGate.items.length : 0;

  const missingItems =
    currentGate && currentKey
      ? currentGate.items
          .filter(item => !(project.gateProgress[currentKey] || []).includes(item.id))
          .map(item => item.text)
      : [];

  return {
    completedItems,
    totalItems,
    currentCompleted,
    currentTotal,
    missingItems,
  };
}

export function generateSummaryForProject(project: Project): GeneratedProjectSummary {
  const now = Date.now();
  const lastUpdated = project.updatedAt;
  const ageMs = now - lastUpdated;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const {
    completedItems,
    totalItems,
    currentCompleted,
    currentTotal,
    missingItems,
  } = getGateContext(project);

  const phaseLabel = PHASE_LABELS[project.currentPhase] || project.currentPhase;

  let status: SummaryStatus = 'on_track';
  let blocker: string | null = null;
  let nextAction = '';

  if (ageMs > sevenDaysMs) {
    status = 'stale';
    nextAction = 'Resume work on this project or refresh gates to confirm status.';
  }

  if (currentTotal > 0 && currentCompleted >= currentTotal) {
    status = 'ready_to_proceed';
    nextAction = `Move into the next phase after a quick review of ${phaseLabel} outcomes.`;
  } else if (currentTotal > 0 && currentCompleted < currentTotal) {
    if (ageMs > threeDaysMs) {
      status = 'blocked';
      blocker =
        missingItems[0] ||
        'Decision gate items are incomplete for this phase.';
      nextAction = 'Complete the remaining gate items to unblock this phase.';
    } else if (status !== 'stale') {
      status = 'on_track';
      nextAction = 'Continue working through the current phase gate items.';
    }
  }

  if (!nextAction) {
    nextAction = 'Review the project and decide the next concrete move.';
  }

  const doneText =
    totalItems > 0
      ? `${completedItems}/${totalItems} gate checks complete across the workflow.`
      : 'No formal gate checks recorded yet.';

  const keyInsight =
    status === 'ready_to_proceed'
      ? `${phaseLabel} gate is fully complete.`
      : status === 'blocked'
      ? 'Progress has slowed with open gate items.'
      : status === 'stale'
      ? 'No recent movement on this project.'
      : `Work is progressing through ${phaseLabel}.`;

  const blockerSnippet =
    status === 'blocked' && blocker
      ? ` Blocked on: ${blocker}`
      : '';

  const summary = `${keyInsight} ${doneText}${blockerSnippet}`.slice(0, 240);

  return {
    summary,
    status,
    blocker,
    nextAction,
    generatedAt: new Date().toISOString(),
  };
}

