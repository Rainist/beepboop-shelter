'use strict'

const proxyTo = require('./proxy')
const {slappAppHost} = require('./config')
const persist = require('./persist')
const proxy = proxyTo(slappAppHost)
const redisRepo = require('./repo/redis')
const express = require('express')
const app = express()

app.set('trust proxy', true)

app.get('/', (req, res) => {
  res.send('beepboop-shelter')
})

app.use('/api/v1', persist(redisRepo))
app.use('/', proxy) // This must be at the end

app.listen(3000, function () {
  console.log('listening at 3000')
})
