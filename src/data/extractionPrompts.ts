import type { ExtractionPrompt } from '../types';

export const EXTRACTION_PROMPTS: ExtractionPrompt[] = [
  {
    phaseId: 'idea', serviceId: 'site',
    title: 'Extract Site Brief',
    description: 'Extract a structured brief from client emails, call notes, or Slack threads',
    outputStructure: ['Primary goal', 'Visitor types', 'Design direction', 'V1 pages', 'Risks'],
    prompt: `You are extracting a website brief from raw notes or conversation.

INPUT:
[PASTE TRANSCRIPT, EMAILS, OR NOTES HERE]

Extract and structure:

1. PRIMARY GOAL — one sentence, one goal. Flag if multiple goals are competing.
2. VISITOR TYPES (max 3) — who they are, what they need, action we want from them.
3. DESIGN DIRECTION — two adjectives it MUST feel like, two it must NEVER feel like.
4. V1 PAGES — page name → single-sentence purpose.
5. RISKS & GAPS — anything unclear, scope not confirmed, timeline concerns.

Only extract what's in the input. Mark missing info as [NEEDS CLARIFICATION: what's missing].`,
  },
  {
    phaseId: 'idea', serviceId: 'tool',
    title: 'Extract Workflow Audit',
    description: 'Extract workflow steps from meeting notes or process descriptions',
    outputStructure: ['Workflow steps', 'Bottlenecks', 'Automation candidates', 'Success metric'],
    prompt: `You are extracting a workflow audit from raw notes or conversation.

INPUT:
[PASTE TRANSCRIPT, MEETING NOTES, OR PROCESS DESCRIPTION HERE]

Extract and structure:

1. WORKFLOW MAP — numbered steps as they actually happen, who does each step, time per step.
2. BOTTLENECKS — steps that are slow, error-prone, or regularly skipped.
3. AUTOMATION CANDIDATES — mark each step: automate / human judgment required.
4. DATA DEPENDENCIES — what input each step needs and where it lives.
5. SUCCESS METRIC — one measurable metric proving the tool works.
6. GAPS — steps that were vague, missing information.

Only extract what's in the input. Mark unclear items as [NEEDS CLARIFICATION].`,
  },
  {
    phaseId: 'idea', serviceId: 'mvp',
    title: 'Extract Product Brief',
    description: 'Extract problem, user, and core loop from founder notes or pitch content',
    outputStructure: ['Problem statement', 'Primary user', 'Core loop', 'V1 scope', 'Evidence'],
    prompt: `You are extracting a product brief from raw notes, pitch content, or conversation.

INPUT:
[PASTE TRANSCRIPT, PITCH NOTES, OR CONVERSATION HERE]

Extract and structure:

1. PROBLEM STATEMENT — format: [specific person] struggles to [specific task] because [specific reason]
2. PRIMARY USER — specific role, context, what they do today instead
3. CORE LOOP — TRIGGER / ACTION / OUTPUT / RETURN
4. V1 SCOPE — IN (supports core loop) / OUT (explicitly deferred)
5. EVIDENCE — any validation mentioned. If none: [NO VALIDATION MENTIONED]
6. GAPS — critical missing information, assumptions needing testing

Be ruthless about specificity. "Users" is not a user. Quote any strong language about the problem.`,
  },
  {
    phaseId: 'idea', serviceId: 'ai',
    title: 'Extract AI Fit Assessment',
    description: 'Extract AI integration requirements from feature discussions',
    outputStructure: ['AI fit', 'Task definition', 'Input contract', 'Output contract', 'Failure modes'],
    prompt: `You are extracting an AI integration assessment from feature discussion notes.

INPUT:
[PASTE FEATURE DISCUSSION, REQUIREMENTS, OR CONVERSATION HERE]

Extract and structure:

1. AI FIT — is AI genuinely needed, or would a simpler solution work?
2. TASK DEFINITION — the exact task the AI performs, in one sentence
3. INPUT CONTRACT — what data the AI receives: user text / structured data / context
4. OUTPUT CONTRACT — format: free text / JSON schema / list / classification
5. FAILURE MODES — bad output / empty / API down / rate limit → what user sees
6. TRUST REQUIREMENT — output shown directly to users, or reviewed first?
7. GAPS — output format unspecified, failure handling unclear, edge cases not discussed

If AI fit is questionable, say so clearly.`,
  },
  {
    phaseId: 'prd', serviceId: 'mvp',
    title: 'Extract Feature Spec',
    description: 'Extract feature requirements from planning discussions',
    outputStructure: ['Features', 'User flow', 'Tech decisions', 'Open questions'],
    prompt: `You are extracting a feature spec from planning notes or discussion.

INPUT:
[PASTE PLANNING NOTES, WHITEBOARD PHOTOS, OR DISCUSSION HERE]

Extract and structure:

1. FEATURES (max 6 for v1) — for each: name, what user does, what system does, what user gets, P0/P1/P2
2. PRIMARY USER FLOW — entry / steps / decision points / success moment
3. TECH DECISIONS MENTIONED — stack choices, integrations, constraints
4. OPEN QUESTIONS — ambiguous features, missing priorities, undecided tech

If priority wasn't stated, mark as [PRIORITY UNCLEAR]. Flag features with external dependencies.`,
  },
  {
    phaseId: 'build', serviceId: 'mvp',
    title: 'Extract Bug Report',
    description: 'Extract actionable bug details from user feedback or testing notes',
    outputStructure: ['Bug summary', 'Steps to reproduce', 'Expected vs actual', 'Severity', 'Context'],
    prompt: `You are extracting a structured bug report from raw feedback or testing notes.

INPUT:
[PASTE USER FEEDBACK, SLACK MESSAGE, OR TESTING NOTES HERE]

Extract and structure:

1. BUG SUMMARY — one sentence: what's broken
2. STEPS TO REPRODUCE — numbered steps, include specific data or conditions
3. EXPECTED VS ACTUAL — what should happen, what actually happens, exact error messages
4. SEVERITY — Blocker / Major / Minor / Cosmetic
5. CONTEXT — device, browser, OS, user role if mentioned
6. UNKNOWNS — information needed to reproduce, questions for the reporter

Quote exact error messages. Note if severity was stated vs inferred.`,
  },
  {
    phaseId: 'qa', serviceId: 'mvp',
    title: 'Extract User Feedback',
    description: 'Extract structured insights from user testing sessions or feedback',
    outputStructure: ['Working', 'Confusing', 'Missing', 'Quotes', 'Priorities'],
    prompt: `You are extracting structured feedback from user testing notes or feedback messages.

INPUT:
[PASTE USER TESTING NOTES, FEEDBACK EMAILS, OR INTERVIEW TRANSCRIPT HERE]

Extract and structure:

1. WHAT'S WORKING — features praised, "aha" moments, smooth workflows
2. WHAT'S CONFUSING — where they got stuck, questions asked, misunderstandings
3. WHAT'S MISSING — features expected but absent, workflow gaps, "I wish it could..."
4. SURPRISING USAGE — unexpected ways they used it, workarounds created
5. VERBATIM QUOTES — direct quotes with context, positive and negative
6. PRIORITY SIGNALS — what would make them use it more, what would make them stop

Preserve exact user language in quotes. Note if feedback was prompted vs spontaneous.`,
  },
  {
    phaseId: 'close', serviceId: 'mvp',
    title: 'Extract Retrospective',
    description: 'Extract retrospective insights from team discussion',
    outputStructure: ['Shipped vs scoped', 'What worked', 'What didn\'t', 'Key decisions', 'Next time'],
    prompt: `You are extracting a structured retrospective from team discussion notes.

INPUT:
[PASTE RETRO DISCUSSION NOTES, SLACK THREAD, OR MEETING TRANSCRIPT HERE]

Extract and structure:

1. SHIPPED VS SCOPED — original scope / what shipped / what was cut / what was added
2. WHAT WORKED — process wins, tooling that helped, collaboration patterns to keep
3. WHAT DIDN'T WORK — causes of rework, process friction, what to stop
4. PROMPT QUALITY (for AI features) — which prompts needed most iteration, failure patterns
5. KEY DECISIONS — biggest impact decision, would you make it again?
6. NEXT TIME — specific changes for the next project

No generalities. Every point should be specific and actionable.`,
  },
];

export function getExtractionPrompt(phaseId: string, serviceId: string): ExtractionPrompt | undefined {
  return EXTRACTION_PROMPTS.find(e => e.phaseId === phaseId && e.serviceId === serviceId);
}
