// Mock Data Service for Transition OS Frontend
// Simulates backend data for demonstration purposes

export interface Household {
  id: string;
  name: string;
  primaryClient: string;
  advisor: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'COMPLETED';
  riskScore: number; // 0-100
  totalAssets: number;
  assetsInTransit: number;
  assetsLanded: number;
  eta: string; // "4 days", "2 weeks"
  etaDays: number;
  transferCompleteness: number; // percentage
  cashDrag: number; // percentage
  idleCash: number;
  hasNIGO: boolean;
  stuckReason?: string;
  currentStage: number; // 0-4 for timeline
  lastUpdated: Date;
}

export interface Task {
  id: string;
  householdId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  owner: string;
  dueDate: string;
  slaBreached: boolean;
  dependencies: string[];
}

export interface Document {
  id: string;
  householdId: string;
  name: string;
  type: string;
  status: 'OK' | 'NIGO' | 'PENDING_REVIEW';
  uploadedAt: string;
  uploadedBy: string;
  nigoIssues?: NIGOIssue[];
}

export interface NIGOIssue {
  id: string;
  type: 'MISSING_SIGNATURE' | 'WRONG_DATE' | 'MISSING_FIELD' | 'WRONG_VERSION' | 'OTHER';
  description: string;
  page: number;
  location: { x: number; y: number; width: number; height: number };
  complianceRule: string;
}

export interface AuditEvent {
  id: string;
  householdId: string;
  timestamp: Date;
  actor: string;
  actorType: 'ADVISOR' | 'OPS' | 'SYSTEM' | 'CLIENT';
  action: string;
  details: string;
  icon: 'upload' | 'check' | 'alert' | 'email' | 'edit' | 'ai';
}

export interface LifeEvent {
  id: string;
  householdId: string;
  date: string;
  event: string;
  source: string;
  sourceDetail: string;
}

export interface Account {
  id: string;
  householdId: string;
  name: string;
  type: string;
  custodian: string;
  balance: number;
  transferStatus: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'NIGO';
  eta?: string;
}

export interface ComplianceAlert {
  id: string;
  householdId: string;
  type: 'CASH_DRAG' | 'MISSING_FIELD' | 'SLA_BREACH' | 'NIGO' | 'LIFE_EVENT';
  severity: 'INFO' | 'WARNING' | 'ERROR';
  title: string;
  description: string;
  suggestedAction?: string;
  data?: Record<string, unknown>;
}

// ========== MOCK DATA ==========

