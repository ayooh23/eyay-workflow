# EYAY Workflow Hub → AI Product Development OS

## Implementation Plan for Claude Code

This document transforms the static prompt hub into an interactive workflow system.
Feed this entire file to Claude Code with `@WORKFLOW-HUB-UPGRADE.md` to begin.

---

## Context

**Current state:** React component with phases, prompts, and best practices as static content.
**Target state:** Operational workflow system with decision gates, prompt chaining, transcript mode, and state persistence.

**Stack:** React (existing), Tailwind-style inline CSS, localStorage for state.

---

## Phase 1: Architecture Refactor (1-2 hours)

### 1.1 Separate data from UI

Create a clean data layer. This makes future features possible.

```
src/
├── data/
│   ├── phases.ts        # PHASES array + types
│   ├── services.ts      # SERVICES array + types  
│   ├── prompts.ts       # All prompt content by phase/service
│   ├── bestPractices.ts # BP array
│   └── gates.ts         # Decision gate definitions
├── hooks/
│   ├── useProject.ts    # Project state management
│   ├── usePhaseProgress.ts # Gate tracking
│   └── usePromptChain.ts   # Chain state
├── components/
│   ├── PhaseNav.tsx
│   ├── PromptCard.tsx
│   ├── DecisionGate.tsx
│   ├── ChainPanel.tsx
│   └── TranscriptInput.tsx
└── App.tsx
```

**Prompt for Claude Code:**

```
Refactor the current App component into a clean architecture:

1. Create src/data/ folder with TypeScript types and data:
   - phases.ts: Phase type + PHASES array
   - services.ts: Service type + SERVICES array  
   - prompts.ts: Prompt type + CONTENT object (the big nested object)
   - bestPractices.ts: BestPractice type + BP array
   - tools.ts: Tool config (TOOL object)

2. Create src/types/index.ts with shared types:
   - Phase, Service, Prompt, BestPractice, Tool
   - ProjectState (for later)

3. Move each component into src/components/:
   - TagComp.tsx
   - AgenticBadge.tsx  
   - CopyBtn.tsx
   - PromptCard.tsx
   - MetaBar.tsx
   - MistakesBlock.tsx
   - PhaseNav.tsx
   - ServiceNav.tsx

4. Keep App.tsx as the shell that composes these.

Maintain all existing functionality. Run and verify nothing breaks.
```

---

## Phase 2: Decision Gates (1 hour)

Transform passive "gates" into interactive checkpoints.

### 2.1 Gate data structure

```typescript
// src/data/gates.ts
export interface GateItem {
  id: string;
  text: string;
}

export interface DecisionGate {
  phaseId: string;
  serviceId: string;
  title: string;
  items: GateItem[];
}

export const GATES: DecisionGate[] = [
  {
    phaseId: "idea",
    serviceId: "mvp",
    title: "Ready for Define?",
    items: [
      { id: "problem", text: "Problem statement is one sentence, specific person + specific struggle" },
      { id: "user", text: "Primary user named and described in context" },
      { id: "loop", text: "Core loop defined: trigger → action → output → return" },
      { id: "scope", text: "v1 scope written down with explicit 'out of scope' list" },
    ]
  },
  // ... more gates per phase/service
];
```

### 2.2 Gate UI component

**Prompt for Claude Code:**

```
Create a DecisionGate component that renders at the bottom of each phase:

Props:
- gate: DecisionGate
- completedItems: string[] (IDs of checked items)
- onToggle: (itemId: string) => void
- onProceed: () => void

UI:
- Header: "✓ Ready to proceed?" with phase color accent
- Checklist of gate items with checkboxes
- Progress indicator: "2 of 4 complete"
- "Move to [Next Phase]" button — disabled until all items checked
- Subtle animation when all items complete

Style: Match existing dark theme. Use the phase color for accents.

Store completed items in localStorage keyed by `gate-${phaseId}-${serviceId}`.
```

### 2.3 Integrate into phase view

