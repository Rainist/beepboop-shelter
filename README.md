# Beepboop Shelter
> This project is aiming to make exisiting Slapp apps work without any modification of the source code of theirs
> by mocking beepboop hosting features
> since Beepboophq is shutting down - https://blog.beepboophq.com/the-final-chapter-of-beep-boop-efab4f351a51

## 1. What beepboophq.com did to provide host your bot app?
- 1) Physical hosting - including having an public endpoint and scaling
- 2) Handling auth with slack - https://blog.beepboophq.com/creating-a-slack-app-with-slapp-firebase-83e4ad139006
- 3) Saving conversations (temporarily) - https://blog.beepboophq.com/creating-a-slack-app-with-slapp-firebase-83e4ad139006, https://beepboophq.com/docs/article/api-persist
- 4) Proxying slack's requests
- 5) Maybe more (tell me what you know that I don't know!)

## 2. What this project does
everything in 1. except 1)

## 3. So, how can I run my Slapp app with the shelter instead of beepboophq.com?
- 1) run your Slapp app in a place where the shelter can reach to
- 2) run the shelter to proxy your Slapp app (check 4. and 5. for the details)

## 4. How to run the shelter
#### With Docker
You can either build from the Dockerfile or use [pre built images](https://hub.docker.com/r/rainist/beepboop-shelter/)

#### Without Docker
Hopefully you can figure out by looking at the Dockerfile!

## 5. ENV vars for the Shelter
Take a look at [config.js](./config.js), you need to provide environments

ex)
```bash
# set slack related vars
export SLACK_CLIENT_ID=1010101010.10101010101
export SLACK_CLIENT_SECRET=0928309clientsecret09182309
export SLACK_OAUTH_ACCESS_TOKEN=xoxp-ladkjflaksjdflksjf-your-access-token-asdlkfjlksadjf
export SLACK_BOT_USER_OAUTH_ACCESS_TOKEN=xoxb-alskdfjlkj-your-bot-access-token
export SLACK_BOT_USERNAME=your-bot-name

# your slapp app
export SLAPP_APP_PORT=8080 # you don't actually need to export this
export SLAPP_APP_HOST=http://your.slapp-app.com:$SLAPP_APP_PORT
```

## 6. ENV for your Slapp app
> https://blog.beepboophq.com/beep-boop-custom-bot-config-937eddfbd4e1

You probably used beepboop's custom bot config (check the link above)
Beepboop make sure those vars delivered when they run your Slapp apps.
*However, there is no beepboop to deliver them when you work with beepboop shelter.* **So you need to make sure that you deliver those values to your Slapp app when you run it**

## 7. Test first before you actually migrate completely.
- This is just an humble open source project that was born to solve our own needs to replace beepboop since it's shutting down.
- So there are no guarantees that it provides that everything beepboop did although more could be added as it grows

## 8. Production hosting
You may be able to host with these solutions below and probably whatever that you can manage to run on
- docker
- k8s
- now

I'm planning to test those solutions and will share how to do it in the future

## 9. What's been added and tested
- [x] Handling auth with slack by ENV vars
- [x] Event Subscriptions
- [x] Interact Components

## 10. What's going to be added and tested
- [ ] Slash Commands
- [ ] Incoming Webhooks
- [ ] Could be more

## 11. Development
> I assume you use docker and docker-compose for development

#### ENV vars
> You may need to create .env .env-for-test .env-ngrok files and provide  appropriate ENV vars especially for the .env file

#### run
`$ make run` will run the shelter via docker-compose

#### ngrok
> You probably needs public domain for the shelter to test with slack
`$ make ngrok`

#### down
`$ make down`

## 12. Contribution
#### Code
I'm no expert to neither to slack bots nor to beepboophq. I'm sure you can do better than me for some parts. Please contribute anything!

#### Bugs/Feature request
You can create an issue or PR

#### English
Although everything is written in English, currently no one who's mainly contributing this project is a native English speaker. So I presume you will find lots of English mistakes especially in the documents like this one. Please **Send a PR** if you find any wrong English!

## 13. License
beepboop-shelter is MIT licensed.
