import { Request, Response } from "express";
import { AppointmentService, CreateAppointmentResponse } from "../services/appointmentService";

export class AppointmentController {
    // we are making most of the functions, in this project, static so that we dont 
    // need to create an instance of the class to call them
    static async createAppointment(req: Request, res: Response) {
        try {
            const patientId = req.decodedToken.userId
            // The dateTime passed in the request body will be in the format of YYYY-MM-DDTHH:MM:SSZ (ISO string)
            const { doctorEmail, dateTime } = req.body
            const response: CreateAppointmentResponse = await AppointmentService.createAppointment(doctorEmail, patientId, dateTime)
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
            const response = await AppointmentService.getAllAppointments(userId, userEmail, userRole)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }
}