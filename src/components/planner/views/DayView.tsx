import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronLeft, ChevronRight, X, GripVertical } from "lucide-react";
import { Event, Priority } from "@/types/planner";

interface DayViewProps {
  events: Event[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
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
  onDeleteEvent,
  onAddEvent
}: DayViewProps) {
  const [quickAddData, setQuickAddData] = useState<QuickAddEvent | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [draggedQuickEvent, setDraggedQuickEvent] = useState<QuickAddEvent | null>(null);

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
      case 'high': return 'border-l-priority-high bg-priority-high/10';
      case 'medium': return 'border-l-priority-medium bg-priority-medium/10';
      case 'low': return 'border-l-priority-low bg-priority-low/10';
      default: return 'border-l-muted bg-muted/10';
    }
  };

  const handleCreateQuickEvent = () => {
    if (!quickAddData || !quickAddData.title.trim()) return;
    
    const newEvent: Omit<Event, 'id'> = {
      title: quickAddData.title.trim(),
      description: quickAddData.description,
      date: selectedDate,
      priority: quickAddData.priority,
      createdAt: new Date(),
    };

    // Set as draggable quick event
    setDraggedQuickEvent(quickAddData);
    setQuickAddData(null);
  };

  const handleDropOnTimeSlot = (hour: number) => {
    if (draggedQuickEvent) {
      // Create event from quick add
      const newEvent: Omit<Event, 'id'> = {
        title: draggedQuickEvent.title,
        description: draggedQuickEvent.description,
        date: selectedDate,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        priority: draggedQuickEvent.priority,
        createdAt: new Date(),
      };
      onAddEvent(newEvent);
      setDraggedQuickEvent(null);
    } else if (draggedEvent) {
      // Move existing event to new time slot
      onUpdateEvent(draggedEvent, {
        startTime: `${hour.toString().padStart(2, '0')}:00`
      });
      setDraggedEvent(null);
    }
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
    <div className="h-full flex">
      {/* Timeline - Left Side */}
      <div className="flex-1 flex flex-col">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Timeline - Scrollable */}
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
                    handleDropOnTimeSlot(slot.hour);
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
                            className={`p-2 rounded-lg border-l-4 ${getPriorityColor(event.priority)} hover:bg-opacity-20 transition-all cursor-move group/event`}
                            draggable
                            onDragStart={() => setDraggedEvent(event.id)}
                            onDragEnd={() => setDraggedEvent(null)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover/event:opacity-100 transition-opacity" />
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
                    
                    {/* Drop zone indicator */}
                    {(draggedQuickEvent || draggedEvent) && (
                      <div 
                        className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                      >
                        <span className="text-sm text-primary font-medium">
                          Drop {draggedQuickEvent ? `"${draggedQuickEvent.title}"` : 'event'} here
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

      {/* Right Panel - Quick Event Creation */}
      <div className="w-80 border-l border-border bg-surface-secondary">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Add Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!quickAddData ? (
              <Button
                variant="outline"
                onClick={() => setQuickAddData({ title: '', priority: 'medium' })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Title</label>
                  <Input
                    placeholder="Enter event title..."
                    value={quickAddData.title}
                    onChange={(e) => setQuickAddData(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={quickAddData.priority} 
                    onValueChange={(value: Priority) => setQuickAddData(prev => prev ? { ...prev, priority: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Add notes or description..."
                    value={quickAddData.description || ''}
                    onChange={(e) => setQuickAddData(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateQuickEvent} className="flex-1">
                    Create & Drag
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setQuickAddData(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-xs text-muted-foreground bg-card p-3 rounded-lg">
              <p className="font-medium mb-1">How to add events:</p>
              <ol className="space-y-1">
                <li>1. Create a quick event above</li>
                <li>2. Drag it to any time slot on the timeline</li>
                <li>3. The event will be saved automatically</li>
              </ol>
            </div>

            {/* Draggable Quick Event */}
            {draggedQuickEvent && (
              <div 
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(draggedQuickEvent.priority)} cursor-move opacity-75`}
                draggable
                onDragEnd={() => setDraggedQuickEvent(null)}
              >
                <div className="font-medium text-sm">{draggedQuickEvent.title}</div>
                {draggedQuickEvent.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {draggedQuickEvent.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {draggedQuickEvent.priority} priority
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}