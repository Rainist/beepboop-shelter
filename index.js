'use strict'

const proxyTo = require('./proxy')
const express = require('express')
const {slappHost} = require('./config')

const proxy = proxyTo(slappHost)

proxy.listen(3000, function () {
  console.log('listening at 3000')
})
