import { AppointmentStatus, Role } from "@prisma/client";
import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(30),
    role: Joi.string().valid(...Object.values(Role)).required()
})

export const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(30)
})

export const createAppointmentSchema = Joi.object({
    doctorEmail: Joi.string().required().email(),
    dateTime: Joi.date().iso().required()
})

export const updateAppointmentSchema = Joi.object({
    dateTime: Joi.date().iso().required(),
    status: Joi.string().valid(...Object.values(AppointmentStatus)).required()
})