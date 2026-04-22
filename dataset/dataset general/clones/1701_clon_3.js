//
// Data Stream Dispatcher: Node.js, Socket.IO, MongoDB Tailable Cursor Demonstration
// server.js - Core application managing HTTP requests and real-time data push via websockets.
// Leverages MongoDB's tailable cursors for live data updates.
//
//
//

//
// ObjectLabs, creators of MongoLab.com, a cloud-hosted MongoDB service.
//
// Copyright 2014 ObjectLabs Corp.
//
// MIT License, with special attribution for the delayedEach() iteration logic.
//
// Permission is granted, free of charge, to any individual obtaining a copy
// of this software and associated documentation files (the "Software"),
// to utilize the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

//
// The `delayedEach()` function also carries a separate copyright:
// Copyright 2009-2010 Christian Amor Kvalheim.
// Refer to the project's package.json for full attributions.
//
// `delayedEach()` is licensed under the Apache License, Version 2.0
// (the "Apache License"); you may not use this file except in compliance
// with the License. You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

//
// Note: This implementation prioritizes demonstration over production-grade
// resilience. A robust solution would include persistent MongoDB connection
// retries, which are currently deferred (TODO).
//

const fileSysUtil = require("fs");
const webAddrParser = require("url");
const eventStream = require("events").EventEmitter; // Renamed, but not directly used in the provided code.
const dbDriver = require("mongodb");
const DbRecordIterator = dbDriver.Cursor;

// --- Application Configuration ---
const appConfig = {
    // Database connection string, prioritizing environment variable for deployment flexibility.
    dbConnectionUri: process.env.DB_SERVICE_URL || "mongodb://localhost/testdatabase",
    // Server listening port, defaults to 2000 if not specified by environment.
    serverListenPort: parseInt(process.env.APP_PORT || "2000", 10),
    // Default path for the client-side HTML file.
    clientHtmlPath: __dirname + "/index.html",
    // Collection name for storing telemetry data.
    telemetryCollectionName: "telemetry_logs",
    // Base delay for general data stream updates in milliseconds.
    baseStreamDelayMs: 300,
    // Extended delay for critical data stream updates in milliseconds.
    criticalStreamDelayMs: 900,
    // Database properties for tailable cursors.
    cursorOptions: {
        tailable: true,
        awaitData: true, // New: Added awaitData for more efficient tailable cursors.
        numberOfRetries: -1, // New: Added a retry option, though actual retry logic is in the driver.
        tailableRetryInterval: 100 // New: Interval for retries.
    },
    // Query filter for critical events.
    criticalEventFilter: { eventType: "critical" },
    // Sort order for tailable cursors.
    naturalSortOrder: { $natural: 1 }
};

// Parse the MongoDB connection URI for logging purposes.
const dbEndpointInfo = webAddrParser.parse(appConfig.dbConnectionUri);

// --- HTTP Server Setup ---
const httpServer = require("http").createServer(requestHandler);
const socketServer = require("socket.io").listen(httpServer);

// Start the HTTP server.
httpServer.listen(appConfig.serverListenPort, () => {
    console.log(`Server successfully started. HTTP listening on port: ${appConfig.serverListenPort}`);
    console.log(`Access the application at: http://localhost:${appConfig.serverListenPort}`);
});

/**
 * Handles incoming HTTP requests, primarily serving the main HTML page.
 * @param {import('http').IncomingMessage} req - The incoming request object.
 * @param {import('http').ServerResponse} res - The server response object.
 */
function requestHandler(req, res) {
    // Basic path validation, only serve root path.
    if (req.url !== "/") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Not Found");
    }

    fileSysUtil.readFile(appConfig.clientHtmlPath, (error, fileContent) => {
        if (error) {
            console.error(`Error loading client HTML file from ${appConfig.clientHtmlPath}:`, error.message);
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Internal Server Error: Could not load client interface.");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fileContent);
    });
}

// --- MongoDB Connection Management ---
console.log(`Attempting to establish database connection to ${dbEndpointInfo.protocol}//${dbEndpointInfo.hostname} ...`);

dbDriver.MongoClient.connect(appConfig.dbConnectionUri, { useNewUrlParser: true, useUnifiedTopology: true }, (error, databaseConnection) => {
    if (error) {
        console.error("Failed to connect to MongoDB. Critical error, exiting:", error.message);
        // Using a non-zero exit code to indicate failure.
        process.exit(101);
    }

    console.log(`Successfully connected to database at ${dbEndpointInfo.protocol}//${dbEndpointInfo.hostname}.`);

    // Retrieve the target collection.
    databaseConnection.collection(appConfig.telemetryCollectionName, (error, dataCollection) => {
        if (error) {
            console.error(`Error accessing collection '${appConfig.telemetryCollectionName}':`, error.message);
            databaseConnection.close();
            process.exit(102);
        }

        // Validate if the collection is capped, which is essential for tailable cursors.
        dataCollection.isCapped((error, isCappedCollection) => {
            if (error) {
                console.error(`Error checking if collection '${appConfig.telemetryCollectionName}' is capped. Aborting.`, error.message);
                databaseConnection.close();
                process.exit(103);
            }
            if (!isCappedCollection) {
                console.error(`Collection '${appConfig.telemetryCollectionName}' is not a capped collection. Tailable cursors require capped collections. Aborting.`);
                console.error("Please ensure the collection is created with the 'capped: true' option.");
                databaseConnection.close();
                process.exit(104);
            }

            console.log(`Collection '${appConfig.telemetryCollectionName}' is validated as a capped collection.`);
            // If all checks pass, proceed to initialize the WebSocket service.
            initializeSocketCommunication(dataCollection);
        });
    });
});

