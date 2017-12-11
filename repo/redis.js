'use strict'

const _ = require('lodash')
const bluebird = require("bluebird")
const redis = require("redis")

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const redisUrl = process.env.REDIS_URL
const client = redis.createClient(redisUrl)

async function rget(key) {
  return rgetWithClient(client, key)
}

async function rgetWithClient(clnt, key) {
  const obj = await clnt.hgetallAsync(key)

  if (!obj) {
    return null
  }

  const { value, updated } = obj
  return { value, updated }
}

async function rmget(keys) {
  const multi = client.multi()

  keys.map(key => {
    return rgetWithClient(multi, key)
  })

  const results = await multi
        .execAsync()

  return _
    .zip(keys, results)
    .map(([key, result]) => {
      if (!result) {
        return null
      }

      const { value, updated } = result
      return { key, value, updated }
    })
}

async function rset(key, value) {
  const updated = Date.now()

  await client.hmsetAsync(key, {
    value: value,
    updated: updated
  })

  return { value, updated }
}

async function rdel(key) {
  const result = await client.delAsync(key)

  if (result !== 1) {
    throw `Failed to delete ${key}`
  }
}

async function rkeys(begins=null) {
  let keys

  if(begins) {
    keys = await client.keysAsync(`${begins}*`)
  }
  else {
    keys = await client.keysAsync('*')
  }

  return keys
}

// ---

async function get(key) {
  const result = await rget(key)

  if (!result) {
    throw 404
  }

  const { value, updated } = result

  if ( value && updated ) {
    return { value, updated }
  }

  throw 404
}

async function mget(keys) {
  return rmget(keys)
}

function keys(begins) {
  return rkeys(begins)

}

async function set(key, value) {
  const { value: val, updated } = await rset(key, value)
  return { value: val, updated }
}

function del(key) {
  return rdel(key)
}

module.exports = {get, mget, keys, set, del}
