const multer = require('multer');
// const koneksi = require('./config/database');
// const express = require('express');
// const path    = require('path');
// const { uploadToImgur } = require('./config/imgur.js');


const upload = multer({ 
    dest: 'uploads/' // Folder sementara untuk simpan file sebelum diupload ke GDrive
  });

  module.exports = upload;