import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { RawEvidence, FilteredArtifact } from '../../types';
import { Search, ChevronDown, ChevronUp, Sliders, Eye, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import EventExplanationDrawer from './EventExplanationDrawer';

interface EvidenceTableProps {
  type: 'raw' | 'filtered';
}

const EvidenceTable: React.FC<EvidenceTableProps> = ({ type }) => {
  const { rawEvidence, filteredArtifacts, confidenceThreshold, setConfidenceThreshold } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedEvent, setSelectedEvent] = useState<RawEvidence | FilteredArtifact | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const data = type === 'raw' ? rawEvidence : filteredArtifacts;

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.user.toLowerCase().includes(searchLower) ||
        item.host.toLowerCase().includes(searchLower) ||
        item.eventType.toLowerCase().includes(searchLower) ||
        item.rawMessage.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof RawEvidence];
      const bVal = b[sortField as keyof RawEvidence];

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return filtered;
  }, [data, searchQuery, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (item: RawEvidence | FilteredArtifact) => {
    setSelectedEvent(item);
    setShowDrawer(true);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-red-100 text-red-800';
    if (score >= 0.8) return 'bg-orange-100 text-orange-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evidence..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            {type === 'filtered' && (
              <div className="flex items-center space-x-3">
                <Sliders className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Confidence Threshold:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm font-bold text-blue-600 min-w-[3rem]">
                  {confidenceThreshold.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Showing <span className="font-bold">{processedData.length}</span> of <span className="font-bold">{data.length}</span> events
          </div>
        </div>

        {type === 'filtered' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Human-in-the-Loop AI:</strong> Adjust the confidence threshold to filter evidence. 
              Higher values show only high-confidence artifacts. Lower values include more potential matches.
            </p>
          </div>
        )}
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Timestamp</span>
                    {sortField === 'timestamp' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('user')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    {sortField === 'user' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Host</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                {type === 'filtered' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Risk</th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={type === 'filtered' ? 10 : 8} className="px-4 py-12 text-center text-gray-500">
                    <XCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No evidence found matching your criteria</p>
                    {type === 'filtered' && (
                      <p className="text-sm mt-2">Try lowering the confidence threshold</p>
                    )}
                  </td>
                </tr>
              ) : (
                processedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {format(item.timestamp, 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.user}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.host}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                        {item.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium capitalize">
                        {item.source}
                      </span>
                    </td>
                    {type === 'filtered' && (
                      <>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded font-bold ${getConfidenceColor((item as FilteredArtifact).confidenceScore)}`}>
                            {((item as FilteredArtifact).confidenceScore * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {getRiskIcon((item as FilteredArtifact).riskLevel)}
                            <span className="text-xs font-medium capitalize">{(item as FilteredArtifact).riskLevel}</span>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-md truncate">
                      {item.rawMessage}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Explanation Drawer */}
      {showDrawer && selectedEvent && (
        <EventExplanationDrawer
          event={selectedEvent}
          isFiltered={type === 'filtered'}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  );
};

export default EvidenceTable;
