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
  id?: string;
  title: string;
  tool: ToolType;
  agentic: boolean;
  content: string;
  estimatedMinutes?: number;
  chainFrom?: string;
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
  t: string;
  b: string;
}

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

export interface ExtractionPrompt {
  phaseId: string;
  serviceId: string;
  title: string;
  description: string;
  prompt: string;
  outputStructure: string[];
}

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

export type GateProgress = Record<string, string[]>;
export type ChainOutputs = Record<string, string>;

export interface AppState {
  activeProjectId: string | null;
  currentPhase: string;
  currentService: string;
  expandedPrompts: string[];
  chainPanelOpen: boolean;
  transcriptPanelOpen: boolean;
}

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
