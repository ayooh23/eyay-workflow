import type { BestPractice } from '../types';

export const BEST_PRACTICES: BestPractice[] = [
  {
    id: 'context',
    icon: '◈',
    label: 'Context First',
    color: '#0000FF',
    rules: [
      {
        t: 'One file per session',
        b: 'Always start with the most relevant file open. Claude loses quality when context is split across many files.',
      },
      {
        t: 'State the constraint',
        b: 'Tell Claude what it cannot touch. "Don\'t change the auth logic" is more useful than hoping it infers.',
      },
      {
        t: 'Reference by line',
        b: 'When referencing code, use line numbers. "Line 142" is unambiguous. "The function near the top" is not.',
      },
    ],
  },
  {
    id: 'prompts',
    icon: '▸',
    label: 'Prompt Quality',
    color: '#0000FF',
    rules: [
      {
        t: 'Input → Output → Constraints',
        b: 'Every good prompt names what goes in, what should come out, and what rules apply. Missing any one of these degrades output.',
      },
      {
        t: 'Show the format',
        b: 'If you want JSON, show the schema. If you want a component, show a similar one. Examples outperform instructions.',
      },
      {
        t: 'One task per prompt',
        b: '"Refactor, add tests, and fix the bug" produces mediocre results on all three. Sequence instead of stacking.',
      },
    ],
  },
  {
    id: 'iteration',
    icon: '↺',
    label: 'Iteration',
    color: '#0000FF',
    rules: [
      {
        t: 'Correct, don\'t restart',
        b: 'When output is 80% right, tell Claude what to fix. Starting over loses the context that got you to 80%.',
      },
      {
        t: 'Checkpoint working state',
        b: 'Commit or save before every agentic session. If Claude goes sideways, you need a clean rollback point.',
      },
      {
        t: 'Flag regressions immediately',
        b: 'If something that worked stops working, say so in the next message. Claude doesn\'t track state across turns automatically.',
      },
    ],
  },
  {
    id: 'agentic',
    icon: '⚡',
    label: 'Agentic Mode',
    color: '#0000FF',
    rules: [
      {
        t: 'Scope before you launch',
        b: 'Write out exactly what "done" looks like before running an agentic session. Vague goals produce sprawling changes.',
      },
      {
        t: 'Read the plan first',
        b: 'When Claude proposes a multi-step plan, read every step before approving. The last step is often the dangerous one.',
      },
      {
        t: 'Smaller steps, more often',
        b: '5 focused agentic runs beats 1 sprawling one. Smaller scope = easier review, easier rollback, better output.',
      },
    ],
  },
  {
    id: 'shipping',
    icon: '◻',
    label: 'Shipping',
    color: '#0000FF',
    rules: [
      {
        t: 'Test at the boundary',
        b: 'AI writes clean code for happy paths. Always test with missing data, wrong types, unauthenticated requests, and empty states.',
      },
      {
        t: 'Prompt injection is real',
        b: 'If user input ever reaches a system prompt, test it with injection attempts. This is not theoretical for production apps.',
      },
      {
        t: 'Name your prompts',
        b: 'System prompts are code. Version them, name them, and track what changed. You cannot improve what you cannot compare.',
      },
    ],
  },
];
