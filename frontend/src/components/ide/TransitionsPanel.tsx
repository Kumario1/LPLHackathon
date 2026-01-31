import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export const TransitionsPanel = () => {
    return (
        <div className="h-full flex flex-col bg-[#18181b] border border-white/15 rounded-xl clip-hidden shadow-sm overflow-hidden">
            <div className="text-xs font-semibold px-4 py-3 text-muted-foreground uppercase tracking-wider bg-white/5 border-b border-white/10 flex justify-between items-center">
                <span>Active Transitions</span>
                <Badge variant="outline" className="text-[10px] bg-background/50 border-white/10">3 Active</Badge>
            </div>

            <ScrollArea className="flex-1 p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="h-8 text-xs font-medium text-muted-foreground">Asset / Stage</TableHead>
                            <TableHead className="h-8 text-xs font-medium text-muted-foreground text-right w-[80px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs font-mono">
                        <TableRow className="border-border/50 hover:bg-accent/30 group cursor-pointer">
                            <TableCell className="py-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">VTSAX (Vanguard)</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" /> ACAT Transfer
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right py-2.5">
                                <Badge className="bg-green-500/15 text-green-500 border-0 hover:bg-green-500/25">Done</Badge>
                            </TableCell>
                        </TableRow>

                        <TableRow className="border-border/50 hover:bg-accent/30 group cursor-pointer">
                            <TableCell className="py-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Fidelity IRA</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-yellow-500" /> Liquidate
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right py-2.5">
                                <Badge className="bg-yellow-500/15 text-yellow-500 border-0 hover:bg-yellow-500/25">In Prog</Badge>
                            </TableCell>
                        </TableRow>

                        <TableRow className="border-border/50 hover:bg-accent/30 group cursor-pointer bg-destructive/5">
                            <TableCell className="py-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Schwab 401k</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3 text-destructive" /> Signature
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right py-2.5">
                                <Badge variant="destructive" className="bg-destructive/15 text-destructive border-0 hover:bg-destructive/25">NIGO</Badge>
                            </TableCell>
                        </TableRow>

                        <TableRow className="border-border/50 hover:bg-accent/30 group cursor-pointer">
                            <TableCell className="py-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Chase Checking</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <TrendingUp className="h-3 w-3 text-blue-400" /> Verification
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right py-2.5">
                                <Badge className="bg-blue-500/15 text-blue-500 border-0 hover:bg-blue-500/25">New</Badge>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
};
