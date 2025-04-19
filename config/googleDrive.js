async function uploadToGoogleDrive(file) {
    try {
      // Upload file ke Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: file.filename,
          parents: [GOOGLE_DRIVE_FOLDER_ID],
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path),
        },
        fields: 'id, webViewLink',
      });
  
      // Set izin publik
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
  
      return response.data.webViewLink;
    } catch (err) {
      throw new Error('Gagal upload ke Google Drive: ' + err.message);
    } finally {
      // Hapus file lokal setelah diupload
      fs.unlinkSync(file.path);
    }
  }
  
  module.exports = { uploadToGoogleDrive };