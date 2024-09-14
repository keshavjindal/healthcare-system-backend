import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { registerSchema } from "../validationSchemas";

const router = Router()

router.post('/register', AuthMiddleware.validateSchema(registerSchema), AuthController.registerUser)

export default router;