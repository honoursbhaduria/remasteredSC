import React, { useState } from 'react';
import { useStore } from '../../store';
import { Settings as SettingsIcon, Sliders, Save, RefreshCw } from 'lucide-react';

const Settings: React.FC = () => {
  const { confidenceThreshold, setConfidenceThreshold, systemStats, loadSystemStats } = useStore();
  const [tempThreshold, setTempThreshold] = useState(confidenceThreshold);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setConfidenceThreshold(tempThreshold);
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        </div>

        {/* Confidence Threshold Setting */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5" />
                <span>Confidence Threshold</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Filter artifacts based on AI confidence score. Higher values show fewer, more confident results.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Threshold: {(tempThreshold * 100).toFixed(0)}%</span>
                <span className="text-sm text-gray-600">
                  Current: {(confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0% (Show all)</span>
                <span>50% (Balanced)</span>
                <span>100% (High confidence only)</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Impact:</strong> Adjusting the threshold will filter the number of artifacts displayed. 
                Lower values show more artifacts but may include false positives. Higher values show fewer, 
                more reliable artifacts.
              </p>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current System Statistics</h3>
            <button
              onClick={loadSystemStats}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Logs Ingested</div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.totalLogsIngested.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Logs Filtered Out</div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.logsFilteredOut.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">High Confidence Artifacts</div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.highConfidenceArtifacts}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Investigation Progress</div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.investigationProgress}%
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || tempThreshold === confidenceThreshold}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              saving || tempThreshold === confidenceThreshold
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Backup</h3>
        <p className="text-sm text-gray-600 mb-4">
          Export case data and evidence for external analysis or archival purposes.
        </p>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="font-semibold text-gray-900">Export Evidence Data</div>
            <div className="text-sm text-gray-600">Export all evidence artifacts as JSON</div>
          </button>
          <button className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="font-semibold text-gray-900">Export Chain of Custody</div>
            <div className="text-sm text-gray-600">Download complete custody audit trail</div>
          </button>
          <button className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="font-semibold text-gray-900">Export Attack Story</div>
            <div className="text-sm text-gray-600">Save generated narrative as PDF</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
