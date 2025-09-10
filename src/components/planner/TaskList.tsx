import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Trash2, Calendar, Clock } from "lucide-react";
import { Event, Priority } from "@/types/planner";

interface TaskListProps {
  events: Event[];
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
}

type FilterMode = 'day' | 'week' | 'month';

export function TaskList({ events, onUpdateEvent, onDeleteEvent }: TaskListProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('day');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      
      switch (filterMode) {
        case 'day':
          return eventDate.toDateString() === today.toDateString();
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return eventDate >= weekStart && eventDate <= weekEnd;
        case 'month':
          return eventDate.getMonth() === today.getMonth() && 
                 eventDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    }).sort((a, b) => {
      // Sort by date first, then by priority
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // Priority order: high, medium, low
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [events, filterMode]);

  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: Event[] } = {};
    
    filteredEvents.forEach(event => {
      const dateKey = new Date(event.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    return groups;
  }, [filteredEvents]);

  const getPriorityBadgeVariant = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-priority-high';
      case 'medium': return 'bg-priority-medium';
      case 'low': return 'bg-priority-low';
      default: return 'bg-muted';
    }
  };

  const handleEventSelection = (eventId: string, checked: boolean) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(eventId);
      } else {
        newSet.delete(eventId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    if (selectedEvents.size === 0) return;
    
    const confirmed = confirm(`Delete ${selectedEvents.size} selected event(s)?`);
    if (confirmed) {
      selectedEvents.forEach(eventId => onDeleteEvent(eventId));
      setSelectedEvents(new Set());
      setDeleteMode(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as FilterMode[]).map(mode => (
            <Button
              key={mode}
              variant={filterMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterMode(mode)}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>

        <Button
          variant={deleteMode ? "destructive" : "ghost"}
          size="sm"
          onClick={() => {
            setDeleteMode(!deleteMode);
            setSelectedEvents(new Set());
          }}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {deleteMode ? 'Cancel' : 'Delete'}
        </Button>
      </div>

      {deleteMode && selectedEvents.size > 0 && (
        <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <span className="text-sm text-destructive">
            {selectedEvents.size} event(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events found for the selected period</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">
                  {formatDate(new Date(dateKey))}
                </h3>
                <Separator className="flex-1" />
              </div>
              
              <div className="space-y-2">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-card-hover transition-colors"
                  >
                    {deleteMode && (
                      <Checkbox
                        checked={selectedEvents.has(event.id)}
                        onCheckedChange={(checked) => 
                          handleEventSelection(event.id, checked as boolean)
                        }
                      />
                    )}
                    
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {event.title}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {event.startTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </div>
                        )}
                        
                        <Badge 
                          variant={getPriorityBadgeVariant(event.priority)}
                          className="text-xs capitalize"
                        >
                          {event.priority}
                        </Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {!deleteMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}