import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { Role, User } from "@prisma/client";
import { AdminAccessDeniedError } from "../errors/customErrors";

export class UserController {

    static async getAllUsers(req: Request, res: Response) {
        try {
            const userRole = req.decodedToken.role

            if(userRole !== Role.ADMIN) {
                throw new AdminAccessDeniedError()
            }

            const users: User[] = await UserService.getAllUsers()
            return res.status(201).json({ users })
        } catch (error) {
            res.status(400).json({ error_message: error.message })
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id
            const requestingUserId = req.decodedToken.userId

            if (userId !== requestingUserId && req.decodedToken.role !== Role.ADMIN) {
                throw new AdminAccessDeniedError()
            }
            
            const user: User = await UserService.getUserById(userId)
            return res.status(201).json({ user })
        } catch (error) {
            res.status(400).json({ error_message: error.message })
        }
    }

    static async getUserPoints(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const points = await UserService.getUserPoints(userId);
            return res.status(200).json({ points });
        } catch (error) {
            return res.status(400).json({
                error_message: error.message
            });
        }
    }

    static async redeemPoints(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { pointsToRedeem } = req.body;

            if (!pointsToRedeem || typeof pointsToRedeem !== 'number' || pointsToRedeem <= 0) {
                return res.status(400).json({
                    error_message: "Please provide a valid number of points to redeem"
                });
            }

            const remainingPoints = await UserService.redeemPoints(userId, pointsToRedeem);
            return res.status(200).json({ remainingPoints });
        } catch (error) {
            return res.status(400).json({
                error_message: error.message
            });
        }
    }

    static async updateUser(req: Request, res: Response) {
        try {
            const userId = req.params.id
            const requestingUserId = req.decodedToken.userId

            if (userId !== requestingUserId && req.decodedToken.role !== Role.ADMIN) {
                throw new AdminAccessDeniedError()
            }

            const user: User = await UserService.updateUser(userId, req.body)
            return res.status(201).json({ user })
        } catch (error) {
            res.status(400).json({ error_message: error.message })
        }
    }

    static async uploadPhoto(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No photo uploaded' });
            }

            const userId = req.decodedToken?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const photoBuffer = req.file.buffer;
            const result = await UserService.updateUserPhoto(userId, photoBuffer);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error uploading photo:', error);
            return res.status(500).json({ error: 'Failed to upload photo' });
        }
    }

    static async getAllDoctors(req: Request, res: Response) {
        try {
            const doctors = await UserService.getAllDoctors();
            return res.status(200).json({ doctors });
        } catch (error) {
            console.error('Error fetching doctors:', error);   
            res.status(400).json({ error_message: error.message }) 
        }
    }
}