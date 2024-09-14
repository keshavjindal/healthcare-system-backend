import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

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
}