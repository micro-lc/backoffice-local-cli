#!/usr/bin/env node
import {build} from 'esbuild'
import {
  readFileSync, writeFileSync
} from 'fs'
import {
  dirname, resolve
} from 'path'
import {fileURLToPath} from 'url'

build({
  platform: 'node',
  entryPoints: ['./src/mgmt/index.ts', './src/create-lib/index.ts'],
  outdir: 'dist',
  minify: true,
  bundle: true,
  format: 'cjs',
  // plugins: [
  //   NodeResolvePlugin({
  //     extensions: ['.ts', '.js'],
  //     onResolved: (resolved) => resolved.includes('node_modules') ? ({external: true}) : resolved
  //   }),
  // ],
  // banner: {js: '#!/usr/bin/env node'}
}).then(() => {
  const pos = dirname(fileURLToPath(import.meta.url))
  const cl = readFileSync(resolve(pos, '../dist/create-lib/index.js')).toString()
  const mgmt = readFileSync(resolve(pos, '../dist/mgmt/index.js')).toString()
  writeFileSync(resolve(pos, '../dist/create-lib/index.js'), '#!/usr/bin/env node\n' + cl)
  writeFileSync(resolve(pos, '../dist/mgmt/index.js'), '#!/usr/bin/env node\n' + mgmt)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})


