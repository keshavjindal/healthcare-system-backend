import { Request, Response } from "express";
import { GetAllHealthRecordsOfUserResponse, GetHealthRecordByIdResponse, RecordService, UploadHealthRecordResponse } from "../services/recordService";
import { HealthRecord } from "@prisma/client";


export class RecordController {
    static async uploadHealthRecord(req: Request, res: Response) {
        try {           
            console.log("Uploading health record")
            const userId = req.decodedToken.userId
            const { patientEmail, recordType, formData } = req.body
            
            let recordData: Buffer
            let fileName: string
            let fileSize: number
            let mimeType: string

            if (recordType === 'FILE') {
                const file = req.file
                if (!file) {
                    return res.status(400).json({
                        error_message: "Please provide health record file"
                    })
                }
                recordData = file.buffer
                fileName = file.originalname
                fileSize = file.size
                mimeType = file.mimetype
            } else {
                // For form data
                console.log("Form data", formData.name)
                const formDataString = JSON.stringify(formData)
                recordData = Buffer.from(formDataString)
                fileName = formData.name + '.json'
                fileSize = recordData.length
                mimeType = 'application/json'
            }

            const response = await RecordService.uploadHealthRecord(
                userId, 
                recordData, 
                patientEmail, 
                fileName, 
                fileSize,
                recordType,
                mimeType
            )
            return res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                error_message: error.message
            })
        }
    }

    static async getHealthRecordsByUser(req: Request, res: Response) {
        try {
            const userId = req.params.userId
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

    static async downloadHealthRecordById(req: Request, res: Response) {
        try {
            const healthRecordId = req.params.id
            const userId = req.decodedToken.userId
            const record: HealthRecord = await RecordService.downloadHealthRecordById(healthRecordId)

            if (!record) {
                return res.status(404).json({
                    error_message: "Health record not found"
                });
            }

            // Verify hash
            const crypto = require('crypto');
            const currentHash = crypto.createHash('sha256')
                .update(record.recordData)
                .digest('hex');

            if (record.recordType === 'FILE') {
                res.set({
                    'Content-Type': record.mimeType,
                    'Content-Disposition': `attachment; filename="${record.recordName}"`,
                    'Content-Length': record.recordSize.toString()
                });
                res.send(record.recordData);
            } else {
                // For form data, send as downloadable JSON file
                const formData = JSON.parse(record.recordData.toString())
                res.set({
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${record.recordName}"`,
                });
                res.json(formData);
            }
        } catch (error) {
            console.error("Error in RecordController.downloadHealthRecordById:", error);
            res.status(400).json({
                error_message: error.message
            })
        }
    }

    static async viewHealthRecordById(req: Request, res: Response) {
        try {
            const healthRecordId = req.params.id
            const userId = req.decodedToken.userId
            const record: HealthRecord = await RecordService.downloadHealthRecordById(healthRecordId)

            if (!record) {
                return res.status(404).json({
                    error_message: "Health record not found"
                });
            }

            // Verify hash
            const crypto = require('crypto');
            const currentHash = crypto.createHash('sha256')
                .update(record.recordData)
                .digest('hex');

            
            if (record.recordType === 'FILE') {
                // For files (PDF, images) - set to inline for viewing in browser
                res.set({
                    'Content-Type': record.mimeType,
                    'Content-Disposition': `inline; filename="${record.recordName}"`,
                    'Content-Length': record.recordSize.toString()
                });
                res.send(record.recordData);
            } else {
                // For form data (JSON)
                const formData = JSON.parse(record.recordData.toString())
                res.json({
                    message: "Form data retrieved successfully",
                    data: formData,
                    recordName: record.recordName,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                });
            }
        } catch (error) {
            console.error("Error in RecordController.viewHealthRecordById:", error);
            res.status(400).json({
                error_message: error.message
            })
        }
    }

    static async updateHealthRecord(req: Request, res: Response) {
        try {
            const userId = req.decodedToken.userId;
            const healthRecordId = req.params.id;
            const updates = req.body;
            const file = req.file;

            if (!updates || Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error_message: "Please provide update data"
                });
            }

            if(req.body.recordType === 'FILE') {
                if(!file) {
                    return res.status(400).json({
                        error_message: "Please provide file"
                    })
                }
                else{
                    updates.recordData = file.buffer
                    updates.recordSize = file.size
                    updates.mimeType = file.mimetype
                }
            }

            const updatedRecord = await RecordService.updateHealthRecord(healthRecordId, userId, updates);
            
            return res.status(200).json({
                message: "Health record updated successfully",
                record: {
                    id: updatedRecord.id,
                    patientId: updatedRecord.patientId,
                    name: updatedRecord.recordName,
                    size: updatedRecord.recordSize,
                    updatedAt: updatedRecord.updatedAt
                }
            });
        } catch (error) {
            console.error("Error in RecordController.updateHealthRecord:", error);
            res.status(400).json({
                error_message: error.message
            });
        }
    }

    static async getRecordChangeHistory(req: Request, res: Response) {
        try {
            const recordId = req.params.recordId;
            if (!recordId) {
                return res.status(400).json({ message: 'Record ID is required' });
            }

            const history = await RecordService.getRecordHistory(recordId);
            return res.status(200).json(history);
        } catch (error) {
            console.error('Error in RecordController.getRecordChangeHistory:', error);
            if (error.message === 'Health record not found') {
                return res.status(404).json({ message: 'Health record not found' });
            }
            return res.status(500).json({ message: 'Failed to fetch record changes' });
        }
    }

    static async deleteHealthRecord(req: Request, res: Response) {
        try {
            const healthRecordId = req.params.id;
            const userId = req.decodedToken.userId;

            await RecordService.deleteHealthRecord(healthRecordId, userId);
            return res.status(200).json({ message: 'Health record deleted successfully' });
        } catch (error) {
            console.error('Error in RecordController.deleteHealthRecord:', error);
            return res.status(500).json({ message: 'Failed to delete health record' });
        }
    }
    
}