import type {
  Answers, QuestionCollection
} from 'inquirer'
import inquirer from 'inquirer'
import {exit} from './init'
import mkdirp from 'mkdirp'
import {
  join as joinPath, dirname
} from 'path'
import {promises as fsp} from 'fs'
import hb from 'handlebars'
import type {FileWithPath} from './templates/createlib/data'
import {exec} from 'child_process'

export default async () => {
  
  // init
  
  const questions = createQuestions()
  await handleLibCreation(questions)
  
  exit()
}


const createQuestions = (): QuestionCollection<Answers> => {
  return [
    {
      name: 'lib_name',
      type: 'input',
      message: 'Choose the name:',
      validate: (input: any) => typeof input === 'string' && input.length > 0 // TODO check if lib_name already exists and is valid
    },
    {
      name: 'is_typescript',
      type: 'confirm',
      message: 'Do you want to use typeScript?',
      default: true
    }
  ]
}

const handleLibCreation = async (questions: QuestionCollection<Answers>): Promise<void> => {
  const compiler = new TemplateCompiler({options: {noEscape: true}})

  await inquirer.prompt(questions)
    .then((answers) => {
      const {
        lib_name, is_typescript
      } = answers

      compiler.setContext({
        ...answers, ts: is_typescript ? 'ts' : 'js'
      })
      compiler.addHelpers({
        'ts?': (str) => is_typescript ? str : '',
        'js?': (str) => is_typescript ? '' : str,
      })

      return Promise.all([mkdirp(`./${lib_name}`), answers])
    })
    .then(([dstDir, answers]) => {
      if (!dstDir) {
        throw new Error()
      }
      
      const files = import('./templates/createlib/data').then(({
        common, typeScript
      }) => {
        const data: FileWithPath[] = []
        
        const files = answers.is_typescript ? {
          ...common, ...typeScript
        } : common

        Object.values(files).forEach(([fileName, fileContent]) => {
          const dstPath = compiler.compile(joinPath(dstDir, fileName))
          const processedContent = compiler.compile(fileContent)
          data.push([dstPath, processedContent])
        })
        return data
      })

      return Promise.all([files, answers])
    })
    .then(async ([files, answers]) => {
      const promises: Promise<void>[] = []
      files?.forEach(([filePath, fileContent]) => {
        const dir = dirname(filePath)
        promises.push(
          fsp.mkdir(dir, {recursive: true}).then(() =>
            fsp.writeFile(filePath, fileContent)
          )
        )
      })
      await Promise.all(promises)

      return answers

    }).then((answers) => {
      if (answers && answers.lib_name) {
        exec(`cd ${answers.lib_name}`, (_, err) => console.error(err))
        exec('git init', (_, err) => console.error(err))
      }
    })
    .catch((err) => {
      console.error(err)
      throw new Error(err)
    })
}

type HelperCallback = (str: string) => string

type TemplateCompilerProps = {
  context?: Record<string, any>,
  helpers?: Record<string, HelperCallback>,
  options?: Record<string, any>
}
class TemplateCompiler {
  private globalOptions: Record<string, any> = {}
  private gloalContext: Record<string, any> = {}

  constructor (props: TemplateCompilerProps = {}) {
    const {
      context, helpers, options
    } = props

    if (context) {
      this.gloalContext = context
    }

    if (helpers) {
      Object.entries(helpers).forEach(([key, callBack]) => {
        hb.registerHelper(key, callBack)
      })
    }

    if (options) {
      this.globalOptions = options
    }
  }

  addHelper (name: string, helper: HelperCallback) {
    hb.registerHelper(name, helper)
  }
  addHelpers (helpers: Record<string, HelperCallback>) {
    Object.entries(helpers).forEach(([key, callBack]) => {
      hb.registerHelper(key, callBack)
    })
  }
  setOptions (options: Record<string, any>) {
    this.globalOptions = options
  }
  setContext (context: Record<string, any>) {
    this.gloalContext = context
  }
  
  compile (str: string, context?: Record<string, any>, options?: Record<string, any>) {
    const options_ = {
      ...this.globalOptions, ...options
    }
    const context_ = {
      ...this.gloalContext, ...context
    }
    return hb.compile(str, options_)(context_)
  }
}