const households: Household[] = [
  {
    id: 'HH-001',
    name: 'Johnson Family',
    primaryClient: 'Michael Johnson',
    advisor: 'Sarah Williams',
    status: 'AT_RISK',
    riskScore: 65,
    totalAssets: 2500000,
    assetsInTransit: 500000,
    assetsLanded: 1800000,
    eta: '4 days',
    etaDays: 4,
    transferCompleteness: 72,
    cashDrag: 4.2,
    idleCash: 105000,
    hasNIGO: true,
    stuckReason: 'Missing signature on ACAT form',
    currentStage: 2,
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
  },
  {
    id: 'HH-002',
    name: 'Smith Household',
    primaryClient: 'John Smith',
    advisor: 'David Chen',
    status: 'ON_TRACK',
    riskScore: 25,
    totalAssets: 1250000,
    assetsInTransit: 125000,
    assetsLanded: 1000000,
    eta: '2 days',
    etaDays: 2,
    transferCompleteness: 85,
    cashDrag: 1.5,
    idleCash: 18750,
    hasNIGO: false,
    currentStage: 3,
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'HH-003',
    name: 'Miller Estate',
    primaryClient: 'Robert Miller',
    advisor: 'Sarah Williams',
    status: 'CRITICAL',
    riskScore: 85,
    totalAssets: 4200000,
    assetsInTransit: 1200000,
    assetsLanded: 2400000,
    eta: '12 days',
    etaDays: 12,
    transferCompleteness: 57,
    cashDrag: 8.5,
    idleCash: 357000,
    hasNIGO: true,
    stuckReason: 'SLA breached - waiting on beneficiary docs',
    currentStage: 1,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'HH-004',
    name: 'Thompson Trust',
    primaryClient: 'Elizabeth Thompson',
    advisor: 'David Chen',
    status: 'ON_TRACK',
    riskScore: 15,
    totalAssets: 890000,
    assetsInTransit: 45000,
    assetsLanded: 800000,
    eta: '1 day',
    etaDays: 1,
    transferCompleteness: 95,
    cashDrag: 0.5,
    idleCash: 4450,
    hasNIGO: false,
    currentStage: 4,
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'HH-005',
    name: 'Garcia Portfolio',
    primaryClient: 'Maria Garcia',
    advisor: 'James Wilson',
    status: 'AT_RISK',
    riskScore: 55,
    totalAssets: 1750000,
    assetsInTransit: 350000,
    assetsLanded: 1200000,
    eta: '6 days',
    etaDays: 6,
    transferCompleteness: 68,
    cashDrag: 3.0,
    idleCash: 52500,
    hasNIGO: true,
    stuckReason: 'Form dated incorrectly',
    currentStage: 2,
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'HH-006',
    name: 'Chen Investments',
    primaryClient: 'Wei Chen',
    advisor: 'James Wilson',
    status: 'COMPLETED',
    riskScore: 0,
    totalAssets: 3100000,
    assetsInTransit: 0,
    assetsLanded: 3100000,
    eta: 'Complete',
    etaDays: 0,
    transferCompleteness: 100,
    cashDrag: 0,
    idleCash: 0,
    hasNIGO: false,
    currentStage: 4,
    lastUpdated: new Date(Date.now() - 60 * 60 * 1000),
  },
];

const tasks: Task[] = [
  // Johnson Family tasks
  { id: 'T-001', householdId: 'HH-001', title: 'Collect ACAT signature', description: 'Get client signature on ACAT transfer form', status: 'BLOCKED', priority: 'CRITICAL', owner: 'Sarah Williams', dueDate: '2026-02-01', slaBreached: true, dependencies: [] },
  { id: 'T-002', householdId: 'HH-001', title: 'Verify beneficiary information', description: 'Confirm beneficiary DOBs for IRA accounts', status: 'PENDING', priority: 'HIGH', owner: 'Ops Team', dueDate: '2026-02-02', slaBreached: false, dependencies: ['T-001'] },
  { id: 'T-003', householdId: 'HH-001', title: 'Submit transfer request', description: 'Submit ACAT request to Schwab', status: 'PENDING', priority: 'MEDIUM', owner: 'Sarah Williams', dueDate: '2026-02-03', slaBreached: false, dependencies: ['T-001', 'T-002'] },
  { id: 'T-004', householdId: 'HH-001', title: 'Review Form CRS delivery', description: 'Confirm Form CRS was delivered to client', status: 'COMPLETED', priority: 'LOW', owner: 'Compliance', dueDate: '2026-01-25', slaBreached: false, dependencies: [] },
  
  // Smith Household tasks
  { id: 'T-005', householdId: 'HH-002', title: 'Final asset reconciliation', description: 'Verify all transferred assets match source', status: 'IN_PROGRESS', priority: 'HIGH', owner: 'David Chen', dueDate: '2026-02-01', slaBreached: false, dependencies: [] },
  { id: 'T-006', householdId: 'HH-002', title: 'Schedule welcome call', description: 'Set up initial planning meeting with client', status: 'PENDING', priority: 'MEDIUM', owner: 'David Chen', dueDate: '2026-02-03', slaBreached: false, dependencies: ['T-005'] },
  
  // Miller Estate tasks
  { id: 'T-007', householdId: 'HH-003', title: 'Collect beneficiary DOBs', description: 'Missing required DOBs for IRA rollover', status: 'BLOCKED', priority: 'CRITICAL', owner: 'Sarah Williams', dueDate: '2026-01-28', slaBreached: true, dependencies: [] },
  { id: 'T-008', householdId: 'HH-003', title: 'Rebalance portfolio', description: 'Move idle cash to diversified allocation', status: 'PENDING', priority: 'HIGH', owner: 'Sarah Williams', dueDate: '2026-02-05', slaBreached: false, dependencies: ['T-007'] },
  { id: 'T-009', householdId: 'HH-003', title: 'Tax lot analysis', description: 'Review cost basis for transferred assets', status: 'PENDING', priority: 'MEDIUM', owner: 'Ops Team', dueDate: '2026-02-10', slaBreached: false, dependencies: [] },
];

