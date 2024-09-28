import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import jwt, { JwtPayload } from "jsonwebtoken";

export class AuthController {

    static async registerUser(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body
            const ipAddress = req.ip
            const user = await AuthService.registerUser(name, email, password, role, ipAddress)
            res.status(201).json({
                message: 'User registered successfully',
                user: user
            })
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
            const user = await AuthService.loginUser(email, password, ipAddress)
            res.status(201).json({
                message: 'User is login successfully',
                user: user
            })
        } catch (error) {            
            res.status(400).json({
                error: error.message
            })
        }
    }

    static async logoutUser(req: Request, res: Response) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
                const userId = decoded.userId;
                const sessionId = decoded.sessionId;
        
                await AuthService.logoutUser(userId, sessionId);
        
                res.status(200).json({ message: 'Logout successful' });
              } catch (error) {
                return res.status(401).json({ message: 'Invalid token' });
              }

        } catch (error) {            
            res.status(400).json({
                error: error.message
            })
        }
    }
}