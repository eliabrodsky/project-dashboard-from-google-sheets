
export interface Project {
  id: number;
  projectName: string;
  projectManager: string;
  lastUpdatedOn: string | null;
  budget: string;
  linkToProjectPlan: string;
  progressOverall: number;
  lastSummaryNotes: string;
  rawData: string[];

  // Optional fields for components that use a different data structure
  status?: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
  budgetTotal?: number;
  budgetUsed?: number;
  dueDate?: string;
  meetingLink?: string;
}

export interface ProjectSummary {
    totalProjects: number;
    totalBudget: string;
    averageProgress: number;
    progressRanges: {
        low: number;
        medium: number;
        high: number;
    };
}

export interface TaskArea {
  id: number;
  name: string;
  owner: string;
  progress: number;
  status: 'On Track' | 'Needs Attention' | 'Blocked';
  issues: number;
}

export interface Milestone {
  id: number;
  title: string;
  date: string;
  type: 'Key Deliverable' | 'Phase Gate' | 'Reporting';
  status: 'Upcoming' | 'Completed';
}

export interface AiSummary {
  overall_health: string;
  executive_summary: string;
  area_updates: {
    area_name: string;
    progress_update: string;
    identified_issues: string[];
  }[];
  action_items: {
    task: string;
    owner: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Notification {
  id: number;
  message: string;
  timestamp: string; // ISO date string
  read: boolean;
}
