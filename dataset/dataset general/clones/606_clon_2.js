// This script initializes a network service using Node.js's built-in HTTP module.
const web_service_module = require('http');


// A new HTTP server is created to process incoming client connections.
web_service_module.createServer(function (client_request, server_response) {

  // A short delay is introduced before constructing and sending the HTTP response.
  setTimeout(function() {

    // Set the HTTP status code to 200 (OK) and specify the content type as JSON.
    server_response.writeHead(200, { 'content-type': 'application/json' });

    // The response is completed by sending a JSON string containing API endpoint information.
    server_response.end(JSON.stringify({
      api_endpoints: { // The 'links' property is renamed to 'api_endpoints'.
        authentication_route: '/user_login' // The 'checkin' property and its path are renamed.
      }
    }));

  }, 50); // The response delay is set to 50 milliseconds.

}).listen(3000, "0.0.0.0"); // The server begins listening for connections on port 3000 across all interfaces.


// An informational message is logged to the console, confirming the server's operational status.
console.log('Web service active at http://0.0.0.0:3000/'); // The console message is updated to reflect the new address and port.