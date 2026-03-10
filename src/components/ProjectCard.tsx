import type { Project } from '../types';
import { GATES } from '../data/gates';
import { SERVICES } from '../data/services';
import { T, V } from './theme';
import { StageProgress } from './StageProgress';
import { AISummary, type ProjectSummary } from './AISummary';

interface ProjectCardProps {
  project: Project;
  summary: ProjectSummary | null;
  isLoadingSummary: boolean;
  onOpen: () => void;
  onGenerateDeck: () => void;
  onGenerateSummary: () => void;
}

const CARD_MIN_WIDTH = 320;
const CARD_MAX_WIDTH = 440;
const CARD_PADDING = 24;

function getGateProgress(project: Project) {
  const gate = GATES.find(
    g => g.phaseId === project.currentPhase && g.serviceId === project.serviceId
  );
  if (!gate) {
    return { completed: 0, total: 0 };
  }

  const key = `${gate.phaseId}-${gate.serviceId}`;
  const completedIds = project.gateProgress[key] || [];
  return {
    completed: completedIds.length,
    total: gate.items.length,
  };
}

export function ProjectCard({
  project,
  summary,
  isLoadingSummary,
  onOpen,
  onGenerateDeck,
  onGenerateSummary,
}: ProjectCardProps) {
  const gateProgress = getGateProgress(project);
  const service = SERVICES.find(s => s.id === project.serviceId);

  const status = summary?.status ?? 'on_track';
  const isBlocked = status === 'blocked';
  const isReady = status === 'ready_to_proceed';

  const leftBorderColor = isBlocked
    ? '#EF4444'
    : isReady
    ? '#0000FF'
    : 'transparent';

  const gateLabel =
    gateProgress.total === 0
      ? 'No gate defined'
      : gateProgress.completed >= gateProgress.total
      ? '✓ Ready to proceed'
      : `Gate: ${gateProgress.completed}/${gateProgress.total} complete`;

  return (
    <div
      style={{
        minWidth: CARD_MIN_WIDTH,
        maxWidth: CARD_MAX_WIDTH,
        padding: CARD_PADDING,
        borderRadius: 12,
        border: `1px solid ${V.border}`,
        background: V.surface,
        boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {leftBorderColor !== 'transparent' && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: leftBorderColor,
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={onOpen}
          style={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: T.sans,
              color: V.text,
              marginBottom: 4,
            }}
          >
            {project.name}
          </div>
        </button>

        {service && (
          <div
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              border: `1px solid ${V.border}`,
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: V.textSub,
              whiteSpace: 'nowrap',
            }}
          >
            {service.label}
          </div>
        )}
      </div>

      <StageProgress currentPhase={project.currentPhase} size="sm" />

      <div
        style={{
          fontSize: 12,
          color: V.textSub,
          marginTop: 4,
        }}
      >
        {gateLabel}
      </div>

      <div style={{ marginTop: 8 }}>
        <AISummary
          summary={summary}
          isLoading={isLoadingSummary}
          onGenerate={onGenerateSummary}
          onRefresh={onGenerateSummary}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          marginTop: 8,
        }}
      >
        <button
          type="button"
          onClick={onOpen}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: `1px solid ${V.border}`,
            background: 'transparent',
            fontSize: 13,
            fontFamily: T.mono,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            color: V.textSub,
          }}
        >
          Open
        </button>
        <button
          type="button"
          onClick={onGenerateDeck}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#0000FF',
            fontSize: 13,
            fontFamily: T.mono,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            color: '#FFFFFF',
          }}
        >
          Generate Deck
        </button>
      </div>
    </div>
  );
}

