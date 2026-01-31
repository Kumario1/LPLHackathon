import { useState, useEffect } from 'react';
import { Mail, Send, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MockService, Household } from '@/services/mockData';
import { toast } from 'sonner';

interface EmailDraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    householdId: string;
    emailType?: 'nigo' | 'cashDrag' | 'status' | 'general';
}

export const EmailDraftModal = ({ isOpen, onClose, householdId, emailType = 'status' }: EmailDraftModalProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [household, setHousehold] = useState<Household | null>(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedType, setSelectedType] = useState(emailType);

    useEffect(() => {
        if (isOpen && householdId) {
            setIsLoading(true);
            setSelectedType(emailType);

            Promise.all([
                MockService.getHousehold(householdId),
                MockService.draftEmail(householdId, emailType)
            ]).then(([hh, draft]) => {
                setHousehold(hh || null);
                setSubject(draft.subject);
                setBody(draft.body);
                setIsLoading(false);
            });
        }
    }, [isOpen, householdId, emailType]);

    const handleTypeChange = async (type: 'nigo' | 'cashDrag' | 'status' | 'general') => {
        setSelectedType(type);
        setIsLoading(true);
        const draft = await MockService.draftEmail(householdId, type);
        setSubject(draft.subject);
        setBody(draft.body);
        setIsLoading(false);
    };

    const handleSend = () => {
        toast.success('Email queued for delivery!', {
            description: `Email to ${household?.primaryClient || 'client'} will be sent shortly.`,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#18181b] border-white/15">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Draft Email - {household?.name || 'Client'}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Generating draft...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Email Type Selector */}
                        <div className="space-y-2">
                            <Label>Email Type</Label>
                            <Select value={selectedType} onValueChange={(v) => handleTypeChange(v as typeof selectedType)}>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                    <SelectValue placeholder="Select email type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="status">Status Update</SelectItem>
                                    <SelectItem value="nigo">NIGO Correction Request</SelectItem>
                                    <SelectItem value="cashDrag">Cash Drag Opportunity</SelectItem>
                                    <SelectItem value="general">General Check-in</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* To Field */}
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input
                                value={household?.primaryClient ? `${household.primaryClient} <${household.primaryClient.toLowerCase().replace(' ', '.')}@email.com>` : ''}
                                className="bg-background/50 border-white/10"
                                readOnly
                            />
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="bg-background/50 border-white/10"
                            />
                        </div>

                        {/* Body */}
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="min-h-[200px] bg-background/50 border-white/10 font-mono text-sm"
                            />
                        </div>

                        {/* AI Badge */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center">
                                ✨
                            </div>
                            <span>Draft generated by Clawdbot AI • Review before sending</span>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isLoading} className="gap-2">
                        <Send className="h-4 w-4" />
                        Send Email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
