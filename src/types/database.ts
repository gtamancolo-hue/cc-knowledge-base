export type UserRole = 'operator' | 'admin';
export type AlertPriority = 'normal' | 'urgent';

// ─── Legacy step/branch types (kept for backward compat) ───────────────────
export interface StepItem {
  step: number;
  title: string;
  desc: string;
  phrase?: string;
}

export interface BranchingScenario {
  condition: string;
  action: string;
  badge_color?: 'red' | 'amber' | 'green' | 'blue' | 'purple';
}

export interface QuickScript {
  label: string;
  text: string;
}

// ─── Decision Tree (Interactive Stepper / Naumen-style) ────────────────────
export type DecisionNodeType = 'start' | 'question' | 'action' | 'info' | 'end';

export interface DecisionOption {
  /** Label shown on the answer button, e.g. "Да, хочет вернуть" */
  label: string;
  /** Id of the next node to navigate to */
  next: string;
  /** Optional colour hint for the button */
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  /** Short badge shown on button, e.g. "Часто" */
  badge?: string;
}

export interface DecisionNode {
  id: string;
  type: DecisionNodeType;
  /** Short step label shown in breadcrumb / progress bar */
  title?: string;
  /** Main content — question to ask client, action to perform, or info block */
  text: string;
  /** Ready-to-say script phrase (shown in a copy box below text) */
  script?: string;
  /** Internal note visible to operator only */
  note?: string;
  /** Answer options (for type = 'question') */
  options?: DecisionOption[];
  /** Id of the single next node (for type = 'action' | 'info') */
  next?: string;
}

// ─── Article ───────────────────────────────────────────────────────────────
export interface Article {
  id: string;
  category_id: string;
  title: string;
  /** Legacy linear steps (still used in full_content view) */
  short_steps_json: StepItem[];
  /** Legacy if/then scenarios (still used in full_content view) */
  branching_scenarios_json: BranchingScenario[];
  quick_scripts_json: QuickScript[];
  /** Interactive decision tree nodes — powers the new Шагалка view */
  decision_tree_json: DecisionNode[];
  full_content_markdown: string;
  tags_array: string[];
  synonyms_array: string[];
  views_count: number;
  is_pinned?: boolean;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  description?: string;
  article_count?: number;
}

export interface NewsAlert {
  id: string;
  title: string;
  content: string;
  priority: AlertPriority;
  tag: string;
  is_active: boolean;
  created_at: string;
  acknowledged?: boolean;
}

export interface AlertRead {
  user_id: string;
  alert_id: string;
  read_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export interface SynonymDictionary {
  [keyword: string]: string[];
}
