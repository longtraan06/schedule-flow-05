import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Event } from "@/types/planner";

interface WeekViewProps {
  events: Event[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function WeekView({ 
  events, 
  selectedDate, 
  onSelectDate, 
  onUpdateEvent, 
  onDeleteEvent 
}: WeekViewProps) {
  
  // Calculate week dates
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // First day is Sunday
    startOfWeek.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  // Get events for each day of the week
  const weekEvents = useMemo(() => {
    const eventsByDay: { [key: string]: Event[] } = {};
    
    weekDates.forEach(date => {
      const dateKey = date.toDateString();
      eventsByDay[dateKey] = events
        .filter(event => new Date(event.date).toDateString() === dateKey)
        .sort((a, b) => {
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
          }
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    });
    
    return eventsByDay;
  }, [events, weekDates]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    onSelectDate(newDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-priority-high bg-priority-high/10';
      case 'medium': return 'border-l-priority-medium bg-priority-medium/10';
      case 'low': return 'border-l-priority-low bg-priority-low/10';
      default: return 'border-l-muted bg-muted/10';
    }
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

  const handleDayDoubleClick = (date: Date) => {
    onSelectDate(date);
    // This would trigger view change to day view in the parent component
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Week Navigation Header */}
      <div className="border-b border-border bg-surface-secondary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold">
                {formatWeekRange()}
              </h2>
              <p className="text-sm text-muted-foreground">
                Week view
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

      {/* Week Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-7 h-full">
          {weekDates.map((date, index) => {
            const dateKey = date.toDateString();
            const dayEvents = weekEvents[dateKey] || [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            return (
              <div
                key={dateKey}
                className={`border-r border-border last:border-r-0 flex flex-col ${
                  isPast(date) && !isToday(date) ? 'opacity-60' : ''
                }`}
                onDoubleClick={() => handleDayDoubleClick(date)}
              >
                {/* Day Header */}
                <div className={`p-3 border-b border-border text-center ${
                  isToday(date) ? 'bg-primary/10' : 'bg-surface-secondary'
                }`}>
                  <div className="text-xs font-medium text-muted-foreground">
                    {dayNames[index]}
                  </div>
                  <div className={`text-lg font-semibold mt-1 ${
                    isToday(date) ? 'text-primary' : 'text-foreground'
                  }`}>
                    {date.getDate()}
                  </div>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                {/* Day Events */}
                <div className="flex-1 p-2 overflow-y-auto">
                  <div className="space-y-1">
                    {dayEvents.length === 0 ? (
                      <div className="text-center text-muted-foreground/50 py-4">
                        <div className="text-xs">No events</div>
                      </div>
                    ) : (
                      dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`p-2 rounded text-xs border-l-2 cursor-pointer hover:bg-opacity-20 transition-colors ${getPriorityColor(event.priority)}`}
                          onClick={() => handleDayDoubleClick(date)}
                        >
                          <div className="font-medium truncate mb-1">
                            {event.title}
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {event.startTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.startTime}</span>
                                {event.endTime && (
                                  <span>-{event.endTime}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs capitalize ${
                                event.priority === 'high' ? 'bg-priority-high/20 text-priority-high' :
                                event.priority === 'medium' ? 'bg-priority-medium/20 text-priority-medium' :
                                'bg-priority-low/20 text-priority-low'
                              }`}
                            >
                              {event.priority}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="border-t border-border bg-surface-secondary p-2">
        <p className="text-xs text-muted-foreground text-center">
          Double-click a day to open detailed Day view
        </p>
      </div>
    </div>
  );
}