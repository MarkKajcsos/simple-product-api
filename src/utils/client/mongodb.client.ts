import { MongoClient } from 'mongodb';
import { MongoDBConfig } from '../../model/config';


export class MongoDBClient {
    private static client: MongoDBClient
    private mongoClient: MongoClient | null = null
    private readonly config: MongoDBConfig

    constructor(config: MongoDBConfig) {
        this.config = config
    }

    static async getInstance(config: MongoDBConfig): Promise<MongoDBClient> {
        if(!MongoDBClient.client){
            MongoDBClient.client = new MongoDBClient(config)
            await MongoDBClient.client.connect()
        }
        return MongoDBClient.client
    }

    static async closeInstance(): Promise<void> {
        return await MongoDBClient.client.close()
    }

    private async connect(): Promise<void> {
        console.log('MongoDBClient.connect: Connecting to MongoDB ...');
        try {
            let mongoClient = new MongoClient(this.config.url);
            this.mongoClient = await mongoClient.connect();
            if (this.mongoClient === undefined) {
                throw new Error('DbClient: invalid database configuration please check the documentation')
            }            
            console.log('MongoDBClient.connect: Connected');
        } catch (error) {
            const msg = `MongoDBClient.connect: Connection failed! - ${error}`
            console.error(msg);
            throw new Error(msg)
        }
    }

    public async close(): Promise<void> {
        if(MongoDBClient.client?.mongoClient){
            console.log('MongoDBClient.close: closing connection...')
            await MongoDBClient.client.mongoClient.close()
            console.log('MongoDBClient.close: Connection closed')
        } else {
            console.log('MongoDBClient.close: MongoClient instance not found.')
        }
    }
}

export default MongoDBClient;
