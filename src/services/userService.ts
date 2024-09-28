import { Role, User } from "@prisma/client";
import { prisma } from "../prisma";
import { hashPassword } from "../utils/passwordHash";

export class UserService {

    static async getAllUsers() : Promise<User[]> {
        try {
            const users : User[] = await prisma.user.findMany()
            return users
        } catch (error) {
            console.error("Error in UserService.getAllUsers:", error);
            throw new Error("Failed to retrieve users");
        }
    }

    static async getUserById(id: string) : Promise<User> {
        try {
            const user : User = await prisma.user.findUnique({ where: { id } })
            return user
        } catch (error) {
            console.error("Error in UserService.getUserById:", error);
            throw new Error("Failed to retrieve user");
        }
    }


}