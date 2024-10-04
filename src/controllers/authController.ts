import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import jwt, { JwtPayload } from "jsonwebtoken";

export class AuthController {

    static async registerUser(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body
            const ipAddress = req.ip
            const response = await AuthService.registerUser(name, email, password, role, ipAddress)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }

    static async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const ipAddress = req.ip
            const response = await AuthService.loginUser(email, password, ipAddress)
            res.status(201).json(response)
        } catch (error) {
            res.status(401).json({
                error: error.message
            })
        }
    }

    static async logoutUser(req: Request, res: Response) {        
        try {
            const userId = req.decodedToken.userId;
            const sessionId = req.decodedToken.sessionId;

            await AuthService.logoutUser(userId, sessionId);
            res.status(200).json({ message: 'Logout successful' });
            
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }
}