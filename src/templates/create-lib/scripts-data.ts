import type {FileWithPath} from './data'

const templates: FileWithPath = ['./scripts/new-cmp/templates/template.{{ts}}', 
  `{{ts? "type FileWithPath = [string, string]"}}
const webc{{ts? ": FileWithPath"}} = ['{{ignore "{{componentName}}"}}{{ignore "{{ext}}"}}',
  \`import {BkBase} from '@micro-lc/back-kit-engine/base'
{{ts? "import type {TemplateResult} from 'lit'"}}
import {html} from 'lit-html'
import {
  customElement, state, property
} from 'lit/decorators.js'

import {
  emitLoading, listensToLoadingData
} from './{{ignore "{{componentName}}"}}.lib'

/**
 * @component
 * @title {{ignore "{{componentName}}"}}
 * @description briefly describe your component here
 */
{{ts? "@customElement('{{componentName}}')"}}
export class {{ignore "{{componentNameCamel}}"}} extends BkBase {
  
  {{ts? "@state() message?: string"}}
  {{ts? "@property() loadingMessage = 'Loading...'"}}
  {{ts? "@property() listeningMessage = 'Listening...'"}}

  {{js? "static get properties() {"}}
  {{js? "  return  {"}}
  {{js? "    loadingMessage: '',"}}
  {{js? "    listeningMessage: '',"}}
  {{js? "    message: ''"}}
  {{js? "  }"}}
  {{js? "}"}}

  loading = false
  onClick = emitLoading.bind(this)

  constructor () {
    super(
      listensToLoadingData // also accepts an array of functions
    )
    {{js? "this.loadingMessage = 'Loading...'"}}
    {{js? "this.listeningMessage = 'Listening...'"}}
  }

  {{ts? "protected "}}render (){{ts? ": TemplateResult"}} {
    return html\\\`<div>
      <button
        .onclick=\\\${this.onClick}
      >
        \\\${'Click me!'}
      </button>
      <span>
        \\\${this.message ?? this.listeningMessage}
      </span>
    </div>\\\`
  }
}
{{js? "customElements.define('test-cmp', {{componentNameCamel}} )"}}
\`]
const lib{{ts? ": FileWithPath"}} = ['{{ignore "{{componentName}}"}}.lib{{ignore "{{ext}}"}}',
  \`import {loadingData} from '@micro-lc/back-kit-engine'
{{ts? "import type {"}}
{{ts? "  Event, EventBus, LoadingDataPayload"}}
{{ts? "} from '@micro-lc/back-kit-engine'"}}
{{ts? "import type {"}}
{{ts? "  Observable, Subscription"}}
{{ts? "} from 'rxjs'"}}
import {filter} from 'rxjs/internal/operators/filter'
import {skipUntil} from 'rxjs/internal/operators/skipUntil'

{{ts? "import type { {{componentNameCamel}} } from './{{componentName}}'"}}

export function listensToLoadingData ({{ts? "this: {{componentNameCamel}}, "}} eventBus{{ts? ": EventBus"}}, kickOff{{ts? ": Observable<0>"}}){{ts? ": Subscription"}} {
  return eventBus
    .pipe(
      skipUntil(kickOff),
      filter{{ts? "<Event, Event<LoadingDataPayload>>"}}(loadingData.is)
    )
    .subscribe(({payload: {loading}}) => {
      this.loading = loading
      this.message = loading ?
        this.loadingMessage :
        this.listeningMessage
    })
}

export function emitLoading ({{ts? "this: {{componentNameCamel}}"}}){{ts? ": void"}} {
  this.eventBus?.next(loadingData({loading: !this.loading}))
}
\`]
const test{{ts? ": FileWithPath"}} = ['__test__/{{ignore "{{componentName}}"}}.test{{ignore "{{ext}}"}}',
  \`import {loadingData} from '@micro-lc/back-kit-engine'
import {runtime} from '@micro-lc/back-kit-engine/west'
import {
  elementUpdated, html
} from '@open-wc/testing-helpers'

{{ts? "import type { {{componentNameCamel}} } from '../{{componentName}}'"}}
import {{ignore "'../{{componentName}}'"}}

runtime.describe('{{ignore "{{componentName}}"}} tests', () => {
  runtime.it{{ts? "<{{componentNameCamel}}>"}}('test bootstrap loading', async ({eventBus, actOnEvents, create}) => {
    const el = await create({template: html\\\`<{{ignore "{{componentName}}"}}
        .eventBus=\\\${eventBus}
      ></{{ignore "{{componentName}}"}}>\\\`})

    el.onClick()

    await actOnEvents([
      {
        filter: loadingData.is,
        handler: async ({payload}) => {
          expect(payload.loading).toBe(true)

          await elementUpdated(el)
          expect(el.message).toEqual('Loading...')

          el.onClick()
        }
      },
      {
        filter: loadingData.is,
        skip: 1,
        handler: async ({payload}) => {
          expect(payload.loading).toBe(false)

          await elementUpdated(el)
          expect(el.message).toEqual('Listening...')
        }
      }
    ])
  })
})
\`]
const index{{ts? ": FileWithPath"}} = ['index.{{ts}}', 'export * from \\'./{{ignore "{{componentName}}"}}\\'\\n']
const readme{{ts? ": FileWithPath"}} = ['README.md', '<!-- Write documentation for {{ignore "{{componentName}}"}} in this file. -->']

{{ts? "export default [webc, lib, test, readme, index]"}}
{{js? "module.exports = [webc, lib, test, readme, index]"}}
`, false]

