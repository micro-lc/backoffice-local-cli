import type {
  Answers, QuestionCollection
} from 'inquirer'
import inquirer from 'inquirer'
import {exit} from '../init'
import mkdirp from 'mkdirp'
import {
  join as joinPath, dirname
} from 'path'
import {promises as fsp} from 'fs'
import hb from 'handlebars'
import type {FileWithPath} from '../templates/create-lib/data'
import {
  exec, execSync
} from 'child_process'

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
    },
    {
      name: 'git_init',
      type: 'confirm',
      message: 'Do you want to initialize a git repository?',
      default: true
    },
    {
      name: 'git_remote',
      type: 'input',
      message: 'Choose the git remote (leave empty in case of no remote):',
      when: (answers: any) => answers.git_init
    },
    {
      name: 'docker_image',
      type: 'input',
      message: 'Choose the name of the docker image (leave empty to use the name of the library):'
    }
  ]
}

const handleLibCreation = async (questions: QuestionCollection<Answers>): Promise<void> => {
  const compiler = new TemplateCompiler({options: {
    noEscape: true, recursive: true
  }})
  let answers: Answers = {}

  await inquirer.prompt(questions)
    .then((ans) => {
      if (!ans.docker_image) {
        ans.docker_image = ans.lib_name
      }
      if (!ans.git_remote) {
        ans.git_remote = undefined
      }

      answers = ans

      const {
        lib_name, is_typescript,  git_init, git_remote
      } = answers

      
      const gitUser: Record<string, string> = {}
      exec('git config user.name', (_, output) => gitUser.name = output.trim())
      exec('git config user.email', (_, output) => gitUser.email = output.trim())
      
      compiler.setContext({
        ...answers,
        ts: is_typescript ? 'ts' : 'js',
        gitUser
      })
      compiler.addHelpers({
        'ts?': (str) => is_typescript ? str : '',
        'js?': (str) => !is_typescript ? str : '',
        'git?': (str) => git_init ? str : '',
        'remote?': (str) => git_remote !== undefined ? str : '',
        'ignore': (str) => str
      })

      return mkdirp(`./${lib_name}`)
    })
    .then((dstDir) => {
      if (!dstDir) {
        throw new Error()
      }
      
      const files = import('../templates/create-lib/data').then(({default: fileData}) => {
        const data: FileWithPath[] = []

        fileData.forEach(([fileName, fileContent, recursive = true]) => {
          const dstPath = compiler.compile(joinPath(dstDir, fileName))
          const processedContent = compiler.compile(fileContent, {}, {recursive})
          data.push([dstPath, processedContent])
        })
        return data
      })

      return files
    })
    .then(async (files) => {
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

    }).then(() => {
      const {
        lib_name, git_init, git_remote
      } = answers

      if (lib_name && git_init) {
        execSync('git init', {cwd: `./${lib_name}`})
        if (git_remote !== undefined) {
          execSync(`git remote add origin ${git_remote}`, {cwd: `./${lib_name}`})
          execSync('git fetch origin', {cwd: `./${lib_name}`})
          execSync('git checkout -b main origin/main', {cwd: `./${lib_name}`})
        } else {
          execSync('git checkout -b main', {cwd: `./${lib_name}`})
        }
      }

      execSync('yarn set version stable', {cwd: `./${lib_name}`})

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

  compile (str: string, context?: Record<string, any>, options?: Record<string, any>): string {
    const options_ = {
      ...this.globalOptions, ...options
    }
    const context_ = {
      ...this.gloalContext, ...context
    }

    let compiledStr = hb.compile(str, options_)(context_)
    
    if (options_.recursive) {
      let lastStr = str
      while(compiledStr !== lastStr) {
        lastStr = compiledStr
        compiledStr = hb.compile(compiledStr, options_)(context_)
      }
    }

    return compiledStr
  }
}
