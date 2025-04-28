import { HealthRecord } from "@prisma/client";
import { PatientNotFoundError } from "../errors/customErrors";
import { prisma } from "../prisma";
import { EthereumService } from "../utils/ethereumService";

export interface UploadHealthRecordResponse {
    message: string,
    record: {
        id: string,
        patientId: string,
        name: string,
        size: number,
    }
}

export interface HealthRecordWithoutActualData {
    id: string,
    patientId: string,
    recordName: string,
    size: number,
    createdAt: Date,
    updatedAt: Date,
    isHashVerified: boolean
}

export interface GetAllHealthRecordsOfUserResponse {
    records: HealthRecordWithoutActualData[]
    totalCount: number
}

export interface GetHealthRecordByIdResponse {
    record: HealthRecordWithoutActualData,
}

export interface RecordHistoryResponse {
    record: HealthRecordWithoutActualData;
    changes: {
        changeType: string;
        description: string;
        userName: string;
        userRole: string;
        changedBy: string;
        timestamp: Date;
        transactionHash: string;
    }[];
}

export class RecordService {

    static async uploadHealthRecord(
        userId: string, 
        recordData: Buffer, 
        patientEmail: string, 
        fileName: string, 
        fileSize: number,
        recordType: 'FILE' | 'FORM',
        mimeType: string
    ): Promise<UploadHealthRecordResponse> {
        try {
            const patient = await prisma.user.findUnique({ 
                where: { email: patientEmail, role: 'PATIENT' } 
            })
            if(!patient) {
                throw new PatientNotFoundError();
            }

            // Calculate data hash
            const crypto = require('crypto');
            const dataHash = crypto.createHash('sha256')
                .update(recordData)
                .digest('hex');

            const result = await prisma.$transaction(async (prisma) => {
                // Create the health record
                const record = await prisma.healthRecord.create({
                    data: {
                        patientId: patient.id,
                        recordData: recordData,
                        recordName: fileName,
                        recordSize: fileSize,
                        recordType: recordType,
                        dataHash: dataHash,
                        mimeType: mimeType,
                        isHashVerified: true
                    }
                });

                // Award points to the user
                await prisma.user.update({
                    where: { id: patient.id },
                    data: {
                        points: {
                            increment: 100
                        }
                    }
                });

                return record;
            });

            // Store the change on Ethereum and in our database
            // const txHash = await EthereumService.storeRecordChange(
            //     patient.id,
            //     result.id,
            //     'CREATED',
            //     `Created health record: ${fileName}`
            // );
            const txHash = '';

            await prisma.healthRecordChange.create({
                data: {
                    healthRecordId: result.id,
                    changedById: userId,
                    changeType: 'CREATED',
                    description: `Created health record: ${fileName}`,
                    transactionHash: txHash
                }
            });

            return {
                message: "Health record uploaded successfully",
                record: {
                    id: result.id,
                    patientId: patient.id,
                    name: result.recordName,
                    size: result.recordSize,
                }
            }
        } catch (error) {
            console.error("Error in RecordService.uploadHealthRecord:", error);
            throw new Error("Failed to upload health record");
        }
    }

