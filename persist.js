'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

let repository

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/ping', (req, res) => {
  res.send('pong')
})

// SET
app.put('/persist/kv/:key', (req, res) => {
  const { key } = req.params
  const { value } = req.body

  if(!value){
    res.status(400).send('No value found')
    return
  }

  repository.set(key, value)
    .then(({value, updated}) => {
      res.json({key, value, updated})
    })
    .catch((err) => {
      console.warn(err)
      res.status(500).send()
    })
})

// DELETE
app.delete('/persist/kv/:key', (req, res) => {
  const {key} = req.params

  repository
    .del(key)
    .then(() => res.send())
    .catch((err) => {
      console.warn(err)
      res.status(500).send()
    })
})

// LIST
app.get('/persist/kv', (req, res) => {
  const { begins } = req.query

  repository.keys(begins)
    .then(keys => {
      res.json(keys)
    })
    .catch(err => {
      console.warn(err)
      res.status(500).send()
    })
})

// GET
app.get('/persist/kv/:key', (req, res) => {
  const {key} = req.params

  repository
    .get(key)
    .then(({value, updated}) => {
      res.json({key, value, updated})
    })
    .catch(err => {
      console.warn(err)
      if (err === 404) {
        res.status(404).send()
      }
      else {
        throw 500
      }
    })
    .catch(() => {
      res.status(500).send()
    })
})

// MULTI GET
app.post('/persist/mget', (req, res) => {
  const {keys} = req.body

  repository
    .mget(keys)
    .then(resolvedList => {
      const results = resolvedList.map(result => {
        if (result === null) {
          return null
        }

        const {key, value, updated} = result
        return { value, key, updated }
      })

      res.json(results)
    })
    .catch((err) => {
      console.warn(err)
      res.status(500).send()
    })
})

module.exports = _repository => {
  repository = _repository
  return app
}