```
Add DecisionGate to the phase content area:
- Appears after prompts section
- Pulls gate data from GATES based on current phase + service
- Tracks completion state via usePhaseProgress hook
- "Move to Define" button calls handlePhase(nextPhase)
```

---

## Phase 3: Prompt Chaining (1.5 hours)

Make prompt outputs flow into next prompt inputs.

### 3.1 Chain state management

```typescript
// src/hooks/usePromptChain.ts
interface ChainState {
  outputs: Record<string, string>; // promptId → user's pasted output
  currentChain: string[]; // ordered list of prompt IDs in active chain
}

export function usePromptChain(projectId: string) {
  // localStorage persistence
  // Methods: setOutput, getOutput, clearChain
}
```

### 3.2 Enhanced PromptCard with output capture

**Prompt for Claude Code:**

```
Enhance PromptCard to support prompt chaining:

1. Add "Save Output" textarea that appears after expanding a prompt
   - Placeholder: "Paste Claude's response here to use in the next prompt"
   - Auto-saves to chain state on blur
   - Shows "✓ Saved" indicator

2. Add "Insert Previous Output" button when:
   - There's a saved output from a prompt in the same phase
   - Clicking inserts `[Previous output from "Prompt Name":]` marker in the prompt text
   
3. Add chain visualization:
   - Small connector line between prompts that have saved outputs
   - "Chained" badge on prompts that reference previous outputs

Visual: Keep minimal. Collapsed by default. Subtle connector lines.
```

### 3.3 Chain panel (sidebar or drawer)

```
Create ChainPanel component:
- Shows current phase's prompt chain visually
- Each node: prompt title + "output saved" status
- Click node to jump to that prompt
- "Clear chain" button to reset

Position: Fixed right sidebar, 240px wide, collapsible.
```

---

## Phase 4: Transcript Mode (1 hour)

Paste raw transcript → extract structured spec.

### 4.1 Transcript input component

**Prompt for Claude Code:**

```
Create TranscriptInput component:

Props:
- phaseId: string
- serviceId: string
- onExtract: (structuredOutput: string) => void

UI:
1. Textarea: "Paste meeting notes, Slack thread, or voice transcript"
2. "Extract to [Phase] spec" button
3. Loading state while "processing"
4. Output preview with "Use this" / "Edit" options

The extraction prompt (stored in data/prompts.ts):
- Takes raw text
- Outputs structured format matching the phase's expected output
- Example for Discover/MVP phase: extracts problem, user, core loop, scope

For v1, this shows the extraction prompt for the user to copy.
For v2, this could call Claude API directly.
```

### 4.2 Extraction prompts per phase

Add to `prompts.ts`:

```typescript
export const EXTRACTION_PROMPTS: Record<string, Record<string, string>> = {
  idea: {
    mvp: `You are extracting a product brief from raw notes.

INPUT: [transcript/notes will be pasted here]

Extract and structure:
1. PROBLEM — one sentence: [person] struggles to [task] because [reason]
2. PRIMARY USER — specific role + context
3. CORE LOOP — trigger / action / output / return
4. V1 SCOPE — in / out
5. GAPS — anything unclear or missing from the notes

If information is missing, mark it as [NEEDS CLARIFICATION: what's missing].
Do not invent. Only extract what's present.`,
    // ... other services
  },
  // ... other phases
};
```

---

## Phase 5: Project State (1 hour)

Track progress across sessions.

### 5.1 Project model

```typescript
// src/types/project.ts
interface Project {
  id: string;
  name: string;
  serviceId: string;
  createdAt: number;
  currentPhase: string;
  gateProgress: Record<string, string[]>; // phaseId → completed gate items
  chainOutputs: Record<string, string>;   // promptId → saved output
  notes: string;
}
```

### 5.2 Project selector

**Prompt for Claude Code:**

```
Create project management:

1. useProject hook:
   - CRUD for projects in localStorage
   - Active project selection
   - Auto-save on changes

