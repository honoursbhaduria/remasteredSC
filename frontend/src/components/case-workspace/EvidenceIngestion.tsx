import React, { useState } from 'react';
import { useStore } from '../../store';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import { format } from 'date-fns';

const EvidenceIngestion: React.FC = () => {
  const { evidenceFiles, chainOfCustody, currentCase } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Mock file handling
    alert('File upload simulated. In production, files would be processed and hashed.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock file handling
    alert('File upload simulated. In production, files would be processed and hashed.');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'parsed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'queued': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Upload Zone */}
      <div className="lg:col-span-2 space-y-6">
        {/* Drag & Drop Zone */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Evidence</h3>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Drop evidence files here
            </h4>
            <p className="text-gray-600 mb-4">or click to browse</p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              multiple
              accept=".evtx,.log,.csv,.json,.pcap"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Select Files
            </label>

            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>.evtx</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>.log</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>.csv</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>.json</span>
              </span>
              <span className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>.pcap</span>
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Files Table */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Evidence Files</h3>
          
          {evidenceFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No evidence files uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">File Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hash</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {evidenceFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{file.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          {file.fileType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatFileSize(file.fileSize)}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {file.hash.substring(0, 20)}...
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(file.status)}
                          <span className="text-sm font-medium capitalize">{file.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(file.uploadedAt, 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chain of Custody */}
      <div>
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 sticky top-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Chain of Custody</h3>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Integrity Preserved</span>
            </div>
            <p className="text-sm text-green-700">
              All evidence is cryptographically hashed and timestamped to maintain forensic integrity.
            </p>
          </div>

          {chainOfCustody.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Lock className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No custody entries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chainOfCustody.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {index !== chainOfCustody.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center relative z-10">
                      <Lock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{entry.action}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        by {entry.performedBy}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(entry.timestamp, 'MMM d, yyyy HH:mm:ss')}
                      </div>
                      {entry.notes && (
                        <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                          {entry.notes}
                        </div>
                      )}
                      <div className="mt-2">
                        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded block break-all">
                          {entry.hash.substring(0, 30)}...
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceIngestion;
