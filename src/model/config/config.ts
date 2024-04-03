import { AppConfig, ImportConfig as ImporterConfig, MongoDBConfig } from '.'

export enum ENVIRONMENT {
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
  INTEGRATION = 'INTEGRATION',
}

export interface Config {
  app: AppConfig
  mongoDB: MongoDBConfig
  importer: ImporterConfig
}
