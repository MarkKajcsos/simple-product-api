import * as fs from 'fs'
import * as yaml from 'js-yaml'

export const configFromYaml: (file: string) => any = (file: string): any => {
  const data: string = fs.readFileSync(file, 'utf8')
  return yaml.load(data)
}
