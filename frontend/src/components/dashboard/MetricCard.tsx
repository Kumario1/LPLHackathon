import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  children: ReactNode;
}

export function MetricCard({ title, children }: MetricCardProps) {
  return (
    <div className="dashboard-card flex flex-col h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function TransitionsCard() {
  return (
    <MetricCard title="My Transitions">
      <div className="stat-value">12 Active</div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">On Track</span>
          <span className="status-badge status-success">8</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">At Risk</span>
          <span className="status-badge status-danger">4</span>
        </div>
      </div>
    </MetricCard>
  );
}

export function WaitingItemsCard() {
  const items = [
    { name: "Smith Household Review", due: "Today" },
    { name: "Q4 Portfolio Rebalance", due: "Tomorrow" },
    { name: "New Account Opening", due: "Dec 15" },
  ];

  return (
    <MetricCard title="Items Waiting on Me">
      <div className="stat-value">5 Pending</div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground truncate mr-2">{item.name}</span>
            <span className="text-xs text-warning whitespace-nowrap">{item.due}</span>
          </li>
        ))}
      </ul>
    </MetricCard>
  );
}

export function HouseholdsAtRiskCard() {
  const households = [
    { name: "Smith Hh", issue: "NIGO Issue" },
    { name: "Chen Hh", issue: "SLA Breach" },
    { name: "Martinez Hh", issue: "Missing Docs" },
  ];

  return (
    <MetricCard title="Households at Risk Today">
      <div className="stat-value text-destructive">3 High Risk</div>
      <ul className="mt-3 space-y-2">
        {households.map((hh) => (
          <li key={hh.name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{hh.name}</span>
            <span className="status-badge status-danger">{hh.issue}</span>
          </li>
        ))}
      </ul>
    </MetricCard>
  );
}

export function DocsPendingCard() {
  const docs = [
    { name: "IRA Transfer Form", status: 60 },
    { name: "Account Application", status: 100 },
    { name: "Beneficiary Update", status: 30 },
  ];

  return (
    <MetricCard title="Docs Pending Signature">
      <div className="stat-value">7 Docs</div>
      <ul className="mt-3 space-y-2.5">
        {docs.map((doc) => (
          <li key={doc.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate">{doc.name}</span>
              <span className="text-xs text-foreground">{doc.status}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${doc.status}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </MetricCard>
  );
}
