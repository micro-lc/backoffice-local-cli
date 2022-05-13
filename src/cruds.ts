import chalk from 'chalk'
import {existsSync} from 'fs'
import {
  readdir, readFile, writeFile, rm
} from 'fs/promises'
import inquirer, {
  Answers, QuestionCollection
} from 'inquirer'
import mkdirp from 'mkdirp'
import {resolve} from 'path'
import stripJsonComments from 'strip-json-comments'
import {exit} from './init.js'
import log from './logger.js'
import {CLIState} from './types'
import context from './config.js'
import {JSONType} from 'ajv'

const CRUD_BASE_DIR = context.get('CRUD_BASE_DIR')
const MOCKS_PATH = context.get('MOCKS_PATH')

const existsAlready = (cruds: string[], input: any) => {
  const i = typeof input === 'string' ? input.replace(/\.[^.]$/, '') : input
  const c = cruds.map((name) => name.replace(/\.[^.]+$/, ''))

  if(i === '') {
    return 'Name cannot be empty or a trailing extension'
  }

  if(typeof i === 'string') {
    return !c.includes(i) || `This will spawn a new CRUD @ ${CRUD_BASE_DIR} hence the new name mustn't conflict with existing ones. Probably ${chalk.red.underline(i + '.js')} already exists.`
  }

  return 'Invalid input'
}

const comment = (flag = true) => `${flag ? '// ' : ''}`

const crudDefaultKeys = ['_id', '__STATE__', 'creatorId', 'createdAt', 'updaterId', 'updatedAt']
const supportedFormats = ['first-name', 'name', 'last-name', 'surname']

const createCrud = (name: string, _: string, opts: Record<string, any>, schema?: Record<string, any>): string => {
  const includes: string[] = []
  const generators: Record<string, string> = {} 
  if(schema && schema.properties && Object.keys(schema.properties).filter((k) => !crudDefaultKeys.includes(k)).length > 0) {
    // there are extra keys
    Object.entries(schema.properties).forEach(([k, schema]) => {
      const {type} = schema as Record<string, any>
      let {format} = schema as Record<string, any>

      if(!format) {
        format = type
      }

      switch (format as typeof supportedFormats & JSONType) {
      case 'string':
        includes.indexOf('genString') || includes.push('genString')
        generators[k] = 'genString(10)'
        break
      default:
        break
      }
    })
  }


  const generatorsPath = '../utils/generators'
  const cPath = '../utils/crud-interface'
  const upper = name.charAt(0).toUpperCase() + name.substring(1)
  const header = `
const ${upper} = require('${cPath}')
const {
  ${comment(schema === undefined)}crudBaseGenerator,
} = require('${generatorsPath}')
`
  const mockFunction = `
const mock${upper} = (quantity) => Array(quantity).fill(0).map(() => {
  return {
    ${comment(schema === undefined)}...crudBaseGenerator(),
  }
})
`
  const footer = `
const ${name} = new ${upper}(${opts.quantity}, mock${upper}, ${opts.sorting})

module.exports = ${name}
`
  return [header, mockFunction, footer].join('\n')
  // writeFileSync(resolve(`./mocks/cruds/${name}.js`), collection)
  // return true
}

const routeTemplates = ['-get', '-get-by-id', '-add-new', '-stream']
const variants = [':ok', ':ko']

const addRoutes = (mocks: any, name: string): string => {
  const [{
    id, routesVariants
  }, ...rest] = mocks
  const newRoutes = variants.reduce((a, v) => {
    routeTemplates.forEach((t) => a.push(`${name}${t}${v}`))
    return a
  }, [] as string[])
  return JSON.stringify([{
    id, routesVariants: [...routesVariants, ...newRoutes]
  }, ...rest])
}

