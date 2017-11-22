'use strict'

const proxyTo = require('./proxy')
const express = require('express')
const {slappAppHost} = require('./config')

const proxy = proxyTo(slappAppHost)

proxy.listen(3000, function () {
  console.log('listening at 3000')
})
