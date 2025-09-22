export enum View {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  EMAIL = 'EMAIL',
  TASKS = 'TASKS',
  MEMORY = 'MEMORY',
  SETTINGS = 'SETTINGS',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  read: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Memory {
  id: string;
  content: string;
  timestamp: string;
}

export interface UserProfile {
    name: string;
    email: string;
    picture: string;
}