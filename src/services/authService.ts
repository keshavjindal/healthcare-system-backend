import { Role } from "@prisma/client";
import { prisma } from "../prisma";
import { hashPassword } from "../utils/passwordHash";

export class AuthService {

    static async registerUser(name: string, email: string, password: string, role: Role) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })
        return user;
    }
}