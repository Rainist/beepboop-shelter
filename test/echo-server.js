'use strict'

const express = require('express')
const _ = require('lodash')

const app = express()

function reduceHeaders(headers) {
  return _.omit(headers, ['content-type', 'content-length', 'connection'])
}

app.all('*', function (req, res) {
  res.set(reduceHeaders(req.headers))
  res.send('hello world')
})

module.exports = app
