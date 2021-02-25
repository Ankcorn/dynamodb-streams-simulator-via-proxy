# [WIP] dynamodb-streams-via-proxy

I wrote this when my puppy woke up at 5am and wouldnt go back to bed without me in the room so its a total mess...

Run this with npm start

Set the aws-sdk to use port 8000

run dynalite or dynamodb-local on port 5000

logs out the stream evnet thing (currently the wrong format)

Issues:
need to handle removes and inserts, also make valid events

Need api, was thinking

```javascript
await dynamoStreamProxy.start(config);
dynamodbStreamProxy.on('event', async (e) => {
    await invokeLambda('lambda-name', e);
})
```
