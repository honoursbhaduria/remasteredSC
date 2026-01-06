// User Types
export type UserRole = 'investigator' | 'incident-responder' | 'legal-auditor' | 'executive';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Case Types
export type CaseStatus = 'open' | 'in-progress' | 'closed';
export type IncidentType = 'ransomware' | 'insider-threat' | 'usb-breach' | 'data-exfiltration' | 'phishing';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Case {
  id: string;
  title: string;
  incidentType: IncidentType;
  severity: Severity;
  status: CaseStatus;
  evidenceCount: number;
  lastUpdated: Date;
  createdAt: Date;
  assignedTo: string;
  description: string;
}

// Evidence Types
export type EvidenceSource = 'endpoint' | 'network' | 'usb' | 'email' | 'cloud';
export type RiskLevel = 'low' | 'high' | 'critical';

export interface RawEvidence {
  id: string;
  caseId: string;
  timestamp: Date;
  user: string;
  host: string;
  eventType: string;
  source: EvidenceSource;
  rawMessage: string;
}

export interface FilteredArtifact extends RawEvidence {
  confidenceScore: number;
  riskLevel: RiskLevel;
  llmInference: string;
  mitreAttack?: string;
  isFalsePositive: boolean;
  excludedFromStory: boolean;
}

// Evidence File Types
export interface EvidenceFile {
  id: string;
  caseId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  hash: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'parsed' | 'queued' | 'error';
}

// Chain of Custody
export interface ChainOfCustodyEntry {
  id: string;
  evidenceId: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  hash: string;
  notes?: string;
}

// Story Types
export type AttackPhase = 'initial-access' | 'privilege-escalation' | 'lateral-movement' | 'data-exfiltration' | 'persistence';

export interface StoryStep {
  id: string;
  phase: AttackPhase;
  timestamp: Date;
  description: string;
  evidenceIds: string[];
  confidence: number;
}

export interface AttackStory {
  id: string;
  caseId: string;
  overallConfidence: number;
  steps: StoryStep[];
  generatedAt: Date;
}

// System Stats
export interface SystemStats {
  totalLogsIngested: number;
  logsFilteredOut: number;
  highConfidenceArtifacts: number;
  currentConfidenceThreshold: number;
  investigationProgress: number;
}

// Notes & Collaboration
export interface InvestigatorNote {
  id: string;
  caseId: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface DecisionLogEntry {
  id: string;
  caseId: string;
  decision: string;
  reason: string;
  performedBy: string;
  timestamp: Date;
}

// Report Types
export interface Report {
  id: string;
  caseId: string;
  executiveSummary: string;
  technicalFindings: string[];
  evidenceList: FilteredArtifact[];
  chainOfCustody: ChainOfCustodyEntry[];
  generatedAt: Date;
}
