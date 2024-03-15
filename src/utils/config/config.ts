export enum ENVIRONMENT {
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
  INTEGRATION = 'INTEGRATION',
}


export interface Config {
  app: {
    port: number
    host: string
    name: string
    version: string
    environment: ENVIRONMENT
    database: {
      name: string
      user: string
      password: string
      baseUrl: string
      port: string
      collections: {
          product: string
      }
      
        product: string
      
    }
    datasources: {
      product: string
    }
  }
}
