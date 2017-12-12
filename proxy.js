'use strict'

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const rp = require('request-promise')
const qs = require('qs')
const Feature = require('./feature')
const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

const headerFiller = require('./header-filler')

let proxyHost = ''

function getBaseOpts(req, extraHeaders={}) {
  const headers = _.extend(req.headers, extraHeaders)

  delete headers['content-length']

  return {
    method: req.method,
    uri: `${proxyHost}${req.path}`,
    headers: headers,
    resolveWithFullResponse: true
  }
}

function getBodyAndType(req) {
  const isJsonType = req.headers['content-type'] === 'application/json'
  const isBodyJson = typeof req.body === 'object'
  const isBodyNotJson = !isBodyJson
  const possibleTextBody = isBodyNotJson ? req.body : null

  return {
    body: isJsonType && isBodyJson ? req.body : possibleTextBody,
    json: req.headers['content-type'] === 'application/json'
  }
}

function genOpts(feature, req, extraHeaders) {
  const baseOpts = getBaseOpts(req, extraHeaders)

  switch(feature) {
  case Feature.EVENT:
    return _.extend(
      baseOpts,
      {
        body: req.body,
        json: true
      }
    )
  case Feature.ACTION: {
    const payload = req.body.payload
    const rawFormBody = qs.stringify({payload: payload}, {format: 'RFC1738'})

    return _.extend(
      baseOpts,
      {
        headers: _.extend(baseOpts.headers, {'content-type': 'application/x-www-form-urlencoded'}),
        body: rawFormBody
      }
    )
  }
  default:
    return _.extend(baseOpts, getBodyAndType(req))
  }
}

router.all('/slack/*', (req, res) => {
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
      }
      catch(anotherErr) {
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

router.all('*', (req, res) => {
  rp(_.extend(
    getBaseOpts(req),
    getBodyAndType(req)
  ))
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
      }
      catch(anotherErr) {
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
  return router
}
