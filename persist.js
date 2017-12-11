'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()

let repository

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

router.get('/ping', (req, res) => {
  res.send('pong')
})

// SET
router.put('/persist/kv/:key', (req, res) => {
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
router.delete('/persist/kv/:key', (req, res) => {
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
router.get('/persist/kv', (req, res) => {
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
router.get('/persist/kv/:key', (req, res) => {
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
router.post('/persist/mget', (req, res) => {
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
  return router
}
