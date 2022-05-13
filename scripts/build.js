#!/usr/bin/env node
'use strict'

import {build} from 'esbuild'
import {NodeResolvePlugin} from '@esbuild-plugins/node-resolve'

build({
  platform: 'node',
  entryPoints: ['index.ts'],
  outdir: 'dist',
  minify: true,
  bundle: true,
  format: 'esm',
  plugins: [
    NodeResolvePlugin({
      extensions: ['.ts', '.js'],
      onResolved: (resolved) => resolved.includes('node_modules') ? ({external: true}) : resolved
    }),
  ],
  banner: {js: '#!/usr/bin/env node'}
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
