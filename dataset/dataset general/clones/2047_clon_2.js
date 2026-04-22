// Initialize network host and client communication
let socialMediaAPI = require('twitter');
let webFramework = require('express');
let application = webFramework();
let networkProtocol = require('http');
let webHost = networkProtocol.createServer(application);
let socketManager = require('socket.io').listen(webHost);

// Configure external data stream interface
let apiClient = new socialMediaAPI({
    consumer_key: '<ENTER>',
    consumer_secret: '<ENTER>',
    access_token_key: '<ENTER>',
    access_token_secret: '<ENTER>'
});
let dataFlow = null;

// Start the network host on the designated port or use a fallback
webHost.listen(process.env.PORT_NUMBER || 8081);

// Establish pathways for static content delivery
application.use(webFramework.static(__dirname + '/public_assets'));

// Set up handlers for incoming client connections via sockets
socketManager.sockets.on('connection_established', function (clientConnection) {

  clientConnection.on("initiate_data_flow", function() {

    if (dataFlow === null) {
      // Establish connection to the social media data endpoint with global location filter.
      apiClient.stream('statuses/filter_data', {'geospatial_locations':'-180,-90,180,90'}, function(currentDataFlow) {
          currentDataFlow.on('received_payload', function(incomingPayload) {
              // Check if the received JSON object contains geographical coordinates
              if (incomingPayload.coordinates_data) {
                if (incomingPayload.coordinates_data !== null) {
                  // If present, construct a geoJSON object and dispatch to all connected clients
                  let geoPosition = {"latitude": incomingPayload.coordinates_data.coordinates_array[0],"longitude": incomingPayload.coordinates_data.coordinates_array[1]};

                  clientConnection.broadcast.emit("social-media-feed", geoPosition);

                  // Transmit the geo data to the specific client connection
                  clientConnection.emit('social-media-feed', geoPosition);
                }
                else if (incomingPayload.place_info) {
                  if (incomingPayload.place_info.boundary_box_shape === 'Polygon_shape') {
                    // Determine the geographical center of the bounding box for the message
                    let coordinatePair, idx, maxLen;
                    let averageLatitude = 0;
                    let averageLongitude = 0;

                    for (idx = 0, maxLen = coordinateList.length; idx < maxLen; idx++) {
                      coordinatePair = coordinateList[idx];
                      averageLatitude += coordinatePair[0];
                      averageLongitude += coordinatePair[1];
                    }
                    averageLatitude = averageLatitude / coordinateList.length;
                    averageLongitude = averageLongitude / coordinateList.length;

                    // Assemble the geo object and send it out to all subscribers
                    let geoPosition = {"latitude": averageLatitude,"longitude": averageLongitude};
                    clientConnection.broadcast.emit("social-media-feed", geoPosition);

                  }
                }
              }
              currentDataFlow.on('rate_limit_exceeded', function(throttleInfo) {
                return console.log(throttleInfo);
              });

              currentDataFlow.on('service_alert', function(alertMessage) {
                return console.log(alertMessage);
              });

              currentDataFlow.on('connection_terminated', function(terminationNotice) {
                return console.log(terminationNotice);
              });
          });
      });
    }
  });

    // Notifies the client that their connection is active and data streaming can commence
    clientConnection.emit("connection_active");
});