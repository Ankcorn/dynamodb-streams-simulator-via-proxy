const http = require('http');
const { PassThrough } = require('stream');
const DynamoDB = require('aws-sdk/clients/dynamodb')

http.createServer(onRequest).listen(8000);

const dynamodb = new DynamoDB({ endpoint: 'http://localhost:5000', region: 'eu-west-1' })
function onRequest(client_req, client_res) {
	const pass = new PassThrough();
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
				console.log(JSON.stringify(streamEvent, null, 2))
			}
		});

    pass.pipe(client_res, {
      end: true
    });
  });


	pass.on('data', async (chunk) => {
		// console.log('REQUEST')
		// console.log(client_req.headers)
		
		if(client_req.headers['x-amz-target'].includes('UpdateItem')) {
			const body = JSON.parse(chunk.toString())
			streamEvent['TableName'] = body.TableName;
			streamEvent.dynamodb['Keys'] = body.Key;
			
			/** THIS IS RUNNING AFTER THE UPDATE PASSTHROUGH STREAMS ARE WRONG FOR THIS.... NEED to use a transform stream maybe idk*/
			const result = await dynamodb.getItem({ TableName: body.TableName, Key: streamEvent.dynamodb['Keys'] }).promise().catch(console.log)
			
			streamEvent.dynamodb['OldKey'] = result.Item
		}
	 });
	
	client_req.pipe(pass)
  pass.pipe(proxy, {
    end: true
  });
}
