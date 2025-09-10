import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, MessageCircle, Clock } from "lucide-react";
import { Event } from "@/types/planner";

interface BottomPanelProps {
  events: Event[];
  onDeleteEvent: (eventId: string) => void;
}

type PanelTab = 'notifications' | 'settings' | 'chatbot';

export function BottomPanel({ events }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('notifications');

  // Get upcoming events for notifications
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getReminderTime = (event: Event) => {
    if (event.customReminderTime) {
      return event.customReminderTime;
    }
    
    switch (event.priority) {
      case 'high': return 60; // 1 hour
      case 'medium': return 30; // 30 minutes  
      case 'low': return 10; // 10 minutes
      default: return 30;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-priority-high';
      case 'medium': return 'text-priority-medium';
      case 'low': return 'text-priority-low';
      default: return 'text-muted-foreground';
    }
  };

  const formatDateTime = (date: Date, time?: string) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  return (
    <div className="border-t border-border bg-surface shadow-panel">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('notifications')}
          className="rounded-none border-r border-border gap-2"
        >
          <Bell className="h-4 w-4" />
          Notifications
          {upcomingEvents.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {upcomingEvents.length}
            </Badge>
          )}
        </Button>

        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('settings')}
          className="rounded-none border-r border-border gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>

        <Button
          variant={activeTab === 'chatbot' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('chatbot')}
          className="rounded-none gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Chatbot
        </Button>
      </div>

      {/* Tab Content */}
      <div className="p-4 h-32 overflow-y-auto">
        {activeTab === 'notifications' && (
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-card hover:bg-card-hover transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className={`w-2 h-2 rounded-full ${
                      event.priority === 'high' ? 'bg-priority-high' :
                      event.priority === 'medium' ? 'bg-priority-medium' : 'bg-priority-low'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(new Date(event.date), event.startTime)} • 
                      <span className={getPriorityColor(event.priority)}>
                        {' '}Remind {getReminderTime(event)}min before
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Settings</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <Button variant="outline" size="sm">Auto</Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Default Reminder</span>
                <Button variant="outline" size="sm">30min</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="text-center text-muted-foreground py-4">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chatbot integration coming soon!</p>
            <p className="text-xs mt-1">AI-powered study planning assistance</p>
          </div>
        )}
      </div>
    </div>
  );
}