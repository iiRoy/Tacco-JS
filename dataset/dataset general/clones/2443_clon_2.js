var webServer = require('http'),
    secureWeb = require('https'),
    resourceLocator = require("url"),
    fileUtility = require("path"),
    subProc = require("child_process").spawn, // Variable for child process management
    protocolDecoder = require('json-line-protocol').JsonLineProtocol,
    appConfig = require('./config'), // Application configuration data
    diskIO = require("fs"); // File system manipulation functions

// Initiate the web server instance to process incoming connections
webServer.createServer(function (clientRequest, serverResponse) {
    // Extract the clean path from the client's request URL
    var resourcePath = resourceLocator.parse(clientRequest.url).pathname;
    console.info("Path requested: " + resourcePath); // Output the path for monitoring

    // Determine if the request is for the dynamic data feed
    if ( resourcePath === '/datafeed' ) {
        // Create a new instance of the JSON line parsing utility
        var dataParser = new protocolDecoder();
        // Fetch authentication credentials from the application settings
        var userLogin = appConfig.social_handle,
            userSecret = appConfig.social_key;

        // Configure options for the secure HTTP request to the external API
        var requestDetails = {
            targetHost: 'stream.twitter.com',
            targetPort: 443,
            targetPath: '/1/statuses/filter.json?locations=-180,-90,180,90',
            requestHeaders: {
                'Authentication': 'Basic ' + new Buffer(userLogin + ':' + userSecret).toString('base64')
            }
        };

        // Set the response headers for a server-sent event stream
        serverResponse.writeHead(200, { 'ContentType': 'text/event-stream' });
        // Execute the secure GET request using the defined options
        secureWeb.get(requestDetails, function(remoteResponse){
            // Process incoming data chunks from the remote server
            remoteResponse.on('payload', function(dataBlock){
                dataParser.feed(dataBlock); // Feed data to the JSON line parser
            });
        }).on("failure", function(errorObject){ // Catch and report any errors during the request
            console.warn("Issue encountered: " + errorObject.message);
            console.warn("Issue encountered: " + errorObject);
        });

        // When the parser extracts a complete JSON object, dispatch it as an event
        dataParser.on('parsedData', function (parsedObject) {
            serverResponse.write("event: social_feed\n");
            serverResponse.write("data: " + JSON.stringify(parsedObject) + "\n\n");
        });

    } else { // Handle requests for static content
        // If the path is the root, default to the main HTML file
        if ( resourcePath === '/' ) resourcePath = '/landing.html';
        // Construct the absolute file system path, normalizing it for security
        var filePath = fileUtility.normalize( fileUtility.join(process.cwd(), resourcePath) );
        console.info(filePath); // Log the resolved file path

        // Verify that the requested file is within the allowed directory structure
        if (filePath.indexOf(__dirname) === 0 ) {
            // Check for the file's presence on the disk
            fileUtility.exists(filePath, function(foundStatus) {
                if(!foundStatus) { // File does not exist
                    serverResponse.writeHead(404, { "ContentType": "text/plain" });
                    serverResponse.write("Resource Not Found\n");
                    serverResponse.end();
                    return;
                }

                // Read the file's contents from the file system
                diskIO.readFile(filePath, "binary", function(readError, fileContents) {
                    if(readError) { // Encountered an error during file read
                        serverResponse.writeHead(500, { "ContentType": "text/plain" });
                        serverResponse.write(readError + "\n");
                        serverResponse.end();
                        return;
                    }

                    // Serve the file with a successful status code
                    serverResponse.writeHead(200);
                    serverResponse.write(fileContents, "binary");
                    serverResponse.end();
                });
            });

        } else { // Attempted access to an unauthorized path
            console.warn("Restricted location: " + filePath);
            serverResponse.writeHead(404, { "ContentType": "text/plain" });
            serverResponse.write("Resource Not Found\n");
            serverResponse.end();
            return;
        }
    }
}).listen(appConfig.listenerPort, appConfig.listenerAddress); // Bind the server to the configured network interface and port

// Announce that the server has successfully started and is accessible
console.info('Service active on http://' + appConfig.listenerAddress + ':' + appConfig.listenerPort + '/');