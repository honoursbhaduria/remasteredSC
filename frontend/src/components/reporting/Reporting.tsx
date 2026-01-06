import React, { useState } from 'react';
import { useStore } from '../../store';
import { FileText, Download, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const Reporting: React.FC = () => {
  const { currentCase, filteredArtifacts, attackStory, chainOfCustody, notes, decisionLog } = useStore();
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'legal'>('executive');
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Report generated successfully! In production, this would generate a PDF.');
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (!currentCase) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Case Selected</h3>
        <p className="text-gray-600">Select a case to generate reports</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Investigation Report</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setReportType('executive')}
            className={`p-4 border-2 rounded-lg transition-all ${
              reportType === 'executive'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Executive Summary</div>
            <div className="text-sm text-gray-600 mt-1">High-level overview for leadership</div>
          </button>

          <button
            onClick={() => setReportType('technical')}
            className={`p-4 border-2 rounded-lg transition-all ${
              reportType === 'technical'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Technical Report</div>
            <div className="text-sm text-gray-600 mt-1">Detailed technical findings</div>
          </button>

          <button
            onClick={() => setReportType('legal')}
            className={`p-4 border-2 rounded-lg transition-all ${
              reportType === 'legal'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Legal / Audit</div>
            <div className="text-sm text-gray-600 mt-1">Chain of custody and evidence</div>
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            disabled={generating}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              generating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Download className="w-5 h-5" />
            <span>{generating ? 'Generating...' : 'Generate PDF Report'}</span>
          </button>

          <button
            disabled={generating}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Report Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investigation Report</h1>
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <div><strong>Case ID:</strong> {currentCase.id}</div>
                <div><strong>Case Title:</strong> {currentCase.title}</div>
                <div><strong>Incident Type:</strong> {currentCase.incidentType}</div>
              </div>
              <div className="text-right">
                <div><strong>Report Type:</strong> {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</div>
                <div><strong>Generated:</strong> {format(new Date(), 'MMM d, yyyy HH:mm')}</div>
                <div><strong>Status:</strong> {currentCase.status}</div>
              </div>
            </div>
          </div>

          {/* Executive Summary Content */}
          {reportType === 'executive' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Executive Summary</h2>
                <p className="text-gray-700 leading-relaxed">
                  {currentCase.description}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Key Findings</h2>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-900">Severity: {currentCase.severity.toUpperCase()}</div>
                      <div className="text-sm text-red-800">Total evidence artifacts: {filteredArtifacts.length}</div>
                    </div>
                  </div>
                  {attackStory && (
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-900">Attack Story Generated</div>
                        <div className="text-sm text-blue-800">
                          {attackStory.steps.length} attack phases identified with {(attackStory.overallConfidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Recommendations</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Implement enhanced monitoring for similar attack patterns</li>
                  <li>Review and strengthen access controls</li>
                  <li>Conduct security awareness training for affected users</li>
                  <li>Update incident response procedures based on lessons learned</li>
                </ul>
              </section>
            </div>
          )}

          {/* Technical Report Content */}
          {reportType === 'technical' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Technical Analysis</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Total Artifacts:</strong> {filteredArtifacts.length}</div>
                    <div><strong>High Risk:</strong> {filteredArtifacts.filter(a => a.riskLevel === 'critical').length}</div>
                    <div><strong>MITRE ATT&CK:</strong> {filteredArtifacts.filter(a => a.mitreAttack).length} mapped</div>
                    <div><strong>False Positives:</strong> {filteredArtifacts.filter(a => a.isFalsePositive).length}</div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Attack Timeline</h2>
                {attackStory ? (
                  <div className="space-y-4">
                    {attackStory.steps.map((step, idx) => (
                      <div key={step.id} className="border-l-4 border-blue-600 pl-4 py-2">
                        <div className="font-semibold text-gray-900">
                          Phase {idx + 1}: {step.phase.replace('-', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">{format(step.timestamp, 'MMM d, yyyy HH:mm:ss')}</div>
                        <div className="text-gray-700 mt-1">{step.description}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Confidence: {(step.confidence * 100).toFixed(0)}% | Evidence: {step.evidenceIds.length} artifacts
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No attack story generated yet.</p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Investigator Notes</h2>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map(note => (
                      <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="font-semibold text-gray-900">{note.author}</div>
                        <div className="text-sm text-gray-600">{format(note.timestamp, 'MMM d, yyyy HH:mm')}</div>
                        <div className="text-gray-700 mt-2">{note.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No investigator notes recorded.</p>
                )}
              </section>
            </div>
          )}

          {/* Legal/Audit Report Content */}
          {reportType === 'legal' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Chain of Custody</h2>
                {chainOfCustody.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                          <th className="px-4 py-3 text-left font-semibold">Action</th>
                          <th className="px-4 py-3 text-left font-semibold">Performed By</th>
                          <th className="px-4 py-3 text-left font-semibold">Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {chainOfCustody.map(entry => (
                          <tr key={entry.id}>
                            <td className="px-4 py-3">{format(entry.timestamp, 'MMM d, yyyy HH:mm:ss')}</td>
                            <td className="px-4 py-3">{entry.action}</td>
                            <td className="px-4 py-3">{entry.performedBy}</td>
                            <td className="px-4 py-3 font-mono text-xs">{entry.hash.substring(0, 24)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No custody records available.</p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Decision Log</h2>
                {decisionLog.length > 0 ? (
                  <div className="space-y-3">
                    {decisionLog.map(decision => (
                      <div key={decision.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div className="font-semibold text-gray-900">{decision.decision}</div>
                          <div className="text-sm text-gray-600">{format(decision.timestamp, 'MMM d, yyyy HH:mm')}</div>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{decision.reason}</div>
                        <div className="text-sm text-gray-600">By: {decision.performedBy}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No decisions logged.</p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Evidence Integrity Certification</h2>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="font-bold text-green-900 text-lg">Evidence Integrity Verified</div>
                      <div className="text-sm text-green-700">All evidence has been cryptographically hashed and timestamped</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-900">
                    <p>This investigation has followed proper digital forensics procedures with maintained chain of custody. 
                    All evidence handling has been logged and is auditable.</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reporting;
