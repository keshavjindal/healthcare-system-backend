import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { loginSchema, registerSchema } from "../validationSchemas";

const router = Router()

router.post('/register', AuthMiddleware.validateSchema(registerSchema), AuthController.registerUser)
router.post('/login', AuthMiddleware.validateSchema(loginSchema), AuthController.loginUser)
router.post('/logout', AuthController.logoutUser)

export default router;