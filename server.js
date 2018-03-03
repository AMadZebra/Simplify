var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')

var AWS = require('aws-sdk');
AWS.config.update({
  region: "us-west-2",
  accessKeyId: 'ACCESS KEY',
  secretAccessKey: 'SECRET KEY',
});

var docClient = new AWS.DynamoDB.DocumentClient();

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.post('/analyze', function(req, res) {
  var text = req.body;

  var words = JSON.stringify(text.body).split(" ");

  var result = "";

  for(var i=0; i< words.length; i++){
    //set parameter
    var params = {
      TableName : "Dictionary",
      KeyConditionExpression: "#w = :word",
      ExpressionAttributeNames:{
          "#w": "Word"
      },
      ExpressionAttributeValues: {
          ":word":words[i].replace(/\"/g, "")
      }
    };
    console.log("CHECKING: " + words[i].replace(/\"/g, ""));

    //send query to dynamoDB
    docClient.query(params, function(err, data) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          console.log("Query succeeded.");
          data.Items.forEach(function(item) {
            //console.log(" ", item.Word + ": " + item.Definition);
            result = result + item.Word + ": " + item.Definition + "\n\n";

          });
      }
    });
console.log(result);
    res.send(result);

  }

  //check if dictionary word is in given body, put in loop

  // Create the DynamoDB service object
  ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

  //res.type('json');
  //res.send(text.body);
});


app.get('/message', function(req, res) {
  var difficulty = req.query;

  //res.type('text');

  res.send(difficulty);
});

// configure app to use bodyParser()
// this will let us get the data from a POST
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
var router = express.Router();              // get an instance of the express Router

app.use(express.static('./'));
http.createServer(app).listen(process.env.PORT || 5000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
