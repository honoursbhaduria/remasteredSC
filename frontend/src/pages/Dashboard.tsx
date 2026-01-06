import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Case } from '../types';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Clock,
  LogOut,
  User,
  Database,
  Filter,
  CheckCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user, logout, setCurrentCase, cases, loadCases, systemStats, loadSystemStats } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadCases(), loadSystemStats()]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loadCases, loadSystemStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadCases(), loadSystemStats()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleCaseClick = (caseItem: Case) => {
    setCurrentCase(caseItem);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Forensic Investigation Platform</h1>
              <p className="text-xs text-gray-600">AI-Assisted Log Investigation</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <div className="text-xs text-gray-500 capitalize">{user?.role.replace('-', ' ')}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* System Health Stats Bar */}
      <div className="bg-blue-900 text-white px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 opacity-80" />
            <div>
              <div className="text-2xl font-bold">{systemStats.totalLogsIngested.toLocaleString()}</div>
              <div className="text-xs opacity-80">Total Logs Ingested</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-8 h-8 opacity-80" />
            <div>
              <div className="text-2xl font-bold">{systemStats.logsFilteredOut.toLocaleString()}</div>
              <div className="text-xs opacity-80">Logs Filtered Out</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div>
              <div className="text-2xl font-bold">{systemStats.highConfidenceArtifacts}</div>
              <div className="text-xs opacity-80">High-Confidence Artifacts</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <div>
              <div className="text-2xl font-bold">{(systemStats.currentConfidenceThreshold * 100).toFixed(0)}%</div>
              <div className="text-xs opacity-80">Confidence Threshold</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div>
              <div className="text-2xl font-bold">{systemStats.investigationProgress}%</div>
              <div className="text-xs opacity-80">Investigation Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Active Investigations</h2>
            <p className="text-gray-600 mt-1">Select a case to begin investigation</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Case</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Found</h3>
            <p className="text-gray-600">Create a new case to start investigating</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((caseItem: Case) => (
            <div
              key={caseItem.id}
              onClick={() => handleCaseClick(caseItem)}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg p-6"
            >
              {/* Case Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-mono text-gray-600">{caseItem.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{caseItem.title}</h3>
                </div>
                <div className={`px-3 py-1 rounded border-2 text-sm font-bold ${getSeverityColor(caseItem.severity)}`}>
                  {caseItem.severity.toUpperCase()}
                </div>
              </div>

              {/* Case Details */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{caseItem.description}</p>

              {/* Case Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Incident Type</div>
                  <div className="font-semibold text-gray-900">{getIncidentTypeLabel(caseItem.incidentType)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Evidence Count</div>
                  <div className="font-semibold text-gray-900">{caseItem.evidenceCount.toLocaleString()} items</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Assigned To</div>
                  <div className="font-semibold text-gray-900 capitalize">{caseItem.assignedTo.replace('-', ' ')}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Last Updated</span>
                  </div>
                  <div className="font-semibold text-gray-900">{format(caseItem.lastUpdated, 'MMM d, HH:mm')}</div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
