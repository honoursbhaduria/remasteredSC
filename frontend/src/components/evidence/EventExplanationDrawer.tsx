import React from 'react';
import { useStore } from '../../store';
import { RawEvidence, FilteredArtifact } from '../../types';
import { X, AlertTriangle, Shield, XCircle, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface EventExplanationDrawerProps {
  event: RawEvidence | FilteredArtifact;
  isFiltered: boolean;
  onClose: () => void;
}

const EventExplanationDrawer: React.FC<EventExplanationDrawerProps> = ({ event, isFiltered, onClose }) => {
  const { markAsFalsePositive, excludeFromStory } = useStore();

  const handleFalsePositive = () => {
    markAsFalsePositive(event.id);
    alert('Event marked as false positive');
  };

  const handleExcludeFromStory = () => {
    excludeFromStory(event.id);
    alert('Event excluded from story');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Basic Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Event ID</div>
                  <div className="font-mono text-sm font-medium">{event.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Timestamp</div>
                  <div className="font-mono text-sm font-medium">{format(event.timestamp, 'MMM d, yyyy HH:mm:ss')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">User</div>
                  <div className="font-medium">{event.user}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Host</div>
                  <div className="font-medium">{event.host}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Event Type</div>
                  <div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                      {event.eventType}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Source</div>
                  <div>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-medium capitalize">
                      {event.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Message */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Raw Message</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              {event.rawMessage}
            </div>
          </div>

          {/* AI Analysis (Only for filtered) */}
          {isFiltered && 'confidenceScore' in event && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">AI Analysis</h3>
                <div className="space-y-3">
                  {/* Confidence Score */}
                  <div className="bg-gradient-to-r from-yellow-50 to-red-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Confidence Score</span>
                      <span className="text-2xl font-bold text-red-600">
                        {(event.confidenceScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-red-600 h-2 rounded-full"
                        style={{ width: `${event.confidenceScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <span className="text-sm font-semibold text-gray-700">Risk Level</span>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        event.riskLevel === 'critical' ? 'text-red-600' :
                        event.riskLevel === 'high' ? 'text-orange-600' :
                        'text-green-600'
                      }`} />
                      <span className={`px-3 py-1 rounded font-bold text-sm uppercase ${
                        event.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                        event.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* LLM Inference */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-blue-900 mb-2">Why this is suspicious:</div>
                        <p className="text-sm text-blue-800">{event.llmInference}</p>
                      </div>
                    </div>
                  </div>

                  {/* MITRE ATT&CK */}
                  {event.mitreAttack && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-purple-900 mb-2">MITRE ATT&CK Tactic</div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">
                          {event.mitreAttack}
                        </code>
                        <a
                          href={`https://attack.mitre.org/techniques/${event.mitreAttack.split(' - ')[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-sm underline"
                        >
                          View on MITRE
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Explanation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">How Confidence is Calculated</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                  <p>The confidence score is calculated using:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Pattern matching against known attack signatures</li>
                    <li>Behavioral analysis of user and system actions</li>
                    <li>Contextual analysis of related events</li>
                    <li>Machine learning model predictions</li>
                    <li>Historical threat intelligence correlation</li>
                  </ul>
                  <p className="pt-2 border-t border-gray-300 text-xs text-gray-600">
                    <strong>Note:</strong> The AI provides recommendations but cannot make final decisions. 
                    Human investigators must review and validate all findings.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Investigator Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleFalsePositive}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 rounded-lg font-semibold transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Mark as False Positive</span>
                  </button>
                  
                  <button
                    onClick={handleExcludeFromStory}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg font-semibold transition-colors"
                  >
                    <EyeOff className="w-5 h-5" />
                    <span>Exclude from Story</span>
                  </button>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Auditability:</strong> All actions are logged in the decision log with timestamp and justification.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventExplanationDrawer;
