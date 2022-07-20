#!/usr/bin/env node
import {build} from 'esbuild'
import {
  dirname, resolve
} from 'path'
import {fileURLToPath} from 'url'
import {NodeResolvePlugin} from '@esbuild-plugins/node-resolve'
import {writeFile} from 'fs/promises'
import mkdirp from 'mkdirp'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')

// const bundles = [
//   {
//     entryPoint: 'mgmt/index.ts',
//     outdir: './dist/mgmt'
//   },
//   {
//     entryPoint: 'create-lib/index.ts',
//     outdir: './dist/create-lib'
//   }
// ];

// build({
//   platform: 'node',
//   format: 'cjs',
//   entryPoints: [resolve(rootDir, 'src', 'mgmt', 'index.ts')],
//   outdir: './dist/mgmt',
//   minify: true,
//   bundle: true,
//   format: 'esm',
//   banner: {js: '#!/usr/bin/env node\n'}
// })
//   }))
//   .map((opts) => build(opts))
// ).then((results) =>
//   Promise.all(results.reduce((ps, {outputFiles}, i) => {
//     const {write} = bundles[i]
//     if (!write) {
//       outputFiles?.forEach(({
//         path, contents
//       }) => mkdirp(dirname(path)).then(() => ps.push(writeFile(path, '#!/usr/bin/env node\n' + Buffer.from(contents).toString()))))
//     }

//     return ps
//   }, []))
// )
// })()

build({
  platform: 'node',
  entryPoints: ['./src/mgmt/index.ts'],
  outdir: 'dist/mgmt',
  outExtension: {'.js': '.mjs'},
  minify: true,
  bundle: true,
  write: true,
  format: 'esm',
  banner: {js: '#!/usr/bin/env node'},
  plugins: [
    NodeResolvePlugin({
      extensions: ['.ts', '.js'],
      onResolved: (resolved) => resolved.includes('node_modules') ? ({external: true}) : resolved
    }),
  ],
// }).then(({outputFiles}) => {
//   return Promise.all(outputFiles.map(({
//     path, contents
//   }) => {
//     return writeFile(path, '#!/usr/bin/env node\n' + Buffer.from(contents).toString())
//   }))
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

build({
  platform: 'node',
  entryPoints: ['./src/create-lib/index.ts'],
  outdir: 'dist/create-lib',
  minify: true,
  bundle: true,
  write: false,
  format: 'cjs',
}).then(({outputFiles}) => Promise.all(outputFiles.map(({
  path, contents
}) =>
  mkdirp(dirname(path)).then(() => writeFile(path, '#!/usr/bin/env node\n' + Buffer.from(contents).toString()))
))).catch((err) => {
  console.error(err)
  process.exit(1)
})
