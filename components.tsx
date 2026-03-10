// src/components/DecisionGate.tsx
// Interactive checkpoint at the end of each phase

import { memo, useCallback } from 'react';

interface GateItem {
  id: string;
  text: string;
}

interface DecisionGateProps {
  title: string;
  items: GateItem[];
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
  onProceed: () => void;
  nextPhaseLabel: string;
  phaseColor: string;
}

const T = {
  bg: "#0C0C0C",
  surface: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.1)",
  text: "rgba(255,255,255,0.82)",
  textSub: "rgba(255,255,255,0.42)",
  textMuted: "rgba(255,255,255,0.18)",
  mono: "'Space Mono', monospace",
  sans: "'DM Sans', sans-serif",
};

export const DecisionGate = memo(function DecisionGate({
  title,
  items,
  completedItems,
  onToggleItem,
  onProceed,
  nextPhaseLabel,
  phaseColor,
}: DecisionGateProps) {
  const progress = completedItems.length;
  const total = items.length;
  const isComplete = progress === total;

  return (
    <div style={{
      marginTop: '24px',
      padding: '16px',
      borderRadius: '10px',
      border: `1px solid ${isComplete ? phaseColor + '40' : T.border}`,
      background: isComplete ? phaseColor + '08' : T.surface,
      transition: 'all 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            color: phaseColor,
            fontSize: '14px',
          }}>
            {isComplete ? '✓' : '○'}
          </span>
          <span style={{
            fontFamily: T.mono,
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: phaseColor,
          }}>
            {title}
          </span>
        </div>
        <span style={{
          fontFamily: T.mono,
          fontSize: '9px',
          color: T.textMuted,
        }}>
          {progress} of {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '2px',
        background: T.border,
        borderRadius: '1px',
        marginBottom: '14px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${(progress / total) * 100}%`,
          background: phaseColor,
          borderRadius: '1px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Checklist */}
      <div style={{ marginBottom: '16px' }}>
        {items.map((item) => {
          const checked = completedItems.includes(item.id);
          return (
            <label
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 0',
                cursor: 'pointer',
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleItem(item.id)}
                style={{
                  appearance: 'none',
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: `1.5px solid ${checked ? phaseColor : T.borderMid}`,
                  background: checked ? phaseColor + '20' : 'transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: '2px',
                  position: 'relative',
                }}
              />
              <span style={{
                fontSize: '12px',
                lineHeight: '1.5',
                color: checked ? T.text : T.textSub,
                textDecoration: checked ? 'none' : 'none',
                transition: 'color 0.15s',
              }}>
                {item.text}
              </span>
              {checked && (
                <span style={{
                  marginLeft: 'auto',
                  color: phaseColor,
                  fontSize: '11px',
                  flexShrink: 0,
                }}>✓</span>
              )}
            </label>
          );
        })}
      </div>

      {/* Proceed button */}
      <button
        onClick={onProceed}
        disabled={!isComplete}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          border: 'none',
          background: isComplete ? phaseColor : T.surface,
          color: isComplete ? '#0C0C0C' : T.textMuted,
          fontFamily: T.mono,
          fontSize: '10px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          cursor: isComplete ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: isComplete ? 1 : 0.5,
        }}
      >
        {isComplete ? `Move to ${nextPhaseLabel} →` : `Complete all items to proceed`}
      </button>
    </div>
  );
});


// ═══════════════════════════════════════════════════════════════════════════
// src/components/ChainPanel.tsx
// Sidebar showing prompt chain state
// ═══════════════════════════════════════════════════════════════════════════

import { memo } from 'react';

interface Prompt {
  id?: string;
  title: string;
}

interface ChainPanelProps {
  prompts: Prompt[];
  chainOutputs: Record<string, string>;
  onJumpToPrompt: (promptId: string) => void;
  onClearChain: () => void;
  isOpen: boolean;
  onToggle: () => void;
  phaseColor: string;
}

