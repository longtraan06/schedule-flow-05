import { Button } from "@/components/ui/button";
import { Calendar, Clock, Grid3X3 } from "lucide-react";
import { Event } from "@/types/planner";
import { DayView } from "./views/DayView";
import { WeekView } from "./views/WeekView";
import { MonthView } from "./views/MonthView";

interface MainContentProps {
  events: Event[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentView: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
}

export function MainContent({ 
  events, 
  selectedDate, 
  onSelectDate, 
  currentView, 
  onViewChange,
  onUpdateEvent,
  onDeleteEvent,
  onAddEvent
}: MainContentProps) {
  
  const handleDayViewSwitch = (date: Date) => {
    onSelectDate(date);
    onViewChange('day');
  };
  
  const getViewIcon = (view: string) => {
    switch (view) {
      case 'day': return <Clock className="h-4 w-4" />;
      case 'week': return <Calendar className="h-4 w-4" />;
      case 'month': return <Grid3X3 className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header with View Switch */}
      <div className="border-b border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Study Planner</h1>
          
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map(view => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(view)}
                className="gap-2 capitalize"
              >
                {getViewIcon(view)}
                {view}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'day' && (
          <DayView 
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            onAddEvent={onAddEvent}
          />
        )}
        
        {currentView === 'week' && (
          <WeekView 
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            onSwitchToDayView={handleDayViewSwitch}
          />
        )}
        
        {currentView === 'month' && (
          <MonthView 
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            onSwitchToDayView={handleDayViewSwitch}
          />
        )}
      </div>
    </div>
  );
}