# Beepboop Shelter

> this project is aiming to make exisiting slapp apps work without any modification of the source code of theirs
> by mocking beepboop hosting features
> since Beepboophq is shutting down - https://blog.beepboophq.com/the-final-chapter-of-beep-boop-efab4f351a51

## 1. What beepboophq.com did to provide host your bot app?

1) Physical hosting - including having an public endpoint and scaling
2) Handling auth with slack - https://blog.beepboophq.com/creating-a-slack-app-with-slapp-firebase-83e4ad139006
3) Saving conversations (temporarily) - https://blog.beepboophq.com/creating-a-slack-app-with-slapp-firebase-83e4ad139006, https://beepboophq.com/docs/article/api-persist
4) Proxying slack's requests

## 2. What this project does
everything in 1. except 1)

## 3. So, how can I replace Beepboophq with this project?

- run this app and your exisiting (working) slapp app side by side (I recommend using docker)
connect each other using environment variables

## 4. How to run this app

## 5. ENV for this app

## 6. ENV for your slapp app

## 7. Test if everything works fine
> using ngrok or a machine with public ip or domain with https

## 8. Production hosting
- docker
- k8s
- now
