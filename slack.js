'use strict'

const _ = require('lodash')
const Slack = require('slack')
const config = require('./config')
const {
  slackAccessToken: accessToken,
  slackBotAccessToken: botToken,
  slackBotUsername: botUsername
} = config
const slack = new Slack({token: botToken})

const {
  getCachedBot,
  getCachedTeam,
  cacheBot,
  cacheTeam
} = require('./slack-cacher')

function _getBot(botName) {
  //TODO: find a way to do this without knowing the bot's username since we already have bot's access token
  return slack.users.list({
    token: botToken
  })
    .then(res => {
      return _(res.members)
        .filter({name: botName})
        .map(bot => {
          return {
            botId: bot.profile.bot_id,
            userId: bot.id
          }
        })
        .head()
    })
    .then(bot => {
      cacheBot(bot)
      return bot
    })
}

function getBot(botName) {
  return getCachedBot()
    .catch(err => {
      return _getBot(botName)
    })
}

function _getTeamInfo(token) {
  return slack.team.info({token})
    .then(res => {
      const {name, domain} = res.team

      return {name, domain}
    })
    .then(team => {
      cacheTeam(team)
      return team
    })
}

function getTeamInfo(token) {
  return getCachedTeam()
    .catch(err => {
      return _getTeamInfo(token)
    })
}

function data() {
  const token = botToken

  return Promise.all([
    getBot(botUsername),
    getTeamInfo(token),
  ]).
    then(([bot, team]) => {
      const {name, domain} = team

      return {
        bot: bot,
        team: {name, domain}
      }
    })
}

module.exports = {data: data}
