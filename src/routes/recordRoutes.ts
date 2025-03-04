import { Router } from "express";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { uploadHealthRecordSchema } from "../validationSchemas";
import { RecordController } from "../controllers/recordController";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const router = Router()

router.post('/upload', uploadMiddleware.single('file'), AuthMiddleware.authenticateJWT, AuthMiddleware.validateSchema(uploadHealthRecordSchema), RecordController.uploadHealthRecord)
router.get('/user/:id', AuthMiddleware.authenticateJWT, RecordController.getHealthRecordsByUser)
router.get('/:id', AuthMiddleware.authenticateJWT, RecordController.getHealthRecordById)

export default router;