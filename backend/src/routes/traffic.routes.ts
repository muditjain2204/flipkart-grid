import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadVideo, getCurrentTraffic } from '../controllers/traffic.controller';

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: (arg0: null, arg1: string) => void) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `traffic-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only video files are accepted.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

const router = Router();

router.post('/upload', upload.single('video'), uploadVideo);
router.get('/current', getCurrentTraffic);

export default router;
