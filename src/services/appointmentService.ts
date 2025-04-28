import { Appointment, AppointmentStatus, Role } from "@prisma/client"
import { prisma } from "../prisma"
import { DoctorNotFoundError } from "../errors/customErrors"

export interface CreateAppointmentResponse {
    message: string,
    appointment: {
        id: string
        doctorEmail?: string,
        patientId: string,
        dateTime: string,
        status: string,
        paymentStatus: string,
        paymentMethod: string,
        amount: number
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

export interface GetAllAppointmentsResponse {
    email: string,
    role: Role,
    appointments: Array<any>
}

export class AppointmentService {

    static async createAppointment(doctorEmail: string, doctorUserId: string, patientId: string, dateTime: string, paymentMethod: 'CASH' | 'POINTS'): Promise<CreateAppointmentResponse> {
        try {
            let doctor;

            if (doctorEmail) {
                const doctor = await prisma.user.findUnique({ where: { email: doctorEmail, role: 'DOCTOR' } })
                if (!doctor) {
                    throw new DoctorNotFoundError();
                }
            }
            else if (doctorUserId) {
                doctor = await prisma.user.findUnique({ where: { id: doctorUserId, role: 'DOCTOR' } })
                if (!doctor) {
                    throw new DoctorNotFoundError();
                }
            }

            const doctorId = doctor.id
            const result: Appointment = await prisma.appointment.create({
                data: {
                    doctorId,
                    patientId,
                    dateTime,
                    status: 'SCHEDULED',
                    paymentStatus: paymentMethod === 'POINTS' ? 'PAID' : 'PENDING',
                    paymentMethod,
                    amount: paymentMethod === 'CASH' ? 500 : 200
                }
            })

            const response: CreateAppointmentResponse = {
                message: 'Appointment created successfully',
                appointment: {
                    id: result.id,
                    doctorEmail,
                    patientId: result.patientId,
                    dateTime: result.dateTime.toISOString(),
                    status: result.status,
                    paymentStatus: result.paymentStatus,
                    paymentMethod: result.paymentMethod,
                    amount: result.amount
                }
            }

            console.log("response", response)

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
                    status: result.status,
                    paymentStatus: result.paymentStatus,
                    paymentMethod: result.paymentMethod,
                    amount: result.amount
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

    static async getAllAppointments(userId: string, userEmail: string, userRole: Role): Promise<GetAllAppointmentsResponse> {
        try {
            let appointments = []

            if(userRole === 'DOCTOR') {
                appointments = await prisma.appointment.findMany({
                    where: { doctorId: userId },
                    select: {
                        id: true,
                        dateTime: true,
                        status: true,
                        patient: {
                            select: { name: true, email: true }
                        }   
                    }
                })
            }
            else if(userRole === 'PATIENT') {
                appointments = await prisma.appointment.findMany({
                    where: { patientId: userId },
                    select: {
                        id: true,
                        dateTime: true,
                        status: true,
                        doctor: {
                            select: { name: true, email: true }
                        },
                        paymentStatus: true,
                        paymentMethod: true,
                        amount: true
                    }
                })
            }

            return {
                email: userEmail,
                role: userRole,
                appointments
            }

        } catch (error) {
            console.error("Unexpected error in AppointmentService.getAllAppointments:", error);
            throw new Error("An unexpected error occurred while getting the appointments");
        }
    }

    static async deleteAppointment(appointmentId: string): Promise<any> {
        try {
            await prisma.appointment.delete({ where: { id: appointmentId } })
            return { message: 'Appointment deleted successfully' }
        } catch (error) {
            console.error("Unexpected error in AppointmentService.deleteAppointment:", error);
            throw new Error("An unexpected error occurred while deleting the appointment");
        }
    }
}
