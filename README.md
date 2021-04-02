# dynamodb-streams-via-proxy

Proxies requests to a local dynamodb instance (dynalite or dynamodb local) and emits events for INSERTS, UPDATES and REMOVES. This makes it easier to mock dynamodb streams for local development.

## Getting Started

Run `npm i dynamodb-streams-via-proxy`

Example usage

```javascript
const dynamodbStreamProxy = require('dynamodb-streams-via-proxy');
const streamProxy = await dynamodbStreamProxy();
streamProxy.emitter.on("event", (record => {
	// record is a single change
});

await streamProxy.server.close()
```

dynamodbStreamProxy takes the following options

* dbPort - the port of your local dynamodb instance. Defaults to `8000`
* dbRegion - the region of the local dynamodb instance. Defaults to `process.env.AWS_REGION`
* proxyPort - the endpoint clients should make requests to. Defaults to `5000`
