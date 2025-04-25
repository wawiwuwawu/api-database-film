import imgur from 'imgur';
// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');


// Inisialisasi client Imgur
// const imgurClient = new ImgurClient({
//   clientId: 'de3f65c7fcf374a',
//   clientSecret: 'a748da9244eabda1162ff4b2e38ac4fa8b5ebc9a'
// });

// const uploadToImgur = async (file) => {
//   try {
//     // Upload ke Imgur
//     const response = await imgurClient.upload({
//       image: fs.createReadStream(file.path), // File stream
//       type: 'stream', // Tipe upload
//       title: file.originalname, // Nama file
//       description: 'Uploaded via API' // Deskripsi opsional
//     });

//     // Hapus file lokal setelah upload
//     fs.unlinkSync(file.path);

//     // Return URL gambar dan deletehash untuk manajemen
//     return {
//       url: response.data.link,
//       deleteHash: response.data.deletehash
//     };
    
//   } catch (error) {
//     console.error('Detail Error Imgur:', {
//       message: error.message,
//       code: error.status,
//       errors: error.errors
//     });
    
//     // Hapus file lokal jika error
//     if(fs.existsSync(file.path)) fs.unlinkSync(file.path);
    
//     throw new Error(`Gagal upload ke Imgur: ${error.message}`);
//   }
// };

// const deleteFromImgur = async (deleteHash) => {
//   try {
//     const response = await imgurClient.delete(
//       `https://api.imgur.com/3/image/${deleteHash}`,
//       {
//         headers: {
//           Authorization: `de3f65c7fcf374a${deleteHash}`
//         },
//       }
//     );

//     if (!response.data.success) {
//       throw new Error('Gagal menghapus gambar dari Imgur');
//     }

//     return true;
//   } catch (error) {
//     console.error('Imgur Delete Error:', error.response?.data?.data?.error || error.message);
//     throw new Error(`Tidak dapat menghapus gambar: ${error.message}`);
//   }
// };




// module.exports = { 
//   uploadToImgur,
//   deleteFromImgur
// };


// const IMGUR_CONFIG = {
//   clientId: 'de3f65c7fcf374a', // Client ID testing khusus
//   clientSecret: 'a748da9244eabda1162ff4b2e38ac4fa8b5ebc9a' // Hapus ini jika tidak diperlukan
// };

imgur.setClientId('de3f65c7fcf374a');


export async function uploadToImgur({ buffer, filePath }) {
  if (buffer) {
    const base64 = buffer.toString('base64');
    const res = await imgur.uploadBase64(base64);
    return { 
      image_url: res.link.replace(/^http:\/\//i,'https://'), 
      delete_hash: res.deletehash };
  }
  if (filePath) {
    const res = await imgur.uploadFile(filePath);
    return { 
      image_url: res.link.replace(/^http:\/\//i,'https://'), 
      delete_hash: res.deletehash 
    };
  }
  throw new Error('Must provide buffer or filePath');
}

export async function deleteFromImgur(deleteHash) {
  await imgur.deleteImage(deleteHash);
}

// async function deleteFromImgur(deleteHash) {
//   if (!deleteHash) return false;
//   try {
//     // deleteImage menerima deleteHash langsung
//     await imgur.deleteImage(deleteHash);
//     return true;
//   } catch (error) {
//     console.error('[IMGUR DELETE ERROR]', error.message);
//     return false;
//   }
// }

export default {
  uploadToImgur,
  deleteFromImgur
};
