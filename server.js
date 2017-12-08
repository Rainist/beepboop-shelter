'use strict'

const proxyTo = require('./proxy')
const {slappAppHost} = require('./config')
const persist = require('./persist')
const proxy = proxyTo(slappAppHost)
const redisRepo = require('./repo/redis')

proxy.use('/api/v1', persist(redisRepo))
proxy.set('trust proxy', true)
proxy.get('/', (req, res) => {
  res.send('beepboop-shelter')
})

proxy.listen(3000, function () {
  console.log('listening at 3000')
})
