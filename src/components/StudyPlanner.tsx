import { useState, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./planner/Sidebar";
import { MainContent } from "./planner/MainContent";
import { BottomPanel } from "./planner/BottomPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Event } from "@/types/planner";

const StudyPlanner = () => {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [events, setEvents] = useLocalStorage<Event[]>("studyplanner-events", []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('day');

  const addEvent = useCallback((event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setEvents(prev => [...prev, newEvent]);
  }, [setEvents]);

  const updateEvent = useCallback((eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  }, [setEvents]);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, [setEvents]);

  const handleSidebarResize = useCallback((width: number) => {
    setSidebarWidth(Math.max(280, Math.min(600, width)));
  }, []);

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <SidebarProvider>
        <div className="flex h-full w-full">
          {/* Resizable Sidebar */}
          <div 
            className="relative border-r border-border bg-gradient-sidebar"
            style={{ width: sidebarWidth }}
          >
            <Sidebar 
              events={events}
              onAddEvent={addEvent}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
            
            {/* Resize Handle */}
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary/20 transition-colors group"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = sidebarWidth;

                const handleMouseMove = (e: MouseEvent) => {
                  const deltaX = e.clientX - startX;
                  handleSidebarResize(startWidth + deltaX);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="absolute top-1/2 right-0 w-1 h-8 bg-primary opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-1/2 rounded-l-sm" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-12">
            <MainContent 
              events={events}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentView={currentView}
              onViewChange={setCurrentView}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
              onAddEvent={addEvent}
            />
          </div>
        </div>

        {/* Fixed Bottom Panel */}
        <BottomPanel 
          events={events}
          onDeleteEvent={deleteEvent}
        />
      </SidebarProvider>
    </div>
  );
};

export default StudyPlanner;