const scriptIndex: FileWithPath = ['./scripts/new-cmp/index.{{ts}}',
  `{{ts? "import {promises as fsp} from 'fs'"}}
{{ts? "import {"}}
{{ts? "  basename, dirname, extname, join as joinPath, resolve"}}
{{ts? "} from 'path'"}}
{{ts? "import mkdirp from 'mkdirp'"}}
{{ts? "import yargs from 'yargs'"}}
{{ts? "import hb from 'handlebars'"}}


{{js? "const {promises: fsp} = require('fs')"}}
{{js? "const {"}}
{{js? "  basename, dirname, extname, join: joinPath, resolve"}}
{{js? "} = require('path')"}}
{{js? "const mkdirp = require('mkdirp')"}}
{{js? "const yargs = require('yargs')"}}
{{js? "const hb = require('handlebars')"}}

async function main () {
  const params = yargs(process.argv.slice(2)).argv {{ts? "as Record<string, any | any[] | undefined>"}}

  const componentPath = params._[0]
  if (typeof componentPath !== 'string') {
    return
  }
  
  const ext = extname(componentPath) || undefined
  const hasDir = basename(componentPath) !== componentPath  

  const componentName = ext !== undefined
    ? basename(componentPath).replace(new RegExp(\`(.*)\${ext}$\`), '$1')
    : basename(componentPath)

  const context = {
    componentName,
    componentNameCamel: kebabToCapitalizedCamel(componentName),
    ext: ext ?? '.{{ts}}'
  }

  {{ts? "await import('./templates/template')"}}
  {{js? "Promise.resolve(require('./templates/template'))"}}
    .then( {{ts? "({default: files})"}} {{js? "(files)"}} => {
      return files.map(([path, content]) =>
        [compile(path, context), compile(content, context)]
      )
    })
    .then(async (files) => {
      const targetDir = hasDir ? resolve('./src/web-components', dirname(componentPath)) : resolve('./src/web-components', componentName)
      
      return mkdirp(targetDir).then(() => {
        return files.map(([filePath, ...rest]) => [joinPath(targetDir, filePath), ...rest])
      })
    })
    .then((files) => {
      files.forEach(([filePath, fileContent]) => {
        fsp.mkdir(dirname(filePath), {recursive: true}).then(() =>
          fsp.writeFile(filePath, fileContent)
        )
      })
    })
    .catch((err) => {
      console.error(err)
    })
}

const compile = (str{{ts? ": string"}}, context{{ts? ": Record<string, any>"}}, options = {noEscape: true}) => {
  let compiledStr = hb.compile(str, options)(context)
  let lastStr = str
  while(compiledStr !== lastStr) {
    lastStr = compiledStr
    compiledStr = hb.compile(compiledStr, options)(context)
  }
  return compiledStr
}

const kebabToCapitalizedCamel = (str{{ts? ": string"}}) => str.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
})
`]

export default [templates, scriptIndex]
