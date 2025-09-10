import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Plus, List, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AddEventForm } from "./AddEventForm";
import { TaskList } from "./TaskList";
import { Event } from "@/types/planner";

interface SidebarProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
}

type SidebarView = 'main' | 'add-event' | 'task-list' | 'expired-deleted';

export function Sidebar({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: SidebarProps) {
  const [currentView, setCurrentView] = useState<SidebarView>('main');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const renderMainView = () => (
    <div className="flex flex-col h-full">
      {/* Header with time */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-sidebar-foreground">Current Time</span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-sidebar-foreground">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-sidebar-foreground/70">
            {getDayName(currentTime)}, {formatDate(currentTime)}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-12 text-left hover:bg-sidebar-accent"
            onClick={() => setCurrentView('add-event')}
          >
            <Plus className="h-4 w-4" />
            <span>Add Schedule / Add Event</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-12 text-left hover:bg-sidebar-accent"
            onClick={() => setCurrentView('task-list')}
          >
            <List className="h-4 w-4" />
            <span>Task List</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-12 text-left hover:bg-sidebar-accent"
            onClick={() => setCurrentView('expired-deleted')}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Expired / Deleted Items</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentView('main')}
        className="hover:bg-sidebar-accent"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <span className="font-semibold text-sidebar-foreground">
        {currentView === 'add-event' && 'Add Schedule / Add Event'}
        {currentView === 'task-list' && 'Task List'}
        {currentView === 'expired-deleted' && 'Expired / Deleted Items'}
      </span>
    </div>
  );

  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {currentView === 'main' ? (
        renderMainView()
      ) : (
        <>
          {renderHeader()}
          <ScrollArea className="flex-1">
            {currentView === 'add-event' && (
              <div className="p-4">
                <AddEventForm 
                  onSubmit={(eventData) => {
                    onAddEvent(eventData);
                    setCurrentView('main');
                  }}
                  onCancel={() => setCurrentView('main')}
                />
              </div>
            )}
            
            {currentView === 'task-list' && (
              <TaskList 
                events={events}
                onUpdateEvent={onUpdateEvent}
                onDeleteEvent={onDeleteEvent}
              />
            )}
            
            {currentView === 'expired-deleted' && (
              <div className="p-4">
                <div className="text-center text-sidebar-foreground/60 py-8">
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Expired and deleted items will appear here</p>
                  <p className="text-sm mt-2">Feature coming soon!</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
}