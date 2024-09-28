import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { User } from "@prisma/client";

export class UserController {

    static async getAllUsers(req: Request, res: Response) {
        try {
            const users: User[] = await UserService.getAllUsers()
            return res.status(201).json({ users })
        } catch (error) {
            res.status(400).json({ error_message: error.message })
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params
            const user: User = await UserService.getUserById(id)
            return res.status(201).json({ user })
        } catch (error) {
            res.status(400).json({ error_message: error.message })
        }
    }


}