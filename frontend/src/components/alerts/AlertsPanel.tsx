import { useState } from 'react';
import { AlertCircle, DollarSign, Calendar, FileWarning, Mail, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ComplianceAlert } from '@/services/mockData';
import { EmailDraftModal } from '@/components/actions/EmailDraftModal';

interface AlertsPanelProps {
    alerts: ComplianceAlert[];
    householdId: string;
}

const getAlertIcon = (type: ComplianceAlert['type']) => {
    switch (type) {
        case 'CASH_DRAG': return <DollarSign className="h-4 w-4" />;
        case 'MISSING_FIELD': return <FileWarning className="h-4 w-4" />;
        case 'NIGO': return <AlertCircle className="h-4 w-4" />;
        case 'SLA_BREACH': return <AlertCircle className="h-4 w-4" />;
        case 'LIFE_EVENT': return <Calendar className="h-4 w-4" />;
        default: return <AlertCircle className="h-4 w-4" />;
    }
};

const getAlertColor = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
        case 'ERROR': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'text-red-400 bg-red-400/20' };
        case 'WARNING': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'text-yellow-400 bg-yellow-400/20' };
        case 'INFO': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400 bg-blue-400/20' };
        default: return { bg: 'bg-muted', border: 'border-white/10', text: 'text-muted-foreground', icon: 'text-muted-foreground bg-muted' };
    }
};

const getEmailType = (alertType: ComplianceAlert['type']): 'nigo' | 'cashDrag' | 'status' | 'general' => {
    switch (alertType) {
        case 'CASH_DRAG': return 'cashDrag';
        case 'NIGO': return 'nigo';
        case 'MISSING_FIELD': return 'nigo';
        default: return 'status';
    }
};

export const AlertsPanel = ({ alerts, householdId }: AlertsPanelProps) => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedEmailType, setSelectedEmailType] = useState<'nigo' | 'cashDrag' | 'status' | 'general'>('status');

    const handleDraftEmail = (alert: ComplianceAlert) => {
        setSelectedEmailType(getEmailType(alert.type));
        setShowEmailModal(true);
    };

    // Separate by severity for display
    const errorAlerts = alerts.filter(a => a.severity === 'ERROR');
    const warningAlerts = alerts.filter(a => a.severity === 'WARNING');
    const infoAlerts = alerts.filter(a => a.severity === 'INFO');

    return (
        <>
            <Card className="bg-[#18181b] border-white/15">
                <CardHeader className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            Alerts & Opportunities
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-background/50 border-white/10">
                            {alerts.length} Items
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-2">
                            {/* Critical Alerts */}
                            {errorAlerts.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Critical</h4>
                                    {errorAlerts.map(alert => {
                                        const colors = getAlertColor(alert.severity);
                                        return (
                                            <div
                                                key={alert.id}
                                                className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${colors.icon}`}>
                                                        {getAlertIcon(alert.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm ${colors.text}`}>{alert.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                                                        {alert.suggestedAction && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 mt-2 text-xs gap-1.5 hover:bg-primary/10"
                                                                onClick={() => handleDraftEmail(alert)}
                                                            >
                                                                <Mail className="h-3 w-3" />
                                                                Draft Email
                                                                <ChevronRight className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Warnings */}
                            {warningAlerts.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Warnings</h4>
                                    {warningAlerts.map(alert => {
                                        const colors = getAlertColor(alert.severity);
                                        return (
                                            <div
                                                key={alert.id}
                                                className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${colors.icon}`}>
                                                        {getAlertIcon(alert.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm ${colors.text}`}>{alert.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                                                        {alert.suggestedAction && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 mt-2 text-xs gap-1.5 hover:bg-primary/10"
                                                                onClick={() => handleDraftEmail(alert)}
                                                            >
                                                                <Sparkles className="h-3 w-3" />
                                                                Take Action
                                                                <ChevronRight className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Life Events / Info */}
                            {infoAlerts.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Life Events</h4>
                                    {infoAlerts.map(alert => {
                                        const colors = getAlertColor(alert.severity);
                                        return (
                                            <div
                                                key={alert.id}
                                                className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${colors.icon}`}>
                                                        {getAlertIcon(alert.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm ${colors.text}`}>{alert.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                                                        {alert.data?.sourceDetail && (
                                                            <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-white/10 pl-2">
                                                                "{String(alert.data.sourceDetail).slice(0, 100)}..."
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {alerts.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No alerts for this household.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <EmailDraftModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                householdId={householdId}
                emailType={selectedEmailType}
            />
        </>
    );
};
