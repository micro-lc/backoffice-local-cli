import nginxData from './nginx-data'
import ciData from './ci-data'
import srcData from './src-data'
import scriptsData from './scripts-data'

export type FileWithPath = [string, string, boolean?]

const eslintignore: FileWithPath = ['.eslintignore',
  `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

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
.idea/
`]

const gitignore: FileWithPath = ['.gitignore',
  `/.yarn/*
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
src/coverage/
.nyc_output/
`]

const eslintrc: FileWithPath = ['.eslintrc.json',
  `{
  "env": {
    "es2021": true,
    "node": true,
    "browser": true{{js? ","}}
    {{js? "\\"jest\\": true"}}
  },
  "extends": [
    "eslint:recommended",
    {{ts? "\\"plugin:@typescript-eslint/recommended\\""}}
    {{js? "\\"plugin:react/recommended\\""}}
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
    "object-curly-newline": ["error", { "minProperties": 2 }],
    {{ts? "\\"@typescript-eslint/no-explicit-any\\": \\"off\\","}}
    {{ts? "\\"@typescript-eslint/no-empty-function\\": \\"off\\""}}
    {{js? "\\"react/prop-types\\": 0"}}
  }
}
`]

const changelog: FileWithPath = ['CHANGELOG.md',
  `# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
`]

const jest: FileWithPath = ['jest.config.{{ts}}',
  `/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

{{ts? "export default"}}{{js? "const config ="}} {
  rootDir: './src',
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: './coverage',
  coverageReporters: ['cobertura', 'text'],
  collectCoverageFrom: [
    '**/*.{{ts}}',
    '**/*.{{ts}}x',
    '!**/index.{{ts}}'
  ],
  moduleNameMapper: {'^rxjs': ['rxjs']},
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\\\.[jt]s{{ts? "x"}}?$': [
      'esbuild-jest',
      {
        sourcemap: true,
        loaders: {'.test.{{ts}}': '{{ts}}x'}
      }
    ]{{js? ","}}
    {{js? "'^.+\\.[jt]sx?$': ['babel-jest']"}}
  },
  testRegex: '(/__tests__/.*|\\\\.(test|spec))\\\\.({{ts}}|{{ts}}x)$',
  transformIgnorePatterns: [
    '../node_modules/(?!(@open-wc|@lit|lit|lit-html|lit-element|@esm-build|uuid)/)'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/testSetup.{{ts}}'
  ]
}

{{js? "module.exports = config"}}
`]

