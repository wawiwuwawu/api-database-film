import imgur from 'imgur';
import dotenv from 'dotenv';
dotenv.config();


imgur.setClientId(process.env.IMGUR_CLIENT_ID);


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


export default {
  uploadToImgur,
  deleteFromImgur
};
