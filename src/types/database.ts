export type UserRole = 'operator' | 'admin';
export type AlertPriority = 'normal' | 'urgent';

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

export interface Article {
  id: string;
  category_id: string;
  title: string;
  short_steps_json: StepItem[];
  branching_scenarios_json: BranchingScenario[];
  quick_scripts_json: QuickScript[];
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
