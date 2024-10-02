import { Appointment, AppointmentStatus } from "@prisma/client"
import { prisma } from "../prisma"
import { DoctorNotFoundError } from "../errors/customErrors"

export interface CreateAppointmentResponse {
    message: string,
    appointment: {
        id: string
        doctorEmail?: string,
        patientId: string,
        dateTime: string,
        status: string
    }
}

export interface GetAppointmentByIdResponse {
    id: string,
    dateTime: Date,
    status: string,
    patient: {
        name: string,
        email: string
    },
    doctor: {
        name: string,
        email: string
    }
}

export class AppointmentService {

    static async createAppointment(doctorEmail: string, patientId: string, dateTime: string): Promise<CreateAppointmentResponse> {
        try {
            const doctor = await prisma.user.findUnique({ where: { email: doctorEmail, role: 'DOCTOR' } })
            if (!doctor) {
                throw new DoctorNotFoundError();
            }

            const doctorId = doctor.id
            const result: Appointment = await prisma.appointment.create({
                data: {
                    doctorId,
                    patientId,
                    dateTime,
                    status: 'SCHEDULED'
                }
            })

            const response: CreateAppointmentResponse = {
                message: 'Appointment created successfully',
                appointment: {
                    id: result.id,
                    doctorEmail,
                    patientId: result.patientId,
                    dateTime: result.dateTime.toISOString(),
                    status: result.status
                }
            }

            return response
        } catch (error) {
            if (error instanceof DoctorNotFoundError) {
                throw error
            }

            console.error("Unexpected error in AppointmentService.createAppointment:", error);
            throw new Error("An unexpected error occurred while creating the appointment");
        }
    }

    static async updateAppointment(appointmentId: string, dateTime: string, status: AppointmentStatus): Promise<CreateAppointmentResponse> {
        try {
            const updatedData = {}
            if (dateTime) {
                updatedData['dateTime'] = dateTime
            }
            if (status) {
                updatedData['status'] = status
            }

            const result: Appointment = await prisma.appointment.update({
                where: { id: appointmentId },
                data: updatedData
            })

            const response: CreateAppointmentResponse = {
                message: 'Appointment updated successfully',
                appointment: {
                    id: appointmentId,
                    patientId: result.patientId,
                    dateTime: result.dateTime.toISOString(),
                    status: result.status
                }
            }

            return response
        } catch (error) {
            console.error("Unexpected error in AppointmentService.updateAppointment:", error);
            throw new Error("An unexpected error occurred while updating the appointment");
        }
    }

    static async getAppointmentById(appointmentId: string): Promise<GetAppointmentByIdResponse> {
        try {
            const result = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                select: {
                    id: true,
                    dateTime: true,
                    status: true,
                    patient: {
                        select: { name: true, email: true }
                    },
                    doctor: {
                        select: { name: true, email: true }
                    }
                }
            });

            return result
        } catch (error) {
            console.error("Unexpected error in AppointmentService.getAppointmentById:", error);
            throw new Error("An unexpected error occurred while getting the appointment");
        }
    }
}