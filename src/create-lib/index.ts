// import {dirname} from 'path'
// import {fileURLToPath} from 'url'
import cli from './createlib.js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = process.env.PWD ?? dirname(__filename)

cli().catch((reason) => {
  // any error
  console.error(reason)
})
