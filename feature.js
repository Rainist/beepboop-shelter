'use strict'

const {Enum} = require('enumify')

class Feature extends Enum {
  static byPath(path) {
    switch(path) {
    case '/slack/event':
      return Feature.EVENT
    case '/slack/action':
      return Feature.ACTION
    default:
      return null
    }
  }
}

Feature.initEnum(['EVENT', 'ACTION'])

module.exports = Feature
