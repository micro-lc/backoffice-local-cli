#!/usr/bin/env node
import {build} from 'esbuild'
import {
  dirname, resolve
} from 'path'
import {fileURLToPath} from 'url'
import {writeFile} from 'fs/promises'
import mkdirp from 'mkdirp'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')
const srcDir = resolve(rootDir, 'src')

const bundles = [
  {
    entryPoint: 'mgmt/index.ts',
    outdir: './dist/mgmt'
  },
  {
    entryPoint: 'create-lib/index.ts',
    outdir: './dist/create-lib'
  }
];

(async () => {
  await Promise.all(bundles
    .map(({
      entryPoint, ...rest
    }) => ({
      platform: 'node',
      format: 'cjs',
      entryPoints: [resolve(srcDir, entryPoint)],
      write: false,
      minify: true,
      bundle: true,
      ...rest
    }))
    .map((opts) => build(opts))
  ).then((results) =>
    Promise.all(results.reduce((ps, {outputFiles}, i) => {
      const {write} = bundles[i]
      if (!write) {
        outputFiles?.forEach(({
          path, contents
        }) => mkdirp(dirname(path)).then(() => ps.push(writeFile(path, '#!/usr/bin/env node\n' + Buffer.from(contents).toString()))))
      }

      return ps
    }, []))
  ).catch((err) => {
    console.error(err)
    process.exit(1)
  })
})()


