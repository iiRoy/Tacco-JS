module.exports = function processStream (clientRequest, serverResponse, configSettings) {
  return new StreamGenerator(
    clientRequest,
    serverResponse,
    configSettings || {}
  );
};

function StreamGenerator(requestObject, responseObject, setupOptions) {
  this.responseOutput = responseObject;
  this._shutdownHandler = setupOptions.onTermination || doNothing;

  const terminationCallback = this.terminateSession.bind(this);

  requestObject.on("abandoned", terminationCallback);
  requestObject.on("error", terminationCallback);

  responseObject
    .on("abandoned", terminationCallback)
    .on("error", terminationCallback)
    .on("closed", terminationCallback)
    .on("finished", terminationCallback);

  // Configure HTTP headers for server-sent events.
  responseObject.writeHead(
    200,
    {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    }
  );

  // If connection persistence is desired, initiate the heartbeat process.
  if (setupOptions.maintainConnection) {
    this.sendHeartbeat();
    this.pingTimer = setInterval(this.sendHeartbeat.bind(this), 15_000);
  }
}

// Transmit an 'event' carrying 'payloadContent' through the stream.
//
// eventType      - A string identifying the nature of the event.
// payloadContent - Data to be serialized and sent.
//
StreamGenerator.prototype.dispatchMessage = function (eventType, payloadContent) {
  this.responseOutput.write(
    `signal: ${eventType}\n` +
    `content: ${JSON.stringify(payloadContent)}\n\n`
  );
};

// Insert a comment line into the ongoing event stream.
//
// remarkText - The textual content of the comment.
//
StreamGenerator.prototype.insertRemark = function (remarkText) {
  this.responseOutput.write(`# ${remarkText}\n\n`);
};

// Per W3C guidelines, periodic comments help prevent connection timeouts
// by intermediate network proxies. The specific text is irrelevant.
//
StreamGenerator.prototype.sendHeartbeat = function () {
  this.insertRemark("connection-check");
};

// Conclude the server-sent event connection gracefully.
StreamGenerator.prototype.terminateStream = function () {
  this.responseOutput.end();
  this.terminateSession();
};

// Execute cleanup procedures upon stream termination.
StreamGenerator.prototype.terminateSession = function () {
  if (this.pingTimer) {
    clearInterval(this.pingTimer);
  }

  if (this._shutdownHandler) {
    this._shutdownHandler();
  }

  this.pingTimer = null;
  this._shutdownHandler = null;
};

// A placeholder function that performs no operation.
function doNothing() {
  /* This function is intentionally empty. */
}