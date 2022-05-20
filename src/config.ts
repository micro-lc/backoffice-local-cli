type ConfigOptions = keyof typeof defaultConfig

export const defaultConfig = {
  CRUD_BASE_DIR: 'mocks/cruds', MOCKS_PATH: 'mocks/mocks.json'
}

class CLIContext {
  config: Record<ConfigOptions, string>

  constructor() {
    this.config = Object.entries(defaultConfig).reduce(function (c, [k, v]) {
      c[k as ConfigOptions] = v
      return c
    }, {} as Record<string, string>) as Record<ConfigOptions, string>
  }

  set (key: ConfigOptions, val: string) {
    if(!Object.keys(this.config).includes(key as ConfigOptions)) {
      throw TypeError(`${key} is not available as configuration options`)
    }

    this.config[key as ConfigOptions] = val
  }
  
  get (key: ConfigOptions) {
    if(!Object.keys(this.config).includes(key as ConfigOptions)) {
      throw TypeError(`${key} is not available as configuration options`)
    }

    return this.config[key as ConfigOptions]
  }
}

const context = new CLIContext()

export default context
