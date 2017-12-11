const express = require('express')
const request = require('supertest')
const persist = require('../persist')
const memRepo = require('../repo/memory')
const redisRepo = require('../repo/redis')

const repos = [memRepo, redisRepo]

repos.map(repo => {
  switch (repo) {
  case memRepo:
    return {name: 'mem repo', repo: memRepo}
  case redisRepo:
    return {name: 'redis repo', repo: redisRepo}
  default:
    return {name: 'no repo', repo: null}
  }
}).map(({name, repo}) => { // eslint-disable-line array-callback-return
  describe(`test persist api via ${name}`, () => {
    let server
    const persistApp = express()
    persistApp.use(persist(repo))
    before(() => {
      server = persistApp.listen(4000, () => {})
    })

    after(() => {
      server.close()
    })

    it('respond to /ping', done => {
      request(server)
        .get('/ping')
        .expect(200, done)
    })

    it('save fail', done => {
      request(server)
        .put('/persist/kv/test-key')
        .send({})
        .expect(400, done)
    })

    it('save success', done => {
      request(server)
        .put('/persist/kv/test-key')
        .send({value: 'test-value'})
        .expect(function(res) {
          const { key, value } = res.body
          res.body = { key, value }
        })
        .expect(200, {
          key: 'test-key',
          value: 'test-value'
        }, done)
    })

    it('get success', done => {
      request(server)
        .get(('/persist/kv/test-key'))
        .expect(function(res) {
          const { key, value } = res.body
          res.body = { key, value }
        })
        .expect(200, {
          key: 'test-key',
          value: 'test-value'
        }, done)
    })

    it('another save success', done => {
      request(server)
        .put('/persist/kv/test-key2')
        .send({value: 'test-value2'})
        .expect(function(res) {
          const { key, value } = res.body
          res.body = { key, value }
        })
        .expect(200, {
          key: 'test-key2',
          value: 'test-value2'
        }, done)
    })


    it('multi get success', done => {
      request(server)
        .post(('/persist/mget'))
        .send({
          keys: ['test-key', 'wrong-key', 'test-key2']
        })
        .expect(function(res) {
          const list = res.body
          res.body = list.map(result => {
            if(result === null) {
              return null
            }

            const {key, value} = result
            return {key, value}
          })
        })
        .expect(200, [
          {key: 'test-key', value: 'test-value'},
          null,
          {key: 'test-key2', value: 'test-value2'},
        ], done)
    })

    it('list with begins success', done => {
      request(server)
        .get(('/persist/kv'))
        .query({begins: 'test-key2'})
        .expect(function(res) {
          const list = res.body
          res.body = list.filter(item => item === 'test-key' || item === 'test-key2')
        })
        .expect(200,
                ['test-key2'],
                done)
    })

    it('delete success', done => {
      request(server)
        .delete('/persist/kv/test-key2')
        .expect(200, done)
    })

    it('list get success', done => {
      request(server)
        .get(('/persist/kv'))
        .expect(function(res) {
          const list = res.body
          res.body = list.filter(item => item === 'test-key' || item === 'test-key2')
        })
        .expect(200,
                ['test-key'],
                done)
    })

  })
})
