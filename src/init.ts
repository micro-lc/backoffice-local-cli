import chalk from 'chalk'
import {Command} from 'commander'
import figlet from 'figlet'
import {resolve} from 'path'

import context, {defaultConfig} from './config.js'

async function parseArgs (__dirname: string): Promise<Command> {
  const {default: packageFile} = await import('../package.json', {assert: {type: 'json'}})
  const program = new Command()
  program
    .name(packageFile.name)
    .description(packageFile.description)
    .version(packageFile.version)

  program
    .option('-d, --crud-dir <path>', 'path to crud directory', defaultConfig.CRUD_BASE_DIR)
    .option('-m, --mocks <path>', 'path to mocks.json', defaultConfig.MOCKS_PATH)
    .action((str) => {
      Object.entries(str).forEach(function ([k, v]) {
        switch (k) {
        case 'crudDir':
          typeof v === 'string' && context.set('CRUD_BASE_DIR', resolve(__dirname, v))
          break
        case 'mocks':
          typeof v === 'string' && context.set('MOCKS_PATH', resolve(__dirname, v))
          break
        default:
          break
        } 
      }, context)
    })

  return program.parse()
}

export const init = async (__dirname: string) => {
  await parseArgs(__dirname)
  console.log(
    chalk.green(
      figlet.textSync('BO :: MGMT', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  )
}

export const exit = (num?: number, msg = 'Bye!') => {
  console.log(chalk.green(msg))
  process.exit(num)
}
