import { memo } from 'react';
import type { DecisionGate as DecisionGateType } from '../types';
import { V, TYPE, RADIUS } from './theme';

interface DecisionGateProps {
  gate: DecisionGateType;
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
  onProceed: () => void;
  nextPhaseLabel: string;
}

export const DecisionGate = memo(function DecisionGate({
  gate, completedItems, onToggleItem, onProceed, nextPhaseLabel,
}: DecisionGateProps) {
  const progress = completedItems.length;
  const total = gate.items.length;
  const isComplete = progress === total;

  // Brand blue for the CTA when unlocked
  const ctaBg  = isComplete ? '#0000FF' : V.surface;
  const ctaFg  = isComplete ? '#FFFFFF' : V.textMuted;

  return (
    <div style={{
      marginTop: 32, padding: 18, borderRadius: RADIUS.xl,
      border: `1px solid ${isComplete ? '#0000FF30' : V.border}`,
      background: isComplete ? '#0000FF06' : V.surface,
      transition: 'border-color 0.3s, background-color 0.3s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: isComplete ? '#0000FF' : V.textMuted, fontSize: 13 }}>
            {isComplete ? '✓' : '○'}
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: TYPE.chip, letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: isComplete ? '#0000FF' : V.textSub,
            fontWeight: isComplete ? 700 : 400,
          }}>
            {gate.title}
          </span>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: V.textMuted }}>
          {progress} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: V.border, borderRadius: 1, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${total > 0 ? (progress / total) * 100 : 0}%`,
          background: isComplete ? '#0000FF' : V.borderMid,
          borderRadius: 1, transition: 'width 0.35s ease',
        }} />
      </div>

      {/* Checklist */}
      <div style={{ marginBottom: 18 }}>
        {gate.items.map((item, i) => {
          const checked = completedItems.includes(item.id);
          const isLastItem = i === gate.items.length - 1;
          return (
            <label key={item.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '7px 0', cursor: 'pointer',
              borderBottom: isLastItem ? 'none' : `1px solid ${V.border}`,
            }}>
              {/* Custom checkbox */}
              <span style={{
                width: 16, height: 16, borderRadius: RADIUS.sm, flexShrink: 0, marginTop: 2,
                border: `1.5px solid ${checked ? '#0000FF' : V.borderMid}`,
                background: checked ? '#0000FF' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.15s, background-color 0.15s',
                cursor: 'pointer',
              }}
              onClick={() => onToggleItem(item.id)}
              >
                {checked && <span style={{ fontSize: 9, color: '#FFFFFF', lineHeight: 1 }}>✓</span>}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleItem(item.id)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                aria-label={item.text}
              />
              <span style={{
                fontSize: TYPE.body, lineHeight: 1.5,
                color: checked ? V.text : V.textSub,
                transition: 'color 0.15s',
              }}>
                {item.text}
              </span>
            </label>
          );
        })}
      </div>

      {/* Proceed button */}
      <button
        onClick={onProceed}
        disabled={!isComplete}
        style={{
          width: '100%', padding: '11px 16px', borderRadius: RADIUS.md, border: 'none',
          background: ctaBg, color: ctaFg,
          fontFamily: 'monospace', fontSize: TYPE.chip, letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          cursor: isComplete ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.25s, color 0.25s',
          opacity: isComplete ? 1 : 0.5,
          fontWeight: isComplete ? 700 : 400,
        }}
      >
        {isComplete ? `Move to ${nextPhaseLabel} →` : 'Complete all items to proceed'}
      </button>
    </div>
  );
});
