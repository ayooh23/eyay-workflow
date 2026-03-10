import { memo } from 'react';
import type { Prompt, ChainOutputs } from '../types';
import { T } from './theme';

interface ChainPanelProps {
  prompts: Prompt[];
  chainOutputs: ChainOutputs;
  onJumpToPrompt: (promptId: string) => void;
  onClearChain: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChainPanel = memo(function ChainPanel({
  prompts, chainOutputs, onJumpToPrompt, onClearChain, isOpen, onToggle,
}: ChainPanelProps) {
  const hasOutputs = Object.keys(chainOutputs).length > 0;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
          width: 28, height: 72, borderRadius: '6px 0 0 6px',
          border: `1px solid ${T.border}`, borderRight: 'none',
          background: hasOutputs ? '#0000FF10' : T.surface,
          color: hasOutputs ? '#0000FF' : T.textMuted,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          writingMode: 'vertical-rl' as const, fontFamily: T.mono, fontSize: 8, letterSpacing: '0.1em',
          zIndex: 50,
        }}
      >
        {hasOutputs ? '◀ CHAIN' : '◀'}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 260,
      background: T.bg, borderLeft: `1px solid ${T.border}`,
      padding: '20px 16px', overflowY: 'auto' as const, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.textMuted }}>
          Prompt Chain
        </span>
        <button onClick={onToggle} style={{ background: 'transparent', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 14 }}>
          ✕
        </button>
      </div>

      <div style={{ marginBottom: 18 }}>
        {prompts.map((prompt, index) => {
          const promptId = prompt.id || `prompt-${index}`;
          const hasOutput = !!chainOutputs[promptId];
          const isLast = index === prompts.length - 1;

          return (
            <div key={promptId}>
              <button
                onClick={() => onJumpToPrompt(promptId)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: `1px solid ${hasOutput ? '#0000FF30' : T.border}`,
                  background: hasOutput ? '#0000FF10' : 'transparent',
                  textAlign: 'left' as const,
                  cursor: 'pointer',
                  marginBottom: isLast ? 0 : 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `1.5px solid ${hasOutput ? '#0000FF' : T.borderMid}`,
                    background: hasOutput ? '#0000FF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: hasOutput ? '#0C0C0C' : T.textMuted, flexShrink: 0,
                  }}>
                    {hasOutput ? '✓' : index + 1}
                  </span>
                  <span style={{
                    fontFamily: T.mono, fontSize: 10,
                    color: hasOutput ? T.text : T.textSub,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                  }}>
                    {prompt.title}
                  </span>
                </div>
                {hasOutput && (
                  <div style={{ marginTop: 6, paddingLeft: 24, fontSize: 10, color: T.textMuted }}>
                    {chainOutputs[promptId].slice(0, 60)}...
                  </div>
                )}
              </button>

              {!isLast && (
                <div style={{
                  width: 1, height: 12, background: hasOutput ? '#0000FF40' : T.border, marginLeft: 19,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {hasOutputs && (
        <button
          onClick={onClearChain}
          style={{
            width: '100%', padding: 8, borderRadius: 6,
            border: `1px solid ${T.border}`, background: 'transparent',
            color: T.textMuted, fontFamily: T.mono, fontSize: 9, cursor: 'pointer',
          }}
        >
          Clear chain
        </button>
      )}
    </div>
  );
});
