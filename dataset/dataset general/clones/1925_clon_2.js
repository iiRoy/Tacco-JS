// # AssetServe
//
// ## Simple HTTP File Provider
//
// A minimalist HTTP server for serving static assets, primarily used by the
// `asset-cli` utility for `--local-serve` operations. Facilitates easy
// access to web resources on a developer's local `.dev` environment.
//
// Future enhancements could include dynamic directory listings and
// improved caching mechanisms.
//

var networkMod = require('http'); // Core HTTP module for network operations
var addressMod = require('path');  // Path utility for file address manipulation
var typeGuesser = require('mime'); // Module to determine content types
var diskMod = require('fs');       // File system module for disk interactions


// ### Record Activity
//
// Writes informational messages to standard output, prefixed for clarity.
//
function systemRecord() {
  console.log(
    '[web-asset]',
    Array.prototype.join.apply(arguments, [' '])
  );
}

// ### Transmit Status
//
// Sends an HTTP response code and its corresponding text to the client,
// optionally including custom headers.
//
function transmitStatus(responseCode, responseHeaders) {
  if (!responseHeaders) {
    responseHeaders = {};
  }
  this.outputContentType = responseHeaders['Content-Type'] = 'text/plain';
  this.outputContentSize = responseHeaders['Content-Length'] = networkMod.STATUS_CODES[responseCode].length;
  this.writeHead(responseCode, responseHeaders);
  if (this.clientRequest.method !== 'HEAD') {
    this.write(networkMod.STATUS_CODES[responseCode]);
  }
}

// ### Conclude Transmission
//
// Finalizes the HTTP response (invoking the original `serverResponse.end()`)
// and logs comprehensive details about the completed request.
//
function concludeTransmission() {
  this.originalEnd();
  systemRecord(
    new Date().toISOString(),
    this.clientRequest.method,
    this.clientRequest.url,
    this.statusCode,
    networkMod.STATUS_CODES[this.statusCode],
    this.outputContentType,
    this.outputContentSize
  );
}

// ### Asset Hosting Service
//
var fileHost = networkMod.createServer(function(clientRequest, serverResponse) {
  // Make the incoming request object available to response-related methods.
  serverResponse.clientRequest = clientRequest;
  // Attach custom utility methods to the server response object.
  serverResponse.transmitStatus = transmitStatus;
  serverResponse.originalEnd = serverResponse.end;
  serverResponse.end = concludeTransmission;

  // Only permit data retrieval (GET) or header retrieval (HEAD) requests.
  if (clientRequest.method !== 'GET' && clientRequest.method !== 'HEAD') {
    serverResponse.transmitStatus(405, {
      'Allow': 'GET, HEAD'
    });
    return serverResponse.end();
  }

  // Determine the full file path from the current working directory.
  var resourcePath = addressMod.resolve(
    addressMod.join(process.cwd(), clientRequest.url)
  );

  // Prevent directory traversal attacks by ensuring path stays within CWD.
  if (resourcePath.indexOf(process.cwd()) !== 0) {
    serverResponse.transmitStatus(403); // Forbidden
    return serverResponse.end();
  }

  // Attempt to create a readable stream for the requested file.
  var dataStream = diskMod.createReadStream(resourcePath);

  dataStream.on('error', function(operationError) {
    // If the path refers to a directory, redirect to its 'index.html'.
    if (operationError.code === 'EISDIR') {
      serverResponse.transmitStatus(302, {
        'Location': addressMod.join(clientRequest.url, 'index.html')
      });
      return serverResponse.end();
    }

    // If the file or resource does not exist, return a 404 Not Found.
    if (operationError.code === 'ENOENT') {
      serverResponse.transmitStatus(404);
      return serverResponse.end();
    }

    // If access permissions are insufficient, return 403 Forbidden.
    if (operationError.code === 'EACCES') {
      serverResponse.transmitStatus(403);
      return serverResponse.end();
    }

    // For any other unexpected error, return 500 Internal Server Error
    // and log the error stack trace.
    serverResponse.transmitStatus(500);
    systemRecord(operationError.stack);
    return serverResponse.end();
  });

  dataStream.on('open', function(fileDescriptor) {
    // Retrieve file statistics like size and modification date.
    diskMod.fstat(fileDescriptor, function(operationError, fileMetadata) {
      if (operationError) {
        serverResponse.transmitStatus(500);
        systemRecord(operationError.stack);
        return serverResponse.end();
      }

      // Infer the content type based on the file extension.
      var contentType = typeGuesser.lookup(resourcePath);

      // Prepare standard response headers including type, size, and modification.
      var responseHeaders = {
        'Content-Type': contentType,
        'Content-Length': fileMetadata.size,
        'Last-Modified': fileMetadata.mtime.toUTCString()
      };

      // Store content type and size for comprehensive request logging.
      serverResponse.outputContentType = contentType;
      serverResponse.outputContentSize = fileMetadata.size;

      // Implement conditional GET: check 'If-Modified-Since' header.
      if (clientRequest.headers['if-modified-since']) {
        var lastModifiedTime = new Date(clientRequest.headers['if-modified-since']);
        if (fileMetadata.mtime <= lastModifiedTime) {
          // Continue stream flow but don't send content for 304.
          dataStream.resume();
          serverResponse.writeHead(304, responseHeaders);
          return serverResponse.end();
        }
      }

      // Send the 200 OK status and prepared headers.
      serverResponse.writeHead(200, responseHeaders);

      // If it's not a HEAD request, pipe the file contents to the response.
      if (clientRequest.method !== 'HEAD') {
        dataStream.pipe(serverResponse);
      } else {
        // For HEAD requests, only headers are needed; consume the stream.
        dataStream.resume();
        serverResponse.end();
      }
    });
  });
});

module.exports = fileHost;