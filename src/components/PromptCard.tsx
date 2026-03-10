import { useState, useCallback, useRef } from 'react';
import type { Prompt } from '../types';
import { V, TOOL_COLORS, TYPE, RADIUS } from './theme';

interface PromptCardProps {
  prompt: Prompt;
  index: number;
  chainOutput?: string;
  onSaveOutput: (promptId: string, output: string) => void;
  previousOutput?: { promptTitle: string; output: string };
}

export function PromptCard({ prompt, index, chainOutput, onSaveOutput, previousOutput }: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [outputText, setOutputText] = useState(chainOutput || '');
  const [copied, setCopied] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const promptId = prompt.id || `prompt-${index}`;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fullContent = previousOutput
    ? `${prompt.content}\n\n---\nPrevious output from "${previousOutput.promptTitle}":\n${previousOutput.output}`
    : prompt.content;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullContent]);

  const handleOutputBlur = useCallback(() => {
    if (outputText.trim()) {
      onSaveOutput(promptId, outputText);
      setSavedIndicator(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSavedIndicator(false), 2000);
    }
  }, [outputText, onSaveOutput, promptId]);

  const toolColor = TOOL_COLORS[prompt.tool as keyof typeof TOOL_COLORS] || V.textSub;
  const hasOutput = !!chainOutput;

  // Time estimate color uses brand neutrals/blue only
  const timeColor = !prompt.estimatedMinutes ? V.textMuted : V.textSub;

  return (
    <div style={{
      borderRadius: RADIUS.lg,
      border: `1px solid ${hasOutput ? '#0000FF26' : V.border}`,
      background: hasOutput ? '#0000FF10' : V.surface,
      overflow: 'hidden',
      transition: 'border-color 0.2s, background-color 0.2s',
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left' as const,
        }}
      >
        {/* Index */}
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: V.textMuted, flexShrink: 0, minWidth: 18, opacity: 0.6 }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Title */}
        <span style={{ flex: 1, fontSize: TYPE.ui, color: V.text, fontWeight: 500, lineHeight: 1.35 }}>
          {prompt.title}
        </span>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {prompt.estimatedMinutes && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: timeColor }}>
              ~{prompt.estimatedMinutes}m
            </span>
          )}

          {/* Tool badge */}
          <span style={{
            padding: '2px 7px', borderRadius: RADIUS.sm,
            border: `1px solid ${toolColor}35`, background: `${toolColor}12`,
            fontFamily: 'monospace', fontSize: TYPE.chip, color: toolColor,
            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>
            {prompt.tool}
          </span>

          {/* Agentic badge */}
          {prompt.agentic && (
            <span style={{
              padding: '2px 7px', borderRadius: RADIUS.sm,
              border: '1px solid #0000FF40', background: '#0000FF12',
              fontFamily: 'monospace', fontSize: TYPE.chip, color: '#0000FF',
              textTransform: 'uppercase' as const, letterSpacing: '0.05em',
            }}>
              ⚡
            </span>
          )}

          {/* Output saved dot */}
          {hasOutput && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0000FF', display: 'inline-block' }} />
          )}

          {/* Chevron */}
          <span style={{ fontSize: 9, color: V.textMuted, opacity: 0.6 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${V.border}`, padding: 14 }}>

          {/* Chain injection notice */}
          {previousOutput && (
              <div style={{
                marginBottom: 10, padding: '7px 10px', borderRadius: RADIUS.md,
                border: '1px solid #0000FF30', background: '#0000FF0A',
              }}>
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#0000FF' }}>
                ↑ carries output from "{previousOutput.promptTitle}"
              </span>
            </div>
          )}

          {/* Prompt text */}
          <pre style={{
            margin: 0, padding: '12px 14px', borderRadius: RADIUS.md,
            background: 'rgba(0,0,0,0.18)', border: `1px solid ${V.border}`,
            fontFamily: 'monospace', fontSize: 11, lineHeight: 1.75,
            color: V.textSub, whiteSpace: 'pre-wrap', wordBreak: 'break-word' as const,
            maxHeight: 400, overflowY: 'auto' as const,
          }}>
            {fullContent}
          </pre>

          {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '7px 14px', borderRadius: RADIUS.md,
                border: `1px solid ${copied ? '#0000FF60' : V.borderMid}`,
                background: copied ? '#0000FF12' : 'transparent',
                color: copied ? '#0000FF' : V.textSub,
                fontFamily: 'monospace', fontSize: TYPE.chip, letterSpacing: '0.04em', cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied' : 'Copy prompt'}
            </button>
            <button
              onClick={() => setShowOutput(!showOutput)}
              style={{
                padding: '7px 14px', borderRadius: RADIUS.md,
                border: `1px solid ${V.border}`, background: 'transparent',
                color: V.textMuted, fontFamily: 'monospace', fontSize: TYPE.chip,
                letterSpacing: '0.04em', cursor: 'pointer',
              }}
            >
              {showOutput ? 'Hide output' : 'Save output'}
            </button>
          </div>

          {/* Output textarea */}
          {showOutput && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                onBlur={handleOutputBlur}
                placeholder="Paste Claude's response here to chain into the next prompt…"
                style={{
                  width: '100%', height: 120, padding: '10px 12px', borderRadius: RADIUS.md,
                  border: `1px solid ${V.borderMid}`, background: V.surfaceHi,
                  color: V.text, fontFamily: 'system-ui, sans-serif', fontSize: TYPE.body, lineHeight: 1.6,
                  resize: 'vertical' as const, boxSizing: 'border-box' as const,
                }}
              />
              {savedIndicator && (
                <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 9, color: '#0000FF' }}>
                  ✓ Saved to chain
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
