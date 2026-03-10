import { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { useProjectSummaries } from '../hooks/useProjectSummaries';
import { ProjectCard } from './ProjectCard';
import { ProjectGrid } from './ProjectGrid';
import { T, V } from './theme';

export function ProjectsPage() {
  const { projects, setActiveProject } = useProject();
  const { summaries, isLoading, generateSummary } = useProjectSummaries();
  const [showCreateHint] = useState(false);

  const activeCount = projects.length;
  const blockedCount = Object.values(summaries).filter(
    s => s.status === 'blocked'
  ).length;
  const totalGatesComplete = projects.reduce((acc, p) => {
    return (
      acc +
      Object.values(p.gateProgress).reduce(
        (sum, ids) => sum + (ids?.length || 0),
        0
      )
    );
  }, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        padding: '48px 32px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: T.mono,
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#737373',
                margin: '0 0 8px 0',
              }}
            >
              Projects
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#737373',
                margin: 0,
              }}
            >
              {activeCount} active · {blockedCount} blocked ·{' '}
              {totalGatesComplete} gates complete
            </p>
          </div>

          <button
            type="button"
            style={{
              background: V.brand,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: T.sans,
            }}
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 32px',
              background: '#F5F5F5',
              borderRadius: 12,
              border: '1px solid #D4D4D4',
            }}
          >
            <p
              style={{
                fontSize: 16,
                color: '#737373',
                marginBottom: 24,
              }}
            >
              No projects yet. Create one from the main workflow to get started.
            </p>
            {showCreateHint && (
              <p
                style={{
                  fontSize: 13,
                  color: '#A3A3A3',
                  margin: 0,
                }}
              >
                Use the project selector in the header to add your first
                project.
              </p>
            )}
          </div>
        ) : (
          <ProjectGrid>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                summary={summaries[project.id] || null}
                isLoadingSummary={isLoading[project.id] || false}
                onOpen={() => {
                  setActiveProject(project.id);
                  const el = document.getElementById('workflow-section');
                  if (el) {
                    el.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
                onGenerateDeck={() => {
                  // Deck generation is handled in the main workflow for now.
                }}
                onGenerateSummary={() => generateSummary(project.id, project)}
              />
            ))}
          </ProjectGrid>
        )}
      </div>
    </div>
  );
}

