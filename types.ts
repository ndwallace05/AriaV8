/**
 * Represents the different views or screens in the application.
 */
export enum View {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  EMAIL = 'EMAIL',
  TASKS = 'TASKS',
  MEMORY = 'MEMORY',
  SETTINGS = 'SETTINGS',
}

/**
 * Represents a single message in the chat window.
 */
export interface ChatMessage {
  /** The role of the message sender (user or AI model). */
  role: 'user' | 'model';
  /** The text content of the message. */
  content: string;
}

/**
 * Represents a single calendar event.
 */
export interface CalendarEvent {
  /** The unique ID of the event. */
  id: string;
  /** The title or summary of the event. */
  title: string;
  /** The date and time of the event. */
  date: Date;
}

/**
 * Represents a single email message.
 */
export interface Email {
  /** The unique ID of the email. */
  id:string;
  /** The sender's name or email address. */
  sender: string;
  /** The subject line of the email. */
  subject: string;
  /** A short snippet of the email body. */
  body: string;
  /** Whether the email has been read. */
  read: boolean;
}

/**
 * Represents a single to-do task.
 */
export interface Task {
  /** The unique ID of the task. */
  id: string;
  /** The title or description of the task. */
  title: string;
  /** Whether the task has been completed. */
  completed: boolean;
}

/**
 * Represents a piece of information stored in Aria's memory.
 */
export interface Memory {
  /** The unique ID of the memory. */
  id: string;
  /** The content of the memory. */
  content: string;
  /** The ISO 8601 timestamp of when the memory was created. */
  timestamp: string;
}

/**
 * Represents the user's Google profile information.
 */
export interface UserProfile {
    /** The user's full name. */
    name: string;
    /** The user's email address. */
    email: string;
    /** A URL to the user's profile picture. */
    picture: string;
}