import { Router } from "express";
import { UserController } from "../controllers/userController";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { updateUserSchema } from "../validationSchemas";
import express from 'express';
import multer from 'multer';

const router = Router()
const upload = multer();

// '/users'

router.get('/doctors', AuthMiddleware.authenticateJWT, UserController.getAllDoctors)
router.get('/', AuthMiddleware.authenticateJWT, UserController.getAllUsers)
router.get('/:id', AuthMiddleware.authenticateJWT, UserController.getUserById)
router.put('/:id', AuthMiddleware.authenticateJWT, AuthMiddleware.validateSchema(updateUserSchema), UserController.updateUser)
router.post(
    '/photo',
    AuthMiddleware.authenticateJWT,
    upload.single('photo'),
    UserController.uploadPhoto
);
// router.put('/photo/:id', AuthMiddleware.authenticateJWT, UserController.updateUserPhoto)
router.get('/points/:id', AuthMiddleware.authenticateJWT, UserController.getUserPoints)
router.post('/points/:id/redeem', AuthMiddleware.authenticateJWT, UserController.redeemPoints)

export default router;