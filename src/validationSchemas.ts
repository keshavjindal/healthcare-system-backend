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
    doctorEmail: Joi.string().email().optional(),
    doctorUserId: Joi.string().uuid().optional(),
    dateTime: Joi.date().iso().required(),
    paymentMethod: Joi.string().valid('CASH', 'POINTS').required()
}).xor('doctorEmail', 'doctorUserId');

export const updateAppointmentSchema = Joi.object({
    dateTime: Joi.date().iso(),
    status: Joi.string().valid(...Object.values(AppointmentStatus))
})

export const uploadHealthRecordSchema = Joi.object({
    patientEmail: Joi.string().email().required(),
    recordType: Joi.string().valid('FILE', 'FORM').required(),
    formData: Joi.object().when('recordType', {
        is: 'FORM',
        then: Joi.object().required(),
        otherwise: Joi.forbidden()
    })
})

export const updateHealthRecordSchema = Joi.object({
    recordName: Joi.string().optional(),
    recordType: Joi.string().valid('FILE', 'FORM').optional(),
    formData: Joi.object().when('recordType', {
        is: 'FORM',
        then: Joi.object().required(),
        otherwise: Joi.forbidden()
    })
})

export const updateUserSchema = Joi.object({

})