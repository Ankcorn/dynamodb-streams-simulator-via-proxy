const dynamodbStreamProxy = require('../src');
const dynalite = require('dynalite')({ createTableMs: 50 });
const client = require('./aws');


describe('Emits an event when a record is inserted into dynamodb', () => {
	dynalite.listen(4000)
	dynalite.close
})
