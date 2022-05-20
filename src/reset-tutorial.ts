import chalk from 'chalk'
import {
  existsSync, readdirSync
} from 'fs'
import fse from 'fs-extra'
import type {
  Answers, QuestionCollection
} from 'inquirer'
import inquirer from 'inquirer'
import {resolve} from 'path'
import type {CLIState} from './types'

export const resetTutorialQuestions = async (): Promise<QuestionCollection<Answers>> => {
  return [
    {
      name: 'confirm',
      type: 'confirm',
      default: false,
      message: 'This routine will swap the content of your backend \
with the content of your ".reset" folder. \
If you tampered with it, this reset won\'t work.\n\
👉 Any extra-file not clashing with the tutorial won\'t be removed.\n\
👉 Please commit before resetting!.\n\
⚠️ Proceed?'
    }
  ]
}

export const handleResetTutorial = async (state: CLIState, questions: QuestionCollection<Answers>): Promise<void> => {
  return inquirer.prompt(questions).then(({confirm}) => {
    state.status = false

    if(!confirm) {
      return
    }

    const src = resolve(state.__dirname, '.reset')
    const dest = resolve(state.__dirname, '.')

    if(!existsSync(src)) {
      console.log(chalk.rgb(253, 134, 18).italic('no ".reset" dir found'))
      return
    }

    readdirSync(src).forEach((path) => {
      fse.copySync(resolve(src, path), resolve(dest, path), {
        overwrite: true, recursive: true
      }) 
    })
    state.status = true
  })
}

