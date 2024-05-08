const http = require("http");
const express = require("express");
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocument,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("public")); // http://expressjs.com/en/starter/static-files.html
app.use(cors());

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html
const client = new DynamoDBClient({ region: "eu-west-3" });

const documentClient = DynamoDBDocument.from(client);

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api", (req, res) => {
  if (req.body.todo === "selectAll") {
    documentClient.scan({ TableName: req.body.table }).then((data) => {
      res.status(200).json(data.Items);
    });
  } else if (req.body.todo === "insert") {
    const params = {
      TableName: req.body.table,
      Item: {
        id: Math.floor(Date.now() / 1000),
        lieu: req.body.lieu,
        ville: req.body.ville,
        note: req.body.note,
        commentaire: req.body.commentaire,
        type: req.body.type,
      },
    };

    documentClient
      .send(new PutCommand(params))
      .then((data) => {
        console.log("Item added successfully:", data);
        res.status(200).json(params.Item);
      })
      .catch((error) => {
        console.error("Error adding item:", error);
        res.status(400).end();
      });
  } else if (req.body.todo === "delete") {
    const params = {
      TableName: req.body.table,
      Key: {
        id: parseInt(req.body.id, 10), // Specify the value of the id attribute of the item to be deleted
      },
    };

    // Execute the delete operation
    documentClient
      .send(new DeleteCommand(params))
      .then((data) => {
        console.log("Item deleted successfully:", data);
        res.status(200).send(req.body.id);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        res.status(400).send(error);
      });
  } else {
    res.status(404).end();
  }
});

const server = http.createServer(app);

server.listen(process.env.PORT || "3000");
