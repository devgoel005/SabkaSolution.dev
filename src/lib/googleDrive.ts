import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App gracefully (prevent multiple instantiations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Keep the access token cached in-memory as instructed by the workspace-integration skill
let cachedAccessToken: string | null = null;
let googleUser: any = null;

// Configure the Google Auth Provider with Google Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

// Add non-interactive prompts to make auth selection seamless
provider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Initiates standard popup Google Sign-In with requested Google Drive scopes
 */
export const connectGoogleDrive = async (): Promise<{ accessToken: string; user: any }> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to capture Google OAuth access token.');
    }
    cachedAccessToken = credential.accessToken;
    googleUser = result.user;
    return { accessToken: cachedAccessToken, user: googleUser };
  } catch (err: any) {
    console.error('Google Drive connection failed:', err);
    throw err;
  }
};

/**
 * Disconnects Google Drive and resets memory cache
 */
export const disconnectGoogleDrive = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    googleUser = null;
  } catch (err) {
    console.error('Google Sign-out failed:', err);
  }
};

/**
 * Retreives active cached access token
 */
export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Retrieves connected Google user info
 */
export const getConnectedGoogleUser = (): any => {
  return googleUser;
};

/**
 * Helper to execute standard Google Drive API calls
 */
const driveFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!cachedAccessToken) {
    throw new Error('No active Google Drive connection found. Please link your Google Account.');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${cachedAccessToken}`
  };

  const response = await fetch(`https://www.googleapis.com/${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Drive API Error: ${response.statusText} (${response.status}) - ${errorBody}`);
  }

  return response.json();
};

/**
 * Search if the custom folder 'SabkaSolution_Civic_Audit' already exists
 */
export const findOrCreateAuditFolder = async (): Promise<string> => {
  const folderName = 'SabkaSolution_Civic_Audit';
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  
  const searchResult = await driveFetch(`drive/v3/files?q=${query}&fields=files(id,name)`);
  
  if (searchResult.files && searchResult.files.length > 0) {
    return searchResult.files[0].id;
  }

  // If not found, create the folder
  const createResponse = await driveFetch('drive/v3/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Directory for verified citizen complaint backups and Ward Audit logs'
    })
  });

  return createResponse.id;
};

/**
 * Backs up a complete summary report of all citizen-submitted complaints to a text document inside Google Drive
 */
export const uploadAuditLogFile = async (issues: any[], citizenName: string): Promise<{ id: string; webViewLink: string }> => {
  const folderId = await findOrCreateAuditFolder();
  const timestampStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Compile a beautiful, structured text report of the citizen's civic audits
  let reportText = `==========================================================\n`;
  reportText += `   SABKASOLUTION CITIZEN CIVIC AUDIT & COMPLAINT REPORT   \n`;
  reportText += `==========================================================\n`;
  reportText += `Generated on: ${timestampStr} (IST)\n`;
  reportText += `Citizen Name: ${citizenName}\n`;
  reportText += `Integrity Standard: Verified Real-world Physical Assets Audit\n`;
  reportText += `----------------------------------------------------------\n\n`;

  if (issues.length === 0) {
    reportText += `No complaints found in active local session. All clean!\n`;
  } else {
    issues.forEach((issue, index) => {
      reportText += `Complaint #${index + 1}\n`;
      reportText += `----------------------------------------------------------\n`;
      reportText += `Ticket Token : SS-${issue.id}\n`;
      reportText += `Title        : ${issue.title}\n`;
      reportText += `Category     : ${issue.category}\n`;
      reportText += `Severity     : Level ${issue.severity} / 5\n`;
      reportText += `Status       : ${issue.status}\n`;
      reportText += `Location     : ${issue.location}\n`;
      if (issue.ward) reportText += `Ward         : ${issue.ward}\n`;
      reportText += `City / State : ${issue.city}, ${issue.state}\n`;
      reportText += `Reporter     : ${issue.anonymous ? 'Anonymous Whistleblower' : issue.reporterName}\n`;
      reportText += `Timestamp    : ${new Date(issue.timestamp || Date.now()).toLocaleString()}\n`;
      reportText += `Description  : ${issue.description}\n`;
      if (issue.imageUrl) {
        reportText += `Media Attachment: Verified Live Spatial Capture\n`;
      }
      reportText += `----------------------------------------------------------\n\n`;
    });
  }

  reportText += `==========================================================\n`;
  reportText += `     SabkaSolution - Powering Hyperlocal Indian Governance\n`;
  reportText += `==========================================================\n`;

  const fileName = `Civic_Audit_Log_${new Date().toISOString().slice(0, 10)}.txt`;

  // Multipart body format to upload metadata and content together as a single text file
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    description: `Automated hyperlocal governance backup of public complaints for ${citizenName}`,
    parents: [folderId]
  };

  const boundary = 'SABKASOLUTION_DRIVE_MULTIPART_BOUNDARY';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n',
    reportText,
    closeDelimiter
  ].join('');

  // Post to Drive upload API
  const uploadResponse = await driveFetch('upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  return {
    id: uploadResponse.id,
    webViewLink: uploadResponse.webViewLink || `https://drive.google.com/open?id=${uploadResponse.id}`
  };
};

/**
 * Lists backup files inside our custom 'SabkaSolution_Civic_Audit' folder
 */
export const listAuditBackups = async (): Promise<any[]> => {
  try {
    const folderId = await findOrCreateAuditFolder();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const result = await driveFetch(`drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,size)&orderBy=createdTime desc`);
    return result.files || [];
  } catch (err) {
    console.error('Failed to list backups:', err);
    return [];
  }
};

/**
 * Permanently deletes a backup file from Google Drive (Mandatory user confirmation is handled in UI)
 */
export const deleteBackupFile = async (fileId: string): Promise<void> => {
  await driveFetch(`drive/v3/files/${fileId}`, {
    method: 'DELETE'
  });
};
