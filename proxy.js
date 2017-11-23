'use strict'

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const rp = require('request-promise')
const qs = require('qs')
const Feature = require('./feature')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const headerFiller = require('./header-filler')

let proxyHost = ''

function genOpts(feature, req, extraHeaders) {
  switch(feature) {
  case Feature.EVENT:
    return {
      method: req.method,
      uri: `${proxyHost}${req.path}`,
      headers: _.extend(req.headers, extraHeaders),
      body: req.body,
      json: true,
      resolveWithFullResponse: true
    }
  case Feature.ACTION: {
    const payload = req.body.payload
    const rawFormBody = qs.stringify({payload: payload}, { format : 'RFC1738' })

    return {
      method: req.method,
      uri: `${proxyHost}${req.path}`,
      headers: _.extend(req.headers, extraHeaders, {'content-type': 'application/x-www-form-urlencoded'}),
      body: rawFormBody,
      resolveWithFullResponse: true
    }
  }}
}

app.all('*', (req, res) => {

  const servingFeature = Feature.byPath(req.path)

  headerFiller
    .fill(req.body, servingFeature)
    .then(headerKVs => {
      return _.chain(headerKVs)
        .reduce((left, right) => {
          return _.extend(left, right)
        }).value()
    })
    .then(extraHeaders => {
      return genOpts(servingFeature, req, extraHeaders)
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
