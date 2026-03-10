import { memo, useState, useCallback } from 'react';
import type { ExtractionPrompt } from '../types';
import { T } from './theme';

interface TranscriptInputProps {
  extractionPrompt: ExtractionPrompt | undefined;
  onClose: () => void;
}

export const TranscriptInput = memo(function TranscriptInput({ extractionPrompt, onClose }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = useCallback(() => {
    if (!extractionPrompt) return;
    const filled = extractionPrompt.prompt.replace(
      /\[PASTE [^\]]+\]/g,
      transcript || '[PASTE YOUR CONTENT HERE]'
    );
    navigator.clipboard.writeText(filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [extractionPrompt, transcript]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, zIndex: 200,
    }}>
      <div style={{
        width: '100%', maxWidth: 640, maxHeight: '90vh',
        background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const,
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0000FF', marginBottom: 4 }}>
              Transcript Mode
            </div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>
              {extractionPrompt?.title || 'No extraction prompt for this phase'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 18, padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' as const }}>
          {extractionPrompt ? (
            <>
              <p style={{ fontSize: 12, color: T.textSub, marginBottom: 16, lineHeight: 1.6 }}>
                {extractionPrompt.description}
              </p>

              <div style={{ marginBottom: 16, padding: 12, background: T.surface, borderRadius: 6 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.textMuted, marginBottom: 8 }}>
                  Extracts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {extractionPrompt.outputStructure.map((item, i) => (
                    <span key={i} style={{
                      padding: '3px 8px', borderRadius: 4,
                      background: '#0000FF10', border: '1px solid #0000FF30',
                      fontFamily: T.mono, fontSize: 9, color: '#0000FF',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste meeting notes, Slack thread, voice transcript, or raw notes here..."
                style={{
                  width: '100%', height: 180, padding: '14px', borderRadius: 8,
                  border: `1px solid ${T.borderMid}`, background: T.surface,
                  color: T.text, fontFamily: T.sans, fontSize: 13, lineHeight: 1.6,
                  resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const,
                }}
              />

              <button
                onClick={() => setShowPrompt(!showPrompt)}
                style={{
                  marginTop: 12, padding: '8px 12px', borderRadius: 6,
                  border: `1px solid ${T.border}`, background: 'transparent',
                  color: T.textSub, fontFamily: T.mono, fontSize: 9,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>{showPrompt ? '▼' : '▶'}</span>
                {showPrompt ? 'Hide extraction prompt' : 'View extraction prompt'}
              </button>

              {showPrompt && (
                <pre style={{
                  marginTop: 12, padding: 14, borderRadius: 8,
                  border: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.3)',
                  color: T.textSub, fontFamily: T.mono, fontSize: 10, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const,
                  maxHeight: 200, overflowY: 'auto' as const, margin: '12px 0 0 0',
                }}>
                  {extractionPrompt.prompt}
                </pre>
              )}
            </>
          ) : (
            <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center' as const, padding: '40px 0' }}>
              No extraction prompt available for this phase/service combination.
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px', borderTop: `1px solid ${T.border}`,
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '10px 16px', borderRadius: 6,
            border: `1px solid ${T.border}`, background: 'transparent',
            color: T.textSub, fontFamily: T.mono, fontSize: 10, cursor: 'pointer',
          }}>
            Cancel
          </button>
          {extractionPrompt && (
            <button
              onClick={handleCopyPrompt}
              disabled={!transcript.trim()}
              style={{
                padding: '10px 20px', borderRadius: 6, border: 'none',
                background: transcript.trim() ? '#0000FF' : T.surface,
                color: transcript.trim() ? '#FFFFFF' : T.textMuted,
                fontFamily: T.mono, fontSize: 10, letterSpacing: '0.04em',
                cursor: transcript.trim() ? 'pointer' : 'not-allowed',
                opacity: transcript.trim() ? 1 : 0.5,
              }}
            >
              {copied ? '✓ Copied!' : 'Copy prompt with transcript →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
