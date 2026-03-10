import { memo, useState, useCallback } from 'react';
import type { Project, Service } from '../types';
import { T } from './theme';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  services: Service[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, serviceId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const PHASE_LABELS: Record<string, string> = {
  idea: 'Discover', prd: 'Define', build: 'Build', qa: 'Validate', close: 'Ship',
};

export const ProjectSelector = memo(function ProjectSelector({
  projects, activeProjectId, services, onSelectProject, onCreateProject, onDeleteProject,
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6,
          border: `1px solid ${T.border}`, background: activeProject ? T.surface : 'transparent', cursor: 'pointer',
        }}
      >
        <span style={{ fontFamily: T.mono, fontSize: 10, color: activeProject ? T.text : T.textMuted }}>
          {activeProject ? activeProject.name : 'No project'}
        </span>
        <span style={{ fontSize: 8, color: T.textMuted }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 260,
            background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
            overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {projects.length > 0 && (
              <div style={{ maxHeight: 200, overflowY: 'auto' as const }}>
                {projects.map((project) => {
                  const service = services.find(s => s.id === project.serviceId);
                  const isActive = project.id === activeProjectId;
                  return (
                    <div
                      key={project.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderBottom: `1px solid ${T.border}`,
                        background: isActive ? T.surface : 'transparent', cursor: 'pointer',
                      }}
                      onClick={() => { onSelectProject(project.id); setIsOpen(false); }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: T.text, marginBottom: 2 }}>{project.name}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontFamily: T.mono, fontSize: 8, color: service?.color || T.textMuted, textTransform: 'uppercase' as const }}>
                            {service?.label || project.serviceId}
                          </span>
                          <span style={{ fontSize: 8, color: T.textMuted }}>·</span>
                          <span style={{ fontFamily: T.mono, fontSize: 8, color: T.textMuted }}>
                            {PHASE_LABELS[project.currentPhase] || project.currentPhase}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${project.name}"?`)) onDeleteProject(project.id);
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: T.textMuted,
                          cursor: 'pointer', padding: 4, fontSize: 12, opacity: 0.5,
                        }}
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  width: '100%', padding: 12, background: 'transparent', border: 'none',
                  color: T.textSub, fontFamily: T.mono, fontSize: 10, cursor: 'pointer', textAlign: 'left' as const,
                }}
              >
                + New project
              </button>
            ) : (
              <div style={{ padding: 12 }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Project name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 4,
                    border: `1px solid ${T.borderMid}`, background: T.surface,
                    color: T.text, fontFamily: T.sans, fontSize: 12,
                    marginBottom: 8, outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 4,
                    border: `1px solid ${T.borderMid}`, background: T.surface,
                    color: T.text, fontFamily: T.mono, fontSize: 10,
                    marginBottom: 8, outline: 'none', boxSizing: 'border-box' as const,
                  }}
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setShowCreate(false)}
                    style={{
                      flex: 1, padding: 8, borderRadius: 4,
                      border: `1px solid ${T.border}`, background: 'transparent',
                      color: T.textMuted, fontFamily: T.mono, fontSize: 9, cursor: 'pointer',
                    }}
                  >Cancel</button>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    style={{
                      flex: 1, padding: 8, borderRadius: 4, border: 'none',
                      background: newName.trim() ? '#0000FF' : T.surface,
                      color: newName.trim() ? '#FFFFFF' : T.textMuted,
                      fontFamily: T.mono, fontSize: 9,
                      cursor: newName.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >Create</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});
