export const CONFIG_PATH = process.env.CONFIG_PATH || './resources/configuration.yaml'
export const NODE_ENV: string = process.env.NODE_ENV || 'development'
export const SERVICE_VERSION: string = process.env.npm_package_version || process.env.SERVICE_VERSION || 'unknown'
export const SERVICE_NAME: string =
  process.env.npm_package_name || process.env.SERVICE_NAME || 'Simple product service'

