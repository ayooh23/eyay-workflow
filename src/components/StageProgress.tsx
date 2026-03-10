import { memo } from 'react';
import { PHASES, PHASE_COLORS, PHASE_LABELS } from '../data/phases';

interface StageProgressProps {
  currentPhase: string;
  size?: 'sm' | 'md';
}

export const StageProgress = memo(function StageProgress({
  currentPhase,
  size = 'sm',
}: StageProgressProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  const dotSize = size === 'sm' ? 10 : 14;
  const lineHeight = size === 'sm' ? 2 : 3;
  const gap = size === 'sm' ? 24 : 32;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        {PHASES.map((phase, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isFuture = index > currentIndex;
          const color = PHASE_COLORS[phase.id];

          return (
            <div
              key={phase.id}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <div
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  background: isCurrent
                    ? color
                    : isCompleted
                    ? `${color}60`
                    : 'transparent',
                  border: `2px solid ${isFuture ? '#D4D4D4' : color}`,
                  transition: 'all 0.2s ease',
                }}
              />

              {index < PHASES.length - 1 && (
                <div
                  style={{
                    width: gap,
                    height: lineHeight,
                    background:
                      index < currentIndex
                        ? `${PHASE_COLORS[PHASES[index + 1].id]}60`
                        : '#D4D4D4',
                    marginLeft: 2,
                    marginRight: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          fontSize: size === 'sm' ? 10 : 12,
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: PHASE_COLORS[currentPhase] || '#0000FF',
          textTransform: 'uppercase',
        }}
      >
        {PHASE_LABELS[currentPhase] || currentPhase}
      </div>
    </div>
  );
});

