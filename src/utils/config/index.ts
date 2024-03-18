import { Config } from '../../model/config'
import { configFromYaml } from './config.from.yaml'
import { CONFIG_PATH, SERVICE_NAME, SERVICE_VERSION } from './defaults'

const config: Config = configFromYaml(CONFIG_PATH)
config.app = Object.assign(
  {
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  },
  config.app
)


export default config