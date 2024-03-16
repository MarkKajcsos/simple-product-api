import mongoose, { Connection } from 'mongoose';
import { MongoDBConfig } from '../../model/config';


export class MongoDBClient {
    private static client: MongoDBClient
    private connection: Connection | null = null
    private readonly config: MongoDBConfig

    constructor(config: MongoDBConfig) {
        this.config = config
    }

    public static async getInstance(config: MongoDBConfig): Promise<MongoDBClient> {
        if(!MongoDBClient.client){
            MongoDBClient.client = new MongoDBClient(config)
            await MongoDBClient.client.connect()
        }
        return MongoDBClient.client
    }

    public static async closeInstance(): Promise<void> {
        return await MongoDBClient.client.close()
    }

    async connect(): Promise<void> {
        console.log('MongoDBClient.connect: Connecting to MongoDB ...');
        try {
            mongoose.connect(this.config.url);
            this.connection = mongoose.connection;
            if (this.connection === undefined) {
                throw new Error('DbClient: invalid database configuration please check the documentation')
            }            
            console.log('MongoDBClient.connect: Connected');
        } catch (error) {
            const msg = `MongoDBClient.connect: Connection failed! - ${error}`
            console.error(msg);
            throw new Error(msg)
        }
    }

    async close(): Promise<void> {
        if(this.connection){
            console.log('MongoDBClient.close: closing connection...')
            await this.connection.close()
            console.log('MongoDBClient.close: Connection closed')
        } else {
            console.log('MongoDBClient.close: No connectin found.')
        }
    }
}

export default MongoDBClient;
