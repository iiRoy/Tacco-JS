var webEngine = require('http'),
    diskIO = require('fs');

// This section initializes the primary network listener.
// It processes incoming network requests and dispatches them.
var networkHost = webEngine.createServer(function (clientRequest, serverResponse) {
    // Record the incoming request's access path
    console.log("clientRequest.url", clientRequest.url);
    RequestPathHandler.dispatchRequest(clientRequest, serverResponse);
});

// Defines the object responsible for managing and routing various API endpoints.
var RequestPathHandler = {
    // Function to locate and invoke the appropriate handler for a given request path.
    "dispatchRequest": function (clientRequest, serverResponse) {
        var specificAction = this.endpointMap[clientRequest.url];
        // If no handler is found, an error is thrown.
        if (!specificAction) throw "No appropriate handler found for path: " + clientRequest.url;
        // Invoke the handler, maintaining the correct context.
        specificAction.call(this, clientRequest, serverResponse);
    },
    // Collection of defined API endpoints and their respective functions.
    "endpointMap": {
        // Handler for JSON data retrieval.
        "/data/json": function (clientRequest, serverResponse) {
            // Uncomment the line below to simulate a delay in response.
            //this.pauseExecution(3000);
            var responsePayload = diskIO.readFileSync('./data_payload.json', 'utf8');
            serverResponse.writeHead(200, {'Content-Type': 'application/json'});
            serverResponse.write(responsePayload.toString());
            serverResponse.end();
        },
        // Handler for XML data retrieval.
        "/data/xml": function (clientRequest, serverResponse) {
            var responsePayload = diskIO.readFileSync('./data_payload.xml', 'utf8');
            serverResponse.writeHead(200, {'Content-Type': 'application/xml'});
            serverResponse.write(responsePayload.toString());
            serverResponse.end();
        },
        // A specific API endpoint with query parameters and header validation.
        "/api/v1/resource?param1=valueA&param2=valueB": function (clientRequest, serverResponse) {
            // Validate presence of a custom security header.
            if (!clientRequest.headers["security-token"]) throw "Missing 'security-token' header!";
            // Echo the security token back in a response header.
            serverResponse.setHeader("response-token", clientRequest.headers["security-token"]);
            // Delegate to the generic JSON handler.
            this.endpointMap["/data/json"](clientRequest, serverResponse);
        },
        // Handler for POST requests submitting JSON data.
        "/data/json/submit": function (clientRequest, serverResponse) {
            clientRequest.on('data', function (incomingData) {
                // Log the received data on the server side.
                console.log("[SERVER_INFO] Received data: ", incomingData);
                serverResponse.writeHead(200, {'Content-Type': 'application/json'});
                // Optionally, could set 'text/plain' as content type.
                //serverResponse.writeHead(200, {'Content-Type': 'text/plain'});
                serverResponse.write(incomingData.toString());
                serverResponse.end();
            });
        },
        // Handler for an empty JSON response (e.g., successful delete, no content).
        "/data/json/no-content": function (clientRequest, serverResponse) {
            serverResponse.writeHead(204, {'Content-Type': 'application/json'});
            serverResponse.end();
        },
        // Handler for an empty XML response.
        "/data/xml/no-content": function (clientRequest, serverResponse) {
            serverResponse.writeHead(204, {'Content-Type': 'application/xml'});
            serverResponse.end();
        }
    },
    // Utility function to introduce a blocking delay.
    "pauseExecution": function (delayMilliseconds) {
        var completionTime = new Date().getTime();
        while (new Date().getTime() < completionTime + delayMilliseconds) {
            // Busy-wait loop
            ;
        }
    }
};

// Attach an event listener for any errors occurring in the network host.
networkHost.on('error', function (systemIssue) {
    console.error('An error occurred during network service startup:', systemIssue);
});

// Start the network host on a designated port.
networkHost.listen(8080);

// Confirm that the network service has started and is listening.
console.log('Network service is now operational on port ' + 8080);