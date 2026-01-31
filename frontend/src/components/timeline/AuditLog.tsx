import { Upload, Check, AlertTriangle, Mail, Edit, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditEvent } from '@/services/mockData';

interface AuditLogProps {
    events: AuditEvent[];
}

const getIcon = (iconType: AuditEvent['icon']) => {
    switch (iconType) {
        case 'upload': return <Upload className="h-3.5 w-3.5" />;
        case 'check': return <Check className="h-3.5 w-3.5" />;
        case 'alert': return <AlertTriangle className="h-3.5 w-3.5" />;
        case 'email': return <Mail className="h-3.5 w-3.5" />;
        case 'edit': return <Edit className="h-3.5 w-3.5" />;
        case 'ai': return <Bot className="h-3.5 w-3.5" />;
        default: return <Check className="h-3.5 w-3.5" />;
    }
};

const getIconColor = (iconType: AuditEvent['icon']) => {
    switch (iconType) {
        case 'upload': return 'text-blue-400 bg-blue-400/20';
        case 'check': return 'text-green-400 bg-green-400/20';
        case 'alert': return 'text-yellow-400 bg-yellow-400/20';
        case 'email': return 'text-purple-400 bg-purple-400/20';
        case 'edit': return 'text-orange-400 bg-orange-400/20';
        case 'ai': return 'text-primary bg-primary/20';
        default: return 'text-muted-foreground bg-muted';
    }
};

const getActorBadge = (actorType: AuditEvent['actorType']) => {
    switch (actorType) {
        case 'ADVISOR': return 'bg-blue-500/10 text-blue-400';
        case 'OPS': return 'bg-green-500/10 text-green-400';
        case 'SYSTEM': return 'bg-purple-500/10 text-purple-400';
        case 'CLIENT': return 'bg-orange-500/10 text-orange-400';
        default: return 'bg-muted text-muted-foreground';
    }
};

export const AuditLog = ({ events }: AuditLogProps) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const eventDate = new Date(date);

        if (eventDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (eventDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Group events by date
    const groupedEvents = events.reduce((groups, event) => {
        const dateKey = formatDate(event.timestamp);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        return groups;
    }, {} as Record<string, AuditEvent[]>);

    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-6 pr-4">
                {Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
                    <div key={dateLabel}>
                        <div className="sticky top-0 bg-background/95 backdrop-blur py-1 mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {dateLabel}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {dateEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    {/* Icon */}
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${getIconColor(event.icon)}`}>
                                        {getIcon(event.icon)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{event.action}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getActorBadge(event.actorType)}`}>
                                                {event.actorType}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{event.details}</p>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                            <span>{formatTime(event.timestamp)}</span>
                                            <span>•</span>
                                            <span>{event.actor}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No audit events recorded yet.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};
