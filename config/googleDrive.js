const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');

// ======================
// Konfigurasi Google Drive
// ======================
const CLIENT_ID = '596906828762-ihco36jj00mepv1poa3ldi5coallrh4r.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04WjUYB-KMDmiCgYIARAAGAQSNwF-L9IrYW7HlQzXLLdf-oecx3Bz7EflEyhYwnxKCLKRbB5anCSbG121MkU0tItv7VNw1yHnFqA';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// ======================
// Konfigurasi Multer untuk upload file
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ======================
// Inisialisasi Express
// ======================
const app = express();
app.use(cors());
app.use(express.json());

// ======================
// Route untuk Proxy Gambar
// ======================
app.get('/image/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const response = await axios({
      method: 'get',
      url: `https://drive.google.com/uc?export=view&id=${fileId}`,
      responseType: 'stream'
    });

    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length']
    });

    response.data.pipe(res);

  } catch (error) {
    res.status(500).json({
      error: 'Gagal mengambil gambar',
      details: error.message
    });
  }
});

// ======================
// Route untuk Upload File
// ======================
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Upload ke Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: req.file.filename,
        parents: ['1sLGbqrDEzeOUSXfBWG3oMvmMQQZ49Pdf']
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path)
      }
    });

    // Set permission
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Hapus file lokal
    fs.unlinkSync(req.file.path);

    // Return URL melalui proxy server kita sendiri
    res.json({
      message: 'Upload berhasil!',
      directUrl: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
      proxyUrl: `https://api.wawunime.my.id/image/${response.data.id}`
    });

  } catch (error) {
    // Cleanup file lokal jika error
    if (req.file?.path) fs.unlinkSync(req.file.path);
    
    res.status(500).json({
      error: 'Gagal upload file',
      details: error.message
    });
  }
});

// ======================
// Jalankan Server
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Endpoint upload: POST http://localhost:${PORT}/upload`);
  console.log(`Endpoint proxy: GET http://localhost:${PORT}/image/:fileId`);
});