import { AppConfig, MongoDBConfig } from "."

export enum ENVIRONMENT {
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
  INTEGRATION = 'INTEGRATION',
}


export interface Config {
  app: AppConfig
  mongoDBConfig: MongoDBConfig
}
