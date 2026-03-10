// src/data/extractionPrompts.ts
// Prompts for Transcript Mode: paste raw notes → extract structured spec
// This is the AI-native workflow mentioned in the review

export interface ExtractionPrompt {
  phaseId: string;
  serviceId: string;
  title: string;
  description: string;
  prompt: string;
  outputStructure: string[];
}

export const EXTRACTION_PROMPTS: ExtractionPrompt[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVER PHASE EXTRACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "idea",
    serviceId: "site",
    title: "Extract Site Brief",
    description: "Extract a structured brief from client emails, call notes, or Slack threads",
    outputStructure: ["Primary goal", "Visitor types", "Design direction", "V1 pages", "Risks"],
    prompt: `You are extracting a website brief from raw notes or conversation.

INPUT:
[PASTE TRANSCRIPT, EMAILS, OR NOTES HERE]

Extract and structure:

1. PRIMARY GOAL
   - One sentence, one goal
   - If multiple goals mentioned, flag the conflict

2. VISITOR TYPES (max 3)
   - Who they are
   - What they need
   - Action we want from them

3. DESIGN DIRECTION
   - Two adjectives it MUST feel like
   - Two adjectives it must NEVER feel like
   - Any references or examples mentioned

4. V1 PAGES
   - Page name → single-sentence purpose
   - Flag any page with unclear purpose

5. RISKS & GAPS
   - Anything unclear or missing
   - Scope items mentioned but not confirmed
   - Timeline concerns

FORMAT RULES:
- Only extract what's actually in the input
- Mark missing information as [NEEDS CLARIFICATION: what's missing]
- Don't invent or assume — if it's not there, note the gap
- Keep it structured and scannable`
  },
  
  {
    phaseId: "idea",
    serviceId: "tool",
    title: "Extract Workflow Audit",
    description: "Extract workflow steps from meeting notes or process descriptions",
    outputStructure: ["Workflow steps", "Bottlenecks", "Automation candidates", "Success metric"],
    prompt: `You are extracting a workflow audit from raw notes or conversation.

INPUT:
[PASTE TRANSCRIPT, MEETING NOTES, OR PROCESS DESCRIPTION HERE]

Extract and structure:

1. WORKFLOW MAP
   - Numbered steps as they actually happen
   - Who does each step
   - Approximate time per step if mentioned

2. BOTTLENECKS
   - Steps that are slow, error-prone, or regularly skipped
   - Quote any frustrations mentioned

3. AUTOMATION CANDIDATES
   - Mark each step: suitable for automation / requires human judgement
   - Note any dependencies between steps

4. DATA DEPENDENCIES
   - What input data each step relies on
   - Where that data currently lives

5. SUCCESS METRIC
   - One measurable metric that would prove the tool works
   - If not mentioned, suggest based on bottlenecks

6. GAPS
   - Steps that were vague or unclear
   - Missing information needed before speccing

FORMAT RULES:
- Only extract what's in the input
- Mark unclear items as [NEEDS CLARIFICATION]
- Preserve any specific numbers, frequencies, or frustrations mentioned`
  },
  
  {
    phaseId: "idea",
    serviceId: "mvp",
    title: "Extract Product Brief",
    description: "Extract problem, user, and core loop from founder notes or pitch content",
    outputStructure: ["Problem statement", "Primary user", "Core loop", "V1 scope", "Evidence"],
    prompt: `You are extracting a product brief from raw notes, pitch content, or conversation.

INPUT:
[PASTE TRANSCRIPT, PITCH NOTES, OR CONVERSATION HERE]

Extract and structure:

1. PROBLEM STATEMENT
   - Format: [specific person] struggles to [specific task] because [specific reason]
   - If the problem is solution-first, flag it
   - If it's too broad, note what's missing

2. PRIMARY USER
   - Specific role and context
   - When this problem hits them
   - What they do today instead

3. CORE LOOP
   - TRIGGER: what causes them to open the product
   - ACTION: the one thing they do
   - OUTPUT: what they get
   - RETURN: what brings them back
   - If multiple loops mentioned, flag the tension

4. V1 SCOPE
   - IN: features directly supporting the core loop
   - OUT: everything else mentioned (note why deferred)

5. EVIDENCE
   - Any validation mentioned (interviews, data, personal experience)
   - If no evidence, note as [NO VALIDATION MENTIONED]

6. GAPS
   - Critical information missing
   - Assumptions that need testing

FORMAT RULES:
- Be ruthless about specificity — "users" is not a user
- Quote any strong language about the problem
- Don't soften or generalise what was said`
  },
  
  {
    phaseId: "idea",
    serviceId: "ai",
    title: "Extract AI Fit Assessment",
    description: "Extract AI integration requirements from feature discussions",
    outputStructure: ["AI fit", "Task definition", "Input contract", "Output contract", "Failure modes"],
    prompt: `You are extracting an AI integration assessment from feature discussion notes.

INPUT:
[PASTE FEATURE DISCUSSION, REQUIREMENTS, OR CONVERSATION HERE]

Extract and structure:

1. AI FIT ASSESSMENT
   - Is AI genuinely needed, or would a simpler solution work?
   - What makes this task LLM-appropriate vs. rule-based?
   - Flag any "AI for AI's sake" patterns

2. TASK DEFINITION
   - The exact task the AI performs, in one sentence
   - Input trigger (user action, event, schedule)

3. INPUT CONTRACT
   - What data the AI receives
   - User text / structured data / DB context / conversation history
   - Max input size if mentioned

4. OUTPUT CONTRACT
   - Format: free text / JSON schema / list / classification
   - If structured, note the shape
   - If streaming needed

5. FAILURE MODES
   - Bad output scenario → what user sees
   - Empty response → what user sees
   - API down → what user sees
   - Rate limit → what user sees

6. TRUST REQUIREMENT
   - Output shown directly to users?
   - Or reviewed/edited first?
   - Any content requiring extra caution

7. GAPS
   - Output format unspecified
   - Failure handling unclear
   - Edge cases not discussed

FORMAT RULES:
- If AI fit is questionable, say so clearly
- Don't assume structure that wasn't specified
- Quote any specific output examples mentioned`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEFINE PHASE EXTRACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "prd",
    serviceId: "mvp",
    title: "Extract Feature Spec",
    description: "Extract feature requirements from planning discussions",
    outputStructure: ["Features", "User flow", "Tech decisions", "Open questions"],
    prompt: `You are extracting a feature spec from planning notes or discussion.

INPUT:
[PASTE PLANNING NOTES, WHITEBOARD PHOTOS, OR DISCUSSION HERE]

Extract and structure:

1. FEATURES (max 6 for v1)
   For each feature:
   - Name
   - What the user does
   - What the system does
   - What the user gets
   - Priority: P0 (blocking) / P1 (important) / P2 (nice-to-have)

2. PRIMARY USER FLOW
   - Entry: how does the user arrive?
   - Steps: each action in sequence
   - Decision points: where does the user choose?
   - Success moment: clear end state

3. TECH DECISIONS MENTIONED
   - Stack choices
   - Integration requirements
   - Performance needs
   - Any constraints named

4. OPEN QUESTIONS
   - Ambiguous features
   - Missing priorities
   - Tech decisions not made
   - Scope boundaries unclear

FORMAT RULES:
- If priority wasn't stated, mark as [PRIORITY UNCLEAR]
- Flag features with external dependencies
- Note any "phase 2" items that were explicitly deferred`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD PHASE EXTRACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "build",
    serviceId: "mvp",
    title: "Extract Bug Report",
    description: "Extract actionable bug details from user feedback or testing notes",
    outputStructure: ["Bug summary", "Steps to reproduce", "Expected vs actual", "Severity", "Context"],
    prompt: `You are extracting a structured bug report from raw feedback or testing notes.

INPUT:
[PASTE USER FEEDBACK, SLACK MESSAGE, OR TESTING NOTES HERE]

Extract and structure:

1. BUG SUMMARY
   - One sentence: what's broken

2. STEPS TO REPRODUCE
   - Numbered steps to trigger the bug
   - Include any specific data or conditions
   - Note if reproduction is intermittent

3. EXPECTED VS ACTUAL
   - What should happen
   - What actually happens
   - Any error messages (quote exactly)

4. SEVERITY
   - Blocker: prevents core loop entirely
   - Major: significantly impacts usage
   - Minor: annoying but workaround exists
   - Cosmetic: visual only

5. CONTEXT
   - Device / browser / OS if mentioned
   - User role or account type
   - Related features

6. UNKNOWNS
   - Information needed to reproduce
   - Questions for the reporter

FORMAT RULES:
- Quote exact error messages
- Don't assume steps — ask if unclear
- Note if severity was stated vs inferred`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATE PHASE EXTRACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "qa",
    serviceId: "mvp",
    title: "Extract User Feedback",
    description: "Extract structured insights from user testing sessions or feedback",
    outputStructure: ["Working", "Confusing", "Missing", "Quotes", "Priorities"],
    prompt: `You are extracting structured feedback from user testing notes or feedback messages.

INPUT:
[PASTE USER TESTING NOTES, FEEDBACK EMAILS, OR INTERVIEW TRANSCRIPT HERE]

Extract and structure:

1. WHAT'S WORKING
   - Features they returned to or praised
   - "Aha" moments observed
   - Workflows that felt smooth

2. WHAT'S CONFUSING
   - Where they got stuck
   - Questions they asked
   - Misunderstandings about functionality

3. WHAT'S MISSING
   - Features they expected but didn't find
   - Workflow gaps
   - "I wish it could..." statements

4. SURPRISING USAGE
   - Unexpected ways they used the product
   - Features used differently than intended
   - Workarounds they created

5. VERBATIM QUOTES
   - Direct quotes worth preserving
   - Both positive and negative
   - Context for each quote

6. PRIORITY SIGNALS
   - What would make them use it more
   - What would make them stop using it
   - Dealbreakers mentioned

FORMAT RULES:
- Preserve exact user language in quotes
- Don't interpret — extract what was said
- Note if feedback was prompted vs spontaneous
- Flag contradictory feedback`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOSE PHASE EXTRACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "close",
    serviceId: "mvp",
    title: "Extract Retrospective",
    description: "Extract retrospective insights from team discussion",
    outputStructure: ["Shipped vs scoped", "What worked", "What didn't", "Key decisions", "Next time"],
    prompt: `You are extracting a structured retrospective from team discussion notes.

INPUT:
[PASTE RETRO DISCUSSION NOTES, SLACK THREAD, OR MEETING TRANSCRIPT HERE]

Extract and structure:

1. SHIPPED VS SCOPED
   - What was in original scope
   - What actually shipped
   - What was cut and why
   - What was added and why

2. WHAT WORKED
   - Process wins
   - Tooling that helped
   - Collaboration patterns to keep
   - Be specific — "communication" is not a finding

3. WHAT DIDN'T WORK
   - Causes of rework or delay
   - Process friction
   - What to stop or change
   - Be specific — name the actual problem

4. PROMPT QUALITY (for AI features)
   - Which prompts needed most iteration
   - What was the pattern of failures
   - What made prompts succeed

5. KEY DECISIONS
   - Biggest impact decision (positive or negative)
   - Would you make it again?
   - What would you do differently

6. NEXT TIME
   - Specific changes for the next project
   - New processes to try
   - Tools or approaches to adopt

FORMAT RULES:
- No generalities — every point should be specific and actionable
- Quote disagreements if they surfaced
- Note who said what if relevant to follow-up`
  },
];

// Helper to get extraction prompt for current phase/service
export function getExtractionPrompt(phaseId: string, serviceId: string): ExtractionPrompt | undefined {
  return EXTRACTION_PROMPTS.find(e => e.phaseId === phaseId && e.serviceId === serviceId);
}
