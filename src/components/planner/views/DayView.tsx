import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Event, Priority } from "@/types/planner";

interface DayViewProps {
  events: Event[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
}

interface QuickAddEvent {
  title: string;
  priority: Priority;
  description?: string;
}

export function DayView({ 
  events, 
  selectedDate, 
  onSelectDate, 
  onUpdateEvent, 
  onDeleteEvent 
}: DayViewProps) {
  const [quickAddData, setQuickAddData] = useState<QuickAddEvent | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

  // Get events for the selected date
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    }).sort((a, b) => {
      // Sort by start time if available, otherwise by priority
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [events, selectedDate]);

  // Generate time slots (24 hours)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        timeString: `${hour.toString().padStart(2, '0')}:00`,
        events: dayEvents.filter(event => {
          if (!event.startTime) return false;
          const eventHour = parseInt(event.startTime.split(':')[0]);
          return eventHour === hour;
        })
      });
    }
    return slots;
  }, [dayEvents]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    onSelectDate(newDate);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-priority-high text-white';
      case 'medium': return 'bg-priority-medium text-white';
      case 'low': return 'bg-priority-low text-white';
      default: return 'bg-muted';
    }
  };

  const handleQuickAdd = () => {
    if (!quickAddData || !quickAddData.title.trim()) return;

    setQuickAddData({
      title: quickAddData.title.trim(),
      priority: quickAddData.priority,
      description: quickAddData.description
    });
  };

  const handleDropOnTimeSlot = (hour: number) => {
    if (!quickAddData) return;

    const newEvent: Omit<Event, 'id'> = {
      title: quickAddData.title,
      description: quickAddData.description,
      date: selectedDate,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      priority: quickAddData.priority,
      createdAt: new Date(),
    };

    // This would need to be connected to the parent's add event function
    console.log('Would add event:', newEvent);
    setQuickAddData(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Day Navigation Header */}
      <div className="border-b border-border bg-surface-secondary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold">
                {formatDate(selectedDate)}
                {isToday(selectedDate) && (
                  <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
          </div>

          {/* Quick Add */}
          <div className="flex items-center gap-2">
            {!quickAddData ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickAddData({ title: '', priority: 'medium' })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Quick Add
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-card p-2 rounded-lg border">
                <Input
                  placeholder="Event title..."
                  value={quickAddData.title}
                  onChange={(e) => setQuickAddData(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-32"
                  size={32}
                />
                <select
                  value={quickAddData.priority}
                  onChange={(e) => setQuickAddData(prev => prev ? { ...prev, priority: e.target.value as Priority } : null)}
                  className="text-xs border border-border rounded px-2 py-1 bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Button size="sm" onClick={handleQuickAdd}>
                  Done
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setQuickAddData(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-1">
            {timeSlots.map(slot => (
              <div
                key={slot.hour}
                className={`flex border-b border-border/50 min-h-[60px] group ${
                  isPast(selectedDate) && slot.hour < new Date().getHours() ? 'opacity-60' : ''
                }`}
                onDrop={(e) => {
                  e.preventDefault();
                  if (quickAddData) {
                    handleDropOnTimeSlot(slot.hour);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
              >
                {/* Time Label */}
                <div className="w-16 flex-shrink-0 text-sm text-muted-foreground py-2">
                  {slot.timeString}
                </div>

                {/* Event Area */}
                <div className="flex-1 py-2 pl-4 min-h-[60px] relative">
                  {slot.events.length === 0 ? (
                    <div className="h-full border-l-2 border-transparent group-hover:border-border/50 transition-colors" />
                  ) : (
                    <div className="space-y-1">
                      {slot.events.map(event => (
                        <div
                          key={event.id}
                          className={`p-2 rounded-lg border-l-4 ${getPriorityColor(event.priority)} bg-opacity-10 hover:bg-opacity-20 transition-all cursor-move group/event`}
                          draggable
                          onDragStart={() => setDraggedEvent(event.id)}
                          onDragEnd={() => setDraggedEvent(null)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground">
                                {event.title}
                              </div>
                              {event.startTime && event.endTime && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {event.startTime} - {event.endTime}
                                </div>
                              )}
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteEvent(event.id)}
                              className="opacity-0 group-hover/event:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Drop zone for quick add */}
                  {quickAddData && (
                    <div 
                      className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => handleDropOnTimeSlot(slot.hour)}
                    >
                      <span className="text-sm text-primary font-medium">
                        Drop "{quickAddData.title}" here
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}