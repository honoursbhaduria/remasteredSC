import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Case, FilteredArtifact, RawEvidence, SystemStats, InvestigatorNote, DecisionLogEntry, AttackStory, EvidenceFile, ChainOfCustodyEntry } from '../types';
import apiService from '../services/api';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;

  // Cases
  cases: Case[];
  currentCase: Case | null;
  loadCases: () => Promise<void>;
  setCurrentCase: (caseItem: Case | null) => void;
  createCase: (caseData: Partial<Case>) => Promise<void>;
  updateCase: (id: string, caseData: Partial<Case>) => Promise<void>;

  // Evidence
  rawEvidence: RawEvidence[];
  filteredArtifacts: FilteredArtifact[];
  confidenceThreshold: number;
  loadEvidence: (caseId: string) => Promise<void>;
  setConfidenceThreshold: (threshold: number) => void;
  evidenceFiles: EvidenceFile[];
  chainOfCustody: ChainOfCustodyEntry[];
  loadChainOfCustody: (evidenceId?: string) => Promise<void>;

  // Story
  attackStory: AttackStory | null;
  loadAttackStory: (caseId: string) => Promise<void>;
  generateStory: (caseId: string) => Promise<void>;

  // System Stats
  systemStats: SystemStats;
  loadSystemStats: () => Promise<void>;

  // Notes & Decisions
  notes: InvestigatorNote[];
  decisionLog: DecisionLogEntry[];
  loadNotes: (caseId?: string) => Promise<void>;
  loadDecisions: (caseId?: string) => Promise<void>;
  addNote: (note: Omit<InvestigatorNote, 'id' | 'timestamp'>) => Promise<void>;
  addDecision: (decision: Omit<DecisionLogEntry, 'id' | 'timestamp'>) => Promise<void>;

  // Toggles
  markAsFalsePositive: (artifactId: string) => Promise<void>;
  excludeFromStory: (artifactId: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('user');
          set({ user: null, isAuthenticated: false, currentCase: null, cases: [] });
        }
      },

      // Cases state
      cases: [],
      currentCase: null,
      loadCases: async () => {
        try {
          const cases = await apiService.getCases();
          set({ cases: cases.map((c: any) => ({
            ...c,
            lastUpdated: new Date(c.lastUpdated),
            createdAt: new Date(c.createdAt),
          })) });
        } catch (error) {
          console.error('Error loading cases:', error);
        }
      },
      setCurrentCase: (caseItem: Case | null) => set({ currentCase: caseItem }),
      createCase: async (caseData: Partial<Case>) => {
        try {
          const newCase = await apiService.createCase(caseData);
          set({ cases: [...get().cases, {
            ...newCase,
            lastUpdated: new Date(newCase.lastUpdated),
            createdAt: new Date(newCase.createdAt),
          }] });
        } catch (error) {
          console.error('Error creating case:', error);
          throw error;
        }
      },
      updateCase: async (id: string, caseData: Partial<Case>) => {
        try {
          const updatedCase = await apiService.updateCase(id, caseData);
          set({
            cases: get().cases.map(c => c.id === id ? {
              ...updatedCase,
              lastUpdated: new Date(updatedCase.lastUpdated),
              createdAt: new Date(updatedCase.createdAt),
            } : c),
            currentCase: get().currentCase?.id === id ? {
              ...updatedCase,
              lastUpdated: new Date(updatedCase.lastUpdated),
              createdAt: new Date(updatedCase.createdAt),
            } : get().currentCase,
          });
        } catch (error) {
          console.error('Error updating case:', error);
          throw error;
        }
      },

      // Evidence state
      rawEvidence: [],
      filteredArtifacts: [],
      confidenceThreshold: 0.7,
      loadEvidence: async (caseId: string) => {
        try {
          const [rawData, filteredData] = await Promise.all([
            apiService.getRawEvidence(caseId),
            apiService.getFilteredArtifacts(caseId, get().confidenceThreshold),
          ]);
          set({
            rawEvidence: rawData.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })),
            filteredArtifacts: filteredData.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })),
          });
        } catch (error) {
          console.error('Error loading evidence:', error);
        }
      },
      setConfidenceThreshold: async (threshold: number) => {
        set({ confidenceThreshold: threshold });
        const caseId = get().currentCase?.id;
        if (caseId) {
          try {
            const filteredData = await apiService.getFilteredArtifacts(caseId, threshold);
            set({
              filteredArtifacts: filteredData.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })),
            });
          } catch (error) {
            console.error('Error updating threshold:', error);
          }
        }
      },
      evidenceFiles: [],
      chainOfCustody: [],
      loadChainOfCustody: async (evidenceId?: string) => {
        try {
          const data = await apiService.getChainOfCustody(evidenceId);
          set({ chainOfCustody: data.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })) });
        } catch (error) {
          console.error('Error loading chain of custody:', error);
        }
      },

      // Story state
      attackStory: null,
      loadAttackStory: async (caseId: string) => {
        try {
          const story = await apiService.getAttackStory(caseId);
          set({
            attackStory: {
              ...story,
              generatedAt: new Date(story.generatedAt),
              steps: story.steps.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) })),
            },
          });
        } catch (error) {
          console.error('Error loading attack story:', error);
        }
      },
      generateStory: async (caseId: string) => {
        try {
          const events = get().filteredArtifacts.filter(a => !a.excludedFromStory);
          const story = await apiService.generateStory(events, caseId);
          set({
            attackStory: {
              ...story,
              generatedAt: new Date(story.generatedAt),
              steps: story.steps.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) })),
            },
          });
        } catch (error) {
          console.error('Error generating story:', error);
          throw error;
        }
      },

      // System stats
      systemStats: {
        totalLogsIngested: 0,
        logsFilteredOut: 0,
        highConfidenceArtifacts: 0,
        currentConfidenceThreshold: 0.7,
        investigationProgress: 0,
      },
      loadSystemStats: async () => {
        try {
          const stats = await apiService.getSystemStats();
          set({ systemStats: stats });
        } catch (error) {
          console.error('Error loading system stats:', error);
        }
      },

      // Notes & Decisions
      notes: [],
      decisionLog: [],
      loadNotes: async (caseId?: string) => {
        try {
          const notes = await apiService.getNotes(caseId);
          set({ notes: notes.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })) });
        } catch (error) {
          console.error('Error loading notes:', error);
        }
      },
      loadDecisions: async (caseId?: string) => {
        try {
          const decisions = await apiService.getDecisions(caseId);
          set({ decisionLog: decisions.map((d: any) => ({ ...d, timestamp: new Date(d.timestamp) })) });
        } catch (error) {
          console.error('Error loading decisions:', error);
        }
      },
      addNote: async (note: Omit<InvestigatorNote, 'id' | 'timestamp'>) => {
        try {
          const newNote = await apiService.addNote(note);
          set({ notes: [...get().notes, { ...newNote, timestamp: new Date(newNote.timestamp) }] });
        } catch (error) {
          console.error('Error adding note:', error);
          throw error;
        }
      },
      addDecision: async (decision: Omit<DecisionLogEntry, 'id' | 'timestamp'>) => {
        try {
          const newDecision = await apiService.addDecision(decision);
          set({ decisionLog: [...get().decisionLog, { ...newDecision, timestamp: new Date(newDecision.timestamp) }] });
        } catch (error) {
          console.error('Error adding decision:', error);
          throw error;
        }
      },

      // Toggles
      markAsFalsePositive: async (artifactId: string) => {
        try {
          await apiService.markAsFalsePositive(artifactId);
          set({
            filteredArtifacts: get().filteredArtifacts.map(artifact =>
              artifact.id === artifactId
                ? { ...artifact, isFalsePositive: !artifact.isFalsePositive }
                : artifact
            ),
          });
        } catch (error) {
          console.error('Error marking false positive:', error);
          throw error;
        }
      },
      excludeFromStory: async (artifactId: string) => {
        try {
          await apiService.excludeFromStory(artifactId);
          set({
            filteredArtifacts: get().filteredArtifacts.map(artifact =>
              artifact.id === artifactId
                ? { ...artifact, excludedFromStory: !artifact.excludedFromStory }
                : artifact
            ),
          });
        } catch (error) {
          console.error('Error excluding from story:', error);
          throw error;
        }
      },
    }),
    {
      name: 'forensics-app-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