const packagejson: FileWithPath = ['package.json',
  `{
  "name": "{{lib_name}}",
  "version": "0.0.1",
  "description": "Web components of back-kit library",
  "license": "SEE LICENSE IN LICENSE",
  "author": "{{gitUser.name}} <{{gitUser.email}}>",
  "contributors": [],
  "module": "dist/index.js",
  {{ts? "\\"types\\": \\"dist/index.d.ts\\","}}
  "files": [
    "/dist"
  ],
  "engines": {
    "node": ">=16.0.0"
  },
  {{remote? "\\"repository\\": {"}}
  {{remote? "  \\"type\\": \\"git\\","}}
  {{remote? "  \\"url\\": \\"{{git_remote}}\\""}}
  {{remote? "},"}}
  "scripts": {
    "clean": "rimraf dist src/coverage",
    "clean:node_modules": "rimraf node_modules",
    {{ts? "\\"tsc\\": \\"tsc\\","}}
    "lint": "eslint src --ext .js,.ts,.jsx,.tsx",
    "lint-fix": "yarn lint --fix",
    "build": "vite build --mode production",
    "unit": "NODE_ENV=test jest --passWithNoTests --watch",
    "test": "NODE_ENV=test jest --passWithNoTests",
    "coverage": "NODE_ENV=test jest --coverage",
    "docs:clear": "rimraf docs",
    "docs": "docgen --entryPoints src/index.{{ts}} --type components",
    "new-cmp": "{{ts? "ts-"}}node ./scripts/new-cmp",
    "start": "vite"
  },
  "devDependencies": {
    "@babel/core": "^7.15.0",
    "@babel/plugin-proposal-class-properties": "^7.16.7",
    "@babel/plugin-proposal-decorators": "^7.17.2",
    "@babel/preset-env": "^7.15.0",
    "@babel/preset-react": "^7.14.5",
    {{ts? "\\"@babel/preset-typescript\\": \\"^7.15.0\\","}}
    "@open-wc/testing-helpers": "^2.0.3",
    "@testing-library/jest-dom": "^5.14.1",
    "@testing-library/react": "^12.0.0",
    "@testing-library/react-hooks": "^7.0.1",
    "@testing-library/user-event": "^13.2.1",
    {{ts? "\\"@types/jest\\": \\"^27.4.0\\","}}
    {{ts? "\\"@types/mkdirp\\": \\"^1.0.2\\","}}
    {{ts? "\\"@types/node\\": \\"^17.0.14\\","}}
    {{ts? "\\"@typescript-eslint/eslint-plugin\\": \\"^4.29.2\\","}}
    {{ts? "\\"@typescript-eslint/parser\\": \\"^4.29.2\\","}}
    "esbuild": "^0.14.25",
    {{js? "\\"babel-jest\\": \\"^26.0.0\\","}}
    "esbuild-jest": "^0.5.0",
    "eslint": "^7.32.0",
    "eslint-config-react-app": "^6.0.0",
    "eslint-config-standard": "^16.0.3",
    "eslint-config-standard-react": "^11.0.1",
    "eslint-plugin-flowtype": "^5.9.0",
    "eslint-plugin-import": "^2.24.0",
    "eslint-plugin-jsx-a11y": "^6.4.1",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^5.1.0",
    "eslint-plugin-react": "^7.30.1",
    "eslint-plugin-react-hooks": "^4.2.0",
    "jest": "^26.6.3",
    "jest-fetch-mock": "^3.0.3",
    "mkdirp": "^1.0.4",
    "prettier": "^2.7.1",
    "rimraf": "^3.0.2",
    "rollup-plugin-analyzer": "^4.0.0",
    {{ts? "\\"ts-node\\": \\"^10.2.0\\","}}
    {{ts? "\\"typescript\\": \\"^4.7.4\\","}}
    {{ts? "\\"vite-tsconfig-paths\\": \\"^3.4.1\\","}}
    "vite": "^2.9.5"
  },
  "dependencies": {
    "@micro-lc/back-kit-engine": "^0.16.1",
    "handlebars": "^4.7.7",
    "lit": "^2.1.2",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "rxjs": "^7.5.5"
  }
}
`]

const babel: FileWithPath = ['.babelrc',
  `{
  "presets": [
    ["@babel/preset-env", {"targets": {"node": "current"}}],
    "@babel/preset-react"{{ts? ","}}
    {{ts? "\\"@babel/preset-typescript\\""}}
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "@babel/plugin-proposal-class-properties"
  ]
}
`]

const vite: FileWithPath = ['vite.config.{{ts}}',
  `import {defineConfig} from 'vite'
import analyzer from 'rollup-plugin-analyzer'
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
})
`]

const tsconfig: FileWithPath = ['{{ts}}config.json', 
  `{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "target": "ES2015",
    "lib": ["DOM", "ES2017", "ES2019.Object", "ES2019.Array", "ES2020"],
    "jsx": "react",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "moduleResolution": "Node",
    "module": "ESNext",
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "dist",
    "isolatedModules": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "skipLibCheck": true
  },
  "include": ["src", "scripts"],
  "exclude": ["node_modules"],
  "{{ts? "ts-"}}node": {
    {{ts? "\\"transpileOnly\\": true,"}}
    "files": false,
    "compilerOptions": {
      "module": "CommonJS"
    }
  }
}
`]


const readme = ['README.md', 'This repository is automatically generated, set up for developing web components.']

const yarnrc = ['.yarnrc.yml', 
  `nodeLinker: node-modules
`]
const yarnLock = ['yarn.lock', '']

export default [
  ...nginxData,
  ...ciData,
  ...srcData,
  ...scriptsData,

  eslintignore,
  gitignore,
  eslintrc,
  changelog,
  jest,
  packagejson,
  vite,
  tsconfig,
  // readme,
  babel,
  yarnrc,
  yarnLock
]

export const tsFiles = [
  tsconfig
]
