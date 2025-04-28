import { Router } from "express";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { uploadHealthRecordSchema , updateHealthRecordSchema} from "../validationSchemas";
import { RecordController } from "../controllers/recordController";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const router = Router()

router.get('/user/:userId', AuthMiddleware.authenticateJWT, RecordController.getHealthRecordsByUser)
router.get('/:id', AuthMiddleware.authenticateJWT, RecordController.getHealthRecordById)
router.get('/download/:id', AuthMiddleware.authenticateJWT, RecordController.downloadHealthRecordById)
router.get('/view/:id', AuthMiddleware.authenticateJWT, RecordController.viewHealthRecordById)
router.post('/upload', uploadMiddleware.single('file'), AuthMiddleware.authenticateJWT, AuthMiddleware.validateSchema(uploadHealthRecordSchema), RecordController.uploadHealthRecord)
router.put('/:id', uploadMiddleware.single('file'), AuthMiddleware.authenticateJWT, AuthMiddleware.validateSchema(updateHealthRecordSchema), RecordController.updateHealthRecord)
router.delete('/:id', AuthMiddleware.authenticateJWT, RecordController.deleteHealthRecord)

// Get record changes from database
router.get('/:recordId/changes', AuthMiddleware.authenticateJWT, RecordController.getRecordChangeHistory)

export default router;