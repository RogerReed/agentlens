#!/usr/bin/env node
/**
 * Tiny local TypeScript runner for demo utilities.
 *
 * The demo scripts are TypeScript, but this repo does not depend on tsx. Using
 * npx would try to download tsx at runtime, which breaks offline capture flows.
 */

const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function compile(filename) {
  const source = fs.readFileSync(filename, 'utf-8')
  return ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
}

require.extensions['.ts'] = function registerTypeScript(module, filename) {
  module._compile(compile(filename), filename)
}

const [, , entry, ...args] = process.argv
if (!entry) {
  process.stderr.write('Usage: node demo/run-ts.js <script.ts> [...args]\n')
  process.exit(1)
}

const entryPath = path.resolve(process.cwd(), entry)
process.argv = [process.argv[0], entryPath, ...args]
require(entryPath)
