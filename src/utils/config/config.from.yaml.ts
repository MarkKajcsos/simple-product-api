import * as yaml from 'js-yaml'
import * as fs from 'fs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configFromYaml: (file: string) => any = (file: string): any => {
  const data: string = fs.readFileSync(file, 'utf8')
  return yaml.load(data)
}