export const ChainPanel = memo(function ChainPanel({
  prompts,
  chainOutputs,
  onJumpToPrompt,
  onClearChain,
  isOpen,
  onToggle,
  phaseColor,
}: ChainPanelProps) {
  const hasOutputs = Object.keys(chainOutputs).length > 0;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '32px',
          height: '80px',
          borderRadius: '6px 0 0 6px',
          border: `1px solid ${T.border}`,
          borderRight: 'none',
          background: hasOutputs ? phaseColor + '10' : T.surface,
          color: hasOutputs ? phaseColor : T.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          writingMode: 'vertical-rl',
          fontFamily: T.mono,
          fontSize: '9px',
          letterSpacing: '0.1em',
        }}
      >
        {hasOutputs ? '◀ CHAIN' : '◀'}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '260px',
      background: T.bg,
      borderLeft: `1px solid ${T.border}`,
      padding: '20px 16px',
      overflowY: 'auto',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <span style={{
          fontFamily: T.mono,
          fontSize: '9px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: T.textMuted,
        }}>
          Prompt Chain
        </span>
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: T.textMuted,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Chain visualization */}
      <div style={{ marginBottom: '16px' }}>
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
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${hasOutput ? phaseColor + '30' : T.border}`,
                  background: hasOutput ? phaseColor + '08' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: isLast ? 0 : '4px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `1.5px solid ${hasOutput ? phaseColor : T.borderMid}`,
                    background: hasOutput ? phaseColor : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: hasOutput ? '#0C0C0C' : T.textMuted,
                    flexShrink: 0,
                  }}>
                    {hasOutput ? '✓' : index + 1}
                  </span>
                  <span style={{
                    fontFamily: T.mono,
                    fontSize: '10px',
                    color: hasOutput ? T.text : T.textSub,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {prompt.title}
                  </span>
                </div>
                {hasOutput && (
                  <div style={{
                    marginTop: '6px',
                    paddingLeft: '24px',
                    fontSize: '10px',
                    color: T.textMuted,
                  }}>
                    {chainOutputs[promptId].slice(0, 60)}...
                  </div>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div style={{
                  width: '1px',
                  height: '12px',
                  background: hasOutput ? phaseColor + '40' : T.border,
                  marginLeft: '19px',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Clear button */}
      {hasOutputs && (
        <button
          onClick={onClearChain}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: `1px solid ${T.border}`,
            background: 'transparent',
            color: T.textMuted,
            fontFamily: T.mono,
            fontSize: '9px',
            cursor: 'pointer',
          }}
        >
          Clear chain
        </button>
      )}
    </div>
  );
});


// ═══════════════════════════════════════════════════════════════════════════
// src/components/TranscriptInput.tsx
// Paste transcript → extract structured spec
// ═══════════════════════════════════════════════════════════════════════════

import { memo, useState, useCallback } from 'react';

interface ExtractionPrompt {
  title: string;
  description: string;
  prompt: string;
  outputStructure: string[];
}

interface TranscriptInputProps {
  extractionPrompt: ExtractionPrompt | undefined;
  onClose: () => void;
  phaseColor: string;
}

export const TranscriptInput = memo(function TranscriptInput({
  extractionPrompt,
  onClose,
  phaseColor,
}: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = useCallback(() => {
    if (!extractionPrompt) return;
    const fullPrompt = extractionPrompt.prompt.replace(
      '[PASTE TRANSCRIPT, EMAILS, OR NOTES HERE]',
      transcript || '[PASTE YOUR CONTENT HERE]'
    ).replace(
      '[PASTE TRANSCRIPT, MEETING NOTES, OR PROCESS DESCRIPTION HERE]',
      transcript || '[PASTE YOUR CONTENT HERE]'
    ).replace(
      '[PASTE TRANSCRIPT, PITCH NOTES, OR CONVERSATION HERE]',
      transcript || '[PASTE YOUR CONTENT HERE]'
    ).replace(
      '[PASTE FEATURE DISCUSSION, REQUIREMENTS, OR CONVERSATION HERE]',
      transcript || '[PASTE YOUR CONTENT HERE]'
    );
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [extractionPrompt, transcript]);

  if (!extractionPrompt) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: T.textMuted,
        fontSize: '12px',
      }}>
        No extraction prompt available for this phase/service combination.
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 200,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: T.mono,
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: phaseColor,
              marginBottom: '4px',
            }}>
              Transcript Mode
            </div>
            <div style={{
              fontSize: '14px',
              color: T.text,
              fontWeight: 500,
            }}>
              {extractionPrompt.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: T.textMuted,
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
        }}>
          <p style={{
            fontSize: '12px',
            color: T.textSub,
            marginBottom: '16px',
            lineHeight: 1.6,
          }}>
            {extractionPrompt.description}
          </p>

          {/* Output structure preview */}
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: T.surface,
            borderRadius: '6px',
          }}>
            <div style={{
              fontFamily: T.mono,
              fontSize: '8px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: T.textMuted,
              marginBottom: '8px',
            }}>
              Extracts
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}>
              {extractionPrompt.outputStructure.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: phaseColor + '15',
                    border: `1px solid ${phaseColor}30`,
                    fontFamily: T.mono,
                    fontSize: '9px',
                    color: phaseColor,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste meeting notes, Slack thread, voice transcript, or raw notes here..."
            style={{
              width: '100%',
              height: '180px',
              padding: '14px',
              borderRadius: '8px',
              border: `1px solid ${T.borderMid}`,
              background: T.surface,
              color: T.text,
              fontFamily: T.sans,
              fontSize: '13px',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
            }}
          />

          {/* Show extraction prompt toggle */}
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.textSub,
              fontFamily: T.mono,
              fontSize: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{showPrompt ? '▼' : '▶'}</span>
            {showPrompt ? 'Hide extraction prompt' : 'View extraction prompt'}
          </button>

          {showPrompt && (
            <pre style={{
              marginTop: '12px',
              padding: '14px',
              borderRadius: '8px',
              border: `1px solid ${T.border}`,
              background: 'rgba(0,0,0,0.3)',
              color: T.textSub,
              fontFamily: T.mono,
              fontSize: '10px',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {extractionPrompt.prompt}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.textSub,
              fontFamily: T.mono,
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCopyPrompt}
            disabled={!transcript.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: transcript.trim() ? phaseColor : T.surface,
              color: transcript.trim() ? '#0C0C0C' : T.textMuted,
              fontFamily: T.mono,
              fontSize: '10px',
              letterSpacing: '0.04em',
              cursor: transcript.trim() ? 'pointer' : 'not-allowed',
              opacity: transcript.trim() ? 1 : 0.5,
            }}
          >
            {copied ? '✓ Copied!' : 'Copy prompt with transcript →'}
          </button>
        </div>
      </div>
    </div>
  );
});


// ═══════════════════════════════════════════════════════════════════════════
// src/components/ProjectSelector.tsx
// Project management dropdown
// ═══════════════════════════════════════════════════════════════════════════

import { memo, useState, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  serviceId: string;
  currentPhase: string;
}

interface Service {
  id: string;
  label: string;
  color: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  services: Service[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, serviceId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectSelector = memo(function ProjectSelector({
  projects,
  activeProjectId,
  services,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newService, setNewService] = useState(services[0]?.id || 'mvp');

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleCreate = useCallback(() => {
    if (newName.trim()) {
      onCreateProject(newName.trim(), newService);
      setNewName('');
      setShowCreate(false);
      setIsOpen(false);
    }
  }, [newName, newService, onCreateProject]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: `1px solid ${T.border}`,
          background: activeProject ? T.surface : 'transparent',
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: T.mono,
          fontSize: '10px',
          color: activeProject ? T.text : T.textMuted,
        }}>
          {activeProject ? activeProject.name : 'No project'}
        </span>
        <span style={{
          fontSize: '8px',
          color: T.textMuted,
        }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          width: '260px',
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 50,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Project list */}
          {projects.length > 0 && (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {projects.map((project) => {
                const service = services.find(s => s.id === project.serviceId);
                const isActive = project.id === activeProjectId;
                return (
                  <div
                    key={project.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderBottom: `1px solid ${T.border}`,
                      background: isActive ? T.surface : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onSelectProject(project.id);
                      setIsOpen(false);
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: T.text,
                        marginBottom: '2px',
                      }}>
                        {project.name}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                      }}>
                        <span style={{
                          fontFamily: T.mono,
                          fontSize: '8px',
                          color: service?.color || T.textMuted,
                          textTransform: 'uppercase',
                        }}>
                          {service?.label || project.serviceId}
                        </span>
                        <span style={{
                          fontSize: '8px',
                          color: T.textMuted,
                        }}>·</span>
                        <span style={{
                          fontFamily: T.mono,
                          fontSize: '8px',
                          color: T.textMuted,
                        }}>
                          {project.currentPhase}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${project.name}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: T.textMuted,
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '12px',
                        opacity: 0.5,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: T.textSub,
                fontFamily: T.mono,
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              + New project
            </button>
          ) : (
            <div style={{ padding: '12px' }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: `1px solid ${T.borderMid}`,
                  background: T.surface,
                  color: T.text,
                  fontFamily: T.sans,
                  fontSize: '12px',
                  marginBottom: '8px',
                  outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <select
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: `1px solid ${T.borderMid}`,
                  background: T.surface,
                  color: T.text,
                  fontFamily: T.mono,
                  fontSize: '10px',
                  marginBottom: '8px',
                  outline: 'none',
                }}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${T.border}`,
                    background: 'transparent',
                    color: T.textMuted,
                    fontFamily: T.mono,
                    fontSize: '9px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: newName.trim() ? '#C8F060' : T.surface,
                    color: newName.trim() ? '#0C0C0C' : T.textMuted,
                    fontFamily: T.mono,
                    fontSize: '9px',
                    cursor: newName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
