'use strict'

const proxyTo = require('./proxy')
const {slappAppHost} = require('./config')
const persist = require('./persist')
const proxy = proxyTo(slappAppHost)
const redisRepo = require('./repo/redis')
const express = require('express')
const app = express()
const terminus = require('@godaddy/terminus')
const http = require('http')

app.set('trust proxy', true)

app.get('/', (req, res) => {
  res.send('beepboop-shelter')
})

app.use('/api/v1', persist(redisRepo))
app.use('/', proxy) // This must be at the end


const server = http.createServer(app)

// this code below doesn't catch the signal when run by nodemon
terminus(server, {
  healthChecks: {
    '/healthz': () => Promise.resolve()
  },
  timeout: 5000,
  onShutdown: () => {
    console.warn('being shutdown by process')
    return Promise.resolve()
  }
})

server.listen(3000, function () {
  console.log('listening at 3000')
})
