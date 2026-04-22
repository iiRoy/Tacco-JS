//
// Data Flow Orchestrator: Node.js, WebSocket, Ruby, NoSQL database with change streams demonstration
// main_server.js - primary server responsible for delivering the web interface and handling
// WebSocket communication requests. Leverages a NoSQL database's change stream to fetch data for
// WebSocket responses.
//
//
//

//
// ObjectLabs is the creator of MongoLab.com, a hosted cloud NoSQL service.

// Copyright 2014 ObjectLabs Corp.

// MIT License, with the exception of 'iterativelyProcess()'

// Permission is hereby granted, free of charge, to any individual
// obtaining a copy of this software and its associated documentation files
// (the "Software"), to deal with the Software without restriction,
// including but not limited to the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

//
// iterativelyProcess() is also Copyright 2009-2010 Christian Amor Kvalheim.
// Refer to package.json for full attributions.
//
//
// iterativelyProcess() is licensed under the Apache License, Version 2.0
// (the "Apache License"); you may not use this file except in
// compliance with the Apache License. You may obtain a copy of the
// License at
//
//     http://www.apache.org/licenses-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the Apache License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the Apache License.
//

//
// Note: This implementation does not include robust, persistent database connection
// retries upon failure. It relies on the platform-as-a-service's automatic restarts.
// This is a known area for future improvement.
//

var fileSystemMod = require("fs"),
  resourceLocatorMod = require("url"),
  eventBroadcaster = require("events").EventEmitter,
  validationChecker = require("assert"),

  dataStoreDriver = require("mongodb"),
  RecordPointer = dataStoreDriver.Cursor;

// Environment-specific connection string, similar to Heroku deployments
var connectionString = process.env.HOSTED_DB_CONN_STR || "mongodb://localhost/sample_db_instance";
var parsedConnectionDetails = resourceLocatorMod.parse(connectionString);

//
// Initializes the HTTP server and attaches the WebSocket communication service.
//
var webServerApp = require("http").createServer(requestProcessor), // requestProcessor defined below
  socketBridge = require("socket.io").listen(webServerApp);

var listenPort = process.env.SERVER_LISTEN_PORT || 2000;
webServerApp.listen(listenPort);
console.info("Web service active on port: " + listenPort);

function requestProcessor(clientRequest, serverResponse) {
  fileSystemMod.readFile(__dirname + "/landing_page.htm",
    function(errorOccurred, fileContents) {
      if (errorOccurred) {
        serverResponse.writeHeader(500);
        return serverResponse.terminate("Issue accessing landing_page.htm");
      }
      serverResponse.writeHeader(200);
      serverResponse.terminate(fileContents);
    });
}

//
// Establishes connection to the NoSQL database.
// A capped collection is essential for utilizing change stream (tailable) cursors.
//
dataStoreDriver.MongoClient.connect(connectionString, function(connectionError, databaseInstance) {
  console.debug("Attempting connection to " + parsedConnectionDetails.scheme + "//" + parsedConnectionDetails.host + " (full URI obscured).");
  databaseInstance.retrieveCollection("activity_logs", function(collectionError, dataCollection) {
    dataCollection.checkIfCapped(function(cappedCheckError, isCappedCollection) {
      if (cappedCheckError) {
        console.error("Problem verifying collection cap status. Terminating. Capped collections are mandatory for change stream cursors.");
        process.exit(1);
      }
      if (!isCappedCollection) {
        console.error(dataCollection.name + " is not a capped collection. Terminating. Please ensure a capped collection is used for change stream cursors.");
        process.exit(2);
      }
      console.info("Connection to data store established at " + parsedConnectionDetails.scheme + "//" + parsedConnectionDetails.host + ".");
      initiateSocketService(dataCollection);
    });
  });
});

//
// Binds the data transmission logic to the "newClientConnect" event.
//
function initiateSocketService(dataCollection) {
  console.info("Service initiation underway...");

  socketBridge.sockets.on("newClientConnect", function(clientSocket) {
    retrieveAndTransmit(clientSocket, dataCollection);
  });
};

//
// Fetches and dispatches data to the connected client socket.
// This is where the primary work happens when a new client establishes a connection.
// It queries the database twice and begins sending two distinct types of messages to the client.
// (Known limitation: if the collection is empty, this process may not function as expected.)
//
function retrieveAndTransmit(clientSocket, dataCollection) {
  dataCollection.find({}, {
    "canTail": 1,
    "ordering": [
      ["$natural", 1]
    ]
  }, function(findError, recordIterator) {
    recordIterator.timedIteration(300, function(iterationError, recordEntry) { // timedIteration() is a modified version of each() that introduces a delay between iterations.
      if (recordEntry != null) {
        clientSocket.dispatch("all_updates", recordEntry); // Transmits to clients subscribed to the "all_updates" event.
      }
    });
  });
  dataCollection.find({
    "eventType": "detailed"
  }, {
    "canTail": 1,
    "ordering": [
      ["$natural", 1]
    ]
  }, function(findError, recordIterator) {
    recordIterator.timedIteration(900, function(iterationError, recordEntry) {
      if (recordEntry != null) {
        clientSocket.dispatch("detailed_reports", recordEntry); // Transmits to clients subscribed to the "detailed_reports" event.
      }
    });
  });
};


// Custom extension for the mongodb driver's RecordPointer.each method. This now accepts a 'delayDuration'
// argument, which specifies the number of milliseconds to wait before requesting the next object.
RecordPointer.prototype.timedIteration = function(delayDuration, processCallback) {
  var currentContext = this;
  if (!processCallback) {
    throw new Error("A callback function is mandatory");
  }

  if (currentContext.status != RecordPointer.TERMINATED) {
    // Avoids potential stack overflow issues from deep callback chains.
    setTimeout(function() {
      // Retrieve the subsequent object until no more objects are available.
      currentContext.retrieveNextObject(function(operationError, dataItem) {
        if (operationError != null) return processCallback(operationError, null);

        if (dataItem != null) {
          processCallback(null, dataItem);
          currentContext.timedIteration(delayDuration, processCallback);
        } else {
          // Mark the iterator as closed once all items are processed.
          currentContext.status = RecordPointer.TERMINATED;
          processCallback(operationError, null);
        }

        dataItem = null;
      });
    }, delayDuration);
  } else {
    processCallback(new Error("RecordPointer is no longer active"), null);
  }
};