import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { builtinModules } from 'node:module'
import { defineConfig } from 'vite'
import pkg from './package.json'

const isdev = process.argv.slice(2).includes('--watch')
const jsfilesDir:string = "lib"
const typesDir:string = "types"

export default defineConfig({
  build: {
    minify: false,
    outDir:jsfilesDir,
    emptyOutDir: !isdev,
    target: 'node14',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
      fileName: format => format === 'es' ? '[name].mjs' : '[name].js',
    },
    rollupOptions: {
      external: [
        'vite',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
        ...Object.keys('dependencies' in pkg ? pkg.dependencies as object : {}),
      ],
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [{
    name: 'generate-types',
    async closeBundle() {
      if (process.env.NODE_ENV === 'test') return
      console.log('[types]', 'workingdir', process.cwd())
    //   
      removeTypes()
      await generateTypes()
      moveTypesToDist()
      removeTypes()
    },
  }],
})

// func workflow:remove-types,generateTypes,moveTypesToDist,removeTypes
function removeTypes() {
    console.log(`[types] declaration remove`)
    fs.rmSync(path.join(__dirname, typesDir), { recursive: true, force: true })
}

function generateTypes() {
  return new Promise(resolve => {
    const cp = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'types'],
      { stdio: 'inherit' },
    )
    cp.on('exit', code => {
      !code && console.log('[types]', 'declaration generated')
      resolve(code)
    })
    cp.on('error', process.exit)
  })
}

function moveTypesToDist() {
  const types = path.join(__dirname, typesDir)
  const dist = path.join(__dirname, jsfilesDir)
  const files = fs.readdirSync(types).filter(n => n.endsWith('.d.ts'))
  for (const file of files) {
    fs.copyFileSync(path.join(types, file), path.join(dist, file))
    console.log('[types]', `${typesDir}/${file} -> ${jsfilesDir}/${file}`)
  }
}
