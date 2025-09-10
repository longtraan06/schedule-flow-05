import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Event } from "@/types/planner";

interface MonthViewProps {
  events: Event[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
  onSwitchToDayView: (date: Date) => void;
}

export function MonthView({ 
  events, 
  selectedDate, 
  onSelectDate, 
  onUpdateEvent, 
  onDeleteEvent,
  onSwitchToDayView
}: MonthViewProps) {
  
  // Calculate calendar grid (6 weeks x 7 days)
  const calendarDates = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks x 7 days)
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }
    
    return dates;
  }, [selectedDate]);

  // Get events for each day
  const eventsByDay = useMemo(() => {
    const eventsMap: { [key: string]: Event[] } = {};
    
    calendarDates.forEach(({ date }) => {
      const dateKey = date.toDateString();
      eventsMap[dateKey] = events.filter(event => 
        new Date(event.date).toDateString() === dateKey
      );
    });
    
    return eventsMap;
  }, [events, calendarDates]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    onSelectDate(newDate);
  };

  const handleDateDoubleClick = (date: Date) => {
    onSwitchToDayView(date);
  };

  const formatMonthYear = () => {
    return selectedDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getPriorityCount = (events: Event[]) => {
    return events.reduce((acc, event) => {
      acc[event.priority] = (acc[event.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      {/* Month Navigation Header */}
      <div className="border-b border-border bg-surface-secondary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold">
                {formatMonthYear()}
              </h2>
              <p className="text-sm text-muted-foreground">
                Month view
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

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-secondary">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-7 grid-rows-6 h-full">
          {calendarDates.map(({ date, isCurrentMonth, isToday, isPast }, index) => {
            const dateKey = date.toDateString();
            const dayEvents = eventsByDay[dateKey] || [];
            const priorityCounts = getPriorityCount(dayEvents);

            return (
              <div
                key={index}
                className={`border-r border-b border-border last-col:border-r-0 last-row:border-b-0 p-2 cursor-pointer hover:bg-surface-secondary transition-colors ${
                  !isCurrentMonth ? 'opacity-40 bg-muted/20' : ''
                } ${
                  isToday ? 'bg-primary/5' : ''
                } ${
                  isPast && !isToday ? 'opacity-60' : ''
                }`}
                onDoubleClick={() => handleDateDoubleClick(date)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-primary font-bold' : 
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {date.getDate()}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                {/* Events Preview */}
                <div className="space-y-1">
                  {dayEvents.length === 0 ? (
                    <div className="h-8" /> // Spacer to maintain consistent cell height
                  ) : (
                    <>
                      {/* Show first few events */}
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate border-l-2 ${
                            event.priority === 'high' ? 'border-l-priority-high bg-priority-high/10' :
                            event.priority === 'medium' ? 'border-l-priority-medium bg-priority-medium/10' :
                            'border-l-priority-low bg-priority-low/10'
                          }`}
                          title={`${event.title}${event.startTime ? ` at ${event.startTime}` : ''}`}
                        >
                          {event.startTime && (
                            <span className="text-muted-foreground mr-1">
                              {event.startTime}
                            </span>
                          )}
                          <span className="font-medium">{event.title}</span>
                        </div>
                      ))}
                      
                      {/* Show "more events" indicator */}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Priority Indicators */}
                {dayEvents.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {priorityCounts.high > 0 && (
                      <div className="w-2 h-2 rounded-full bg-priority-high" title={`${priorityCounts.high} high priority`} />
                    )}
                    {priorityCounts.medium > 0 && (
                      <div className="w-2 h-2 rounded-full bg-priority-medium" title={`${priorityCounts.medium} medium priority`} />
                    )}
                    {priorityCounts.low > 0 && (
                      <div className="w-2 h-2 rounded-full bg-priority-low" title={`${priorityCounts.low} low priority`} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="border-t border-border bg-surface-secondary p-2">
        <p className="text-xs text-muted-foreground text-center">
          Double-click a date to open detailed Day view
        </p>
      </div>
    </div>
  );
}