// Register mock for 'vscode' module before any tests run
const Module = require('module')
const path = require('path')

const originalResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'vscode') {
    return path.join(__dirname, '__mocks__', 'vscode.js')
  }
  return originalResolveFilename.call(this, request, parent, isMain, options)
}
