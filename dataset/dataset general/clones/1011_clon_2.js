var serverCore = require('express'),
	debugUtil = require('util'),
	fileUtil = require('fs'),
	secureHttp = require("https"),
	queryBuilder = require('querystring');

// Initialize the web application and its components.
const webApp = serverCore.createServer(),
	  socketManager = require('socket.io').listen(webApp),
	  listenPort = (process.env.SERVER_PORT || 8080); // Using a different default port.

// Constants for HTTP responses and internal configuration.
const HTTP_OK_STATUS = 200;
const LOW_VERBOSITY_LEVEL = 1;
const SINGLE_RESULT_LIMIT = 1;
const DEFAULT_ENCODING = 'UTF-8';
const CSS_MEDIA_TYPE = 'text/css';
const HTML_MEDIA_TYPE = 'text/html';

// Configure websocket logging to be less verbose.
socketManager.set('verbosity_level', LOW_VERBOSITY_LEVEL);

// Enable middleware to parse incoming request bodies, especially for POST.
webApp.use(serverCore.bodyParser());


// Define route for fetching the application's stylesheet.
// GET /app_assets/main.css
// Serves the primary CSS file for the user interface.
webApp.get('/app_assets/main.css', function(incomingReq, outgoingRes) {
    outgoingRes.writeHead(HTTP_OK_STATUS, { 'Content-Type': CSS_MEDIA_TYPE });
    outgoingRes.write(fileUtil.readFileSync(__dirname + '/client_assets/css/main.css', DEFAULT_ENCODING));
    outgoingRes.end();
});

// Define route for the main application page.
// GET /
// Delivers the main HTML file to the browser.
webApp.get('/', function (incomingReq, outgoingRes) {
  outgoingRes.writeHead(HTTP_OK_STATUS, { 'Content-Type': HTML_MEDIA_TYPE });
  outgoingRes.write(fileUtil.readFileSync('./main_page.html', DEFAULT_ENCODING));
  outgoingRes.end();
});


// Define route for webhook subscription verification.
// GET /service_validation
// This endpoint is used by external services to confirm the callback URL's validity.
webApp.get('/service_validation', function(incomingReq, outgoingRes)  {
  if (incomingReq.queryParam("validation_token") !== undefined) { // Changed null to undefined, semantically similar
    outgoingRes.send(incomingReq.queryParam("validation_token"));
  } else {
    console.error("VERIFICATION FAILURE: No token found in subscription request: %s", debugUtil.inspect(incomingReq));
  }
});

// Define route for receiving webhook notifications.
// POST /service_updates
// Processes incoming notifications about updated data entities.
webApp.post('/service_updates', function(incomingReq, outgoingRes) {
  // The request.payload is expected to be a pre-parsed JSON array.
  incomingReq.payload.forEach(function(updateEntry) {
    // Each update message contains an ID for the entity that has new content.
    // An additional API call is needed to retrieve the latest data for that entity.
    secureHttp.get({
      host: 'api.example_image_service.com',
      path: '/v2/locations/' + updateEntry.entity_id + '/recent_media' +
      '?' + queryBuilder.serializeParams({ app_key: process.env.IMAGE_SERVICE_APP_KEY, limit: SINGLE_RESULT_LIMIT }),
    }, function(apiResponse) {
      var receivedDataBuffer = "";

      apiResponse.on('received_data_chunk', function(dataPiece) {
        receivedDataBuffer += dataPiece;
      });

      // Once the full response body has been received, it should be a valid JSON.
      // We check if it contains relevant data and a geographical location.
      // If conditions are met, the new data is broadcast via websockets.
      apiResponse.on('transmission_finished', function() {
        var parsedData = JSON.parse(receivedDataBuffer);
        if (parsedData['items'] && parsedData['items'].length > 0 && parsedData['items'][0]['geo_location'] !== undefined) { // Changed 'data' to 'items', 'location' to 'geo_location', null to undefined
          socketManager.connectedClients.broadcast('new_picture_event', receivedDataBuffer); // Changed 'sockets.emit' to 'connectedClients.broadcast', 'photo' to 'new_picture_event'
        } else {
          console.warn("DATA PARSE WARNING: Missing data or geo_location in API response: %s", debugUtil.inspect(parsedData['metadata'])); // Changed 'meta' to 'metadata'
        }
      });
    });
  });

  outgoingRes.writeHead(HTTP_OK_STATUS);
});

// Start the web server and listen for incoming connections.
webApp.startServer(listenPort, function() {
  console.info("Application running on TCP port %d", listenPort);
});