import { useState } from 'react';
import { T, V } from './theme';

interface DeckGeneratorFormProps {
  phaseId: string;
  phaseLabel: string;
  serviceId: string;
  serviceLabel: string;
  defaultProjectName?: string;
}

export function DeckGeneratorForm({
  phaseId,
  phaseLabel,
  serviceId,
  serviceLabel,
  defaultProjectName,
}: DeckGeneratorFormProps) {
  const [projectName, setProjectName] = useState(defaultProjectName ?? '');
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const baseUrl =
        (import.meta as any).env?.VITE_DECK_API_BASE || 'http://localhost:4000';

      const response = await fetch(`${baseUrl}/api/generate-deck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phaseId,
          serviceId,
          projectName: projectName || undefined,
          darkMode: mode === 'dark',
        }),
      });

      if (!response.ok) {
        throw new Error(`Deck generation failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${phaseId}-${serviceId}-deck${mode === 'dark' ? '-dark' : ''}.pdf`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Deck generation failed. Check the backend endpoint.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        background: V.surface,
        border: `1px dashed ${V.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: V.textMuted,
          }}
        >
          Phase deck
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            color: V.textSub,
          }}
        >
          {phaseLabel} · {serviceLabel}
        </div>
      </div>

      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontSize: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: V.textMuted,
          }}
        >
          Project name (optional)
        </span>
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="Client / project name for title slide"
          style={{
            padding: '6px 8px',
            borderRadius: 6,
            border: `1px solid ${V.border}`,
            background: V.bg,
            color: V.text,
            fontFamily: T.sans,
            fontSize: 13,
          }}
        />
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: V.textMuted,
            }}
          >
            Theme
          </span>
          <button
            type="button"
            onClick={() => setMode('light')}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: `1px solid ${mode === 'light' ? '#0000FF80' : V.border}`,
              background: mode === 'light' ? '#0000FF10' : 'transparent',
              color: mode === 'light' ? '#0000FF' : V.textSub,
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Light (client)
          </button>
          <button
            type="button"
            onClick={() => setMode('dark')}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: `1px solid ${mode === 'dark' ? '#0000FF80' : V.border}`,
              background: mode === 'dark' ? '#0000FF10' : 'transparent',
              color: mode === 'dark' ? '#0000FF' : V.textSub,
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Dark (internal)
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            border: 'none',
            background: '#0000FF',
            color: '#FFFFFF',
            fontFamily: 'monospace',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: isSubmitting ? 'default' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isSubmitting ? 'Generating…' : 'Generate deck'}
          <span style={{ fontSize: 12 }}>↗</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: '#EF4444',
            fontFamily: 'monospace',
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
}

