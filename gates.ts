// src/data/gates.ts
// Decision gates for each phase × service combination
// These transform phases into progress checkpoints

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

export const GATES: DecisionGate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVER → DEFINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "idea",
    serviceId: "site",
    title: "Ready for Define?",
    nextPhase: "prd",
    items: [
      { id: "goal", text: "Single primary goal defined — not multiple 'priorities'" },
      { id: "visitors", text: "Visitor types named with specific needs and actions" },
      { id: "impression", text: "Design direction clear: what it MUST feel like, what it must NOT" },
      { id: "pages", text: "V1 pages listed with single-sentence purpose each" },
      { id: "agreed", text: "Brief reviewed and agreed with client in writing" },
    ]
  },
  
  {
    phaseId: "idea",
    serviceId: "tool",
    title: "Ready for Define?",
    nextPhase: "prd",
    items: [
      { id: "workflow", text: "Full workflow mapped step-by-step as it actually happens" },
      { id: "bottleneck", text: "Bottlenecks identified — slow, error-prone, or dropped steps" },
      { id: "metric", text: "One measurable success metric defined" },
      { id: "validated", text: "Workflow validated with the person who actually does it" },
    ]
  },
  
  {
    phaseId: "idea",
    serviceId: "mvp",
    title: "Ready for Define?",
    nextPhase: "prd",
    items: [
      { id: "problem", text: "Problem statement is one sentence: [person] struggles to [task] because [reason]" },
      { id: "user", text: "Primary user named with specific role and context" },
      { id: "loop", text: "Core loop defined: trigger → action → output → return" },
      { id: "scope", text: "V1 scope written with explicit 'out of scope' list" },
      { id: "evidence", text: "Some evidence the problem exists beyond assumption" },
    ]
  },
  
  {
    phaseId: "idea",
    serviceId: "ai",
    title: "Ready for Define?",
    nextPhase: "prd",
    items: [
      { id: "fit", text: "AI is genuinely better than a deterministic function for this task" },
      { id: "input", text: "Input contract defined: exactly what data the AI receives" },
      { id: "output", text: "Output contract defined: exact format (text / JSON schema / etc.)" },
      { id: "failure", text: "Failure modes named: bad output / empty / API down → what user sees" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEFINE → BUILD
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "prd",
    serviceId: "site",
    title: "Ready for Build?",
    nextPhase: "build",
    items: [
      { id: "pages", text: "Every page has defined purpose, sections, and CTA" },
      { id: "components", text: "Component inventory complete with variants marked" },
      { id: "cms", text: "CMS schema defined — only fields that will actually be used" },
      { id: "timeline", text: "Animated components flagged (they take 3x longer)" },
    ]
  },
  
  {
    phaseId: "prd",
    serviceId: "tool",
    title: "Ready for Build?",
    nextPhase: "build",
    items: [
      { id: "features", text: "Features spec'd with trigger / input / process / output / priority" },
      { id: "data", text: "Data model reviewed — every entity and relationship confirmed" },
      { id: "roles", text: "Roles and permissions defined (max 3 roles for v1)" },
      { id: "external", text: "External dependencies flagged with fallback plans" },
    ]
  },
  
  {
    phaseId: "prd",
    serviceId: "mvp",
    title: "Ready for Build?",
    nextPhase: "build",
    items: [
      { id: "flow", text: "Primary user flow documented: entry → actions → success moment" },
      { id: "arch", text: "Tech architecture decided: routes, API, database, AI layer" },
      { id: "ai", text: "AI integration spec'd: model choice, I/O, streaming, failure handling" },
      { id: "decisions", text: "All open technical decisions named and assigned" },
    ]
  },
  
  {
    phaseId: "prd",
    serviceId: "ai",
    title: "Ready for Build?",
    nextPhase: "build",
    items: [
      { id: "prompt", text: "System prompt drafted and stress-tested with 4 scenarios" },
      { id: "chain", text: "If multi-call: chaining spec defined (what passes between calls)" },
      { id: "validation", text: "Output validation approach defined (Zod schema if structured)" },
      { id: "dataflow", text: "Full request trace mapped: user action → API → AI → response → UI" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD → VALIDATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "build",
    serviceId: "site",
    title: "Ready for Validate?",
    nextPhase: "qa",
    items: [
      { id: "components", text: "All components built with all 4 states: default / loading / empty / error" },
      { id: "responsive", text: "All components render correctly at 375px and 1280px" },
      { id: "cms", text: "CMS connected and content editable" },
      { id: "staging", text: "Deployed to staging URL" },
    ]
  },
  
  {
    phaseId: "build",
    serviceId: "tool",
    title: "Ready for Validate?",
    nextPhase: "qa",
    items: [
      { id: "schema", text: "Schema live with RLS enabled on all tables" },
      { id: "api", text: "All API routes tested with valid, invalid, unauth, and wrong-role cases" },
      { id: "automation", text: "Core automation runs end-to-end with real data" },
      { id: "ui", text: "Dashboard renders all 4 states correctly" },
    ]
  },
  
  {
    phaseId: "build",
    serviceId: "mvp",
    title: "Ready for Validate?",
    nextPhase: "qa",
    items: [
      { id: "auth", text: "Auth working: signup, login, session, role-based access" },
      { id: "loop", text: "Core loop functional end-to-end" },
      { id: "ai", text: "AI integration wired: streaming works, errors handled" },
      { id: "external", text: "Core loop tested by someone other than the builder" },
    ]
  },
  
  {
    phaseId: "build",
    serviceId: "ai",
    title: "Ready for Validate?",
    nextPhase: "qa",
    items: [
      { id: "route", text: "API route working: input validation, auth, timeout, error responses" },
      { id: "frontend", text: "Frontend wired: loading state, streaming render, error state" },
      { id: "tested", text: "5 real inputs tested end-to-end in browser" },
      { id: "abort", text: "Abort on unmount works — no memory leaks" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATE → SHIP & CLOSE
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "qa",
    serviceId: "site",
    title: "Ready to Ship?",
    nextPhase: "close",
    items: [
      { id: "craft", text: "Visual craft review complete — typography, spacing, colour, motion" },
      { id: "a11y", text: "WCAG 2.1 AA audit passed — zero violations" },
      { id: "seo", text: "SEO implemented: meta tags, sitemap, robots, JSON-LD" },
      { id: "perf", text: "Lighthouse mobile 90+ / LCP < 2.5s / CLS < 0.1" },
      { id: "client", text: "Client reviewed and approved" },
    ]
  },
  
  {
    phaseId: "qa",
    serviceId: "tool",
    title: "Ready to Ship?",
    nextPhase: "close",
    items: [
      { id: "functional", text: "Core workflows tested: happy path, partial data, edge cases, duplicates" },
      { id: "security", text: "Security review passed: auth, RLS, input validation, no secrets in client" },
      { id: "external", text: "Real user completed core workflow without help from builder" },
    ]
  },
  
  {
    phaseId: "qa",
    serviceId: "mvp",
    title: "Ready to Ship?",
    nextPhase: "close",
    items: [
      { id: "security", text: "Security checklist passed: auth, RLS, prompt injection test, no leaked secrets" },
      { id: "ai", text: "AI output reviewed with 5 real inputs — all acceptable" },
      { id: "console", text: "No console.logs in production (they leak data)" },
      { id: "external", text: "Core loop tested by someone outside the build team" },
    ]
  },
  
  {
    phaseId: "qa",
    serviceId: "ai",
    title: "Ready to Ship?",
    nextPhase: "close",
    items: [
      { id: "inputs", text: "5 real inputs tested — all produce acceptable output" },
      { id: "injection", text: "Prompt injection test passed — system prompt not revealed" },
      { id: "latency", text: "Latency measured and acceptable for UX context" },
      { id: "failures", text: "All failure states confirmed in browser" },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHIP & CLOSE (no next phase — project complete)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    phaseId: "close",
    serviceId: "site",
    title: "Project Complete?",
    nextPhase: "",
    items: [
      { id: "domain", text: "Custom domain live with SSL and redirects working" },
      { id: "content", text: "All placeholder content replaced" },
      { id: "cms", text: "Client has edited one piece of content themselves" },
      { id: "handoff", text: "Handoff doc delivered" },
      { id: "checkin", text: "Post-launch check-in scheduled (2-3 weeks out)" },
    ]
  },
  
  {
    phaseId: "close",
    serviceId: "tool",
    title: "Project Complete?",
    nextPhase: "",
    items: [
      { id: "rollout", text: "Soft launch complete with 2-3 early adopters" },
      { id: "onboarding", text: "Onboarding message sent to users" },
      { id: "cutover", text: "Old process switched off (specific date or trigger)" },
      { id: "feedback", text: "Feedback channel open and monitored" },
      { id: "retro", text: "Retrospective completed" },
    ]
  },
  
  {
    phaseId: "close",
    serviceId: "mvp",
    title: "Project Complete?",
    nextPhase: "",
    items: [
      { id: "live", text: "MVP live with first users" },
      { id: "feedback", text: "Feedback synthesised into structured findings" },
      { id: "backlog", text: "V2 backlog defined with priorities justified by user feedback" },
      { id: "retro", text: "Retrospective completed" },
    ]
  },
  
  {
    phaseId: "close",
    serviceId: "ai",
    title: "Project Complete?",
    nextPhase: "",
    items: [
      { id: "monitoring", text: "Monitoring plan defined: what to check, when, by whom" },
      { id: "cost", text: "Anthropic usage alert set at budget threshold" },
      { id: "versioning", text: "System prompt versioned (so you know what changed)" },
      { id: "cycle", text: "Improvement cycle defined: when to review, what triggers updates" },
    ]
  },
];

// Helper to get gate for current phase/service
export function getGate(phaseId: string, serviceId: string): DecisionGate | undefined {
  return GATES.find(g => g.phaseId === phaseId && g.serviceId === serviceId);
}

// Helper to check if gate is complete
export function isGateComplete(gate: DecisionGate, completedItems: string[]): boolean {
  return gate.items.every(item => completedItems.includes(item.id));
}
