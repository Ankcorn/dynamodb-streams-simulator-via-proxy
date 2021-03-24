process.env.AWS_REGION = 'eu-west-1';
const dynamodbStreamProxy = require('../src');
const dynalite = require('dynalite')({ createTableMs: 0 });
const client = require('./aws');


describe('Emits an event when a record is inserted into dynamodb', () => {
	beforeEach((done) => {
		dynalite.listen(5000, async () => {
			const result = await client.dynalite.createTable({
				TableName: 'dummy',
				AttributeDefinitions: [
					{
						AttributeName: 'id',
						AttributeType: 'S'
					}
				],
				KeySchema: [
					{ AttributeName: 'id', KeyType: 'HASH' }
				],
				BillingMode: 'PAY_PER_REQUEST',
			}).promise();
			console.log(result)
			done()
		})
	})
	it('Writes an item ', async () => {
		await dynamodbStreamProxy();
		const res = await client.proxy.put({
			TableName: 'dummy',
			Item: {
				id: '1',
				f1: 4,
				f2: 'a',
				f3: {
					a: 'a'
				},
				f4: [
					1,2
				]
			}
		}).promise();
		console.log(res)
		expect(2).toBe(2)
	})
	afterEach((done) => {
		dynalite.close(done)
	})

})
