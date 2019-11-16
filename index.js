require('dotenv').config()
// Enable es6 on nodejs
require = require('esm')(module)
module.exports = require('./server.js')
