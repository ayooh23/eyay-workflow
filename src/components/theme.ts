// CSS custom property names — used in inline styles as var(--token)
// All values are set by [data-theme] in index.css
export const V = {
  bg:         'var(--bg)',
  surface:    'var(--surface)',
  surfaceHi:  'var(--surface-hi)',
  border:     'var(--border)',
  borderMid:  'var(--border-mid)',
  text:       'var(--text)',
  textSub:    'var(--text-sub)',
  textMuted:  'var(--text-muted)',
  brand:      'var(--brand)',       // #0000FF — primary CTA
  accent:     'var(--accent)',      // accent red for underlines / micro details
} as const;

export const T = {
  bg:        V.bg,
  surface:   V.surface,
  border:    V.border,
  borderMid: V.borderMid,
  text:      V.text,
  textSub:   V.textSub,
  textMuted: V.textMuted,
  // System-friendly stacks to match the design spec
  mono:      'monospace',
  sans:      'system-ui, -apple-system, sans-serif',
} as const;

// Raw theme values for non-CSS-var contexts (chart colors, dynamic calculations, etc.)
export const DARK = {
  bg:         '#020617',
  surface:    '#111827',
  surfaceHi:  '#1F2937',
  border:     '#374151',
  borderMid:  '#4B5563',
  text:       '#F9FAFB',
  textSub:    '#9CA3AF',
  textMuted:  '#6B7280',
} as const;

export const LIGHT = {
  bg:         '#FFFFFF',
  surface:    '#F5F5F5',
  surfaceHi:  '#E5E5E5',
  border:     '#D4D4D4',
  borderMid:  '#A3A3A3',
  text:       '#0A0A0A',
  textSub:    '#737373',
  textMuted:  '#A3A3A3',
} as const;

// Phase accent colors — unchanged across themes
export const PHASE_ACCENTS = {
  idea:  '#0000FF',
  prd:   '#0000FF',
  build: '#0000FF',
  qa:    '#0000FF',
  close: '#0000FF',
} as const;

// Service colors — unchanged across themes
export const SERVICE_COLORS = {
  mvp:  '#0000FF',
  site: '#0000FF',
  tool: '#0000FF',
  ai:   '#0000FF',
} as const;

// Tool badge colors
export const TOOL_COLORS = {
  chat: '#0000FF',
  code: '#0000FF',
} as const;

// Typography scale (px values matching STYLE.md ramp)
export const TYPE = {
  hero:   32,   // H1 — page hero
  h2:     24,   // Section headline
  h3:     18,   // Subheadline
  body:   14,   // Main body, bubble text
  ui:     13,   // Buttons, inline labels
  meta:   11,   // Timestamps, helper text
  chip:   10,   // Tags, badges — always mono + uppercase
} as const;

// Spacing
export const RADIUS = {
  sm:  4,
  md:  6,
  lg:  8,
  xl:  10,
  xxl: 12,
} as const;