const documents: Document[] = [
  // Johnson Family docs
  { id: 'D-001', householdId: 'HH-001', name: 'ACAT Transfer Form', type: 'ACAT', status: 'NIGO', uploadedAt: '2026-01-28 14:30', uploadedBy: 'Sarah Williams', nigoIssues: [
    { id: 'NI-001', type: 'MISSING_SIGNATURE', description: 'Client signature missing on page 3', page: 3, location: { x: 350, y: 680, width: 200, height: 40 }, complianceRule: 'Compliance Rule #404: All ACAT forms require client signature' }
  ]},
  { id: 'D-002', householdId: 'HH-001', name: 'Account Application', type: 'Application', status: 'OK', uploadedAt: '2026-01-25 09:15', uploadedBy: 'Sarah Williams' },
  { id: 'D-003', householdId: 'HH-001', name: 'Form CRS', type: 'Disclosure', status: 'OK', uploadedAt: '2026-01-24 11:00', uploadedBy: 'Compliance' },
  
  // Smith Household docs
  { id: 'D-004', householdId: 'HH-002', name: 'IRA Rollover Form', type: 'Rollover', status: 'OK', uploadedAt: '2026-01-26 16:45', uploadedBy: 'David Chen' },
  { id: 'D-005', householdId: 'HH-002', name: 'Beneficiary Designation', type: 'Beneficiary', status: 'OK', uploadedAt: '2026-01-26 16:50', uploadedBy: 'David Chen' },
  
  // Miller Estate docs
  { id: 'D-006', householdId: 'HH-003', name: 'Trust Documentation', type: 'Trust', status: 'PENDING_REVIEW', uploadedAt: '2026-01-29 10:00', uploadedBy: 'Sarah Williams' },
  { id: 'D-007', householdId: 'HH-003', name: 'IRA Rollover Form', type: 'Rollover', status: 'NIGO', uploadedAt: '2026-01-27 14:20', uploadedBy: 'Sarah Williams', nigoIssues: [
    { id: 'NI-002', type: 'MISSING_FIELD', description: 'Beneficiary date of birth missing', page: 2, location: { x: 280, y: 420, width: 150, height: 25 }, complianceRule: 'Compliance Rule #301: Beneficiary DOB required for IRA rollovers' }
  ]},
  
  // Garcia Portfolio docs
  { id: 'D-008', householdId: 'HH-005', name: 'ACAT Form', type: 'ACAT', status: 'NIGO', uploadedAt: '2026-01-30 09:30', uploadedBy: 'James Wilson', nigoIssues: [
    { id: 'NI-003', type: 'WRONG_DATE', description: 'Form dated 2025 instead of 2026', page: 1, location: { x: 450, y: 120, width: 100, height: 20 }, complianceRule: 'Compliance Rule #102: Forms must be dated within 30 days' }
  ]},
];

