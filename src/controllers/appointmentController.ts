import { Request, Response } from "express";
import { AppointmentService, CreateAppointmentResponse } from "../services/appointmentService";

export class AppointmentController {
    // we are making most of the functions, in this project, static so that we dont 
    // need to create an instance of the class to call them
    static async createAppointment(req: Request, res: Response) {
        try {
            const patientId = req.decodedToken.userId
            const { doctorEmail, doctorUserId, dateTime, paymentMethod } = req.body

            if (!paymentMethod || !['CASH', 'POINTS'].includes(paymentMethod)) {
                return res.status(400).json({
                    error_message: "Please provide a valid payment method (CASH or POINTS)"
                });
            }

            const response = await AppointmentService.createAppointment(doctorEmail, doctorUserId, patientId, dateTime, paymentMethod)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }

    static async updateAppointment(req: Request, res: Response) {
        try {
            const appointmentId = req.params.id
            const { dateTime, status } = req.body

            if(!dateTime && !status) {
                throw new Error('Please provide at least one field to update. Either dateTime or status')
            }

            const response: CreateAppointmentResponse = await AppointmentService.updateAppointment(appointmentId, dateTime, status)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }

    static async getAppointmentById(req: Request, res: Response) {
        try {
            const appointmentId = req.params.id
            const response = await AppointmentService.getAppointmentById(appointmentId)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    } 

    static async getAllAppointments(req: Request, res: Response) {
        try {
            const userId = req.decodedToken.userId
            const userEmail = req.decodedToken.email
            const userRole = req.decodedToken.role
            console.log("userId", userId)
            const response = await AppointmentService.getAllAppointments(userId, userEmail, userRole)
            console.log("response", response)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }

    static async deleteAppointment(req: Request, res: Response) {
        try {
            const appointmentId = req.params.id
            const response = await AppointmentService.deleteAppointment(appointmentId)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }
}