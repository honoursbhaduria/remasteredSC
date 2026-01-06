import React, { useState } from 'react';
import { useStore } from '../../store';
import { Clock, Terminal, Upload, Network, FileText, Shield, User } from 'lucide-react';
import { format } from 'date-fns';

const TimelineView: React.FC = () => {
  const { filteredArtifacts, attackStory } = useStore();
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  if (!filteredArtifacts || filteredArtifacts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-12 text-center">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Timeline Data</h3>
        <p className="text-gray-600">Analyze evidence to generate a visual timeline</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('login') || type.includes('auth')) return User;
    if (type.includes('powershell') || type.includes('process') || type.includes('command')) return Terminal;
    if (type.includes('file') || type.includes('encryption')) return FileText;
    if (type.includes('network') || type.includes('connection')) return Network;
    if (type.includes('upload') || type.includes('transfer')) return Upload;
    return Shield;
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'initial-access': return 'bg-blue-500';
      case 'privilege-escalation': return 'bg-purple-500';
      case 'lateral-movement': return 'bg-orange-500';
      case 'data-exfiltration': return 'bg-red-500';
      case 'persistence': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Group events by attack phase
  const groupedEvents = filteredArtifacts.map(artifact => {
    const storyStep = attackStory?.steps.find(step =>
      step.evidenceIds.includes(artifact.id)
    );
    return {
      ...artifact,
      phase: storyStep?.phase,
    };
  });

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Attack Timeline</h2>
            <p className="text-gray-600">Visual representation of events grouped by attack phase</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Initial Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Persistence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Privilege Escalation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Lateral Movement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Data Exfiltration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 overflow-x-auto">
        <div className="relative" style={{ minWidth: '800px' }}>
          {/* Timeline Line */}
          <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />

          {/* Timeline Events */}
          <div className="relative flex justify-between items-start pt-4 pb-4">
            {groupedEvents.map((event, index) => {
              const Icon = getEventIcon(event.eventType);
              const isHovered = hoveredEvent === event.id;

              return (
                <div
                  key={event.id}
                  className="relative flex flex-col items-center"
                  style={{ width: `${100 / groupedEvents.length}%` }}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  {/* Event Marker */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform cursor-pointer ${
                    isHovered ? 'scale-125' : ''
                  } ${getPhaseColor(event.phase)}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Event Label */}
                  <div className="mt-4 text-center">
                    <div className="text-xs font-mono text-gray-600 mb-1">
                      {format(event.timestamp, 'HH:mm:ss')}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 max-w-[100px] truncate">
                      {event.eventType}
                    </div>
                    <div className="text-xs text-gray-500 max-w-[100px] truncate">
                      {event.user}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 mt-4 bg-gray-900 text-white rounded-lg shadow-xl p-4 z-20 w-64">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45" />
                      <div className="relative space-y-2">
                        <div className="font-bold text-sm">{event.eventType}</div>
                        <div className="text-xs opacity-80">{format(event.timestamp, 'MMM d, yyyy HH:mm:ss')}</div>
                        <div className="text-xs opacity-80">User: {event.user}</div>
                        <div className="text-xs opacity-80">Host: {event.host}</div>
                        <div className="pt-2 border-t border-gray-700">
                          <div className="text-xs opacity-80 mb-1">AI Analysis:</div>
                          <div className="text-xs">{event.llmInference}</div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                          <span className="text-xs">Confidence:</span>
                          <span className="text-xs font-bold">{(event.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event List (Detailed View) */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Event List</h3>
        <div className="space-y-3">
          {groupedEvents.map((event, index) => {
            const Icon = getEventIcon(event.eventType);
            return (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {/* Event Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                  {index + 1}
                </div>

                {/* Event Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white ${getPhaseColor(event.phase)}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{event.eventType}</div>
                      <div className="text-sm text-gray-600 font-mono">
                        {format(event.timestamp, 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        event.confidenceScore >= 0.9 ? 'bg-red-100 text-red-800' :
                        event.confidenceScore >= 0.8 ? 'bg-orange-100 text-orange-800' :
                        event.confidenceScore >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {(event.confidenceScore * 100).toFixed(0)}% confidence
                      </span>
                      {event.phase && (
                        <span className="px-3 py-1 rounded text-xs font-bold bg-gray-200 text-gray-700 capitalize">
                          {event.phase.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{event.llmInference}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>User: <span className="font-semibold">{event.user}</span></span>
                    <span>•</span>
                    <span>Host: <span className="font-semibold">{event.host}</span></span>
                    <span>•</span>
                    <span>Source: <span className="font-semibold capitalize">{event.source}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
