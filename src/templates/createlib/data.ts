
export type FileWithPath = [string, string]

const eslintignore: FileWithPath = ['.eslintignore',`
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
.pnp.*

# production
/www
/dist
/build
/loader

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# vscode
.vscode/
.idea/`]

const gitignore: FileWithPath = ['.gitignore', `
/.yarn/*
!/.yarn/patches
!/.yarn/plugins
!/.yarn/releases
!/.yarn/sdks

# Swap the comments on the following lines if you don't wish to use zero-installs
# Documentation here: https://yarnpkg.com/features/zero-installs
# !/.yarn/cache
/.pnp.*

# build-time folders
/node_modules/
/dist/
/coverage/
.nyc_output/`]

const eslintrc: FileWithPath = ['.eslintrc.json', `
{
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended"{{ts? ", \\"plugin:@typescript-eslint/recommended\\""}}
  ],
  {{ts? "\\"parser\\": \\"@typescript-eslint/parser\\","}}
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  {{ts? "\\"plugins\\":[\\"@typescript-eslint\\"],"}}
  "rules": {
    "eol-last": "error",
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "object-curly-spacing": "error",
    "object-curly-newline": ["error", { "minProperties": 2 }]{{ts? ","}}
    {{ts? "\\"@typescript-eslint/no-explicit-any\\": \\"off\\","}}
    {{ts? "\\"@typescript-eslint/no-empty-function\\": \\"off\\""}}
  }
}`]

const changelog: FileWithPath = ['CHANGELOG.md', `
# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased`]

const jest: FileWithPath = ['jest.config.{{ts}}', `
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  rootDir: './src',
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: '../coverage/bke',
  coverageReporters: ['cobertura', 'text', 'lcov'],
  collectCoverageFrom: [
    '**/*.{{ts}}',
    '**/*.{{ts}}x',
    '!**/index.{{ts}}'
  ],
  moduleNameMapper: {'^rxjs': ['rxjs']},
  testEnvironment: 'jsdom',
  transform: {'^.+\\.[jt]sx?$': [
    'esbuild-jest',
    {
      sourcemap: true,
      loaders: {'.test.{{ts}}': '{{ts}}x'}
    }
  ]},
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.({{ts}}|{{ts}}x)$',
  transformIgnorePatterns: [
    '../node_modules/(?!(@open-wc|@lit|lit|lit-html|lit-element|@esm-build|uuid)/)'
  ],
  setupFilesAfterEnv: [
    './testSetup.{{ts}}'
  ]
}`]

const packagejson: FileWithPath = ['package.json', `
{
  "name": "{{lib_name}}",
  "version": "0.0.1",
  "description": "Web components of back-kit library",
  "license": "SEE LICENSE IN LICENSE",
  "author": "TODO",
  "contributors": [],
  "module": "dist/index.js",
  {{ts? "\\"types\\": \\"dist/index.d.ts\\","}}
  "files": [
    "/dist"
  ],
  "scripts": {
    "TODO": "TODO"
  },
  "devDependencies": {
    "TODO": "TODO"
  },
  "dependencies": {
    "TODO": "TODO"
  }
}`]

const vite: FileWithPath = ['vite.config.{{ts}}', `
import {defineConfig} from 'vite'
import {analyzer} from 'rollup-plugin-analyzer'
{{ts? "import tsconfigPaths from 'vite-tsconfig-paths'"}}

export default defineConfig({
  plugins: [{{ts? "tsconfigPaths(), "}}analyzer()],
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'Fragment',
    minify: true,
    legalComments: 'none',
    charset: 'utf8'
  },
  publicDir: 'dist/{{lib_name}}',
  build: {
    outDir: 'dist/{{lib_name}}',
    emptyOutDir: true,
    manifest: true,
    lib: {
      entry: 'src/index.{{ts}}',
      name: '{{lib_name}}',
      formats: ['es'],
      fileName: format => \`{{lib_name}}.\${format}m.js\`
    },
    minify: 'esbuild'
  }
})`]

const reactComponent: FileWithPath = ['react-components/ReactExample.{{ts}}x', `
This is a test`]

const webComponent: FileWithPath = ['web-components/webc-example.{{ts}}', `
This is a test`]

const webComponentLib: FileWithPath = ['web-components/webc-example.lib.{{ts}}', `
This is a test`]

const webComponentTets: FileWithPath = ['web-components/__test__/webc-example.test.{{ts}}', `
This is a test`]

const tsconfig: FileWithPath = ['.tsconfig.json', `
{"This": "is a test"}`]

const common =  {
  eslintignore,
  gitignore,
  eslintrc,
  changelog,
  jest,
  packagejson,
  vite,
  reactComponent,
  webComponent,
  webComponentLib,
  webComponentTets
}

const typeScript = {tsconfig}

export {
  common,
  typeScript
}
