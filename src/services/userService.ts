import { Role, User } from "@prisma/client";
import { prisma } from "../prisma";
import { hashPassword } from "../utils/passwordHash";

type UpdateableUserFields = Omit<User , 'id' | 'createdAt' | 'updatedAt'>

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

    static async updateUser(id: string, updatedData: Partial<UpdateableUserFields>) : Promise<User> {
        try {
            const user : User = await prisma.user.update({ where: { id }, data: updatedData })
            return user
        } catch (error) {
            console.error("Error in UserService.updateUser:", error);
            throw new Error("Failed to update user");
        }
    }


}