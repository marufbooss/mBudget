import React, { useState, useEffect } from 'react';
import { SyncMetadata, DatabaseExport } from '../types/budget';
import { GoogleDriveService, RemoteFileInfo } from '../services/googleDriveService';
import { StorageService } from '../services/storageService';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  FileText,
  Clock,
  Shield,
  HardDrive,
} from 'lucide-react';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [syncMeta, setSyncMeta] = useState<SyncMetadata>(
    GoogleDriveService.getSyncMetadata()
  );
  const [remoteFile, setRemoteFile] = useState<RemoteFileInfo | null>(
    GoogleDriveService.getRemoteFile()
  );
  const [conflictInfo, setConflictInfo] = useState(
    GoogleDriveService.checkConflict()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshState();
    }
  }, [isOpen]);

  const refreshState = () => {
    const meta = GoogleDriveService.getSyncMetadata();
    setSyncMeta(meta);
    setRemoteFile(GoogleDriveService.getRemoteFile());
    setConflictInfo(GoogleDriveService.checkConflict());
  };

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsSyncing(true);
    setStatusMessage('Authenticating with Google OAuth 2.0...');
    try {
      const meta = await GoogleDriveService.connectGoogleDrive('maruf3k9@gmail.com');
      setSyncMeta(meta);
      refreshState();
      setStatusMessage('Google Drive connected successfully.');
    } catch (e: any) {
      setStatusMessage('Connection failed: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    const meta = GoogleDriveService.disconnectGoogleDrive();
    setSyncMeta(meta);
    refreshState();
    setStatusMessage('Disconnected from Google Drive.');
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMessage('Encrypting database and syncing to Google Drive AppData...');
    try {
      const res = await GoogleDriveService.uploadToGoogleDrive();
      refreshState();
      setStatusMessage(`Backup synced! File: ${res.remoteFile.name} (${(res.remoteFile.sizeBytes / 1024).toFixed(1)} KB)`);
    } catch (e: any) {
      setStatusMessage('Sync failed: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (
      !confirm(
        'Are you sure you want to restore your financial database from Google Drive? This will replace your local changes with the remote cloud backup.'
      )
    ) {
      return;
    }

    setIsSyncing(true);
    setStatusMessage('Downloading database from Google Drive AppData...');
    try {
      await GoogleDriveService.restoreFromGoogleDrive();
      refreshState();
      onDataRestored();
      setStatusMessage('Database restored successfully from Google Drive!');
    } catch (e: any) {
      setStatusMessage('Restore failed: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualExport = () => {
    const data = StorageService.exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mBudget_backup_${new Date().toISOString().split('T')[0]}.db.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleManualImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload: DatabaseExport = JSON.parse(
          event.target?.result as string
        );
        StorageService.importDatabase(payload);
        onDataRestored();
        refreshState();
        alert('Local database successfully restored from file!');
      } catch (err: any) {
        alert('Invalid database file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Drive Cloud Sync</h2>
              <p className="text-xs text-slate-400">
                Encrypted multi-platform database synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 mt-5">
          {/* Status Bar */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  syncMeta.cloudSyncEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  {syncMeta.cloudSyncEnabled ? 'Google Drive Connected' : 'Google Drive Offline'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {syncMeta.accountEmail || 'No account linked'}
                </span>
              </div>
            </div>

            {syncMeta.cloudSyncEnabled ? (
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.25C.45 8.19 0 10.04 0 12s.45 3.81 1.25 5.4l4.03-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.57 1.25 6.6l4.03 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            )}
          </div>

          {/* Conflict Resolution & Timestamps Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-400" />
              <span>Version & Timestamp Comparison</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400 block mb-1">Local Device Database</span>
                <span className="text-white font-mono font-medium block">
                  {new Date(conflictInfo.localTimestamp).toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(conflictInfo.localTimestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400 block mb-1">Google Drive Cloud File</span>
                <span className="text-white font-mono font-medium block">
                  {conflictInfo.remoteTimestamp
                    ? new Date(conflictInfo.remoteTimestamp).toLocaleTimeString()
                    : 'No remote file yet'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {conflictInfo.remoteTimestamp
                    ? new Date(conflictInfo.remoteTimestamp).toLocaleDateString()
                    : 'Sync to create first backup'}
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              {conflictInfo.newer === 'equal' ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>Local database is fully in sync with Google Drive.</span>
                </div>
              ) : conflictInfo.newer === 'local' ? (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <RefreshCw size={14} />
                  <span>Local database has newer changes. Sync to backup to cloud.</span>
                </div>
              ) : conflictInfo.newer === 'remote' ? (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <AlertCircle size={14} />
                  <span>Cloud has a newer version from another device! Restore recommended.</span>
                </div>
              ) : (
                <div className="text-slate-400 text-[11px]">
                  Ready to perform initial Google Drive backup.
                </div>
              )}
            </div>
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Upload size={16} />
              <span>Sync to Google Drive Now</span>
            </button>

            <button
              onClick={handleRestore}
              disabled={isSyncing || !remoteFile}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-medium text-xs transition-colors disabled:opacity-40"
            >
              <Download size={16} />
              <span>Download & Restore from Drive</span>
            </button>
          </div>

          {/* Status Message Toast */}
          {statusMessage && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 font-mono">
              {statusMessage}
            </div>
          )}

          {/* Manual Offline File Backup Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HardDrive size={14} className="text-slate-400" />
              <span>Offline Database Export & Import</span>
            </h4>
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
              >
                <Download size={13} />
                <span>Export mBudget_backup.db</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer transition-colors">
                <Upload size={13} />
                <span>Restore Backup File</span>
                <input
                  type="file"
                  accept=".json,.db"
                  onChange={handleManualImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
