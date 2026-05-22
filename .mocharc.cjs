module.exports = {
  require: ['src/test/setup.js'],
  spec: ['out/test/test/**/*.test.js'],
  timeout: 10000,
  ui: 'tdd',
  color: true
}