/**
 * Initializes the Socket.IO server to handle client connections and data streaming.
 * @param {import('mongodb').Collection} dataCollection - The MongoDB collection to stream data from.
 */
function initializeSocketCommunication(dataCollection) {
    console.log("Initializing real-time data streaming service...");

    socketServer.sockets.on("connection", (clientSocket) => {
        console.log(`New client connected: ${clientSocket.id}. Setting up data streams.`);
        manageClientDataStream(clientSocket, dataCollection);

        // Optional: Log client disconnection
        clientSocket.on('disconnect', () => {
            console.log(`Client disconnected: ${clientSocket.id}`);
        });
    });
}

/**
 * Manages the data streams for a newly connected client socket.
 * Establishes two tailable cursors to push different types of data at varying intervals.
 * @param {import('socket.io').Socket} clientSocket - The connected client socket.
 * @param {import('mongodb').Collection} dataCollection - The MongoDB collection.
 */
function manageClientDataStream(clientSocket, dataCollection) {
    // Helper function to create and manage a data stream.
    const setupDataStream = (queryFilter, eventName, delayMs) => {
        const cursorOptions = {
            tailable: appConfig.cursorOptions.tailable,
            awaitData: appConfig.cursorOptions.awaitData,
            sort: appConfig.naturalSortOrder
        };

        dataCollection.find(queryFilter, cursorOptions, (error, recordCursor) => {
            if (error) {
                console.error(`Error establishing cursor for '${eventName}' stream:`, error.message);
                return; // Do not proceed with this stream if cursor fails.
            }

            if (!recordCursor) {
                console.warn(`No cursor returned for '${eventName}' stream. This might indicate an empty collection or an issue.`);
                return;
            }

            console.log(`Starting '${eventName}' data stream for client ${clientSocket.id} with delay ${delayMs}ms.`);
            recordCursor.delayedEach(delayMs, (itemError, recordEntry) => {
                if (itemError) {
                    // Log cursor errors but attempt to continue if possible, or close cursor.
                    console.error(`Error during '${eventName}' cursor iteration for client ${clientSocket.id}:`, itemError.message);
                    // Decide whether to close the cursor or let it attempt to recover.
                    // For tailable cursors, often they just wait for new data.
                    return;
                }
                if (recordEntry !== null) {
                    // Ensure the socket is still connected before emitting.
                    if (clientSocket.connected) {
                        clientSocket.emit(eventName, recordEntry);
                    } else {
                        // If socket disconnected, close this cursor.
                        recordCursor.close(() => {
                            console.log(`Cursor for '${eventName}' closed for disconnected client ${clientSocket.id}.`);
                        });
                    }
                }
            });
        });
    };

    // Establish the 'stream_updates' (all records) data stream.
    setupDataStream({}, "stream_updates", appConfig.baseStreamDelayMs);

    // Establish the 'critical_events' (filtered records) data stream.
    setupDataStream(appConfig.criticalEventFilter, "critical_events", appConfig.criticalStreamDelayMs);
}

// --- Custom Cursor Prototype Extension ---
// This extends the MongoDB Cursor prototype to introduce a delay between fetching records.
// This is a "duck-punched" method, modifying an external library's prototype.
DbRecordIterator.prototype.delayedEach = function(delayMs, iterCallback) {
    const currentCursor = this;

    // Input validation for the delay and callback.
    if (typeof delayMs !== 'number' || delayMs < 0) {
        return iterCallback(new Error("Invalid 'delayMs' provided to delayedEach. Must be a non-negative number."));
    }
    if (typeof iterCallback !== 'function') {
        throw new Error("A callback function is mandatory for delayedEach operation.");
    }

    // Check if the cursor is still active.
    if (currentCursor.state !== DbRecordIterator.CLOSED) {
        // Schedule the next record fetch after the specified delay.
        setTimeout(() => {
            currentCursor.nextObject((fetchError, recordEntry) => {
                if (fetchError !== null) {
                    return iterCallback(fetchError, null);
                }

                if (recordEntry !== null) {
                    // If a record is found, invoke the callback and then schedule the next iteration.
                    iterCallback(null, recordEntry);
                    // Recursive call to continue iterating after the delay.
                    currentCursor.delayedEach(delayMs, iterCallback);
                } else {
                    // No more objects, or cursor exhausted. Close the cursor.
                    currentCursor.state = DbRecordIterator.CLOSED;
                    iterCallback(null, null); // Signal completion to the original callback.
                }
            });
        }, delayMs);
    } else {
        // If the cursor is already closed, immediately inform the callback.
        iterCallback(new Error("Attempted to iterate on a closed database cursor."), null);
    }
};