    static async getHealthRecordsByUser(userId: string) : Promise<GetAllHealthRecordsOfUserResponse>{
        try {
            const healthRecords: HealthRecord[] = await prisma.healthRecord.findMany({ where: { patientId: userId } })
            
            const crypto = require('crypto');
            const healthRecordsWithoutData: HealthRecordWithoutActualData[] = healthRecords.map(record => {
                // Verify hash for each record
                const currentHash = crypto.createHash('sha256')
                    .update(record.recordData)
                    .digest('hex');

                const isHashVerified = currentHash === record.dataHash;

                return {
                    id: record.id,
                    patientId: record.patientId,
                    recordName: record.recordName,
                    size: record.recordSize,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    isHashVerified: isHashVerified
                }
            })

            const response: GetAllHealthRecordsOfUserResponse = {
                records: healthRecordsWithoutData,
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

            if (!healthRecord) {
                throw new Error("Health record not found");
            }

            // Verify if record data has been tampered with
            const crypto = require('crypto');
            const currentHash = crypto.createHash('sha256')
                .update(healthRecord.recordData)
                .digest('hex');

            const isHashVerified = currentHash === healthRecord.dataHash;

            const healthRecordWithoutData: HealthRecordWithoutActualData = {
                id: healthRecord.id,
                patientId: healthRecord.patientId,
                recordName: healthRecord.recordName,
                size: healthRecord.recordSize,
                createdAt: healthRecord.createdAt,
                updatedAt: healthRecord.updatedAt,
                isHashVerified: isHashVerified
            }
            
            const response: GetHealthRecordByIdResponse = {
                record: healthRecordWithoutData,
            }

            return response
        } catch (error) {
            console.error("Error in RecordService.getHealthRecordById:", error);
            throw new Error("Failed to retrieve health record");
        }
    }

    static async downloadHealthRecordById(healthRecordId: string) : Promise<HealthRecord>{
        try {
            const healthRecord: HealthRecord = await prisma.healthRecord.findUnique({ where: { id: healthRecordId } })
            return healthRecord
        } catch (error) {
            console.error("Error in RecordService.downloadRecord:", error);
            throw new Error("Failed to download health record");
        }
    }

    static async updateHealthRecord(healthRecordId: string, userId: string, updates: any) {
        try {
            const healthRecord = await prisma.healthRecord.update({ 
                where: { id: healthRecordId }, 
                data: updates
            });

            // Store the change on Ethereum and in our database
            // const txHash = await EthereumService.storeRecordChange(
            //     userId,
            //     healthRecordId,
            //     'UPDATED',
            //     `Updated health record: ${healthRecord.recordName}`
            // );
            const txHash = '';

            // Record the change in our database
            await prisma.healthRecordChange.create({
                data: {
                    healthRecordId: healthRecordId,
                    changedById: userId,
                    changeType: 'UPDATED',
                    description: `Updated health record: ${healthRecord.recordName}`,
                    transactionHash: txHash
                }
            });

            return healthRecord;
        } catch (error) {
            console.error("Error in RecordService.updateHealthRecord:", error);
            throw new Error("Failed to update health record");
        }
    }

    static async getRecordChangeHistory(recordId: string) {
        try {
            const changes = await prisma.healthRecordChange.findMany({
                where: { healthRecordId: recordId },
                select: {
                    id: true,
                    changeType: true,
                    description: true,
                    transactionHash: true,
                    createdAt: true,
                    changedBy: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return changes.map(change => ({
                id: change.id,
                changeType: change.changeType,
                description: change.description,
                transactionHash: change.transactionHash,
                changedBy: change.changedBy,
                createdAt: change.createdAt
            }));
        } catch (error) {
            console.error("Error in RecordService.getRecordChangeHistory:", error);
            throw new Error("Failed to retrieve record change history");
        }
    }

    static async getRecordHistory(recordId: string): Promise<RecordHistoryResponse> {
        try {
            // Get record details from database
            const record = await prisma.healthRecord.findUnique({
                where: { id: recordId },
                select: {
                    id: true,
                    patientId: true,
                    recordName: true,
                    recordSize: true,
                    recordData: true,  // Need this to verify hash
                    dataHash: true,    // Need this to verify hash
                    createdAt: true,
                    updatedAt: true,
                    isHashVerified: true
                }
            });

            if (!record) {
                throw new Error('Health record not found');
            }

            // Verify hash
            const crypto = require('crypto');
            const currentHash = crypto.createHash('sha256')
                .update(record.recordData)
                .digest('hex');

            // Get changes from database
            const changes = await prisma.healthRecordChange.findMany({
                where: { healthRecordId: recordId },
                include: {
                    changedBy: {
                        select: {
                            name: true,
                            role: true,
                            ethereumAddress: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            return {
                record: {
                    id: record.id,
                    patientId: record.patientId,
                    recordName: record.recordName,
                    size: record.recordSize,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    isHashVerified: record.isHashVerified
                },
                changes: changes.map(change => ({
                    changeType: change.changeType,
                    description: change.description,
                    userName: change.changedBy.name,
                    userRole: change.changedBy.role,
                    changedBy: change.changedBy.ethereumAddress,
                    timestamp: change.createdAt,
                    transactionHash: change.transactionHash
                }))
            };
        } catch (error) {
            console.error("Error in RecordService.getRecordHistory:", error);
            throw error;
        }
    }

    static async deleteHealthRecord(healthRecordId: string, userId: string) {
        try {
            // First delete all related changes
            await prisma.healthRecordChange.deleteMany({
                where: {
                    healthRecordId: healthRecordId
                }
            });

            // Then delete the health record
            await prisma.healthRecord.delete({
                where: {
                    id: healthRecordId
                }
            });

            // // Store the deletion event on Ethereum
            // await EthereumService.storeRecordChange(
            //     userId,
            //     healthRecordId,
            //     'DELETED',
            //     `Deleted health record`
            // );

        } catch (error) {
            console.error("Error in RecordService.deleteHealthRecord:", error);
            throw new Error("Failed to delete health record");
        }
    }
}
