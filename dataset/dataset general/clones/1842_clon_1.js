module.exports = function fastcgi ( newOptions )
{
	// This module facilitates communication with a FastCGI server,
	// commonly used for integrating Node.js applications with PHP-FPM.
	// It acts as a FastCGI client, handling protocol details.

	var url = require('url')
	  , fs = require('fs') // File system module; not directly used in core logic here.
	  , path = require("path") // Path module; not directly used in core logic here.
	  , http = require("http") // HTTP module; provides request and response objects.
	  , net = require("net") // Networking module; used for TCP socket connections.
	  , sys = require("sys") // System utilities; used for error logging.
	  , fastcgi = require("fastcgi-parser") // The primary FastCGI protocol parser and writer.
	; // End of module imports.

	// A simple debug object. If the first operand of the ternary is falsy (0),
	// it provides no-op functions for `log` and `dir`, effectively disabling debug output.
	var debug = 0 ? console : { log: function() {}, dir: function() {} };

	// FastCGI protocol constants, retrieved from the 'fastcgi-parser' module.
	var FCGI_RESPONDER = fastcgi.constants.role.FCGI_RESPONDER; // Role indicating a responder application.
	var FCGI_BEGIN     = fastcgi.constants.record.FCGI_BEGIN;     // Record type for beginning a request.
	var FCGI_STDIN     = fastcgi.constants.record.FCGI_STDIN;     // Record type for standard input data.
	var FCGI_STDOUT    = fastcgi.constants.record.FCGI_STDOUT;    // Record type for standard output data.
	var FCGI_PARAMS    = fastcgi.constants.record.FCGI_PARAMS;    // Record type for request parameters.
	var FCGI_END       = fastcgi.constants.record.FCGI_END;       // Record type for ending a request.

	/**
	 * Transforms standard HTTP headers into a format suitable for PHP-FPM.
	 *
	 * PHP-FPM expects HTTP headers to be uppercase, with hyphens replaced by underscores,
	 * and most headers prefixed with "HTTP_". Content-related headers (e.g., Content-Type)
	 * are typically exceptions to the "HTTP_" prefix rule.
	 *
	 * @param  {Object} headers An object containing HTTP headers from the Node.js request.
	 * @param  {Array<Array<string>>} params An array of pre-existing FastCGI parameters.
	 * @returns {Array<Array<string>>} The combined array of parameters, including transformed headers.
	 */
	function makeHeaders(headers, params)
	{
		// If no headers are provided in the input, return the existing parameters as-is.
		if ( headers.length <= 0 )
		{
			return params;
		}

		// Iterate through each property (header name) in the `headers` object.
		for ( var prop in headers )
		{
			var head = headers[prop]; // Get the header value.
			// Transform the header name: replace hyphens with underscores, then convert to uppercase.
			prop = prop.replace(/-/, '_').toUpperCase();
			// Special handling for content-related headers: they usually don't get the "HTTP_" prefix.
			if ( prop.indexOf('CONTENT_') < 0 )
			{
				// For other headers, prepend "HTTP_" as expected by PHP-FPM.
				prop = 'HTTP_' + prop;
			}

			// Add the transformed header name and its original value as a new parameter pair.
			params[params.length] = [prop, head];
		}

		return params; // Return the augmented list of parameters.
	}; // Semicolon here is consistent with original code for this function expression.

	/**
	 * Handles the core interaction with the FastCGI server.
	 *
	 * This function establishes a network connection, sends FastCGI records
	 * (BEGIN, PARAMS, STDIN), and parses incoming FastCGI records (STDOUT, END)
	 * to construct and send the HTTP response back to the client.
	 *
	 * @param {http.IncomingMessage} request  The incoming HTTP request object from Node.js.
	 * @param {http.ServerResponse}  response The HTTP response object for sending data back to the client.
	 * @param {Array<Array<string>>} params   An array of FastCGI parameters to send to the FPM server.
	 * @param {Object}               options  Configuration options, such as FastCGI host and port.
	 * @param {Function}             next     A callback function for middleware chaining, used for 404s.
	 * @returns {void}
	 */
	function server(request, response, params, options, next)
	{
		// Create a new TCP socket connection to the FastCGI server.
		var connection = new net.Stream();
		connection.setNoDelay(true); // Disable Nagle's algorithm for immediate packet transmission.

		var writer = null; // FastCGI writer instance, initialized after connection.
		var parser = null; // FastCGI parser instance, initialized after connection.

		// Define the structure for a FastCGI record header.
		var header =
		{
			"version": fastcgi.constants.version, // FastCGI protocol version.
			"type": FCGI_BEGIN, // Initial record type.
			"recordId": 0, // Request ID for this specific FastCGI communication.
			"contentLength": 0, // Length of the record's content data.
			"paddingLength": 0 // Padding bytes to ensure 8-byte alignment.
		};

		// Define the body for an FCGI_BEGIN_REQUEST record.
		var begin =
		{
			"role": FCGI_RESPONDER, // Specifies the role of the FastCGI application.
			"flags": fastcgi.constants.keepalive.OFF // Indicates whether the connection should be kept alive.
		};

		// Buffers for collecting STDIN data from the client request before the FastCGI writer is ready.
		var collectedStdin = [], noMoreData = false;

		/**
		 * Signals the end of standard input (STDIN) to the FastCGI server.
		 * This is typically sent after all request body data has been transmitted.
		 */
		function endRequest()
		{
			if ( writer ) // Check if the FastCGI writer object has been initialized.
			{
				header.type = FCGI_STDIN; // Set the record type to indicate STDIN.
				header.contentLength = 0; // A content length of 0 signifies the end of STDIN.
				header.paddingLength = 0; // No padding needed for an empty content body.
				writer.writeHeader(header); // Write the header to the writer.
				connection.write(writer.tobuffer()); // Send the header (and empty body) over the connection.
				connection.end(); // Gracefully close the TCP connection to the FastCGI server.
			}
			else
			{
				noMoreData = true; // If writer isn't ready, defer closing until it is.
			}
		} // endRequest function definition.

		/**
		 * Sends the initial FastCGI records (BEGIN_REQUEST and PARAMS) to the server.
		 * It also handles the transmission of any buffered STDIN data.
		 * @param {net.Stream} connection The active TCP connection to the FastCGI server.
		 */
		function sendRequest (connection)
		{
			// Send the FCGI_BEGIN_REQUEST record.
			header.type = FCGI_BEGIN; // Set record type.
			header.contentLength = 8; // The body of BEGIN_REQUEST is 8 bytes.
			writer.writeHeader(header); // Write the header for BEGIN_REQUEST.
			writer.writeBegin(begin); // Write the BEGIN_REQUEST body.
			connection.write(writer.tobuffer()); // Send the complete record.

			// Send the FCGI_PARAMS record containing all request parameters.
			header.type = FCGI_PARAMS; // Set record type.
			header.contentLength = fastcgi.getParamLength(params); // Calculate content length based on parameters.
			writer.writeHeader(header); // Write the header for PARAMS.
			writer.writeParams(params); // Write the parameters body.
			connection.write(writer.tobuffer()); // Send the complete record.

			// Send an empty FCGI_PARAMS record to signal the end of parameters.
			header.type = FCGI_PARAMS; // Set record type.
			header.contentLength = 0; // Zero content length signifies end of parameters.
			writer.writeHeader(header); // Write the header.
			connection.write(writer.tobuffer()); // Send the empty record.

			// The following lines are commented out in the original source,
			// indicating they are not part of the active logic.
			// header.type = FCGI_STDOUT;
			// writer.writeHeader(header);
			// connection.write(writer.tobuffer());

			// Check if the HTTP method implies a request body (STDIN).
			if ( (request.method != 'PUT' && request.method != 'POST') )
			{
				endRequest(); // If no body, signal end of request immediately.
			}
			else // If it's a PUT or POST request, there might be STDIN data.
			{
				// Send any STDIN chunks that were collected before the writer was ready.
				for ( var j = 0; j < collectedStdin.length; ++j )
				{
					header.type = FCGI_STDIN; // Set record type.
					header.contentLength = collectedStdin[j].length; // Set content length.
					header.paddingLength = 0; // No padding needed.
					writer.writeHeader(header); // Write the header.
					writer.writeBody(collectedStdin[j]); // Write the STDIN chunk.
					connection.write(writer.tobuffer()); // Send the record.
				}
				collectedStdin = []; // Clear the buffer after sending.

				// If the 'end' event on the client request already fired, signal end of STDIN.
				if ( noMoreData )
				{
					endRequest();
				}
			}
		}; // sendRequest function definition.

		// Event handler for incoming data from the client's HTTP request (request body/STDIN).
		request.on('data', function(chunk)
		{
			if ( writer ) // If the FastCGI writer is ready.
			{
				// Send the data chunk immediately as an FCGI_STDIN record.
				header.type = FCGI_STDIN;
				header.contentLength = chunk.length;
				header.paddingLength = 0;
				writer.writeHeader(header);
				writer.writeBody(chunk);
				connection.write(writer.tobuffer());
			}
			else
			{
				// If writer is not yet ready, buffer the data.
				collectedStdin.push(chunk);
			}
		}); // End of request 'data' event handler.

		// Event handler for when the client's HTTP request stream has ended.
		request.on('end', endRequest); // Call endRequest to signal end of STDIN to FPM.

		// Data handler for the TCP connection receiving data from the FastCGI server.
		connection.ondata = function (buffer, start, end)
		{
			parser.execute(buffer, start, end); // Feed the received buffer to the FastCGI parser.
		};

		// Event handler for when the TCP connection to the FastCGI server is successfully established.
		connection.addListener("connect", function()
		{
			writer = new fastcgi.writer(); // Initialize the FastCGI writer.
			parser = new fastcgi.parser(); // Initialize the FastCGI parser.

			writer.encoding = 'binary'; // Set encoding for the writer.

			var body="", hadheaders = false; // Variables to store response body and track header parsing state.

			// Callback function for when the FastCGI parser successfully processes a complete record.
			parser.onRecord = function(record)
			{
				// Handle FCGI_STDOUT records, particularly the first one which contains HTTP headers.
				if ( record.header.type == FCGI_STDOUT && !hadheaders )
				{
					body = record.body; // Store the initial part of the response body.

					debug.log(body); // Log the raw FastCGI STDOUT body for debugging purposes.

					// Split the FastCGI STDOUT content into HTTP headers and the actual response body.
					var parts = body.split("\r\n\r\n");

					var headers = parts[0]; // The first part contains HTTP headers.
					var headerParts = headers.split("\r\n"); // Split headers into individual lines.

					body = parts[1]; // The second part is the actual HTTP response body.

					var responseStatus = 200; // Default HTTP status code.

					headers = []; // Initialize an array to store parsed HTTP headers.
					try
					{
						// Iterate through each header line to parse it.
						for ( var i in headerParts )
						{
							var header = headerParts[i].split(': '); // Split header name and value.
							if ( header[0].indexOf('Status') >= 0 ) // Check for the HTTP "Status" header.
							{
								responseStatus = header[1].substr(0, 3); // Extract the 3-digit status code.
								continue; // Do not add "Status" header to the response headers array.
							}

							headers.push([header[0], header[1]]); // Add other headers to the array.
						}
					}
					catch (err)
					{
						// Error handling for malformed headers.
						// console.log(err); // Original code had this commented out.
					}

					debug.log('  --> Request Response Status Code: "' + responseStatus + '"'); // Log the parsed status code.

					// If the FastCGI server returns a 404, delegate handling to the next middleware.
					if ( responseStatus === "404" )
					{
						next(); // Invoke the next middleware in the chain.
						parser.onRecord = function() {}; // Disable further record processing to prevent issues.
						connection.end(); // Close the FastCGI connection.
						return; // Exit this handler.
					}

					// Write the HTTP status code and headers to the client's response.
					response.writeHead(responseStatus, headers);

					hadheaders = true; // Mark that headers have been successfully processed.


				}
				else if ( record.header.type == FCGI_STDOUT && hadheaders )
				{
					// If subsequent FCGI_STDOUT records arrive after headers, append them to the body.
					body += record.body;
				}
				else if ( record.header.type == FCGI_END )
				{
					// When an FCGI_END_REQUEST record is received, the FastCGI response is complete.
					response.end(body); // Send the accumulated body to the client and finalize the HTTP response.
				}
			}; // End of parser.onRecord callback.

			// Callback function for errors encountered by the FastCGI parser.
			parser.onError = function(err)
			{
				// Error handling for parser issues.
				// console.log(err); // Original code had this commented out.
			};

			sendRequest(connection); // Initiate sending the FastCGI request after connection is established.
		}); // End of connection 'connect' event listener.

		// Event handler for when the TCP connection to the FastCGI server is closed.
		connection.addListener("close", function()
		{
			connection.end(); // Ensure the connection is properly terminated.
		});

		// Event handler for errors occurring on the TCP connection.
		connection.addListener("error", function(err)
		{
			sys.puts(sys.inspect(err.stack)); // Log the error stack to stderr using 'sys.puts'.
			connection.end(); // Close the connection if an error occurs.
		});

		// Establish the connection to the FastCGI server using the configured host and port.
		connection.connect(options.fastcgiPort, options.fastcgiHost);
	} // End of server function definition.

	// Default configuration options for the FastCGI client.
	var options =
	{
		fastcgiPort: 9000,      // Default port for the FastCGI server (e.g., PHP-FPM).
		fastcgiHost: 'localhost', // Default host address for the FastCGI server.
		root: ''                // Default document root for script file paths.
	};

	// Override default options with any new options provided by the user.
	for ( var k in newOptions )
	{
		options[k] = newOptions[k]; // Assign the new option value.
	}

	// This function serves as the main middleware exposed by the module.
	// It will be called for each incoming HTTP request that needs FastCGI processing.
	return function(request, response, next)
	{
		var script_dir = options.root; // The base directory for scripts.
		// Parse the URL from the request to extract the pathname, which is treated as the script file.
		var script_file = url.parse(request.url).pathname;

		// Determine the request URI, preferring 'x-request-uri' header if present, otherwise using request.url.
		var request_uri = request.headers['x-request-uri'] ? request.headers['x-request-uri'] : request.url;
		// Extract the query string from the request URI.
		var qs = url.parse(request_uri).query ? url.parse(request_uri).query : '';

		// Construct the FastCGI parameters array, including transformed HTTP headers and standard CGI variables.
		var params = makeHeaders(request.headers,
		[
			["SCRIPT_FILENAME", script_dir + script_file],           // Full path to the script being executed.
			["REMOTE_ADDR", request.connection.remoteAddress],       // IP address of the client making the request.
			["QUERY_STRING", qs],                                    // The query string part of the URL.
			["REQUEST_METHOD", request.method],                      // The HTTP method (GET, POST, PUT, DELETE, etc.).
			["SCRIPT_NAME", script_file],                            // The name of the script being executed.
			["PATH_INFO", script_file],                              // Additional path information.
			["DOCUMENT_URI", script_file],                           // The URI of the document.
			["REQUEST_URI", request_uri],                            // The full request URI.
			["DOCUMENT_ROOT", script_dir],                           // The document root directory.
			["PHP_SELF", script_file],                               // PHP_SELF variable, typically the script name.
			["GATEWAY_PROTOCOL", "CGI/1.1"],                         // The protocol version of the CGI gateway.
			["SERVER_SOFTWARE", "node/" + process.version]           // Information about the server software.
		]);

		// Log details of the incoming request for debugging.
		debug.log('Incoming Request: ' + request.method + ' ' + request.url);
		debug.dir(params); // Log the generated FastCGI parameters.

		// Call the main 'server' function to handle the FastCGI communication.
		server(request, response, params, options, next);
	}; // End of the returned middleware function.
} // End of fastcgi module definition.