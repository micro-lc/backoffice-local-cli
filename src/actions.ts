import inquirer, {
  Answers, QuestionCollection
} from 'inquirer'
import {
  handleAddNotifications, handleRemoveNotifications
} from './notifications.js'
import type {CLIState} from './types'

type HandlerContext = {
  state: CLIState,
  questions: QuestionCollection<Answers>
}

export async function actionQuestions (state: CLIState): Promise<HandlerContext> {
  return {
    state, questions: [
      {
        name: 'action',
        type: 'list',
        choices: [
          {
            name: 'Add notifications', value: 'add-notifications'
          },
          {
            name: 'Remove notifications', value: 'remove-notifications'
          }
        ]
      },
      {
        name: 'notifications_crud_name',
        type: 'input',
        default: 'notifications',
        message: (answers) => {
          switch(answers.action) {
          case 'add-notifications':
            return 'Choose the CRUD name to assign to notifications:'
          case 'remove-notifications':
          default:
            return 'Which CRUD was used by notifications?'
          }
        },
        when: (answers) => ['add-notifications', 'remove-notifications'].includes(answers.action),
        validate: (input: any, answers: Answers) => {
          if(typeof input !== 'string' || input.trim() === '') {
            return 'Invalid input'
          }

          const i = input.trim().replace(/\.js$/, '')

          switch(answers.action) {
          case 'add-notifications':
            return !state.cruds.includes(`${i}.js`) || `${i} is already defined as a CRUD collection`
          case 'remove-notifications':
          default:
            return state.cruds.includes(`${i}.js`) || `There's no "${i}" CRUD`
          } 
        }
      }
    ]
  }
}

export async function handleAction ({
  state, questions
}: HandlerContext): Promise<CLIState> {
  return inquirer.prompt(questions).then(({
    action, ...rest
  }) => {
    switch (action) {
    case 'add-notifications':
      return handleAddNotifications(state, rest)
    case 'remove-notifications':
    default:
      return handleRemoveNotifications(state, rest)
    }
  })
}
