import {dirname} from 'path'
import {fileURLToPath} from 'url'
import cli from '../mgmt.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = process.env.PWD ?? dirname(__filename)

cli(__dirname).catch((reason) => {
  // any error
  console.error(reason)
})
