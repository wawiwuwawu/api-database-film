// const { google } = require('googleapis');
// const fs = require('fs');

// const CLIENT_ID = '596906828762-ihco36jj00mepv1poa3ldi5coallrh4r.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = '1//04WjUYB-KMDmiCgYIARAAGAQSNwF-L9IrYW7HlQzXLLdf-oecx3Bz7EflEyhYwnxKCLKRbB5anCSbG121MkU0tItv7VNw1yHnFqA';

// // ✅ Scope ditambahkan saat inisialisasi OAuth2Client
// const oauth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// oauth2Client.setCredentials({
//   refresh_token: REFRESH_TOKEN
// });

// const uploadToGoogleDrive = async (file) => {
//   try {
//     const drive = google.drive({ version: 'v3', auth: oauth2Client });

//     // ✅ Tambahkan mimeType untuk menghindari error "Unable to upload file"
//     const response = await drive.files.create({
//       requestBody: {
//         name: file.filename,
//         parents: ['1sLGbqrDEzeOUSXfBWG3oMvmMQQZ49Pdf'],
//       },
//       media: {
//         mimeType: file.mimetype,  // Penting untuk menentukan tipe file
//         body: fs.createReadStream(file.path),
//       },
//     });

//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//     });

//     fs.unlinkSync(file.path);

//     return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    
//   } catch (error) {
//     console.error('Detail Error Google Drive:', {
//       message: error.message,
//       code: error.code,
//       errors: error.errors
//     });
//     throw new Error(`Gagal upload ke Google Drive: ${error.message}`);
//   }
// };

// // ✅ Export fungsi agar bisa diimport di file lain
// module.exports = { uploadToGoogleDrive };