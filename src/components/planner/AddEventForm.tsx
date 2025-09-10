import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Event, Priority } from "@/types/planner";

interface AddEventFormProps {
  onSubmit: (event: Omit<Event, 'id'>) => void;
  onCancel: () => void;
}

export function AddEventForm({ onSubmit, onCancel }: AddEventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    priority: "medium" as Priority,
    customReminderTime: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    const eventData: Omit<Event, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: new Date(formData.date),
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      priority: formData.priority,
      customReminderTime: formData.customReminderTime ? parseInt(formData.customReminderTime) : undefined,
      createdAt: new Date(),
    };

    onSubmit(eventData);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-priority-high';
      case 'medium': return 'text-priority-medium';
      case 'low': return 'text-priority-low';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter event title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Notes / Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add notes or description..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Priority affects reminder time:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li className="text-priority-low">• Green: remind 10 minutes before</li>
                <li className="text-priority-medium">• Yellow: remind 30 minutes before</li>
                <li className="text-priority-high">• Red: remind 1 hour before</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={formData.priority}
          onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              <span className={getPriorityColor('low')}>Low Priority (Green)</span>
            </SelectItem>
            <SelectItem value="medium">
              <span className={getPriorityColor('medium')}>Normal Priority (Yellow)</span>
            </SelectItem>
            <SelectItem value="high">
              <span className={getPriorityColor('high')}>High Priority (Red)</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customReminder">Custom Reminder (minutes before)</Label>
        <Input
          id="customReminder"
          type="number"
          min="0"
          value={formData.customReminderTime}
          onChange={(e) => setFormData(prev => ({ ...prev, customReminderTime: e.target.value }))}
          placeholder="Override default reminder time"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Add Event
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}