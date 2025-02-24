import { Router } from "express";
import { UserController } from "../controllers/userController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router()

router.get('/', AuthMiddleware.authenticateJWT, UserController.getAllUsers)
router.get('/:id', AuthMiddleware.authenticateJWT, UserController.getUserById)
router.put('/:id', AuthMiddleware.authenticateJWT, UserController.updateUser)

export default router;