import { Search, Filter, Flag, AlertTriangle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transitions = [
  {
    name: "Smith Family Wealth Transfer",
    status: "On Track",
    stage: "Paperwork",
    aum: "$2.4M",
    households: 3,
    riskLevel: "none",
    lastActivity: "2 hours ago",
  },
  {
    name: "Chen Retirement Rollover",
    status: "At Risk",
    stage: "Discovery",
    aum: "$850K",
    households: 1,
    riskLevel: "flag",
    lastActivity: "1 day ago",
  },
  {
    name: "Martinez Estate Planning",
    status: "Stalled",
    stage: "Discovery",
    aum: "$1.2M",
    households: 2,
    riskLevel: "warning",
    lastActivity: "3 days ago",
  },
  {
    name: "Johnson 401k Consolidation",
    status: "On Track",
    stage: "Funding",
    aum: "$520K",
    households: 1,
    riskLevel: "none",
    lastActivity: "4 hours ago",
  },
  {
    name: "Williams Trust Setup",
    status: "At Risk",
    stage: "Paperwork",
    aum: "$3.1M",
    households: 4,
    riskLevel: "clock",
    lastActivity: "5 hours ago",
  },
  {
    name: "Davis IRA Transfer",
    status: "On Track",
    stage: "Funding",
    aum: "$180K",
    households: 1,
    riskLevel: "none",
    lastActivity: "1 hour ago",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "On Track": "status-success",
    "At Risk": "status-danger",
    "Stalled": "status-warning",
  };

  return (
    <span className={`status-badge ${styles[status as keyof typeof styles] || ""}`}>
      {status}
    </span>
  );
}

function RiskIndicator({ level }: { level: string }) {
  if (level === "none") return <span className="text-muted-foreground">—</span>;
  
  const icons = {
    flag: <Flag className="w-4 h-4 text-destructive" />,
    warning: <AlertTriangle className="w-4 h-4 text-warning" />,
    clock: <Clock className="w-4 h-4 text-warning" />,
  };

  return icons[level as keyof typeof icons] || null;
}

export function TransitionsTable() {
  return (
    <div className="dashboard-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Recent Transitions</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-8 w-48 bg-muted border-border text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Transition Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Stage</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">AUM</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Households</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Risk</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transitions.map((t) => (
              <TableRow key={t.name} className="border-border hover:bg-accent/50 cursor-pointer">
                <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="text-muted-foreground">{t.stage}</TableCell>
                <TableCell className="text-right text-foreground">{t.aum}</TableCell>
                <TableCell className="text-center text-muted-foreground">{t.households}</TableCell>
                <TableCell className="text-center"><RiskIndicator level={t.riskLevel} /></TableCell>
                <TableCell className="text-right text-muted-foreground">{t.lastActivity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <span className="text-sm text-muted-foreground">Showing 1-6 of 12</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 bg-accent">1</Button>
          <Button variant="outline" size="sm" className="h-7 w-7">2</Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
