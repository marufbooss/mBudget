import 'dart:convert';
import 'dart:io';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:http/http.dart' as http;
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'database_helper.dart';

class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}

class GoogleDriveSyncService {
  static final GoogleDriveSyncService instance = GoogleDriveSyncService._init();
  GoogleDriveSyncService._init();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      drive.DriveApi.driveAppdataScope,
      drive.DriveApi.driveFileScope,
    ],
  );

  GoogleSignInAccount? _currentUser;
  drive.DriveApi? _driveApi;

  GoogleSignInAccount? get currentUser => _currentUser;
  bool get isSignedIn => _currentUser != null;

  Future<bool> signIn() async {
    try {
      _currentUser = await _googleSignIn.signIn();
      if (_currentUser == null) return false;

      final authHeaders = await _currentUser!.authHeaders;
      final authClient = GoogleAuthClient(authHeaders);
      _driveApi = drive.DriveApi(authClient);
      return true;
    } catch (e) {
      print('Google Sign-In Error: $e');
      return false;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    _currentUser = null;
    _driveApi = null;
  }

  Future<bool> syncBackupToDrive() async {
    if (_driveApi == null) {
      final signedIn = await signIn();
      if (!signedIn) return false;
    }

    try {
      final dbPath = await getDatabasesPath();
      final localDbFile = File(join(dbPath, 'mbudget.db'));
      if (!await localDbFile.exists()) return false;

      const fileName = 'mBudget_backup.db';

      final fileList = await _driveApi!.files.list(
        spaces: 'appDataFolder',
        $fields: 'files(id, name, modifiedTime)',
        q: "name = '$fileName'",
      );

      final media = drive.Media(
        localDbFile.openRead(),
        await localDbFile.length(),
      );

      if (fileList.files != null && fileList.files!.isNotEmpty) {
        final existingFileId = fileList.files!.first.id!;
        await _driveApi!.files.update(
          drive.File(),
          existingFileId,
          uploadMedia: media,
        );
      } else {
        final driveFile = drive.File()
          ..name = fileName
          ..parents = ['appDataFolder'];

        await _driveApi!.files.create(
          driveFile,
          uploadMedia: media,
        );
      }
      return true;
    } catch (e) {
      print('Google Drive Sync Error: $e');
      return false;
    }
  }

  Future<bool> restoreFromDrive() async {
    if (_driveApi == null) {
      final ok = await signIn();
      if (!ok) return false;
    }

    try {
      final fileList = await _driveApi!.files.list(
        spaces: 'appDataFolder',
        $fields: 'files(id, name, modifiedTime)',
        q: "name = 'mBudget_backup.db'",
      );

      if (fileList.files == null || fileList.files!.isEmpty) {
        return false;
      }

      final remoteFile = fileList.files!.first;
      final media = await _driveApi!.files.get(
        remoteFile.id!,
        downloadOptions: drive.DownloadOptions.fullMedia,
      ) as drive.Media;

      final dbPath = await getDatabasesPath();
      final targetFile = File(join(dbPath, 'mbudget.db'));

      final sink = targetFile.openWrite();
      await media.stream.pipe(sink);
      await sink.close();

      return true;
    } catch (e) {
      print('Restore Error: $e');
      return false;
    }
  }
}
