import { Request, Response } from "express";
import { GetAllHealthRecordsOfUserResponse, GetHealthRecordByIdResponse, RecordService, UploadHealthRecordResponse } from "../services/recordService";


export class RecordController {
    static async uploadHealthRecord(req: Request, res: Response) {
        try {
            const userId = req.decodedToken.userId // either this user will be a patient or a doctor
            const healthRecord = req.file
            const patientEmail = req.body.patientEmail            

            if(healthRecord === undefined){
                return res.status(400).json({
                    error_message: "Please provide health record"
                })
            }

            const response: UploadHealthRecordResponse = await RecordService.uploadHealthRecord(userId, healthRecord, patientEmail)
            return res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error_message: error.message
            })
        }
    }

    static async getHealthRecordsByUser(req: Request, res: Response) {
        try {
            const userId = req.params.id
            const response: GetAllHealthRecordsOfUserResponse = await RecordService.getHealthRecordsByUser(userId)
            return res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error_message: error.message
            })
        }
    }

    static async getHealthRecordById(req: Request, res: Response) {
        try {
            const healthRecordId = req.params.id
            const response: GetHealthRecordByIdResponse = await RecordService.getHealthRecordById(healthRecordId)
            return res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error_message: error.message
            })
        }
    }
}