import inquirer from 'inquirer'

export type Modes = 'add-crud' | 'delete-crud' | 'actions' | 'exit'

export const modeQuestions = async (): Promise<Modes> => {
  const questions = [
    {
      name: 'mode',
      type: 'list',
      choices: [
        {
          name: 'Add new CRUD',
          value: 'add-crud'
        }, 
        {
          name: 'Delete existing CRUD',
          value: 'delete-crud'
        },
        {
          name: 'Pre-configured actions',
          value: 'actions'
        },
        {
          name: 'Exit',
          value: 'exit'
        }
      ],
      message: 'What you\'re up to?'
    },
  ]
  return inquirer.prompt(questions).then(({mode}) => mode)
}
