/*
 ********************************************************************************
 *
 * Tractor Push: A Node.js, socket.io, Ruby, and MongoDB tailed cursor demonstration application.
 *
 * This file, app.js, serves as the primary server component.
 * Its responsibilities include serving the main HTML page (index.html)
 * and handling all incoming socket.io requests.
 * The application leverages MongoDB's powerful tailed cursors to
 * efficiently retrieve and push real-time data in response to
 * client-side socket.io subscriptions.
 *
 ********************************************************************************
 */


/*
 ********************************************************************************
 *
 * ObjectLabs, the company behind MongoLab.com, provides a robust, cloud-hosted
 * MongoDB service. This application demonstrates interaction with such a service.
 *
 * Copyright 2014 ObjectLabs Corp.
 *
 * This software is licensed under the MIT License,
 * with the specific exception of the 'intervalEach()' function,
 * which carries its own separate licensing terms as detailed below.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 ********************************************************************************
 */


/*
 ********************************************************************************
 *
 * The 'intervalEach()' function itself is separately copyrighted:
 * Copyright 2009-2010 Christian Amor Kvalheim.
 * For further attributions and details regarding this specific component,
 * please refer to the 'package.json' file included with this distribution.
 *
 * The 'intervalEach()' function is licensed under the Apache License, Version 2.0
 * (referred to herein as "the Apache License").
 * You may not use this specific file or function except in compliance with the Apache License.
 * You can obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Apache License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License for the specific language governing permissions and
 * limitations under the Apache License.
 *
 ********************************************************************************
 */


/*
 ********************************************************************************
 *
 * NB: It's important to note that this demonstration intentionally does NOT
 * implement a durable connection to MongoDB that automatically retries upon
 * connection failures. Instead, it assumes and relies upon a PaaS (Platform as a Service)
 * provider's durable restart mechanisms to handle service interruptions.
 * This is, in essence, a known limitation and a designated "TODO" for future improvements.
 *
 ********************************************************************************
 */

var fs = require("fs"), // File system module for reading files
    url = require("url"), // URL parsing utilities
    emitter = require("events").EventEmitter, // Event emitter base class
    assert = require("assert"); // Assertion testing utility


var mongo = require("mongodb"), // MongoDB driver module
    Cursor = mongo.Cursor; // Directly reference the Cursor class from the driver


// Retrieve MongoDB connection URI from environment variables (Heroku-style)
// or default to a local test database if not specified.
var uristring = process.env.MONGOLAB_URI || "mongodb://localhost/testdatabase";
// Parse the MongoDB connection URL for informational purposes.
var mongoUrl = url.parse(uristring);


/*
 ********************************************************************************
 *
 * Initialize the HTTP server and bind the socket.io service to it.
 *
 ********************************************************************************
 */
var app = require("http").createServer(handler), // Create HTTP server, 'handler' function defined below
    io = require("socket.io").listen(app); // Attach Socket.IO to the HTTP server


// Determine the port to listen on; use environment variable PORT or default to 2000.
theport = process.env.PORT || 2000;
// Start the HTTP server and begin listening for incoming requests.
app.listen(theport);
// Log the port the server is running on to the console.
console.log("http server on port: " + theport);


/**
 * @function handler
 * @description Handles incoming HTTP requests, primarily serving the index.html file.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
function handler(req, res) {
    fs.readFile(__dirname + "/index.html", // Read the index.html file from the current directory
        function(err, data) { // Callback function executed after readFile completes
            if (err) { // Check for errors during file reading
                res.writeHead(500); // Send a 500 Internal Server Error status
                return res.end("Error loading index.html"); // End the response with an error message
            }
            res.writeHead(200); // Send a 200 OK status
            res.end(data); // End the response, sending the content of index.html
        });
}


/*
 ********************************************************************************
 *
 * Establish a connection to the MongoDB database.
 * A crucial requirement for utilizing tailable cursors is that the target
 * collection MUST be a capped collection.
 *
 ********************************************************************************
 */
mongo.MongoClient.connect(uristring, function(err, db) { // Attempt to connect to MongoDB using the URI
    // Inform the user about the connection attempt, suppressing the full URL for security/verbosity.
    console.log("Attempting connection to " + mongoUrl.protocol + "//" + mongoUrl.hostname + " (complete URL supressed).");
    db.collection("messages", function(err, collection) { // Access the "messages" collection
        collection.isCapped(function(err, capped) { // Check if the "messages" collection is capped
            if (err) { // Handle errors during the capped check
                console.log("Error when detecting capped collection. Aborting. Capped collections are necessary for tailed cursors.");
                process.exit(1); // Exit the process with an error code
            }
            if (!capped) { // If the collection is not capped
                console.log(collection.collectionName + " is not a capped collection. Aborting. Please use a capped collection for tailable cursors.");
                process.exit(2); // Exit the process with a different error code
            }
            // Log successful connection and capped collection verification.
            console.log("Success connecting to " + mongoUrl.protocol + "//" + mongoUrl.hostname + ".");
            startIOServer(collection); // Proceed to start the Socket.IO server with the collection
        });
    });
});


