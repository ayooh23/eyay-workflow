// src/types/index.ts
// Shared types for the EYAY Workflow Hub

// ═══════════════════════════════════════════════════════════════════════════
// CORE DATA TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Phase {
  id: string;
  label: string;
  color: string;
}

export interface Service {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface Tool {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export type ToolType = "chat" | "code";

export interface Prompt {
  id?: string; // auto-generated if not provided
  title: string;
  tool: ToolType;
  agentic: boolean;
  content: string;
  estimatedMinutes?: number; // 5, 10, 20, 30
  chainFrom?: string; // ID of prompt whose output this uses
}

export interface SubPhase {
  id: string;
  label: string;
  icon: string;
  color: string;
  prompts: Prompt[];
}

export interface PhaseContent {
  input: string;
  output: string;
  gate: string;
  mistakes?: string[];
  prompts?: Prompt[];
  subs?: SubPhase[];
}

export interface BestPractice {
  id: string;
  icon: string;
  label: string;
  color: string;
  rules: BestPracticeRule[];
}

export interface BestPracticeRule {
  t: string; // title
  b: string; // body
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISION GATES
// ═══════════════════════════════════════════════════════════════════════════

export interface GateItem {
  id: string;
  text: string;
}

export interface DecisionGate {
  phaseId: string;
  serviceId: string;
  title: string;
  items: GateItem[];
  nextPhase: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACTION / TRANSCRIPT MODE
// ═══════════════════════════════════════════════════════════════════════════

export interface ExtractionPrompt {
  phaseId: string;
  serviceId: string;
  title: string;
  description: string;
  prompt: string;
  outputStructure: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface Project {
  id: string;
  name: string;
  serviceId: string;
  createdAt: number;
  updatedAt: number;
  currentPhase: string;
  gateProgress: GateProgress;
  chainOutputs: ChainOutputs;
  notes: string;
}

// phaseId-serviceId → array of completed gate item IDs
export type GateProgress = Record<string, string[]>;

// promptId → saved output text
export type ChainOutputs = Record<string, string>;

// ═══════════════════════════════════════════════════════════════════════════
// UI STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface AppState {
  activeProjectId: string | null;
  currentPhase: string;
  currentService: string;
  currentSubPhase: string | null;
  expandedPrompts: string[];
  chainPanelOpen: boolean;
  transcriptPanelOpen: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════════════

export interface PromptCardProps {
  prompt: Prompt;
  chainOutput?: string;
  onSaveOutput: (output: string) => void;
  previousOutput?: { promptTitle: string; output: string };
}

export interface DecisionGateProps {
  gate: DecisionGate;
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
  onProceed: () => void;
  phaseColor: string;
}

export interface MetaBarProps {
  input: string;
  output: string;
  gate: string;
}

export interface ChainPanelProps {
  prompts: Prompt[];
  chainOutputs: ChainOutputs;
  onJumpToPrompt: (promptId: string) => void;
  onClearChain: () => void;
}

export interface TranscriptInputProps {
  phaseId: string;
  serviceId: string;
  extractionPrompt: ExtractionPrompt | undefined;
  onExtract: (structuredOutput: string) => void;
}

export interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, serviceId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK RETURN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseProjectReturn {
  projects: Project[];
  activeProject: Project | null;
  createProject: (name: string, serviceId: string) => Project;
  updateProject: (updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setActiveProject: (projectId: string) => void;
  exportProject: (projectId: string) => string;
  importProject: (json: string) => Project | null;
}

export interface UsePhaseProgressReturn {
  completedItems: string[];
  toggleItem: (itemId: string) => void;
  isComplete: boolean;
  progress: { completed: number; total: number };
  resetProgress: () => void;
}

export interface UsePromptChainReturn {
  outputs: ChainOutputs;
  setOutput: (promptId: string, output: string) => void;
  getOutput: (promptId: string) => string | undefined;
  getPreviousOutput: (currentPromptIndex: number, prompts: Prompt[]) => { promptTitle: string; output: string } | undefined;
  clearChain: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════════════════

export interface Theme {
  bg: string;
  surface: string;
  border: string;
  borderMid: string;
  text: string;
  textSub: string;
  textMuted: string;
  mono: string;
  sans: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MAP TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type ContentMap = Record<string, Record<string, PhaseContent>>;
