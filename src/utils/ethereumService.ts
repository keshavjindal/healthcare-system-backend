import { ethers } from 'ethers';
import { prisma } from '../prisma';
import * as dotenv from 'dotenv';

dotenv.config();

// ABI for the deployed RecordChanges contract
const CONTRACT_ABI = [
    "function recordChange(string recordId, string changeType, string description, string userName, string userRole) public",
    "function getChangesMade(address _address) external view returns (uint256)",
    "function pause() external",
    "function unpause() external",
    "function owner() public view returns (address)",
    "function paused() public view returns (bool)",
    "event RecordChanged(string recordId, string changeType, string description, string userName, string userRole, address indexed changedBy, uint256 timestamp)"
];

type RecordChangesContract = ethers.Contract & {
    recordChange(
        recordId: string,
        changeType: string,
        description: string,
        userName: string,
        userRole: string
    ): Promise<ethers.ContractTransactionResponse>;
    getChangesMade(address: string): Promise<bigint>;
    owner(): Promise<string>;
    paused(): Promise<boolean>;
    pause(): Promise<ethers.ContractTransactionResponse>;
    unpause(): Promise<ethers.ContractTransactionResponse>;
}

export class EthereumService {
    private static provider = new ethers.JsonRpcProvider(process.env.QUICKNODE_SEPOLIA_TESTNET_URL);
    private static contract: RecordChangesContract;
    private static TEST_ETH_AMOUNT = "0.0001"; // Amount of test ETH to send to new accounts

    private static getContract(signer?: ethers.Signer): RecordChangesContract {
        if (!this.contract) {
            const contractAddress = process.env.RECORD_CHANGES_CONTRACT_ADDRESS;
            if (!contractAddress) {
                throw new Error('Contract address not found in environment variables');
            }
            
            this.contract = new ethers.Contract(
                contractAddress,
                CONTRACT_ABI,
                signer || this.provider
            ) as unknown as RecordChangesContract;
        }
        return signer ? (this.contract.connect(signer) as unknown as RecordChangesContract) : this.contract;
    }

    static async sendTestEther(toAddress: string): Promise<string> {
        try {
            const funderPrivateKey = process.env.FUNDER_PRIVATE_KEY;
            if (!funderPrivateKey) {
                throw new Error('Funder private key not found in environment variables');
            }

            const funderWallet = new ethers.Wallet(funderPrivateKey, this.provider);
            
            // Check funder's balance
            const funderBalance = await this.provider.getBalance(funderWallet.address);
            const requiredAmount = ethers.parseEther(this.TEST_ETH_AMOUNT);
            
            if (funderBalance < requiredAmount) {
                throw new Error('Funder account has insufficient balance');
            }

            console.log(`Sending ${this.TEST_ETH_AMOUNT} test ETH to ${toAddress}...`);
            
            const tx = await funderWallet.sendTransaction({
                to: toAddress,
                value: requiredAmount
            });

            console.log('Waiting for transaction confirmation...');
            const receipt = await tx.wait();
            console.log(`Test ETH sent successfully. TX Hash: ${receipt.hash}`);
            
            return receipt.hash;
        } catch (error) {
            console.error('Error sending test ETH:', error);
            throw new Error('Failed to send test ETH');
        }
    }

    static async storeRecordChange(
        userId: string,
        recordId: string,
        changeType: 'CREATED' | 'UPDATED' | 'DELETED',
        description: string
    ): Promise<string> {
        try {
            // Get user's ethereum address and password
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { 
                    ethereumAddress: true, 
                    encryptedJSON: true,
                    password: true,
                    name: true,
                    role: true
                }
            });

            if (!user?.ethereumAddress || !user?.encryptedJSON) {
                throw new Error('User does not have an Ethereum wallet configured');
            }

            console.log('Attempting to decrypt wallet...');
            
            // Create wallet instance from encrypted JSON using the user's password
            const wallet = await ethers.Wallet.fromEncryptedJson(
                user.encryptedJSON,
                user.password
            );
            
            console.log('Wallet decrypted successfully!');
            
            // Connect wallet to provider and get contract instance
            const connectedWallet = wallet.connect(this.provider);
            const contract = this.getContract(connectedWallet);

            // Check if contract is paused
            const isPaused = await contract.paused();
            if (isPaused) {
                throw new Error('Contract is currently paused');
            }

            console.log('Sending transaction to record change...');
            const tx = await contract.recordChange(
                recordId,
                changeType,
                description,
                user.name,
                user.role
            );

            console.log('Waiting for transaction confirmation...');
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.hash);
            
            return receipt.hash;
        } catch (error) {
            console.error('Error in EthereumService.storeRecordChange:', error);
            throw new Error('Failed to store record change on Ethereum');
        }
    }

    static async getRecordChangeByTxHash(txHash: string): Promise<any> {
        try {
            console.log(`Fetching transaction receipt for hash: ${txHash}`);
            const receipt = await this.provider.getTransactionReceipt(txHash);
            if (!receipt) {
                console.log('Transaction receipt not found');
                return null;
            }

            const contract = this.getContract();
            
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    });

                    if (parsedLog?.name === 'RecordChanged') {
                        const { args } = parsedLog;
                        return {
                            recordId: args[0],
                            changeType: args[1],
                            description: args[2],
                            userName: args[3],
                            userRole: args[4],
                            changedBy: args[5],
                            timestamp: new Date(Number(args[6]) * 1000),
                            transactionHash: txHash
                        };
                    }
                } catch (e) {
                    continue; // Skip logs that can't be parsed
                }
            }
            
            console.log('No RecordChanged event found in transaction');
            return null;
        } catch (error) {
            console.error('Error fetching record change:', error);
            return null;
        }
    }

    static async getChangesMadeByAddress(address: string): Promise<number> {
        try {
            const contract = this.getContract();
            const count = await contract.getChangesMade(address);
            return Number(count);
        } catch (error) {
            console.error('Error getting changes count:', error);
            return 0;
        }
    }

    static async isContractPaused(): Promise<boolean> {
        try {
            const contract = this.getContract();
            return await contract.paused();
        } catch (error) {
            console.error('Error checking contract pause status:', error);
            return false;
        }
    }
} 