const removeRoutes = (mocks: any, name: string): string => {
  const [{
    id, routesVariants
  }, ...rest] = mocks
  let rv = routesVariants as string[]
  variants.forEach((v) => {
    routeTemplates.forEach((t) => {
      const toBeRemoved = `${name}${t}${v}`
      rv = rv.filter((r) => r !== toBeRemoved)
    })
  })
  return JSON.stringify([{
    id, routesVariants: [...rv]
  }, ...rest])
}

export const listCruds = async (print = true): Promise<string[]> => {
  const cruds = await readdir(CRUD_BASE_DIR).catch((reason) => {
    const questions = [{
      name: 'mkdirp',
      type: 'confirm',
      message: `${CRUD_BASE_DIR} does not exist. Do you want to create it?`
    }]
    return inquirer.prompt(questions).then(({mkdirp: shouldCreate}) => {
      if (shouldCreate) {
        return mkdirp(CRUD_BASE_DIR).then(() => {
          return readdir(CRUD_BASE_DIR)
        })
      } else {
        throw new TypeError(reason)
      }
    })
  })

  if(!print) {
    return cruds
  }
  
  if(cruds.length > 0) {
    log(chalk.whiteBright(`available CRUDs @ ${CRUD_BASE_DIR}:`).concat('\n'))
    log(chalk.blue(cruds.join('\n')))
  } else {
    log(chalk.whiteBright.underline('no available CRUD'))
  }

  log('\n')
  return cruds
}

