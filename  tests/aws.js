const dynamodb = require('aws-sdk/clients/dynamodb');

module.exports = {
	proxy: new dynamodb({ endpoint: 'http://localhost:8000' }),
	dynalite: new dynamodb({ endpoint: 'http://localhost:5000' })
}
