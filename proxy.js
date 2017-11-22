'use strict'

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const rp = require('request-promise')

const app = express()

app.use(bodyParser.json())

const headerFiller = require('./header-filler')

let proxyHost = ''

app.all('*', (req, res) => {
  headerFiller
    .fill(req.body)
    .then(headerKVs => {
      return _.chain(headerKVs)
        .reduce((left, right) => {
          return _.extend(left, right)
        }).value()
    })
    .then(extraHeaders => {
      return {
        method: req.method,
        uri: `${proxyHost}${req.path}`,
        headers: _.extend(req.headers, extraHeaders),
        body: req.body,
        json: true,
        resolveWithFullResponse: true
      }
    })
    .then(options => {
      return rp(options)
    })
    .then(response => {
      res
        .set(response.headers)
        .status(response.statusCode)
        .send(response.body)
    })
    .catch(err => {
      try {
        res
          .set(err.response.headers)
          .status(err.response.statusCode)
          .send(err.response.body)
      } catch(anotherErr) {
        throw err || anotherErr
      }
    })
    .catch(err => {
      console.log(err)
      res
        .status(501)
        .send(err)
    })
})

module.exports = _proxyHost => {
  proxyHost = _proxyHost
  return app
}
