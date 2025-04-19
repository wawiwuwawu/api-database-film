// config/googleDrive.js
const { google } = require('googleapis');
const fs = require('fs');

const CLIENT_ID = '596906828762-ihco36jj00mepv1poa3ldi5coallrh4r.apps.googleusercontent.com'
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04WjUYB-KMDmiCgYIARAAGAQSNwF-L9IrYW7HlQzXLLdf-oecx3Bz7EflEyhYwnxKCLKRbB5anCSbG121MkU0tItv7VNw1yHnFqA';


// Konfigurasi OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/drive'
});

const uploadToGoogleDrive = async (file) => {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 1. Upload file ke Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.filename,
        parents: ['1sLGbqrDEzeOUSXfBWG3oMvmMQQZ49Pdf'],
      },
      media: {
        body: fs.createReadStream(file.path),
      },
    });

    // Set file menjadi publik
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 3. Hapus file lokal setelah upload
    fs.unlinkSync(file.path);

    // 4. Kembalikan URL publik
    return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    
  } catch (error) {
    console.error('Detail Error Google Drive:', {
        message: error.message,
        code: error.code,
        errors: error.errors
      });
      throw new Error(`Gagal upload ke Google Drive: ${error.message}`);
  }
};
