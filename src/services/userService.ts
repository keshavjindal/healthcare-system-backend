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

    static async getUserPoints(userId: string): Promise<number> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { points: true }
            });
            if (!user) {
                throw new Error("User not found");
            }
            return user.points;
        } catch (error) {
            console.error("Error in UserService.getUserPoints:", error);
            throw new Error("Failed to retrieve user points");
        }
    }

    static async redeemPoints(userId: string, pointsToRedeem: number): Promise<number> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { points: true }
            });

            if (!user) {
                throw new Error("User not found");
            }

            if (user.points < pointsToRedeem) {
                throw new Error("Insufficient points");
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    points: {
                        decrement: pointsToRedeem
                    }
                },
                select: { points: true }
            });

            return updatedUser.points;
        } catch (error) {
            console.error("Error in UserService.redeemPoints:", error);
            throw error;
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

    static async updateUserPhoto(userId: string, photoBuffer: Buffer) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    photo: photoBuffer
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            });

            return {
                message: "Photo updated successfully",
                user: updatedUser
            };
        } catch (error) {
            console.error('Error updating user photo:', error);
            throw new Error('Failed to update user photo');
        }
    }

    static async getAllDoctors() : Promise<User[]> {
        try {
            const doctors : User[] = await prisma.user.findMany({ where: { role: Role.DOCTOR } })
            return doctors
        } catch (error) {
            console.error("Error in UserService.getAllDoctors:", error);
            throw new Error("Failed to retrieve doctors");
        }
    }

}