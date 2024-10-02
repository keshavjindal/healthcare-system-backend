import { AppointmentController } from "../controllers/appointmentController";
import { Router } from "express";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { createAppointmentSchema, updateAppointmentSchema } from "../validationSchemas";


const router = Router()

router.post('/', AuthMiddleware.authenticateJWT, AuthMiddleware.validateSchema(createAppointmentSchema), AppointmentController.createAppointment)
router.put('/:id', AuthMiddleware.authenticateJWT, AuthMiddleware.validateSchema(updateAppointmentSchema), AppointmentController.updateAppointment)
router.get('/:id', AuthMiddleware.authenticateJWT, AppointmentController.getAppointmentById)

export default router;