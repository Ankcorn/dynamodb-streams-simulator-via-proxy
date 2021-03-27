const EventEmitter = require("events");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const createProxy = require("./proxy");

async function dynamodbStreamProxy(config) {
  const dynamodb = new DynamoDB({
    endpoint: config.dbEndpoint || "http://localhost:5000",
    region: process.env.AWS_REGION || config.dbRegion,
  });
  const emitter = new EventEmitter();

  const eventTypes = {
    "DynamoDB_20120810.PutItem": "INSERT",
    "DynamoDB_20120810.UpdateItem": "MODIFY",
    "DynamoDB_20120810.DeleteItem": "REMOVE",
  };

  const server = await createProxy(
    config.proxyPort || 8000,
    async (req) => {
      const TableName = req.body.TableName;
      const body = req.body.Item;
      const { Table } = await dynamodb.describeTable({ TableName }).promise();
      const eventName = eventTypes[req.headers["x-amz-target"]];
      const Keys =
        req.body.Key ||
        Table.KeySchema.reduce(
          (sum, el) => ({
            ...sum,
            [el.AttributeName]: body[el.AttributeName],
          }),
          {}
        );

      const { Item: OldImage } = await dynamodb
        .getItem({ TableName, Key: Keys })
        .promise();
      console.log({ OldImage });
      return {
        eventName,
        awsRegion: "eu-west-1",
        TableName,
        dynamodb: {
          ApproximateCreationDateTime: 1594936434,
          OldImage,
          Keys,
          SequenceNumber: "100000000061894315953",
          SizeBytes: 20,
          StreamViewType: "NEW_AND_OLD_IMAGES",
        },
        eventSource: "aws:dynamodb",
        eventVersion: "1.1",
        eventID: "4f5dde6250d4c12800433bfae4d2eb7c",
        eventSourceARN:
          "arn:aws:dynamodb:eu-west-1:🦊:table/dynamodb-streams-test-experiment-NewTable-UK5PFMFS64LS/stream/2020-07-16T21:40:16.987",
      };
    },
    async (state) => {
      const { Item: NewImage } = await dynamodb
        .getItem({ TableName: state.TableName, Key: state.dynamodb.Keys })
        .promise();
      state.dynamodb["NewImage"] = NewImage;
      delete state.TableName;
      return emitter.emit("event", state);
    }
  );

  return {
    emitter,
    server,
  };
}

module.exports = dynamodbStreamProxy;
