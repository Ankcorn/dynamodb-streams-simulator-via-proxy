process.env.AWS_REGION = "eu-west-1";
const dynalite = require("dynalite")({ createTableMs: 0 });
const client = require("./aws");
const dynamodbStreamProxy = require("../src/index");

describe("Emits an event when a record is inserted into dynamodb", () => {
  beforeEach((done) => {
    dynalite.listen(5000, async () => {
      await client.dynalite
        .createTable({
          TableName: "dummy",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
        .promise();
      done();
    });
  });
  it("Writes an item ", async () => {
    const streamProxy = await dynamodbStreamProxy();
    const event = jest.fn();
    streamProxy.emitter.on("event", event);
    await client.proxy
      .put({
        TableName: "dummy",
        Item: {
          id: "1",
          f1: 2,
          f2: "a",
          f3: {
            a: "a",
          },
          f4: [1, 2],
        },
      })
      .promise();
    expect(event).toBeCalledWith({
      awsRegion: "eu-west-1",
      dynamodb: {
        ApproximateCreationDateTime: 1594936434,
        Keys: { id: { S: "1" } },
        NewImage: {
          f1: { N: "2" },
          f2: { S: "a" },
          f3: { M: { a: { S: "a" } } },
          f4: { L: [{ N: "1" }, { N: "2" }] },
          id: { S: "1" },
        },
        OldImage: undefined,
        SequenceNumber: "100000000061894315953",
        SizeBytes: 20,
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      eventID: "4f5dde6250d4c12800433bfae4d2eb7c",
      eventName: "INSERT",
      eventSource: "aws:dynamodb",
      eventSourceARN:
        "arn:aws:dynamodb:eu-west-1:🦊:table/dynamodb-streams-test-experiment-NewTable-UK5PFMFS64LS/stream/2020-07-16T21:40:16.987",
      eventVersion: "1.1",
    });
		await streamProxy.server.close()
  }, 10000);

  it("Updates an item", async () => {
    await client.doculite.put({
        TableName: "dummy",
        Item: {
          id: "1",
          f1: 2,
          f2: "a",
          f3: {
            a: "a",
          },
          f4: [1, 2],
        },
      })
      .promise();
    const streamProxy = await dynamodbStreamProxy();
    const event = jest.fn();
    streamProxy.emitter.on("event", event);
    await client.proxy.update({
      TableName: 'dummy',
      Key: {
        id: "1"
      },
      UpdateExpression: 'SET f1 = :c',
      ExpressionAttributeValues: {
        ":c": 3
      }
    }).promise()
    expect(event).toBeCalledWith({
      awsRegion: "eu-west-1",
      dynamodb: {
        ApproximateCreationDateTime: 1594936434,
        Keys: { id: { S: "1" } },
        OldImage: {
          f1: { N: "2" },
          f2: { S: "a" },
          f3: { M: { a: { S: "a" } } },
          f4: { L: [{ N: "1" }, { N: "2" }] },
          id: { S: "1" },
        },
        NewImage: {
          f1: { N: "3" },
          f2: { S: "a" },
          f3: { M: { a: { S: "a" } } },
          f4: { L: [{ N: "1" }, { N: "2" }] },
          id: { S: "1" },
        },
        SequenceNumber: "100000000061894315953",
        SizeBytes: 20,
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      eventID: "4f5dde6250d4c12800433bfae4d2eb7c",
      eventName: "MODIFY",
      eventSource: "aws:dynamodb",
      eventSourceARN:
        "arn:aws:dynamodb:eu-west-1:🦊:table/dynamodb-streams-test-experiment-NewTable-UK5PFMFS64LS/stream/2020-07-16T21:40:16.987",
      eventVersion: "1.1",
    });
		await streamProxy.server.close()
  }, 10000);

  it("Removes an item", async () => {
    await client.doculite.put({
        TableName: "dummy",
        Item: {
          id: "1",
          f1: 2,
          f2: "a",
          f3: {
            a: "a",
          },
          f4: [1, 2],
        },
      })
      .promise();
    const streamProxy = await dynamodbStreamProxy();
    const event = jest.fn();
    streamProxy.emitter.on("event", event);
    await client.proxy.delete({
      TableName: 'dummy',
      Key: {
        id: "1"
      }
    }).promise()
    expect(event).toBeCalledWith({
      awsRegion: "eu-west-1",
      dynamodb: {
        ApproximateCreationDateTime: 1594936434,
        Keys: { id: { S: "1" } },
        OldImage: {
          f1: { N: "2" },
          f2: { S: "a" },
          f3: { M: { a: { S: "a" } } },
          f4: { L: [{ N: "1" }, { N: "2" }] },
          id: { S: "1" },
        },
        NewImage: undefined,
        SequenceNumber: "100000000061894315953",
        SizeBytes: 20,
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      eventID: "4f5dde6250d4c12800433bfae4d2eb7c",
      eventName: "REMOVE",
      eventSource: "aws:dynamodb",
      eventSourceARN:
        "arn:aws:dynamodb:eu-west-1:🦊:table/dynamodb-streams-test-experiment-NewTable-UK5PFMFS64LS/stream/2020-07-16T21:40:16.987",
      eventVersion: "1.1",
    });
		await streamProxy.server.close()
  }, 10000);
  afterEach((done) => {
    dynalite.close(done);
  });
});
