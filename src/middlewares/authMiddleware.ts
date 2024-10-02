import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
      interface Request {
        decodedToken?: jwt.JwtPayload;
      }
    }
  }

export class AuthMiddleware {

    static validateSchema(schema: Joi.ObjectSchema) {
        // validateSchema function is returning a middleware function which will be called 
        // by express when /register request is hit
        return (req: Request, res: Response, next: NextFunction) => {
            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            next(); // if we dont write next, the request will be left hanging.
            // Each middleware function either calls next or ends the req-res life cycle.
        };
    }

    static authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
            req.decodedToken = decoded
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}