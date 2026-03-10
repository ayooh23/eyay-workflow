import { memo } from 'react';
import { T, V } from './theme';

export interface ProjectSummary {
  summary: string;
  status: 'on_track' | 'blocked' | 'ready_to_proceed' | 'stale';
  blocker: string | null;
  nextAction: string;
  generatedAt: string;
}

interface AISummaryProps {
  summary: ProjectSummary | null;
  isLoading: boolean;
  onGenerate: () => void;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<ProjectSummary['status'], string> = {
  on_track: '#22C55E',
  blocked: '#EF4444',
  ready_to_proceed: '#0000FF',
  stale: '#9CA3AF',
};

const STATUS_LABELS: Record<ProjectSummary['status'], string> = {
  on_track: 'On track',
  blocked: 'Blocked',
  ready_to_proceed: 'Ready to proceed',
  stale: 'Needs attention',
};

export const AISummary = memo(function AISummary({
  summary,
  isLoading,
  onGenerate,
  onRefresh,
}: AISummaryProps) {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#F0F0F0',
          borderRadius: 6,
          padding: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#D4D4D4',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#737373',
            }}
          >
            Generating summary...
          </span>
        </div>
        <div
          style={{
            height: 12,
            background: '#E5E5E5',
            borderRadius: 4,
            marginBottom: 6,
            width: '90%',
          }}
        />
        <div
          style={{
            height: 12,
            background: '#E5E5E5',
            borderRadius: 4,
            width: '70%',
          }}
        />
      </div>
    );
  }

  if (!summary) {
    return (
      <button
        type="button"
        onClick={onGenerate}
        style={{
          width: '100%',
          background: '#F0F0F0',
          border: '1px dashed #D4D4D4',
          borderRadius: 6,
          padding: 16,
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#737373',
          }}
        >
          ✦ Generate AI Summary
        </span>
      </button>
    );
  }

  const isStale =
    Date.now() - new Date(summary.generatedAt).getTime() >
    24 * 60 * 60 * 1000;

  return (
    <div
      style={{
        background: '#F0F0F0',
        borderRadius: 6,
        padding: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: STATUS_COLORS[summary.status],
            }}
          />
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: STATUS_COLORS[summary.status],
            }}
          >
            {STATUS_LABELS[summary.status]}
          </span>
        </div>
        {isStale && (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 10,
              color: V.textMuted,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Refresh
          </button>
        )}
      </div>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: V.text,
          margin: 0,
        }}
      >
        {summary.summary}
      </p>

      {summary.blocker && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 10px',
            background: '#FEF2F2',
            borderRadius: 4,
            borderLeft: '3px solid #EF4444',
          }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#EF4444',
            }}
          >
            Blocked:
          </span>
          <span
            style={{
              fontSize: 12,
              color: V.text,
              marginLeft: 4,
            }}
          >
            {summary.blocker}
          </span>
        </div>
      )}
    </div>
  );
});

