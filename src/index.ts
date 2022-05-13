import Ajv from 'ajv'
import chalk from 'chalk'
import prettier from 'prettier'
import log from './logger.js'
import {
  exit, init
} from './init.js'
import {modeQuestions} from './mode.js'
import type {CLIState} from './types'
import {
  createQuestions, handleCrudCreation, handleCrudRemoval, listCruds, removeQuestions
} from './cruds.js'
import {
  actionQuestions, handleAction
} from './actions.js'

export default async (__dirname: string) => {
  // show script introduction
  await init(__dirname)
  const mode = await modeQuestions()
  const state: Partial<CLIState> = {
    ajv: new Ajv(),
    status: false, 
    linter: {
      json: (source: string) => prettier.format(source, {parser: 'json'}),
      js: (source: string) => prettier.format(source, {
        parser: 'espree', semi: false, singleQuote: true
      })
    },
    __dirname
  }

  switch (mode) {
  case 'add-crud': 
  {
    const cruds = await listCruds()
    log(chalk.blue('\n=== Creating a new CRUD ===\n'))
    
    state.cruds = cruds
    await createQuestions(state as CLIState)
      .then((q) => handleCrudCreation(state as CLIState, q))
    break
  }
  case 'delete-crud': 
  {
    const cruds = await listCruds()
    console.log(chalk.blue('\n=== Removing an existing CRUD ===\n'))
    
    state.cruds = cruds
    await removeQuestions(state as CLIState)
      .then((q) => handleCrudRemoval(state as CLIState, q))
    break
  }
  case 'actions':
  {
    const cruds = await listCruds(false)
    state.cruds = cruds
    await actionQuestions(state as CLIState)
      .then(handleAction)
    break
  }
  case 'exit':
  default:
    break
  }
  
  state.status && console.log(chalk.greenBright.bold('Done!'))
  exit()
}
