
export enum UserRole {
  ADMIN = 'ADMIN',
  PREVENTIE_ADVISEUR = 'PREVENTIE_ADVISEUR',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  PROJECT_ASSISTENT = 'PROJECT_ASSISTENT',
  WERFLEIDER = 'WERFLEIDER',
  TECHNIEKER = 'TECHNIEKER'
}

export enum Department {
  TELECOM = 'TELECOM',
  LAAGSPANNING = 'LAAGSPANNING',
  MIDDENSPANNING = 'MIDDENSPANNING',
  GENERAL = 'ALGEMEEN'
}

export type Language = 'nl' | 'fr' | 'en' | 'tr';

export interface Attendee {
  userId?: string; 
  name: string;
  signature: string; 
  isSigned: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  department: Department;
  isExternal: boolean;
  mustChangePassword?: boolean;
  timestamp: number;
}

export enum LMRAStatus {
  OK = 'OK',
  NOK = 'NOK',
  RESOLVED = 'RESOLVED',
  PENDING_SIGNATURE = 'WACHT OP HANDTEKENING'
}

export type LMRAAnswer = 'OK' | 'NOK' | 'NVT' | null;

export interface LMRAQuestion {
  id: string;
  questionText: string;
  answer: LMRAAnswer;
  reason?: string; 
}

export interface LMRA {
  id: string;
  title: string;
  date: string;
  timestamp: number;
  userId: string;
  userName: string;
  supervisorId: string;
  department: Department;
  status: LMRAStatus;
  questions: LMRAQuestion[];
  remarks?: string;
  treatmentNotes?: string;
  location: string;
  attendees: Attendee[];
  resolvedById?: string;
  resolvedByName?: string;
  assignedToId?: string;
  assignedToName?: string;
  isRead?: boolean;
}

export interface Notification {
  id: string;
  type: 'NOK' | 'INFO';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  relatedId?: string;
}

export interface KickOffMeeting {
  id: string;
  project: string;
  date: string;
  timestamp: number;
  userId: string;
  department: Department;
  attendees: Attendee[];
  topics: string[];
  risksIdentified: string[];
  location: string;
}

export interface AppConfig {
  appName: string;
  logoUrl: string;
  lmraQuestions: string[];
  kickoffTopics: string[];
  departments: string[];
  permissions: Record<UserRole, string[]>;
}
