module.exports = function fastCgiConnector(configSettings) {
  var resourceLocator = require('url');
  var fileSystem = require('fs');
  var filePath = require('path');
  var hypertextProtocol = require('http');
  var networkSocket = require('net');
  var systemUtilities = require('sys');
  var protocolHandler = require('fastcgi-parser');

  // A simple logging mechanism; can be enabled by changing `false` to `true`.
  var logger = false ? console : { info: function() {}, inspectObject: function() {} };

  // Define essential FastCGI role and record types using the protocol parser's constants.
  var FCGI_ROLE_RESPONDER = protocolHandler.constants.role.FCGI_RESPONDER;
  var FCGI_RECORD_BEGIN = protocolHandler.constants.record.FCGI_BEGIN;
  var FCGI_RECORD_STDIN = protocolHandler.constants.record.FCGI_STDIN;
  var FCGI_RECORD_STDOUT = protocolHandler.constants.record.FCGI_STDOUT;
  var FCGI_RECORD_PARAMS = protocolHandler.constants.record.FCGI_PARAMS;
  var FCGI_RECORD_END = protocolHandler.constants.record.FCGI_END;

  /**
   * Prepares HTTP headers for the FastCGI Process Manager (FPM).
   *
   * Certain header fields require modification to align with FPM's expected format.
   * For example, a 'Content-Type' header needs its hyphens replaced with underscores
   * and all characters converted to uppercase. Conversely, an 'Accept' header
   * will also be uppercased, hyphens converted to underscores, and then prefixed
   * with "HTTP_".
   *
   * @param  Array incomingHeaders    An array of original HTTP headers from the Node.js request.
   * @param  Array requestParameters  An array of pre-existing parameters for the FCGI request.
   *
   * @return Array                    A consolidated array of all parameters, including formatted headers.
   */
  function prepareRequestHeaders(incomingHeaders, requestParameters) {
    if (incomingHeaders.length === 0) {
      return requestParameters;
    }

    for (var headerKey in incomingHeaders) {
      var headerValue = incomingHeaders[headerKey];
      headerKey = headerKey.replace(/-/g, '_').toUpperCase(); // Global replace for all hyphens.
      if (headerKey.indexOf('CONTENT_') < 0) {
        // This is a common pattern for PHP-FPM, might vary for other FCGI servers.
        headerKey = 'HTTP_' + headerKey;
      }

      requestParameters.push([headerKey, headerValue]);
    }

    return requestParameters;
  }

  /**
   * Orchestrates interaction with an FPM server.
   *
   * This routine manages the FastCGI protocol communication utilizing `net.Socket`
   * and the `fcgiProtocolParser` module. It processes an incoming HTTP request,
   * constructs the necessary FCGI packets, sends them to the FPM, and then
   * forwards the FPM's response back to the client.
   *
   * @param Object httpRequest     The incoming Node.js HTTP request object.
   * @param Object httpResponse    The Node.js HTTP response object for sending data back.
   * @param Array  fcgiParameters  A list of key-value pairs to send as FCGI_PARAMS.
   * @param Object connectionOptions A configuration object containing FPM connection details.
   * @param Function nextMiddleware The next middleware function in the chain, if applicable.
   *
   * @return void
   */
  function processFcgiRequest(httpRequest, httpResponse, fcgiParameters, connectionOptions, nextMiddleware) {
    var socketConnection = new networkSocket.Socket();
    socketConnection.setNoDelay(true); // Disable Nagle's algorithm for better performance.

    var fcgiWriter = null;
    var fcgiParser = null;

    // Default FastCGI header structure.
    var fcgiHeader = {
      "version": protocolHandler.constants.version,
      "type": FCGI_RECORD_BEGIN,
      "recordId": 0, // Will be set by writer.
      "contentLength": 0,
      "paddingLength": 0
    };

    // FastCGI begin request record details.
    var fcgiBeginRecord = {
      "role": FCGI_ROLE_RESPONDER,
      "flags": protocolHandler.constants.keepalive.OFF // Do not keep connection alive after response.
    };

    // Buffer for incoming STDIN data if writer isn't ready.
    var bufferedInputData = [];
    var inputDataComplete = false;

    /**
     * Completes the FastCGI request cycle by sending an empty STDIN packet.
     * This signals the FPM server that no more input data is expected.
     */
    function finishRequestProcessing() {
      if (fcgiWriter) {
        fcgiHeader.type = FCGI_RECORD_STDIN;
        fcgiHeader.contentLength = 0;
        fcgiHeader.paddingLength = 0;
        fcgiWriter.writeHeader(fcgiHeader);
        socketConnection.write(fcgiWriter.tobuffer());
        socketConnection.end(); // Close the socket after sending final STDIN.
      } else {
        inputDataComplete = true; // Mark as complete if writer not yet initialized.
      }
    }

    /**
     * Dispatches the initial FastCGI request records to the FPM server.
     * This includes BEGIN_REQUEST, PARAMS, and potentially STDIN.
     *
     * @param Object currentSocket The active network socket connection.
     */
    function dispatchFcgiRequest(currentSocket) {
      // 1. Send FCGI_BEGIN_REQUEST
      fcgiHeader.type = FCGI_RECORD_BEGIN;
      fcgiHeader.contentLength = 8; // Size of the FCGI_BEGIN_REQUEST body.
      fcgiWriter.writeHeader(fcgiHeader);
      fcgiWriter.writeBegin(fcgiBeginRecord);
      currentSocket.write(fcgiWriter.tobuffer());

      // 2. Send FCGI_PARAMS
      fcgiHeader.type = FCGI_RECORD_PARAMS;
      fcgiHeader.contentLength = protocolHandler.getParamLength(fcgiParameters);
      fcgiWriter.writeHeader(fcgiHeader);
      fcgiWriter.writeParams(fcgiParameters);
      currentSocket.write(fcgiWriter.tobuffer());

      // 3. Send empty FCGI_PARAMS to signal end of parameters
      fcgiHeader.type = FCGI_RECORD_PARAMS;
      fcgiHeader.contentLength = 0;
      fcgiWriter.writeHeader(fcgiHeader);
      currentSocket.write(fcgiWriter.tobuffer());

      // 4. Handle STDIN (if any)
      if (httpRequest.method !== 'PUT' && httpRequest.method !== 'POST') {
        finishRequestProcessing(); // No STDIN for GET/HEAD requests.
      } else {
        // Send any buffered STDIN data.
        for (var j = 0; j < bufferedInputData.length; ++j) {
          fcgiHeader.type = FCGI_RECORD_STDIN;
          fcgiHeader.contentLength = bufferedInputData[j].length;
          fcgiHeader.paddingLength = 0;
          fcgiWriter.writeHeader(fcgiHeader);
          fcgiWriter.writeBody(bufferedInputData[j]);
          currentSocket.write(fcgiWriter.tobuffer());
        }
        bufferedInputData = []; // Clear the buffer.
        if (inputDataComplete) {
          finishRequestProcessing(); // If request ended while buffering, send final STDIN.
        }
      }
    }

    // Event handler for incoming request data (STDIN).
    httpRequest.on('data', function(dataChunk) {
      if (fcgiWriter) {
        // If writer is ready, send STDIN packet immediately.
        fcgiHeader.type = FCGI_RECORD_STDIN;
        fcgiHeader.contentLength = dataChunk.length;
        fcgiHeader.paddingLength = 0;
        fcgiWriter.writeHeader(fcgiHeader);
        fcgiWriter.writeBody(dataChunk);
        socketConnection.write(fcgiWriter.tobuffer());
      } else {
        // Buffer data if writer is not yet initialized.
        bufferedInputData.push(dataChunk);
      }
    });

    // Event handler for the end of the incoming HTTP request.
    httpRequest.on('end', finishRequestProcessing);

    // Event handler for data received from the FPM server.
    socketConnection.ondata = function(dataBuffer, startIndex, endIndex) {
      fcgiParser.execute(dataBuffer, startIndex, endIndex);
    };

    // Listener for successful socket connection to FPM.
    socketConnection.addListener('connect', function() {
      fcgiWriter = new protocolHandler.writer();
      fcgiParser = new protocolHandler.parser();

      fcgiWriter.encoding = 'binary'; // Ensure binary data handling.

      var responseBodyContent = '';
      var headersProcessed = false;

      // Callback for when the parser identifies a complete FCGI record.
      fcgiParser.onRecord = function(fcgiRecord) {
        if (fcgiRecord.header.type === FCGI_RECORD_STDOUT && !headersProcessed) {
          responseBodyContent = fcgiRecord.body.toString(); // Convert Buffer to string.

          logger.info(responseBodyContent); // Log the initial part of the response.

          var responseParts = responseBodyContent.split('\r\n\r\n');

          var headerLines = responseParts[0];
          var individualHeaderLines = headerLines.split('\r\n');

          responseBodyContent = responseParts[1] || ''; // Remaining part is body.

          var httpStatusCode = 200; // Default status.

          var outputHeaders = [];
          try {
            for (var idx in individualHeaderLines) {
              var currentHeader = individualHeaderLines[idx].split(': ');
              if (currentHeader[0].indexOf('Status') >= 0) {
                httpStatusCode = parseInt(currentHeader[1].substring(0, 3), 10); // Extract status code.
                continue;
              }

              outputHeaders.push([currentHeader[0], currentHeader[1]]);
            }
          } catch (processingError) {
            // Error parsing headers, log but continue if possible.
            // console.error(processingError);
          }

          logger.info('  --> HTTP Response Status: "' + httpStatusCode + '"');

          if (httpStatusCode === 404) {
            nextMiddleware(); // Pass control to the next middleware for 404s.
            fcgiParser.onRecord = function() {}; // Disable further record processing.
            socketConnection.end(); // Close the connection.
            return;
          }

          httpResponse.writeHead(httpStatusCode, outputHeaders); // Send HTTP status and headers.
          headersProcessed = true; // Mark headers as processed.

        } else if (fcgiRecord.header.type === FCGI_RECORD_STDOUT && headersProcessed) {
          // Append subsequent STDOUT records to the body.
          responseBodyContent += fcgiRecord.body.toString();
        } else if (fcgiRecord.header.type === FCGI_RECORD_END) {
          // End of FastCGI response, send the complete body to client.
          httpResponse.end(responseBodyContent);
        }
      };

      // Callback for parser errors.
      fcgiParser.onError = function(parsingError) {
        // console.error('FCGI Parser Error:', parsingError);
      };

      dispatchFcgiRequest(socketConnection); // Start sending the FCGI request.
    });

    // Listener for socket closure.
    socketConnection.addListener('close', function() {
      socketConnection.end(); // Ensure connection is fully closed.
    });

    // Listener for socket errors.
    socketConnection.addListener('error', function(connectionError) {
      systemUtilities.puts(systemUtilities.inspect(connectionError.stack));
      socketConnection.end(); // Terminate connection on error.
    });

    // Initiate connection to the FPM server.
    socketConnection.connect(connectionOptions.fastcgiPort, connectionOptions.fastcgiHost);
  }

  // Default configuration settings for the FastCGI connector.
  var moduleConfig = {
    fastcgiPort: 9000,
    fastcgiHost: 'localhost',
    root: '' // Document root for script execution.
  };

  // Merge user-provided settings with defaults.
  for (var configKey in configSettings) {
    moduleConfig[configKey] = configSettings[configKey];
  }

  // Return a middleware function for Node.js HTTP servers.
  return function(clientRequest, serverResponse, nextHandler) {
    var baseDirectory = moduleConfig.root;
    var requestedScriptPath = resourceLocator.parse(clientRequest.url).pathname;

    var originalRequestUri = clientRequest.headers['x-request-uri'] ? clientRequest.headers['x-request-uri'] : clientRequest.url;
    var queryString = resourceLocator.parse(originalRequestUri).query || '';

    // Construct the FastCGI parameters list.
    var fcgiRequestParams = prepareRequestHeaders(clientRequest.headers, [
      ['SCRIPT_FILENAME', baseDirectory + requestedScriptPath],
      ['REMOTE_ADDR', clientRequest.connection.remoteAddress],
      ['QUERY_STRING', queryString],
      ['REQUEST_METHOD', clientRequest.method],
      ['SCRIPT_NAME', requestedScriptPath],
      ['PATH_INFO', requestedScriptPath],
      ['DOCUMENT_URI', requestedScriptPath],
      ['REQUEST_URI', originalRequestUri],
      ['DOCUMENT_ROOT', baseDirectory],
      ['PHP_SELF', requestedScriptPath],
      ['GATEWAY_PROTOCOL', 'CGI/1.1'],
      ['SERVER_SOFTWARE', 'node/' + process.version]
    ]);

    logger.info('Incoming HTTP Request: ' + clientRequest.method + ' ' + clientRequest.url);
    logger.inspectObject(fcgiRequestParams);
    processFcgiRequest(clientRequest, serverResponse, fcgiRequestParams, moduleConfig, nextHandler);
  };
};