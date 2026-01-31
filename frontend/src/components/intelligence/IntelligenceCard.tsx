import { useState, useEffect } from 'react';
import { Sparkles, Info, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MockService, Household, LifeEvent, Account } from '@/services/mockData';
import { KimiClient } from '@/services/kimiClient';

interface IntelligenceCardProps {
    household: Household;
}

export const IntelligenceCard = ({ household }: IntelligenceCardProps) => {
    const [executiveBrief, setExecutiveBrief] = useState('');
    const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [dossierQuery, setDossierQuery] = useState('');
    const [dossierAnswer, setDossierAnswer] = useState('');
    const [isAsking, setIsAsking] = useState(false);

    useEffect(() => {
        MockService.getExecutiveBrief(household.id).then(setExecutiveBrief);
        MockService.getLifeEvents(household.id).then(setLifeEvents);
        MockService.getAccounts(household.id).then(setAccounts);
    }, [household.id]);

    const handleAskDossier = async () => {
        if (!dossierQuery.trim() || isAsking) return;

        setIsAsking(true);
        try {
            const context = `Regarding ${household.name}: ${executiveBrief}. Life events: ${lifeEvents.map(e => e.event).join(', ')}. Accounts: ${accounts.map(a => `${a.name} ($${a.balance})`).join(', ')}.`;
            const answer = await KimiClient.sendMessage([
                { role: 'user', content: `Based on this client dossier: ${context}\n\nQuestion: ${dossierQuery}` }
            ]);
            setDossierAnswer(answer);
        } catch (error) {
            setDossierAnswer('Unable to answer at this time. Please try again.');
        }
        setIsAsking(false);
    };

    const getMinutesAgo = (date: Date) => {
        const diff = Date.now() - date.getTime();
        return Math.floor(diff / 60000);
    };

    return (
        <Card className="bg-[#18181b] border-white/15">
            <CardHeader className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Intelligence Dossier
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-background/50 border-white/10 gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {getMinutesAgo(household.lastUpdated)}m ago
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
                {/* Executive Brief */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Info className="h-3 w-3" /> Executive Brief
                    </h4>
                    <p className="text-sm leading-relaxed">
                        {executiveBrief.split('**').map((part, idx) =>
                            idx % 2 === 0 ? part : <strong key={idx} className="text-primary">{part}</strong>
                        )}
                    </p>
                </div>

                {/* Financial Health Snapshot */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" /> Financial Health
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-muted-foreground">Assets Landed</p>
                            <p className="text-lg font-bold text-green-400">${(household.assetsLanded / 1000000).toFixed(2)}M</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-muted-foreground">In Transit</p>
                            <p className="text-lg font-bold text-yellow-400">${(household.assetsInTransit / 1000000).toFixed(2)}M</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-muted-foreground">Transfer Completeness</span>
                            <span className="text-sm font-semibold">{household.transferCompleteness}%</span>
                        </div>
                        <Progress value={household.transferCompleteness} className="h-2" />
                    </div>
                </div>

                {/* Life Events with Citations */}
                {lifeEvents.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Life Events
                        </h4>
                        <div className="space-y-2">
                            {lifeEvents.map(event => (
                                <Tooltip key={event.id}>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 cursor-help transition-colors">
                                            <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                📅
                                            </div>
                                            <span className="text-sm flex-1">{event.event}</span>
                                            <Badge variant="outline" className="text-[10px]">{event.date}</Badge>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-[300px]">
                                        <p className="text-xs font-semibold mb-1">Source: {event.source}</p>
                                        <p className="text-xs text-muted-foreground italic">"{event.sourceDetail}"</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ask the Dossier */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Ask the Dossier
                    </h4>
                    <div className="flex gap-2">
                        <Input
                            placeholder="E.g., Does this client have any held-away 401ks?"
                            value={dossierQuery}
                            onChange={(e) => setDossierQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAskDossier()}
                            className="bg-background/50 border-white/10 text-sm"
                            disabled={isAsking}
                        />
                        <Button
                            size="sm"
                            onClick={handleAskDossier}
                            disabled={isAsking || !dossierQuery.trim()}
                        >
                            {isAsking ? '...' : 'Ask'}
                        </Button>
                    </div>
                    {dossierAnswer && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-sm">{dossierAnswer}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
