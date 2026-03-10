import { useState, useCallback } from 'react';
import { PHASES, PHASE_COLORS } from './data/phases';
import { SERVICES } from './data/services';
import { BEST_PRACTICES } from './data/bestPractices';
import { CONTENT } from './data/prompts';
import { getGate } from './data/gates';
import { getExtractionPrompt } from './data/extractionPrompts';
import { useProject } from './hooks/useProject';
import { usePhaseProgress } from './hooks/usePhaseProgress';
import { usePromptChain } from './hooks/usePromptChain';
import { DecisionGate } from './components/DecisionGate';
import { ChainPanel } from './components/ChainPanel';
import { TranscriptInput } from './components/TranscriptInput';
import { ProjectSelector } from './components/ProjectSelector';
import { PromptCard } from './components/PromptCard';
import { DeckGeneratorForm } from './components/DeckGeneratorForm';
import { ProjectsPage } from './components/ProjectsPage';
import { T, V } from './components/theme';
import type { Prompt } from './types';

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('eyay-theme') as 'dark' | 'light') ?? 'dark'
  );
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('eyay-theme', next);
      return next;
    });
  }, []);
  return { theme, toggle };
}

export default function App() {
  const [activePhase, setActivePhase] = useState('idea');
  const [activeService, setActiveService] = useState('mvp');
  const [activeSubPhase, setActiveSubPhase] = useState<string | null>(null);
  const [showBP, setShowBP] = useState(false);
  const [chainPanelOpen, setChainPanelOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const { projects, activeProject, createProject, updateProject, deleteProject, setActiveProject } = useProject();

  const currentGate = getGate(activePhase, activeService);
  const { completedItems, toggleItem } = usePhaseProgress(currentGate, activeProject?.id);

  const { outputs: chainOutputs, setOutput, getPreviousOutput, clearChain } = usePromptChain(
    activePhase, activeService, activeProject?.id
  );

  const phaseContent = CONTENT[activePhase]?.[activeService];
  const extractionPrompt = getExtractionPrompt(activePhase, activeService);
  const currentPhaseData = PHASES.find(p => p.id === activePhase);
  const nextPhaseId = currentGate?.nextPhase || '';
  const nextPhaseLabel = PHASES.find(p => p.id === nextPhaseId)?.label || '';

  const allPrompts: Prompt[] = [];
  if (phaseContent) {
    if (phaseContent.prompts) allPrompts.push(...phaseContent.prompts);
    if (phaseContent.subs) phaseContent.subs.forEach(sub => allPrompts.push(...sub.prompts));
  }

  const activeSubData = phaseContent?.subs?.find(s => s.id === activeSubPhase);
  const visiblePrompts: Prompt[] = activeSubData
    ? activeSubData.prompts
    : phaseContent?.prompts || [];

  const totalMinutes = visiblePrompts.reduce((sum, p) => sum + (p.estimatedMinutes || 0), 0);
  const phaseColor = PHASE_COLORS[activePhase] || '#0000FF';

  function handlePhaseChange(phaseId: string) {
    setActivePhase(phaseId);
    setActiveSubPhase(null);
  }

  function handleProceed() {
    if (nextPhaseId) {
      handlePhaseChange(nextPhaseId);
      if (activeProject) updateProject({ currentPhase: nextPhaseId });
    }
  }

  function handleSelectProject(projectId: string) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(projectId);
      setActiveService(project.serviceId);
      setActivePhase(project.currentPhase);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: V.bg,
        color: V.text,
        fontFamily: T.sans,
        paddingRight: chainPanelOpen ? 260 : 0,
        transition: 'padding-right 0.2s',
      }}
    >
      {/* Site header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: V.bg,
          borderBottom: `1px solid ${V.border}`,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: phaseColor,
                fontWeight: 700,
              }}
            >
              EYAY
            </span>
            <span
              style={{
                width: 20,
                height: 1,
                background: '#EF4444',
                opacity: 0.8,
              }}
            />
          </div>
          <span style={{ color: V.border }}>|</span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: V.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
            }}
          >
            Workflow Studio
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <ProjectSelector
          projects={projects}
          activeProjectId={activeProject?.id || null}
          services={SERVICES}
          onSelectProject={handleSelectProject}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
        />
        {extractionPrompt && (
          <button
            onClick={() => setTranscriptOpen(true)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: `1px solid ${V.border}`,
              background: 'transparent',
              color: V.textSub,
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            ◈ Transcript
          </button>
        )}
        <button
          onClick={() => setShowBP(!showBP)}
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: `1px solid ${showBP ? phaseColor + '50' : V.border}`,
            background: showBP ? phaseColor + '18' : 'transparent',
            color: showBP ? phaseColor : V.textSub,
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          ▸ Best Practices
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            padding: '5px 8px',
            borderRadius: 6,
            border: `1px solid ${V.border}`,
            background: 'transparent',
            color: V.textMuted,
            fontFamily: 'monospace',
            fontSize: 10,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {theme === 'dark' ? '◑' : '●'}
        </button>
      </div>

      {/* Hero & meta intro */}
      <div
        style={{
          padding: '40px 24px 12px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase' as const,
              color: V.textMuted,
              marginBottom: 14,
            }}
          >
            // This is how it starts
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: V.text,
            }}
          >
            Your idea from this morning,
            <br />
            built today.
          </h1>
          <p
            style={{
              marginTop: 16,
              maxWidth: 520,
              fontSize: 14,
              lineHeight: 1.6,
              color: V.textSub,
            }}
          >
            EYAY is a small, sharp studio that turns fuzzy notes, transcripts, and
            half-baked specs into shippable product workflows. We build with AI,
            not just about it.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 20,
              flexWrap: 'wrap' as const,
            }}
          >
            <button
              className="primary-cta"
              onClick={() => {
                const el = document.getElementById('workflow-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Start this phase
              <span style={{ fontSize: 14 }}>↗</span>
            </button>
            <button
              onClick={() => {
                setShowProjects(true);
                const el = document.getElementById('projects-overview');
                if (el) {
                  el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${V.border}`,
                background: V.surface,
                color: V.textSub,
                fontFamily: 'monospace',
                fontSize: 10,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              View projects
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11,
                color: V.textMuted,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '999px',
                  background: '#0000FF',
                }}
              />
              <span style={{ fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                {projects.length || 1} active builds in this workspace
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Nav */}
      <div
        style={{
          padding: '8px 24px 0',
          borderBottom: `1px solid ${V.border}`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 960,
            display: 'flex',
            gap: 0,
            overflowX: 'auto' as const,
          }}
        >
          {SERVICES.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActiveService(s.id);
                setActiveSubPhase(null);
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  activeService === s.id
                    ? `2px solid ${s.color}`
                    : '2px solid transparent',
                color: activeService === s.id ? s.color : V.textMuted,
                fontFamily: 'monospace',
                fontSize: 10,
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                whiteSpace: 'nowrap' as const,
                fontWeight: activeService === s.id ? 700 : 400,
              }}
            >
              {s.icon}&nbsp;{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Nav */}
      <div
        style={{
          padding: '0 24px',
          borderBottom: `1px solid ${V.border}`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 960,
            display: 'flex',
            gap: 0,
            overflowX: 'auto' as const,
          }}
        >
          {PHASES.map((phase, i) => {
            const isActive = activePhase === phase.id;
            const projectPhaseIdx = PHASES.findIndex(
              p => p.id === activeProject?.currentPhase
            );
            const isDone = activeProject && i < projectPhaseIdx;
            return (
              <button
                key={phase.id}
                onClick={() => handlePhaseChange(phase.id)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive
                    ? `2px solid ${phase.color}`
                    : '2px solid transparent',
                  color: isActive
                    ? phase.color
                    : isDone
                    ? V.textSub
                    : V.textMuted,
                  fontFamily: 'monospace',
                  fontSize: 10,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap' as const,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {isDone && <span style={{ fontSize: 8 }}>✓</span>}
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 8,
                    opacity: 0.35,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {phase.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div
        id="workflow-section"
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '40px 24px 56px',
        }}
      >

        {/* Best Practices */}
        {showBP && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: V.textMuted, marginBottom: 20 }}>
              Best Practices
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {BEST_PRACTICES.map(bp => (
                <div key={bp.id} style={{
                  padding: 18, borderRadius: 10,
                  border: `1px solid ${bp.color}28`, background: `${bp.color}08`,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    fontFamily: 'monospace', fontSize: 10, color: bp.color,
                    textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 700,
                  }}>
                    <span>{bp.icon}</span><span>{bp.label}</span>
                  </div>
                  {bp.rules.map((rule, ri) => (
                    <div key={ri} style={{ marginBottom: ri < bp.rules.length - 1 ? 16 : 0 }}>
                      <div style={{ fontSize: 13, color: V.text, fontWeight: 500, marginBottom: 6 }}>{rule.t}</div>
                      <div style={{ fontSize: 13, color: V.textSub, lineHeight: 1.6 }}>{rule.b}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase Header */}
        {phaseContent && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: V.text }}>
                  {currentPhaseData?.label}
                  <span style={{ color: V.textMuted, fontWeight: 400, marginLeft: 8, fontSize: 18 }}>
                    — {SERVICES.find(s => s.id === activeService)?.label}
                  </span>
                </h1>
                {totalMinutes > 0 && (
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: V.textMuted }}>~{totalMinutes}m</span>
                )}
              </div>
              {/* Meta bar: IN / OUT */}
              <div style={{
                display: 'flex', gap: 0, padding: '12px 16px',
                borderRadius: 10, background: V.surface, border: `1px solid ${V.border}`,
                fontSize: 13, flexWrap: 'wrap' as const, columnGap: 20, rowGap: 8,
              }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: V.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginRight: 8 }}>IN</span>
                  <span style={{ color: V.textSub }}>{phaseContent.input}</span>
                </div>
                <span style={{ color: V.border, userSelect: 'none' }}>·</span>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: V.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginRight: 8 }}>OUT</span>
                  <span style={{ color: V.textSub }}>{phaseContent.output}</span>
                </div>
              </div>

              <DeckGeneratorForm
                phaseId={activePhase}
                phaseLabel={currentPhaseData?.label || activePhase}
                serviceId={activeService}
                serviceLabel={SERVICES.find(s => s.id === activeService)?.label || activeService}
                defaultProjectName={activeProject?.name}
              />
            </div>

            {/* Common Mistakes */}
            {phaseContent.mistakes && phaseContent.mistakes.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#EF4444', marginBottom: 10 }}>
                  Common Mistakes
                </div>
                <div style={{ padding: '8px 14px', borderRadius: 8, background: '#EF444408', border: '1px solid #EF444420' }}>
                  {phaseContent.mistakes.map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '6px 0', fontSize: 13, color: V.textSub, lineHeight: 1.5,
                      borderBottom: i < phaseContent.mistakes!.length - 1 ? '1px solid #EF444415' : 'none',
                    }}>
                      <span style={{ color: '#EF4444', flexShrink: 0, marginTop: 2, fontSize: 11 }}>✗</span>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-phase tabs */}
            {phaseContent.subs && phaseContent.subs.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {phaseContent.subs.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubPhase(activeSubPhase === sub.id ? null : sub.id)}
                    style={{
                      padding: '7px 14px', borderRadius: 6,
                      border: `1px solid ${activeSubPhase === sub.id ? sub.color + '50' : V.border}`,
                      background: activeSubPhase === sub.id ? `${sub.color}18` : V.surface,
                      color: activeSubPhase === sub.id ? sub.color : V.textSub,
                      fontFamily: 'monospace', fontSize: 10, cursor: 'pointer',
                      letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                      fontWeight: activeSubPhase === sub.id ? 700 : 400,
                    }}
                  >
                    {sub.icon}&nbsp;{sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Prompts */}
            {visiblePrompts.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const, color: V.textMuted, marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>Prompts</span>
                  {Object.keys(chainOutputs).length > 0 && (
                    <button
                      onClick={() => setChainPanelOpen(true)}
                      style={{
                        padding: '4px 10px', borderRadius: 4,
                        border: '1px solid #0000FF40', background: '#0000FF10',
                        color: '#0000FF', fontFamily: 'monospace', fontSize: 9,
                        cursor: 'pointer', letterSpacing: '0.04em',
                      }}
                    >
                      {Object.keys(chainOutputs).length} saved ↗
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                  {visiblePrompts.map((prompt, index) => {
                    const promptId = prompt.id || `prompt-${index}`;
                    const previousOut = getPreviousOutput(index, visiblePrompts);
                    return (
                      <PromptCard
                        key={promptId}
                        prompt={prompt}
                        index={index}
                        chainOutput={chainOutputs[promptId]}
                        onSaveOutput={setOutput}
                        previousOutput={previousOut}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Decision Gate */}
            {currentGate && (
              <DecisionGate
                gate={currentGate}
                completedItems={completedItems}
                onToggleItem={toggleItem}
                onProceed={handleProceed}
                nextPhaseLabel={nextPhaseLabel}
              />
            )}
          </>
        )}

        {!phaseContent && (
          <div style={{ textAlign: 'center' as const, padding: '60px 0', color: V.textMuted }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
              No content for {activePhase} / {activeService}
            </div>
          </div>
        )}
      </div>

      {/* Projects Overview */}
      <div
        id="projects-overview"
        style={{
          borderTop: `1px solid ${V.border}`,
          marginTop: 24,
        }}
      >
        {showProjects && <ProjectsPage />}
      </div>

      {/* Chain Panel */}
      <ChainPanel
        prompts={allPrompts}
        chainOutputs={chainOutputs}
        onJumpToPrompt={() => {}}
        onClearChain={clearChain}
        isOpen={chainPanelOpen}
        onToggle={() => setChainPanelOpen(!chainPanelOpen)}
      />

      {/* Transcript Modal */}
      {transcriptOpen && (
        <TranscriptInput
          extractionPrompt={extractionPrompt}
          onClose={() => setTranscriptOpen(false)}
        />
      )}
    </div>
  );
}