const auditEvents: AuditEvent[] = [
  // Johnson Family audit trail
  { id: 'A-001', householdId: 'HH-001', timestamp: new Date('2026-01-31T10:05:00'), actor: 'Clawdbot', actorType: 'SYSTEM', action: 'Generated Slide Deck', details: 'AI-generated meeting prep slides for Johnson Family review', icon: 'ai' },
  { id: 'A-002', householdId: 'HH-001', timestamp: new Date('2026-01-31T10:01:00'), actor: 'NIGO Shield', actorType: 'SYSTEM', action: 'Verified Form A', details: 'ACAT Transfer Form flagged: Missing signature on page 3', icon: 'alert' },
  { id: 'A-003', householdId: 'HH-001', timestamp: new Date('2026-01-31T10:00:00'), actor: 'Sarah Williams', actorType: 'ADVISOR', action: 'Uploaded Form A', details: 'Uploaded ACAT Transfer Form for review', icon: 'upload' },
  { id: 'A-004', householdId: 'HH-001', timestamp: new Date('2026-01-30T15:30:00'), actor: 'David Chen', actorType: 'OPS', action: 'Updated Status', details: 'Changed status from ON_TRACK to AT_RISK', icon: 'edit' },
  { id: 'A-005', householdId: 'HH-001', timestamp: new Date('2026-01-28T09:00:00'), actor: 'Sarah Williams', actorType: 'ADVISOR', action: 'Sent Email', details: 'Sent reminder to client for missing signature', icon: 'email' },
  { id: 'A-006', householdId: 'HH-001', timestamp: new Date('2026-01-25T11:00:00'), actor: 'Compliance', actorType: 'OPS', action: 'Completed Review', details: 'Form CRS delivery confirmed', icon: 'check' },
  
  // Smith Household audit trail
  { id: 'A-007', householdId: 'HH-002', timestamp: new Date('2026-01-31T08:30:00'), actor: 'David Chen', actorType: 'ADVISOR', action: 'Started Reconciliation', details: 'Beginning final asset reconciliation', icon: 'edit' },
  { id: 'A-008', householdId: 'HH-002', timestamp: new Date('2026-01-30T14:00:00'), actor: 'System', actorType: 'SYSTEM', action: 'Assets Received', details: '$125,000 from Fidelity IRA received', icon: 'check' },
  
  // Miller Estate audit trail
  { id: 'A-009', householdId: 'HH-003', timestamp: new Date('2026-01-29T10:00:00'), actor: 'Sarah Williams', actorType: 'ADVISOR', action: 'Uploaded Document', details: 'Trust documentation submitted for review', icon: 'upload' },
  { id: 'A-010', householdId: 'HH-003', timestamp: new Date('2026-01-28T16:00:00'), actor: 'System', actorType: 'SYSTEM', action: 'SLA Alert', details: 'Beneficiary DOB collection task exceeded SLA', icon: 'alert' },
];

const lifeEvents: LifeEvent[] = [
  { id: 'LE-001', householdId: 'HH-001', date: '2025-08', event: 'Daughter starting college', source: 'Email', sourceDetail: 'Hi Sarah, great news - Emily got into UT Austin! We\'ll need to discuss 529 options.' },
  { id: 'LE-002', householdId: 'HH-001', date: '2025-12', event: 'Bonus received', source: 'Email', sourceDetail: 'Just received my year-end bonus, looking to invest an additional $50k.' },
  { id: 'LE-003', householdId: 'HH-002', date: '2026-01', event: 'New grandchild', source: 'Notes', sourceDetail: 'Client mentioned new grandchild born Jan 15. Consider 529 discussion.' },
  { id: 'LE-004', householdId: 'HH-003', date: '2025-06', event: 'Retirement party', source: 'Calendar', sourceDetail: 'Attended Robert\'s retirement celebration at country club' },
  { id: 'LE-005', householdId: 'HH-003', date: '2025-09', event: 'House sale', source: 'Email', sourceDetail: 'Sold vacation home in Aspen. Proceeds of $850k incoming.' },
  { id: 'LE-006', householdId: 'HH-005', date: '2025-11', event: 'Business sale', source: 'Notes', sourceDetail: 'Sold dental practice - significant liquidity event, needs tax planning' },
];

