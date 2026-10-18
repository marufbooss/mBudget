import { DatabaseExport, SyncMetadata } from '../types/budget';
import { StorageService } from './storageService';

const CLOUD_STORAGE_KEY = 'mbudget_simulated_gdrive_remote_file';
const SYNC_META_KEY = 'mbudget_sync_metadata';

export interface RemoteFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  sizeBytes: number;
  deviceOrigin: string;
  md5Checksum?: string;
  payload: DatabaseExport;
}

export class GoogleDriveService {
  public static getSyncMetadata(): SyncMetadata {
    try {
      const saved = localStorage.getItem(SYNC_META_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse sync metadata', e);
    }

    return {
      lastSyncTimestamp: null,
      remoteTimestamp: null,
      cloudSyncEnabled: false,
      driveFileName: 'mBudget_backup.db',
      driveFolder: 'Google Drive / AppData / mBudget',
      accountEmail: null,
      status: 'idle',
    };
  }

  public static saveSyncMetadata(meta: SyncMetadata): void {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  }

  // Connect Google Account
  public static async connectGoogleDrive(email = 'maruf3k9@gmail.com'): Promise<SyncMetadata> {
    // Simulate OAuth token exchange
    await new Promise((r) => setTimeout(r, 600));

    const meta = this.getSyncMetadata();
    meta.cloudSyncEnabled = true;
    meta.accountEmail = email;
    meta.status = 'idle';
    this.saveSyncMetadata(meta);

    // Check if remote file exists in Cloud Drive
    const remote = this.getRemoteFile();
    if (remote) {
      meta.remoteTimestamp = remote.modifiedTime;
      this.saveSyncMetadata(meta);
    }

    return meta;
  }

  public static disconnectGoogleDrive(): SyncMetadata {
    const meta: SyncMetadata = {
      lastSyncTimestamp: null,
      remoteTimestamp: null,
      cloudSyncEnabled: false,
      driveFileName: 'mBudget_backup.db',
      driveFolder: 'Google Drive / AppData / mBudget',
      accountEmail: null,
      status: 'idle',
    };
    this.saveSyncMetadata(meta);
    return meta;
  }

  public static getRemoteFile(): RemoteFileInfo | null {
    try {
      const data = localStorage.getItem(CLOUD_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get remote drive file', e);
    }
    return null;
  }

  // Upload local database to Google Drive (Encrypted DB payload)
  public static async uploadToGoogleDrive(): Promise<{ success: boolean; remoteFile: RemoteFileInfo }> {
    const meta = this.getSyncMetadata();
    meta.status = 'syncing';
    this.saveSyncMetadata(meta);

    // Simulate network delay to Google Drive API
    await new Promise((r) => setTimeout(r, 800));

    const localData = StorageService.exportDatabase();
    const nowIso = new Date().toISOString();
    localData.timestamp = nowIso;
    StorageService.touchLastModified();

    const jsonString = JSON.stringify(localData);
    const sizeBytes = new Blob([jsonString]).size;

    const remoteFile: RemoteFileInfo = {
      id: 'gdrive_file_' + Math.random().toString(36).substring(2, 9),
      name: meta.driveFileName || 'mBudget_backup.db',
      modifiedTime: nowIso,
      sizeBytes: sizeBytes + 2048, // simulating encrypted db headers
      deviceOrigin: 'Current Device (Web / Multi-Platform)',
      payload: localData,
    };

    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(remoteFile));

    meta.status = 'synced';
    meta.lastSyncTimestamp = nowIso;
    meta.remoteTimestamp = nowIso;
    this.saveSyncMetadata(meta);

    return { success: true, remoteFile };
  }

  // Download & Restore from Google Drive
  public static async restoreFromGoogleDrive(): Promise<{ success: boolean; payload: DatabaseExport }> {
    const meta = this.getSyncMetadata();
    meta.status = 'syncing';
    this.saveSyncMetadata(meta);

    await new Promise((r) => setTimeout(r, 900));

    const remote = this.getRemoteFile();
    if (!remote) {
      meta.status = 'error';
      meta.errorMessage = 'No backup file found in Google Drive AppData folder.';
      this.saveSyncMetadata(meta);
      throw new Error(meta.errorMessage);
    }

    StorageService.importDatabase(remote.payload);

    meta.status = 'synced';
    meta.lastSyncTimestamp = new Date().toISOString();
    meta.remoteTimestamp = remote.modifiedTime;
    this.saveSyncMetadata(meta);

    return { success: true, payload: remote.payload };
  }

  // Check version conflict between local DB and Cloud Drive
  public static checkConflict(): {
    hasConflict: boolean;
    localTimestamp: string;
    remoteTimestamp: string | null;
    newer: 'local' | 'remote' | 'equal' | 'no_remote';
  } {
    const localTimestamp = StorageService.getLastModified();
    const remote = this.getRemoteFile();

    if (!remote) {
      return {
        hasConflict: false,
        localTimestamp,
        remoteTimestamp: null,
        newer: 'no_remote',
      };
    }

    const localTime = new Date(localTimestamp).getTime();
    const remoteTime = new Date(remote.modifiedTime).getTime();

    // Within 2 seconds considered equal
    if (Math.abs(localTime - remoteTime) < 2000) {
      return {
        hasConflict: false,
        localTimestamp,
        remoteTimestamp: remote.modifiedTime,
        newer: 'equal',
      };
    }

    if (remoteTime > localTime) {
      return {
        hasConflict: true,
        localTimestamp,
        remoteTimestamp: remote.modifiedTime,
        newer: 'remote',
      };
    }

    return {
      hasConflict: false,
      localTimestamp,
      remoteTimestamp: remote.modifiedTime,
      newer: 'local',
    };
  }
}
