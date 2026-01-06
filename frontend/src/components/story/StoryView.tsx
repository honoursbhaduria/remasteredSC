import React from 'react';
import { useStore } from '../../store';
import { BookOpen, TrendingUp, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const StoryView: React.FC = () => {
  const { attackStory } = useStore();

  if (!attackStory) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Story Generated Yet</h3>
        <p className="text-gray-600 mb-6">Upload and analyze evidence to generate an attack narrative</p>
      </div>
    );
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'initial-access': return '🚪';
      case 'privilege-escalation': return '⬆️';
      case 'lateral-movement': return '↔️';
      case 'data-exfiltration': return '📤';
      case 'persistence': return '🔒';
      default: return '📍';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'initial-access': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'privilege-escalation': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'lateral-movement': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'data-exfiltration': return 'bg-red-100 text-red-800 border-red-300';
      case 'persistence': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-red-600';
    if (confidence >= 0.8) return 'text-orange-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Story Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Attack Narrative</h2>
            </div>
            <p className="text-blue-100 text-lg">
              AI-generated storyline based on analyzed evidence
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Overall Confidence</div>
            <div className="text-4xl font-bold">{(attackStory.overallConfidence * 100).toFixed(0)}%</div>
            <div className="mt-2 flex items-center justify-end space-x-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs text-blue-100">
                {attackStory.steps.length} attack phases identified
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mt-6">
          <div className="w-full bg-blue-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${attackStory.overallConfidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Story Steps Timeline */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <div className="space-y-6">
          {attackStory.steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index !== attackStory.steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500" />
              )}

              <div className="flex space-x-6">
                {/* Phase Badge */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {getPhaseIcon(step.phase)}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 transition-all">
                    {/* Step Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full border-2 text-xs font-bold mb-2 ${getPhaseColor(step.phase)}`}>
                          {step.phase.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="font-mono">{format(step.timestamp, 'MMM d, yyyy HH:mm:ss')}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className={`font-bold ${getConfidenceColor(step.confidence)}`}>
                              {(step.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1">
                        <span>View Evidence</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-900 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Evidence References */}
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">
                        Supported by <span className="font-bold text-gray-900">{step.evidenceIds.length}</span> evidence artifact{step.evidenceIds.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Footer - Metadata */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Story Generated</div>
            <div className="font-semibold text-gray-900">
              {format(attackStory.generatedAt, 'MMM d, yyyy HH:mm:ss')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Attack Phases</div>
            <div className="font-semibold text-gray-900">{attackStory.steps.length} phases</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Evidence Used</div>
            <div className="font-semibold text-gray-900">
              {attackStory.steps.reduce((acc, step) => acc + step.evidenceIds.length, 0)} artifacts
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">How This Story is Generated</h3>
            <p className="text-blue-800 text-sm mb-3">
              This attack narrative is automatically generated by analyzing evidence artifacts and their relationships. 
              The AI identifies patterns, sequences, and correlations to construct a coherent timeline of the incident.
            </p>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>Events are grouped by attack phase based on MITRE ATT&CK framework</li>
              <li>Confidence scores reflect the strength of evidence for each phase</li>
              <li>Timeline is constructed from event timestamps and causal relationships</li>
              <li>Human investigators can click on any step to review supporting evidence</li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-900">
              <strong>⚠️ Important:</strong> This is an AI-assisted narrative. All findings must be validated by human investigators before use in legal proceedings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;