const accounts: Account[] = [
  // Johnson Family accounts
  { id: 'ACC-001', householdId: 'HH-001', name: 'Schwab 401k', type: '401k', custodian: 'Schwab', balance: 450000, transferStatus: 'NIGO', eta: 'Blocked' },
  { id: 'ACC-002', householdId: 'HH-001', name: 'Fidelity Brokerage', type: 'Brokerage', custodian: 'Fidelity', balance: 320000, transferStatus: 'COMPLETED' },
  { id: 'ACC-003', householdId: 'HH-001', name: 'Vanguard IRA', type: 'IRA', custodian: 'Vanguard', balance: 180000, transferStatus: 'IN_TRANSIT', eta: '3 days' },
  
  // Smith Household accounts
  { id: 'ACC-004', householdId: 'HH-002', name: 'Fidelity IRA', type: 'IRA', custodian: 'Fidelity', balance: 125000, transferStatus: 'IN_TRANSIT', eta: '1 day' },
  { id: 'ACC-005', householdId: 'HH-002', name: 'TD Ameritrade', type: 'Brokerage', custodian: 'TD Ameritrade', balance: 250000, transferStatus: 'COMPLETED' },
  
  // Miller Estate accounts
  { id: 'ACC-006', householdId: 'HH-003', name: 'Schwab Trust', type: 'Trust', custodian: 'Schwab', balance: 1800000, transferStatus: 'PENDING' },
  { id: 'ACC-007', householdId: 'HH-003', name: 'Morgan Stanley IRA', type: 'IRA', custodian: 'Morgan Stanley', balance: 650000, transferStatus: 'NIGO', eta: 'Blocked' },
];

// ========== MOCK SERVICE API ==========

