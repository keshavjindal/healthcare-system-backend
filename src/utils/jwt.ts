import jwt from "jsonwebtoken";
import { User } from "../entities/user.entity";

const key = process.env.JWT_SECRET

export function generateJWT(user) : string {
    console.log("check333", key);
    
    return jwt.sign({
        id: user.id,
        role: user.role
    }, key, {expiresIn: '1h'})
}