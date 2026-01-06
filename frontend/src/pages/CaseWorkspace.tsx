import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Lock,
  Table,
  BookOpen,
  Clock as ClockIcon,
  Settings as SettingsIcon,
  FileCheck
} from 'lucide-react';
import EvidenceIngestion from '../components/case-workspace/EvidenceIngestion';
import EvidenceTable from '../components/evidence/EvidenceTable';
import StoryView from '../components/story/StoryView';
import TimelineView from '../components/timeline/TimelineView';
import Reporting from '../components/reporting/Reporting';
import Settings from '../components/settings/Settings';

type TabType = 'evidence-ingestion' | 'raw-evidence' | 'filtered-artifacts' | 'story' | 'timeline' | 'reporting' | 'settings';

const CaseWorkspace: React.FC = () => {
  const { currentCase, setCurrentCase, loadEvidence, loadAttackStory } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('evidence-ingestion');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load data for the current case
    if (currentCase) {
      setLoading(true);
      Promise.all([
        loadEvidence(currentCase.id),
        loadAttackStory(currentCase.id),
      ]).finally(() => setLoading(false));
    }
  }, [currentCase, loadEvidence, loadAttackStory]);

  if (!currentCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Case Selected</h2>
          <p className="text-gray-600 mb-4">Please select a case from the dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'evidence-ingestion' as TabType, label: 'Evidence Ingestion', icon: Upload },
    { id: 'raw-evidence' as TabType, label: 'Raw Evidence', icon: Table },
    { id: 'filtered-artifacts' as TabType, label: 'Filtered Artifacts', icon: FileCheck },
    { id: 'story' as TabType, label: 'Attack Story', icon: BookOpen },
    { id: 'timeline' as TabType, label: 'Timeline', icon: ClockIcon },
    { id: 'reporting' as TabType, label: 'Reporting', icon: FileText },
    { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'evidence-ingestion':
        return <EvidenceIngestion />;
      case 'raw-evidence':
        return <EvidenceTable type="raw" />;
      case 'filtered-artifacts':
        return <EvidenceTable type="filtered" />;
      case 'story':
        return <StoryView />;
      case 'timeline':
        return <TimelineView />;
      case 'reporting':
        return <Reporting />;
      case 'settings':
        return <Settings />;
      default:
        return <EvidenceIngestion />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentCase(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Chain of Custody Active</span>
            </div>
          </div>

          {/* Case Info */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-mono text-gray-600">{currentCase.id}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentCase.status === 'open' ? 'bg-blue-100 text-blue-800' :
                  currentCase.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentCase.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded border-2 text-xs font-bold ${
                  currentCase.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                  currentCase.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                  currentCase.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-green-100 text-green-800 border-green-300'
                }`}>
                  {currentCase.severity.toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentCase.title}</h1>
              <p className="text-gray-600">{currentCase.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default CaseWorkspace;
