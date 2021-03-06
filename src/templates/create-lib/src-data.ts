import type {FileWithPath} from './data'

const reactComponent: FileWithPath = ['src/react-components/Example/ReactExample.{{ts}}x',
  `import React from 'react'

export const Example{{ts? ": React.FC<{content: string}>"}} = ({content}) => {
  return (
    <React.Fragment>
      {content}
      {/* you can mount custom React components inside a wevb-component that extends the \`BkComponent\` class */}
    </React.Fragment>
  )
}
`]
const reactComponentIndex: FileWithPath = ['src/react-components/Example/index.{{ts}}', 'export * from \'./ReactExample\'\n']
const reactComponentTest: FileWithPath = ['src/react-components/__test__/ReactExample.test.{{ts}}x', 
  `import React from 'react'
import {render} from '@testing-library/react'
import {Example} from '../Example'

describe('Example tests', () => {
  it('content test', () => {
    const {getByText} = render(
      <Example content={'Test'}/>
    )
    expect(getByText('Test')).toBeInTheDocument()
  })
})
`]
const reactIndex: FileWithPath = ['src/react-components/index.{{ts}}', 'export * from \'./Example\'\n']


const webComponent: FileWithPath = ['src/web-components/example/webc-example.{{ts}}', 
  `import {html} from 'lit-html'
{{ts? "import type {TemplateResult} from 'lit'"}}
{{ts? "import {"}}
{{ts?   "customElement, property"}}
{{ts? "} from 'lit/decorators.js'"}}

import {BkBase} from '@micro-lc/back-kit-engine/base'
{{ts? "import type {LocalizedText} from '@micro-lc/back-kit-engine/utils'"}}
import {getText} from './webc-example.lib'

/**
 * @component
 * @title Example
 * @description simple example of a lit web component, displays a custom text, which can be localized
 */
{{ts? "@customElement('bk-webc-example')"}}
export class BkExample extends BkBase {
  /**
   * @description localized text content to display.
   */
  {{ts? "@property({attribute: false}) content: LocalizedText = {en: 'Example', it: 'Esempio'}"}}
  {{js? "static get properties() {return {content: {}}}"}}

  {{js? "constructor () {"}}
  {{js? "  super()"}}
  {{js? "  this.content = {en: 'Example', it: 'Esempio'}"}}
  {{js? "}"}}

  {{ts? "protected "}}render (){{ts? ": TemplateResult"}} {
    const localizedContent = getText.call(this)
    return html\`<div>
      <span>
        \${localizedContent}
      </span>
    </div>\`
  }
}
{{js? "customElements.define('webc-example', BkExample)"}}
`]
const webComponentLib: FileWithPath = ['src/web-components/example/webc-example.lib.{{ts}}', 
  `import {
  getLocalizedText, getNavigatorLanguage
} from '@micro-lc/back-kit-engine/utils'
{{ts? "import type {BkExample} from './webc-example'"}}

export function getText ({{ts? "this: BkExample"}}){{ts? ": string"}} {
  return getLocalizedText(this.content, getNavigatorLanguage())
}
`]
const webComponentTets: FileWithPath = ['src/web-components/example/__test__/webc-example.test.{{ts}}', 
  `import {runtime} from '@micro-lc/back-kit-engine/west'
import {html} from '@open-wc/testing-helpers'
import {getText} from '../webc-example.lib'
{{ts? "import {BkExample} from '../webc-example'"}}
{{ts? import '../webc-example'}}

runtime.describe('test', () => {
  runtime.it{{ts? "<BkExample>"}}('test example', async ({create}) => {
    const el = await create({template: html\`<webc-example .content=\${'Test'}></webc-example>\`})
    expect(getText.call(el)).toEqual('Test')
  })
})
`]
const webComponentReadme: FileWithPath = ['src/web-components/example/README.md',
  `<!-- Everything that you write here is is attached to the \`webc-example\` component documentation. Try running \`yarn docs\`. -->
Allows to display a configurable and internationalized text.
`]
const webComponentIndex: FileWithPath = ['src/web-components/example/index.{{ts}}', 'export * from \'./webc-example\'\n']
const webcReadme: FileWithPath = ['src/web-components/README.md',
  `<!-- Everything that you write here is is attached to the documentation. Try running \`yarn docs\`. -->
Library of web components.
`]
const webcIndex: FileWithPath = ['src/web-components/index.{{ts}}', 'export * from \'./example\'\n']

const index: FileWithPath = ['src/index.{{ts}}', 'export * from \'./web-components\'\n']
const testSetup: FileWithPath = ['src/testSetup.{{ts}}',
  `{{js? "import 'jest'"}}
import '@testing-library/jest-dom'

jest.mock('@micro-lc/back-kit-engine/engine')
Object.defineProperty(global, 'console', {
  writable: true, value: {
    ...console, error: jest.fn()
  }
})
`]

export default [
  reactComponent,
  reactComponentIndex,
  reactComponentTest,
  reactIndex,

  webComponent,
  webComponentLib,
  webComponentTets,
  webComponentIndex,
  webComponentReadme,
  webcIndex,
  
  testSetup,
  webcReadme,
  index  
]
