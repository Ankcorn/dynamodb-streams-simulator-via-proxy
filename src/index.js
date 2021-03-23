const http = require('http');
const { PassThrough, Transform } = require('stream');
const EventEmitter = require('events');
const DynamoDB = require('aws-sdk/clients/dynamodb')

function dynamodbStreamProxy(config) {
	const dynamodb = new DynamoDB({ endpoint: 'http://localhost:5000' || config.endpoint, region: process.env.AWS_REGION || config.region });
	const server = http.createServer(onRequest).listen(8000);
	const emitter = new EventEmitter();
	
	function onRequest(client_req, client_res) {	
		const options = {
			hostname: 'localhost',
			port: 5000,
			path: client_req.url,
			method: client_req.method,
			headers: client_req.headers
		};
		const streamEvent = {
			dynamodb: {},
		}
		const proxy = http.request(options, function (res) {
	
			const pass = new PassThrough();
			client_res.writeHead(res.statusCode, res.headers)
			res.pipe(pass)
	
			pass.on('data', async () => { 
				if(streamEvent.dynamodb.Keys) {
					const result = await dynamodb.getItem({ TableName: streamEvent.TableName, Key: streamEvent.dynamodb.Keys }).promise().catch(console.log)
					streamEvent.dynamodb['NewKey'] = result.Item
					emitter.emit('event', streamEvent)
				}
			});
	
			pass.pipe(client_res, {
				end: true
			});
		});
	
		const transform = new Transform({
			objectMode: true,
			async transform(chunk, _, callback) {
				if(client_req.headers['x-amz-target'].includes('UpdateItem')) {
					const body = JSON.parse(chunk.toString())
					streamEvent['TableName'] = body.TableName;
					streamEvent.dynamodb['Keys'] = body.Key;
					
					const result = await dynamodb.getItem({ TableName: body.TableName, Key: streamEvent.dynamodb['Keys'] }).promise().catch(console.log)
					streamEvent.dynamodb['OldKey'] = result.Item
				}
				callback(null, chunk)
			}
		});
		
		client_req.pipe(transform)
		transform.pipe(proxy, {
			end: true
		});
	}

	return {
		on: emitter.on,
		close: server.close()
	}
}

module.exports = dynamodbStreamProxy
