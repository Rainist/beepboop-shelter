'use strict'

const _ = require('lodash')
const config = require('./config')
const slack = require('./slack')

const {
  slackAccessToken: accessToken,
  slackBotAccessToken: botToken,
  slackBotUsername: botUsername
} = config

const genHeaders = (body) => {
  if (_.isEmpty(body)) {
    return []
  }

  const {
    token: verificationToken,
    team_id: teamId,
    api_app_id: apiAppId,
    authed_users: authedUsers
  } = body

  const authedUserId = _(authedUsers).first()

  return [
    slack.data()
      .then(({bot}) => {
        const {userId: botUserId} = bot

        return {
          'bb-slackaccesstoken': accessToken,
          'bb-slackbotaccesstoken': botToken,
          // userID for the user who installed the app
          'bb-slackuserid': authedUserId,
          // userID of the bot user of the app
          'bb-slackbotuserid': botUserId
        }
      }),

    // botID for the Slack App (different from the bots userID)
    slack.data()
      .then(({bot}) => {
        return {
          'bb-slackbotid': bot.botId
        }
      }),

    // additional bot and team meta-data
    slack.data()
      .then(({team}) => {
        const {name, domain} = team
        return {
          'bb-slackbotusername': botUsername,
          'bb-slackteamdomain': domain,
          'bb-slackteamname': name
        }
      }),

    // Couldn't find the use case yet
    // (() => {
    //   // Beep Boop specific ID for App/Team association
    //   return {
    //     'bb-slackteamresourceid': '' //TODO: fetch it!
    //   }
    // })(),
    (() => {
      return {
        // Incoming webhook props
        'bb-incomingwebhookurl': '', //TODO: fetch it!
        'bb-incomingwebhookchannel': '' //TODO: fetch it!
      }
    })(),
    (() => {
      return {
        'bb-error': '' //TODO: fetch it!
      }
    })()
  ]
}

module.exports = {
  fill: (body) => {
    return Promise.all(genHeaders(body))
  }
}