export const createQuestions = async (state: CLIState): Promise<QuestionCollection<Answers>> => {
  const [baseSchema, textBaseSchema] = await import('./templates/base_schema.json', {assert: {type: 'json'}}).then(({default: baseSchema}) => {
    return Promise.all([Promise.resolve(baseSchema), state.linter.json(JSON.stringify(baseSchema))])
  }) as [typeof import('./templates/base_schema.json'), string]

  return [
    {
      name: 'crud_name',
      type: 'input',
      message: 'Choose the name:',
      validate: (input: any) => existsAlready(state.cruds, input)
    },
    {
      name: 'crud_endpoint',
      type: 'input',
      message: 'Choose endpoint:',
      default: (answers: any) => answers.crud_name,
      validate: (input: any) => typeof input === 'string' && input !== '' || 'Invalid input'
    },
    {
      name: 'has_schema',
      type: 'confirm',
      message: 'Do you already have a schema to provide?',
      default: false
    },
    {
      name: 'which_schema',
      type: 'list',
      choices: ['editor', 'file'],
      default: 'editor',
      message: 'How you wanna insert the schema:',
      when: (answers: any) => answers.has_schema
    },
    {
      name: 'editor_schema',
      message: 'Open editor:',
      type: 'editor',
      default: textBaseSchema,
      postfix: 'jsonc',
      validate: (input: any) => {
        try {
          return state.ajv.compile(JSON.parse(stripJsonComments(input))) !== undefined
        } catch (err) {
          return `${err}`
        }
      },
      when: (answers: any) => answers.which_schema === 'editor'
    },
    {
      name: 'file_schema',
      message: 'Type the schema file path',
      default: 'templates/base_schema.json',
      type: 'input',
      validate: (input: any) => {
        if (typeof input !== 'string') {
          return 'Invalid input'
        }

        let path = input
        if(!input.match(/^\//)) {
          path = resolve(state.__dirname, input)
        }

        if(!existsSync(path)) {
          return `${path} do not exists or you don't have permission`
        }

        try {
          return state.ajv.compile(baseSchema) !== undefined
        } catch (err) {
          return `${err}`
        }
      },
      when: (answers: any) => answers.which_schema === 'file',
    },
    {
      name: 'quantity',
      message: 'How many mocks do you want to assign to this collection?',
      default: 1000,
      type: 'number',
      validate: (input: any) => typeof input === 'number' && input >= 0 || 'Quantity must be non-negative'
    },
    {
      name: 'sorting',
      message: 'Do you want to enforce "oldest first" sorting on GET?',
      default: true,
      type: 'confirm'
    },
    {
      name: 'proceed',
      message: 'Proceed?',
      default: false,
      type: 'confirm'
    }
  ]
}

export const handleCrudCreation = async (state: CLIState, questions: QuestionCollection<Answers>): Promise<void> => {
  return inquirer.prompt(questions).then((answers): Promise<[Answers, Buffer | undefined]> => {
    const {
      has_schema, which_schema, file_schema
    } = answers
    if(has_schema && which_schema === 'file' && typeof file_schema === 'string') {
      return Promise.all([answers, readFile(file_schema)])
    }

    return Promise.all([answers, undefined])
  }).then(([{
    crud_name,
    crud_endpoint,
    has_schema,
    which_schema,
    editor_schema,
    quantity,
    sorting,
    proceed
  }, file]) => {
    if(!proceed) {
      exit()
    }

    let schema
    if(has_schema) {
      if(which_schema === 'editor') {
        schema = JSON.parse(stripJsonComments(editor_schema))
      } else {
        file && (schema = JSON.parse(stripJsonComments(file.toString())))
      }
    }

    const crudPath = resolve(state.__dirname, CRUD_BASE_DIR, `${crud_name}.js`)
    const collectionPromise = Promise.resolve(createCrud(crud_name, crud_endpoint, {
      quantity, sorting
    }, schema))
      .then((content) => state.linter.js(content))
      .then((content) => writeFile(crudPath, content))

    const mocksPath = resolve(state.__dirname, MOCKS_PATH)
    const routesPromise = readFile(mocksPath)
      .then((buf) => JSON.parse(buf.toString()))
      .then((mocks) => addRoutes(mocks, crud_name))
      .then((content) => state.linter.json(content))
      .then((content) => writeFile(mocksPath, content))

    return Promise.all([
      Promise.resolve({
        crudPath, mocksPath
      }),
      collectionPromise,
      routesPromise
    ])
  }).then(([{
    crudPath, mocksPath
  }]) => {
    state.status = true
    console.log(chalk.rgb(253, 134, 18).italic(`new CRUD: ${crudPath}`))
    console.log(chalk.rgb(253, 134, 18).italic(`edited mocks: ${mocksPath}`))
  })
}

export const removeQuestions = async (state: CLIState): Promise<QuestionCollection<Answers>> => {
  return [
    {
      name: 'crud_to_remove',
      type: 'list',
      message: 'Choose which crud to remove:',
      choices: state.cruds
    },
    {
      name: 'proceed',
      message: 'Proceed?',
      default: false,
      type: 'confirm'
    }
  ]
}

export const handleCrudRemoval = async (state: CLIState, questions: QuestionCollection<Answers>): Promise<void> =>
  inquirer.prompt(questions).then(async ({
    crud_to_remove, proceed
  }) => {
    if(!proceed) {
      exit()
    }
    
    const crudPath = resolve(state.__dirname, CRUD_BASE_DIR, crud_to_remove)
    const removePromise = rm(crudPath)

    const mocksPath = resolve(state.__dirname, MOCKS_PATH)
    const crud_name = crud_to_remove.replace(/\.js$/, '')
    const routesPromise = readFile(mocksPath)
      .then((buf) => JSON.parse(buf.toString()))
      .then((mocks) => removeRoutes(mocks, crud_name))
      .then((content) => state.linter.json(content))
      .then((content) => writeFile(mocksPath, content))

    return Promise.all([
      Promise.resolve({
        crud_name, mocksPath
      }),
      removePromise,
      routesPromise
    ]).then(([{
      crud_name, mocksPath
    }]) => {
      state.status = true
      console.log(chalk.rgb(253, 134, 18).italic(`removed CRUD: ${crud_name}`))
      console.log(chalk.rgb(253, 134, 18).italic(`edited mocks: ${mocksPath}`))
    })
  })