2. ProjectSelector component (top of app):
   - Dropdown: "ResumeCopilot" / "Client Site X" / "+ New Project"
   - New project modal: name + service type
   - Project badge shows current phase

3. When project is selected:
   - Service is locked to project's service
   - Phase progress loads from project state
   - Chain outputs restore

4. Export project as JSON (for backup/sharing)
```

---

## Phase 6: UI Polish (30 min)

### 6.1 Effort indicators

**Prompt for Claude Code:**

```
Add time estimates to prompts:

1. Add `estimatedMinutes` field to Prompt type (5 / 10 / 20 / 30)

2. Show in PromptCard header:
   - "~5 min" badge, subtle gray
   - Different color bands: green (5), yellow (10-20), orange (30+)

3. Phase summary:
   - "This phase: ~45 min total"
   - Based on sum of visible prompts
```

### 6.2 Progress visualization

```
Add to phase nav:
- Small progress dots under each phase button
- Filled = gate complete for current project
- Creates visual journey across phases
```

---

## Implementation Order for Claude Code

Run these in sequence. Each builds on the previous.

### Session 1: Foundation
```
1. Refactor into /data and /components structure
2. Add TypeScript types
3. Verify everything still works
```

### Session 2: Decision Gates
```
1. Create gates.ts with gate definitions
2. Build DecisionGate component
3. Add usePhaseProgress hook
4. Integrate into phase view
```

### Session 3: Prompt Chaining
```
1. Add usePromptChain hook
2. Enhance PromptCard with output capture
3. Build ChainPanel sidebar
4. Connect chain state to UI
```

### Session 4: Transcript Mode
```
1. Add extraction prompts to prompts.ts
2. Build TranscriptInput component
3. Add to each phase view
```

### Session 5: Projects + Polish
```
1. Build useProject hook
2. Create ProjectSelector
3. Add effort indicators
4. Add progress visualization
```

---

## File-by-File Specifications

### src/types/index.ts

```typescript
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

export interface Prompt {
  title: string;
  tool: "chat" | "code";
  agentic: boolean;
  content: string;
  estimatedMinutes?: number;
  chainFrom?: string; // ID of prompt whose output this uses
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
}

export interface PhaseContent {
  input: string;
  output: string;
  gate: string;
  mistakes?: string[];
  prompts?: Prompt[];
  subs?: SubPhase[];
}

export interface SubPhase {
  id: string;
  label: string;
  icon: string;
  color: string;
  prompts: Prompt[];
}

export interface BestPractice {
  id: string;
  icon: string;
  label: string;
  color: string;
  rules: { t: string; b: string }[];
}

export interface Project {
  id: string;
  name: string;
  serviceId: string;
  createdAt: number;
  currentPhase: string;
  gateProgress: Record<string, string[]>;
  chainOutputs: Record<string, string>;
  notes: string;
}
```

---

## Testing Checklist

After each session, verify:

- [ ] All existing prompts still display correctly
- [ ] Phase navigation works
- [ ] Service switching works
- [ ] Best practices section works
- [ ] Mobile responsive (375px)
- [ ] No console errors
- [ ] localStorage persistence works

---

## Future: Dynamic Prompt Generation (v2)

Once the above is stable, the hub can generate prompts dynamically:

```typescript
// User inputs:
const projectContext = {
  name: "ResumeCopilot",
  user: "job seekers",
  aiTask: "rewrite CV bullet points",
  stack: "Next.js, Supabase, Anthropic"
};

// Hub generates:
// - System prompt tailored to this product
// - API route structure
// - Database schema
// - Core loop components

// This turns the hub from prompt reference → AI Product Generator
```

This requires an API integration (Claude API or MCP) and is a v2 feature.

---

## Commands for Claude Code

Start each session with:

```bash
# Clone/open the project
cd ~/workflow-hub

# Install deps if needed
npm install

# Start dev server
npm run dev
```

Then feed the relevant section of this document as context.

---

*Generated for EYAY Workflow Hub upgrade. Based on architectural review feedback.*
