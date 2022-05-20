import type Ajv from 'ajv'

type Linter = (source: string) => string

export type CLIState = {
  ajv: Ajv
  cruds: string[],
  status: boolean,
  linter: Record<string, Linter>,
  __dirname: string
}