export const MockService = {
  // Households
  getHouseholds: async (): Promise<Household[]> => {
    await delay(100);
    return [...households];
  },

  getHousehold: async (id: string): Promise<Household | undefined> => {
    await delay(100);
    return households.find(h => h.id === id);
  },

  getHouseholdsByStatus: async (status: Household['status']): Promise<Household[]> => {
    await delay(100);
    return households.filter(h => h.status === status);
  },

  getAtRiskHouseholds: async (): Promise<Household[]> => {
    await delay(100);
    return households.filter(h => h.riskScore >= 50);
  },

  // Tasks
  getTasks: async (householdId?: string): Promise<Task[]> => {
    await delay(100);
    if (householdId) {
      return tasks.filter(t => t.householdId === householdId);
    }
    return [...tasks];
  },

  completeTask: async (taskId: string): Promise<Task | undefined> => {
    await delay(200);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'COMPLETED';
    }
    return task;
  },

  // Documents
  getDocuments: async (householdId?: string): Promise<Document[]> => {
    await delay(100);
    if (householdId) {
      return documents.filter(d => d.householdId === householdId);
    }
    return [...documents];
  },

  getNIGODocuments: async (): Promise<Document[]> => {
    await delay(100);
    return documents.filter(d => d.status === 'NIGO');
  },

  analyzeDocument: async (_file: File): Promise<{ status: 'OK' | 'NIGO'; issues: NIGOIssue[] }> => {
    await delay(2000); // Simulate OCR processing
    // Always return a simulated NIGO result for demo
    return {
      status: 'NIGO',
      issues: [
        {
          id: 'NI-DEMO',
          type: 'MISSING_SIGNATURE',
          description: 'Client signature missing on page 3',
          page: 3,
          location: { x: 350, y: 680, width: 200, height: 40 },
          complianceRule: 'Compliance Rule #404: All forms require client signature'
        }
      ]
    };
  },

  // Audit Events
  getAuditEvents: async (householdId?: string): Promise<AuditEvent[]> => {
    await delay(100);
    const events = householdId 
      ? auditEvents.filter(e => e.householdId === householdId)
      : [...auditEvents];
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  // Life Events
  getLifeEvents: async (householdId: string): Promise<LifeEvent[]> => {
    await delay(100);
    return lifeEvents.filter(e => e.householdId === householdId);
  },

  // Accounts
  getAccounts: async (householdId: string): Promise<Account[]> => {
    await delay(100);
    return accounts.filter(a => a.householdId === householdId);
  },

  // Alerts
  getAlerts: async (householdId: string): Promise<ComplianceAlert[]> => {
    await delay(100);
    const household = households.find(h => h.id === householdId);
    const householdDocs = documents.filter(d => d.householdId === householdId);
    const householdLifeEvents = lifeEvents.filter(e => e.householdId === householdId);
    
    const alerts: ComplianceAlert[] = [];
    
    // Cash Drag Alert
    if (household && household.cashDrag > 2) {
      alerts.push({
        id: `ALERT-CASH-${householdId}`,
        householdId,
        type: 'CASH_DRAG',
        severity: household.cashDrag > 5 ? 'ERROR' : 'WARNING',
        title: `$${(household.idleCash / 1000).toFixed(0)}k Cash Idle (${household.cashDrag.toFixed(1)}% Yield)`,
        description: `Opportunity: Move to Money Market (4.5% yield potential)`,
        suggestedAction: 'Draft rebalance recommendation email',
        data: { currentYield: 0.01, potentialYield: 4.5, amount: household.idleCash }
      });
    }
    
    // NIGO Alerts
    householdDocs.filter(d => d.status === 'NIGO').forEach(doc => {
      alerts.push({
        id: `ALERT-NIGO-${doc.id}`,
        householdId,
        type: 'NIGO',
        severity: 'ERROR',
        title: `NIGO: ${doc.name}`,
        description: doc.nigoIssues?.[0]?.description || 'Document requires attention',
        suggestedAction: 'Send client correction request'
      });
    });
    
    // Missing Field Compliance
    const householdTasks = tasks.filter(t => t.householdId === householdId);
    if (householdTasks.some(t => t.title.includes('beneficiary') && t.status !== 'COMPLETED')) {
      alerts.push({
        id: `ALERT-COMPLIANCE-${householdId}`,
        householdId,
        type: 'MISSING_FIELD',
        severity: 'ERROR',
        title: 'Missing: Beneficiary DOB',
        description: 'Required for IRA rollover processing',
        suggestedAction: 'Request beneficiary information from client'
      });
    }
    
    // Life Event Alerts
    householdLifeEvents.forEach(event => {
      alerts.push({
        id: `ALERT-LIFE-${event.id}`,
        householdId,
        type: 'LIFE_EVENT',
        severity: 'INFO',
        title: event.event,
        description: `Detected from ${event.source} (${event.date})`,
        data: { source: event.source, sourceDetail: event.sourceDetail }
      });
    });
    
    return alerts;
  },

  // Generate Executive Brief
  getExecutiveBrief: async (householdId: string): Promise<string> => {
    await delay(100);
    const household = households.find(h => h.id === householdId);
    const householdTasks = tasks.filter(t => t.householdId === householdId);
    const householdDocs = documents.filter(d => d.householdId === householdId);
    const householdEvents = lifeEvents.filter(e => e.householdId === householdId);
    
    if (!household) return 'Household not found';
    
    const pendingTasks = householdTasks.filter(t => t.status !== 'COMPLETED').length;
    const nigoCount = householdDocs.filter(d => d.status === 'NIGO').length;
    
    return `**${household.name}** is a $${(household.totalAssets / 1000000).toFixed(1)}M household advised by ${household.advisor}. ` +
      `The transition is currently ${household.transferCompleteness}% complete with ${household.etaDays} days to estimated completion. ` +
      `There are ${pendingTasks} pending tasks and ${nigoCount} documents requiring attention. ` +
      (householdEvents.length > 0 
        ? `Recent life events include: ${householdEvents.map(e => e.event).join(', ')}.`
        : '');
  },

  // Generate Meeting Slides
  generateMeetingSlides: async (householdId: string): Promise<{ title: string; content: string; type: 'title' | 'chart' | 'timeline' | 'actions' }[]> => {
    await delay(2000); // Simulate AI generation
    const household = households.find(h => h.id === householdId);
    const householdAccounts = accounts.filter(a => a.householdId === householdId);
    const householdTasks = tasks.filter(t => t.householdId === householdId && t.status !== 'COMPLETED');
    
    if (!household) return [];
    
    return [
      {
        title: 'Client Meeting',
        content: `${household.name}\nAdvisor: ${household.advisor}\nDate: ${new Date().toLocaleDateString()}`,
        type: 'title'
      },
      {
        title: 'Asset Allocation',
        content: JSON.stringify({
          labels: householdAccounts.map(a => a.type),
          values: householdAccounts.map(a => a.balance)
        }),
        type: 'chart'
      },
      {
        title: 'Transfer Timeline',
        content: `Progress: ${household.transferCompleteness}%\nAssets Landed: $${(household.assetsLanded / 1000000).toFixed(2)}M\nAssets In Transit: $${(household.assetsInTransit / 1000000).toFixed(2)}M\nETA: ${household.eta}`,
        type: 'timeline'
      },
      {
        title: 'Next Steps',
        content: householdTasks.map(t => `• ${t.title} (Due: ${t.dueDate})`).join('\n') || '• No pending actions',
        type: 'actions'
      }
    ];
  },

  // Draft Email
  draftEmail: async (householdId: string, type: 'nigo' | 'cashDrag' | 'status' | 'general'): Promise<{ subject: string; body: string }> => {
    await delay(500);
    const household = households.find(h => h.id === householdId);
    if (!household) return { subject: '', body: '' };
    
    const templates: Record<string, { subject: string; body: string }> = {
      nigo: {
        subject: `Action Required: Document Correction Needed - ${household.name}`,
        body: `Dear ${household.primaryClient},\n\nWe noticed that a document in your transition file requires a small correction. Specifically, we need:\n\n• Signature on page 3 of the ACAT Transfer Form\n\nThis is a quick fix that will help us continue processing your account transfer without delay.\n\nPlease reply to this email or give us a call at your earliest convenience to arrange the correction.\n\nBest regards,\n${household.advisor}`
      },
      cashDrag: {
        subject: `Investment Opportunity - ${household.name}`,
        body: `Dear ${household.primaryClient},\n\nI noticed we have approximately $${(household.idleCash / 1000).toFixed(0)}k in cash sitting idle in your account, currently earning minimal interest (0.01%).\n\nI'd like to discuss moving this to a Money Market fund that could earn approximately 4.5% - a significant improvement that aligns with your investment goals.\n\nWould you be available for a brief call this week to discuss?\n\nBest regards,\n${household.advisor}`
      },
      status: {
        subject: `Transition Update - ${household.name}`,
        body: `Dear ${household.primaryClient},\n\nI wanted to provide you with a quick update on your account transition:\n\n• Overall Progress: ${household.transferCompleteness}%\n• Assets Successfully Transferred: $${(household.assetsLanded / 1000000).toFixed(2)}M\n• Remaining In Transit: $${(household.assetsInTransit / 1000000).toFixed(2)}M\n• Estimated Completion: ${household.eta}\n\nEverything is progressing smoothly. Please don't hesitate to reach out if you have any questions.\n\nBest regards,\n${household.advisor}`
      },
      general: {
        subject: `Checking In - ${household.name}`,
        body: `Dear ${household.primaryClient},\n\nI hope this message finds you well. I wanted to check in and see if there's anything you need assistance with regarding your accounts.\n\nPlease feel free to reach out anytime.\n\nBest regards,\n${household.advisor}`
      }
    };
    
    return templates[type] || templates.general;
  }
};

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export data for use in system prompt
export const getDataContextForAI = (): string => {
  const householdSummaries = households.map(h => 
    `- ${h.name} (ID: ${h.id}): ${h.status}, Risk: ${h.riskScore}/100, Assets: $${(h.totalAssets/1000000).toFixed(1)}M, ETA: ${h.eta}, Transfer: ${h.transferCompleteness}%${h.hasNIGO ? ', HAS NIGO ISSUES' : ''}`
  ).join('\n');
  
  return `
## Current Household Data (as of ${new Date().toLocaleString()})
${householdSummaries}

## Key Alerts
- Miller Estate: SLA BREACHED - missing beneficiary DOBs
- Johnson Family: NIGO - missing signature on ACAT form
- Garcia Portfolio: NIGO - form dated incorrectly
- Miller Estate: HIGH CASH DRAG - $357k idle (8.5%)
`.trim();
};
