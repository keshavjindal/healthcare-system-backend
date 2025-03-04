import multer from 'multer';

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

export default uploadMiddleware;