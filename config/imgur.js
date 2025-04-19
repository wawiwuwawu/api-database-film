const { ImgurClient } = require('imgur');
const fs = require('fs');


// Inisialisasi client Imgur
const imgurClient = new ImgurClient({
  clientId: 'de3f65c7fcf374a',
  clientSecret: 'a748da9244eabda1162ff4b2e38ac4fa8b5ebc9a'
});

const uploadToImgur = async (file) => {
  try {
    // Upload ke Imgur
    const response = await imgurClient.upload({
      image: fs.createReadStream(file.path), // File stream
      type: 'stream', // Tipe upload
      title: file.originalname, // Nama file
      description: 'Uploaded via API' // Deskripsi opsional
    });

    // Hapus file lokal setelah upload
    fs.unlinkSync(file.path);

    // Return URL gambar dan deletehash untuk manajemen
    return {
      url: response.data.link,
      deleteHash: response.data.deletehash
    };
    
  } catch (error) {
    console.error('Detail Error Imgur:', {
      message: error.message,
      code: error.status,
      errors: error.errors
    });
    
    // Hapus file lokal jika error
    if(fs.existsSync(file.path)) fs.unlinkSync(file.path);
    
    throw new Error(`Gagal upload ke Imgur: ${error.message}`);
  }
};

module.exports = { uploadToImgur };