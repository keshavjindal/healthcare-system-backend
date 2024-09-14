import { Request, Response } from "express";
import { AuthService } from "../services/authService";

export class AuthController {

    static async registerUser(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body
            const user = AuthService.registerUser(name, email, password, role)
            res.status(201).json({
                message: 'User registered successfully',
                user: user
            })
        } catch (error) {
            console.log("fesrgsrgdgd");
            
            res.status(400).json({
                error: error
            })
        }
    }
}