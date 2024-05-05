const http = require('http');
const express = require('express');

const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocument} = require('@aws-sdk/lib-dynamodb');

const pantry = require('pantry-node');

const app = express();
const pantryClient = new pantry("62b666e2-d83e-4702-ba4c-2e7900b55e4f");

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/modules/credentials.html
const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html
const config = {
    region: 'eu-west-3',
    credentials,
};

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html
const client = new DynamoDBClient({region : "eu-west-3"});

const documentClient = DynamoDBDocument.from(client);


// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use("/api", (req, res) => {
  if (req.query.todo === "selectAll") {
    documentClient.scan({ TableName: "sorties" })
    .then((data) => {
      res.status(200).json(data.Items);
    })
  }
});

const server = http.createServer(app);

server.listen(process.env.PORT || '3000');
