import { HealthRecord } from "@prisma/client";
import { PatientNotFoundError } from "../errors/customErrors";
import { prisma } from "../prisma";

export interface UploadHealthRecordResponse {
    message: string,
    record: {
        id: string,
        patientId: string
    }
}

export interface GetAllHealthRecordsOfUserResponse {
    records: HealthRecord[]
    totalCount: number
}

export interface GetHealthRecordByIdResponse {
    record: HealthRecord
}

export class RecordService {

    static async uploadHealthRecord(userId: string, healthRecord: any, patientEmail: string) : Promise<UploadHealthRecordResponse> {
        try {
            const patient = await prisma.user.findUnique({ where: { email: patientEmail, role: 'PATIENT' } })
            if(!patient){
                throw new PatientNotFoundError();
            }

            const result: HealthRecord = await prisma.healthRecord.create({
                data: {
                    patientId: patient.id,
                    recordData: healthRecord.buffer
                }
            })

            const response: UploadHealthRecordResponse = {
                message: "Health record uploaded successfully",
                record: {
                    id: result.id,
                    patientId: patient.id
                }
            }

            return response
        } catch (error) {
            console.error("Error in RecordService.uploadHealthRecord:", error);
            throw new Error("Failed to upload health record");
        }
    }

    static async getHealthRecordsByUser(userId: string) : Promise<GetAllHealthRecordsOfUserResponse>{
        try {
            const healthRecords: HealthRecord[] = await prisma.healthRecord.findMany({ where: { patientId: userId } })
            
            const response: GetAllHealthRecordsOfUserResponse = {
                records: healthRecords,
                totalCount: healthRecords.length
            }

            return response
        } catch (error) {
            console.error("Error in RecordService.getHealthRecordsByUser:", error);
            throw new Error("Failed to retrieve health records");
        }
    }

    static async getHealthRecordById(healthRecordId: string) : Promise<GetHealthRecordByIdResponse>{
        try {
            const healthRecord: HealthRecord = await prisma.healthRecord.findUnique({ where: { id: healthRecordId } })

            const response: GetHealthRecordByIdResponse = {
                record: healthRecord
            }

            return response
        } catch (error) {
            console.error("Error in RecordService.getHealthRecordById:", error);
            throw new Error("Failed to retrieve health record");
        }
    }
}