/*
 ********************************************************************************
 *
 * Binds the data sending logic to the "connection" event of Socket.IO.
 * This ensures that when a new client connects, data streaming begins for them.
 *
 ********************************************************************************
 */
function startIOServer(collection) {
    console.log("Starting Socket.IO server..."); // Log that the Socket.IO server is starting

    io.sockets.on("connection", function(socket) { // Listen for new client connections
        readAndSend(socket, collection); // When a client connects, initiate data reading and sending
    });
}


/*
 ********************************************************************************
 *
 * Core logic to read data from MongoDB and send it to the connected socket.
 * This function performs the main work upon a new client connection.
 * It queries the database twice and establishes two distinct data streams
 * to the client, each for a different type of message.
 *
 * (Known Bug): This implementation currently does not function correctly
 * if the target MongoDB collection is entirely empty. It expects at least
 * some documents to be present.
 *
 ********************************************************************************
 */
function readAndSend(socket, collection) {
    // First query: Retrieve all messages, using a tailable cursor with natural sort order.
    collection.find({}, {
        "tailable": 1,
        "sort": [
            ["$natural", 1]
        ]
    }, function(err, cursor) {
        // Use the custom intervalEach() method to iterate over cursor results
        // with a 300ms delay between each item.
        // intervalEach() is a modified version of the standard each() method
        // that introduces a specified pause between iterations.
        cursor.intervalEach(300, function(err, item) {
            if (item != null) { // If an item is received from the cursor
                socket.emit("all", item); // Emit the item to clients subscribed to the "all" event
            }
        });
    });

    // Second query: Retrieve messages specifically of type "complex",
    // again using a tailable cursor with natural sort order.
    collection.find({
        "messagetype": "complex"
    }, {
        "tailable": 1,
        "sort": [
            ["$natural", 1]
        ]
    }, function(err, cursor) {
        // Use intervalEach() for this stream as well, but with a longer 900ms delay.
        cursor.intervalEach(900, function(err, item) {
            if (item != null) { // If an item is received from this cursor
                socket.emit("complex", item); // Emit the item to clients subscribed to the "complex" event
            }
        });
    });
}


/*
 ********************************************************************************
 *
 * Duck-punching the MongoDB driver's Cursor.each method.
 * This modified version, `intervalEach`, now accepts an `interval` parameter.
 * It introduces a delay of `interval` milliseconds before making the request
 * for the *next* object in the cursor's stream. This helps control the rate
 * at which data is processed and sent.
 *
 ********************************************************************************
 */
Cursor.prototype.intervalEach = function(interval, callback) {
    var self = this; // Capture 'this' context for use within nested functions
    if (!callback) { // Ensure a callback function is provided
        throw new Error("callback is mandatory"); // Throw an error if no callback
    }

    if (this.state != Cursor.CLOSED) { // Proceed only if the cursor is not already closed
        // FIX: Addresses a potential stack overflow issue that can occur
        // with deep callbacks. (Credit: https://github.com/limp/node-mongodb-native/commit/27da7e4b2af02035847f262b29837a94bbbf6ce2)
        setTimeout(function() { // Introduce a delay before fetching the next object
            // Fetch the next object from the cursor. This continues until no more objects are available.
            self.nextObject(function(err, item) {
                if (err != null) return callback(err, null); // If an error occurs, invoke callback with error

                if (item != null) { // If an item was successfully retrieved
                    callback(null, item); // Invoke the callback with the item
                    self.intervalEach(interval, callback); // Recursively call intervalEach for the next item
                } else { // If no more items are available (item is null)
                    self.state = Cursor.CLOSED; // Mark the cursor as closed
                    callback(err, null); // Invoke callback indicating end of stream (item is null)
                }

                item = null; // Explicitly nullify item to aid garbage collection
            });
        }, interval); // The delay specified by 'interval' milliseconds
    } else { // If the cursor is already closed
        callback(new Error("Cursor is closed"), null); // Invoke callback with an error indicating the cursor is closed
    }
};