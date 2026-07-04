// src/shared/utils/cloudinary.js

// Lee las credenciales de Cloudinary de las variables de entorno.
// Si no están configuradas, usa valores por defecto para que no falle inmediatamente,
// pero la subida fallará si no son válidos en Cloudinary.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'TU_CLOUD_NAME';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'TU_UPLOAD_PRESET';

/**
 * Sube una imagen a Cloudinary utilizando "unsigned upload".
 * @param {string} imageUri - La URI de la imagen local obtenida por expo-image-picker.
 * @returns {Promise<string>} La URL segura (secure_url) de la imagen subida.
 */
export const uploadImageToCloudinary = async (imageUri) => {
  if (!imageUri) throw new Error('No se proporcionó una URI de imagen.');

  const data = new FormData();
  
  // Extraemos el nombre y tipo del archivo a partir de la URI local
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  data.append('file', {
    uri: imageUri,
    name: filename,
    type,
  });

  data.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
      },
    });

    const result = await response.json();

    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error(result.error?.message || 'Error al subir la imagen a Cloudinary.');
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
