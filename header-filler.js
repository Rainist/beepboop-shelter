'use strict'

const _ = require('lodash')
const config = require('./config')
const slack = require('./slack')
const Feature = require('./feature')

const {
  slackAccessToken: accessToken,
  slackBotAccessToken: botToken,
  slackBotUsername: botUsername
} = config

const genHeaders = (body, feature) => {
  switch(feature) {
  case Feature.EVENT:
    return genHeadersJSON(body)
  case Feature.ACTION:
    return genHeadersForm(body)
  default:
    return []
  }
}

const genHeadersForm = (body) => {
  const payload = JSON.parse(body.payload)

  const {
    token: verificationToken,
    team,
    user
  } = payload

  return genHeadersByInfo({verificationToken, teamId: team.id, authedUsers: [user.id]})
}

const genHeadersJSON = (body) => {
  if (_.isEmpty(body)) {
    return []
  }

  const {
    token: verificationToken,
    team_id: teamId,
    authed_users: authedUsers
  } = body

  return genHeadersByInfo({verificationToken, teamId, authedUsers})
}

const genHeadersByInfo = ({verificationToken, teamId, authedUsers}) => { // eslint-disable-line no-unused-vars
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
    //     'bb-slackteamresourceid': '' //maybeTODO: fetch it!
    //   }
    // })(),
    {'bb-slackteamid': teamId},
    (() => {
      return {
        // Incoming webhook props
        'bb-incomingwebhookurl': '', //maybeTODO: fetch it!
        'bb-incomingwebhookchannel': '' //maybeTODO: fetch it!
      }
    })(),
    (() => {
      return {
        'bb-error': '' //maybeTODO: fetch it!
      }
    })()
  ]
}

module.exports = {
  fill: (body, feature) => {
    return Promise.all(genHeaders(body, feature))
  }
}
