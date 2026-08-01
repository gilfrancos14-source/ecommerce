import multer from 'multer';
import AppError from '../utils/AppError.js';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formats acceptés : JPEG, PNG, WebP, AVIF', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp', quality: 'auto:good' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });

export const uploadImages = async (req, _res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const results = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer, 'luxe/products')),
      );
      req.cloudinaryImages = results.map((r) => r.secure_url);
      req.cloudinaryPublicIds = results.map((r) => r.public_id);
    } else {
      req.cloudinaryImages = [];
      req.cloudinaryPublicIds = [];
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const deleteImages = async (urls) => {
  if (!urls?.length) return;
  const ids = urls
    .map((url) => {
      const match = url.match(/\/v\d+\/(.+)\.\w+$/);
      return match ? `luxe/products/${match[1]}` : null;
    })
    .filter(Boolean);
  if (ids.length) {
    await Promise.all(ids.map((id) => cloudinary.uploader.destroy(id)));
  }
};
