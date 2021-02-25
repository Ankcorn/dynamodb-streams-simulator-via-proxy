# [WIP] dynamodb-streams-via-proxy

I wrote this when my puppy woke up at 5am and wouldnt go back to bed without me in the room so its a total mess...

```javascript
const dynamodbStreamProxy = require('wip');
const proxy = dynamodbStreamProxy({ region: 'eu-west-1' })
proxy.on('event', console.log);
```

or you know invoke your lambda

Set the aws-sdk to use port 8000

run dynalite or dynamodb-local on port 5000

logs out the stream evnet thing (currently the wrong format)

Issues:
need to handle removes and inserts, also make valid events
