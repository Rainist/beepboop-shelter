const assert = require('assert')
const request = require('supertest')
const proxyTo = require('../proxy')
const echoServer = require('./echo-server')
const proxy = proxyTo('http://localhost:5000')

const {
  slackAccessToken: accessToken,
  slackBotAccessToken: botToken,
  slackBotUsername: botUsername
} = require('../config')

const {
  slackVerifyToken: verifyToken,
  slackTeamId: teamId,
  slackSenderId: senderId,
  slackChannelId: channelId,
  slackBotUserId: botUserId,
  slackTeamDomain: teamDomain,
  slackTeamName: teamName
} = require('./config')

describe('Proxy and manipulate header', () => {
  let server
  let echo

  beforeEach(() => {
    echo = echoServer.listen(5000, () => {})
    server = proxy.listen(3000, () => {})
  })

  afterEach(() => {
    server.close()
    echo.close()
  })

  it('respond to /', done => {
    request(server)
      .get('/')
      .expect(200, done)
  })

  it('manipulate header in event subscripotion', done => {
    const authedUserId = botUserId

    request(server)
      .post('/slack/event')
      .send({
        "token": verifyToken,
        "team_id": teamId,
        "api_app_id": "A5MQM034L", //TODO: avoid hard coding
        "event":{
          "type":"message",
          "user": senderId,
          "text":"diff",
          "ts":"1510217310.000266",
          "channel": channelId,
          "event_ts":"1510217310.000266"},
        "type":"event_callback",
        "event_id":"Ev7XJNL84D",
        "event_time":1510217310,
        "authed_users":[authedUserId]
      })
      .expect('bb-slackaccesstoken', accessToken)
      .expect('bb-slackbotaccesstoken', botToken)
      .expect('bb-slackuserid', authedUserId)
      .expect('bb-slackbotuserid', botUserId)
      .expect('bb-slackbotusername', botUsername)
      .expect('bb-slackteamdomain', teamDomain)
      .expect('bb-slackteamname', teamName)
      .expect(res => {
        // console.log(res.headers)
      })
      .expect(200, done)
  })
})
