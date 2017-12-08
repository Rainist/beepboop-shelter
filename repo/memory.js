'use strict'

const db = {}

function wrapValueWithUpdated(value) {
  return {val: value, updated: Date.now()}
}

async function get(key) {
  const valWithUpdated = db[key]

  if (valWithUpdated){
    const {val, updated} = valWithUpdated
    return {value: val, updated}
  }
  else {
    throw 404
  }
}

function mget(keys) {
  return Promise.all(
    keys.map(
      key => get(key)
        .then(({value, updated}) => {
          return { key, value, updated }
        })
        .catch(err => {
          if (err === 404) {
            return null
          }
          throw err
        })
    )
  )
}

async function keys(begins) {
  const keys = Object.keys(db)

  if(!begins) {
    return keys
  }

  return keys
    .filter(key => {
      return new RegExp(`${begins}.*`).test(key)
    })
}

async function set(key, value) {
  db[key] = wrapValueWithUpdated(value)

  const { val, updated } = db[key]
  return { value: val, updated }
}

async function del(key) {
  delete db[key]
}

module.exports = {get, mget, keys, set, del}
