'use strict'

const jwt = require('jsonwebtoken')

const secretKey = 'jwt-secret'
const oneHour = Math.floor(Date.now() / 1000) + (60 * 60)

let botCached
let teamInfoCached

function getCachedItem(token) {
  if (!token) {
    return Promise.reject('No token provided')
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if(decoded) {
        resolve(decoded.data)
        return
      }
      reject(err)
    })
  })
}

function getCachedBot() {
  return getCachedItem(botCached)

}

function getCachedTeam() {
  return getCachedItem(teamInfoCached)
}

function sign(payload) {
  return jwt.sign({
    exp: oneHour,
    data: payload
  }, secretKey)
}

function cacheBot(bot) {
  botCached = sign(bot)
}

function cacheTeam(team) {
  teamInfoCached = sign(team)
}

module.exports = {
  getCachedBot: getCachedBot,
  getCachedTeam: getCachedTeam,
  cacheBot: cacheBot,
  cacheTeam: cacheTeam
}
