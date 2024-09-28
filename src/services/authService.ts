import { LoginAttempt, Role, User, UserSession } from "@prisma/client";
import { prisma } from "../prisma";
import { comparePassword, hashPassword } from "../utils/passwordHash";
import { EmailAlreadyExistsError, EmailNotFoundError, InvalidPasswordError } from "../errors/customErrors";
import jwt from "jsonwebtoken";

export interface UserRegisterResponse {
    user: User,
    userSession: UserSession
    // we dont return loginAttempt here
}

export interface UserLoginResponse {
    token: string
    user: {
        id: string
        email: string
        name: string
        role: Role
    },
    userSession: UserSession
}

export class AuthService {

    static async registerUser(name: string, email: string, password: string, role: Role, ipAddress: string): Promise<UserRegisterResponse> {
        try {
            const existingUser: User = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new EmailAlreadyExistsError();
            }

            const hashedPassword = await hashPassword(password)

            const result = await prisma.$transaction(async (prisma) => {
                const user: User = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role
                    }
                })

                const userSession: UserSession = await prisma.userSession.create({
                    data: {
                        userId: user.id,
                        ipAddress: ipAddress
                    }
                })

                await prisma.loginAttempt.create({
                    data: {
                        userId: user.id,
                        ipAddress: ipAddress,
                        isSuccess: true
                    }
                })

                return { user, userSession }
            })

            return result;
        } catch (error) {
            await prisma.loginAttempt.create({
                data: {
                    userId: null,
                    ipAddress: ipAddress,
                    isSuccess: false
                }
            })

            if (error instanceof EmailAlreadyExistsError) {
                throw error
            }

            console.error("Error in AuthService.registerUser:", error);
            throw new Error("Failed to register user");
        }
    }

    static async loginUser(email: string, password: string, ipAddress: string): Promise<UserLoginResponse> {
        try {
            const user: User = await prisma.user.findUnique({ where: { email } })
            if (!user) {
                throw new EmailNotFoundError();
            }

            const isPasswordValid = await comparePassword(password, user.password)
            if (!isPasswordValid) {
                throw new InvalidPasswordError();
            }

            const userSession: UserSession = await prisma.userSession.create({
                data: {
                    userId: user.id,
                    ipAddress: ipAddress
                }
            })

            await prisma.loginAttempt.create({
                data: {
                    userId: user.id,
                    ipAddress: ipAddress,
                    isSuccess: true
                }
            })

            // create jwt token
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role, sessionId: userSession.id },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                userSession
            };

        } catch (error) {
            await prisma.loginAttempt.create({
                data: {
                    userId: null,
                    ipAddress: ipAddress,
                    isSuccess: false
                }
            })

            if (error instanceof EmailNotFoundError || error instanceof InvalidPasswordError) {
                throw error
            }

            console.error("Unexpected error in AuthService.loginUser:", error);
            throw new Error("An unexpected error occurred during login");
        }
    }

    static async logoutUser(userId: string, sessionId: string) {
        try {
            await prisma.userSession.delete({ where: { id: sessionId } })
        } catch (error) {
            console.error("Error in AuthService.logoutUser:", error);
            throw new Error("Failed to log out user");
        }
    }
}