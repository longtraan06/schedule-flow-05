export type Priority = 'low' | 'medium' | 'high';

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  priority: Priority;
  customReminderTime?: number; // minutes before event
  createdAt: Date;
  updatedAt?: Date;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  events: Event[];
}

export type ViewMode = 'day' | 'week' | 'month';