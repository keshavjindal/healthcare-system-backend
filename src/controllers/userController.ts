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
}