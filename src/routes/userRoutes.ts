import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router()

// router.post('/register', AuthMiddleware.validateSchema(registerSchema), AuthController.registerUser)
router.get('/', UserController.getAllUsers)
router.get('/:id', UserController.getUserById)

export default router;