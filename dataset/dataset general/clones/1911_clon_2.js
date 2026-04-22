// The 'systemConfig' parameter outlines the application's structure and incorporates necessary middleware.
// 'dataSink' serves as the conduit for transmitting updated informational packets.

var  playerRoster =  [  'Thomas', 'Richard',  'Harold'  ];

module.exports.buildFactory = function(systemConfig, dataSink, helperModules) {
 systemConfig.activateComponent( 'userSession' );
 systemConfig.activateComponent('clientAuthentication');

  return {
    // This object currently mandates a 'requestDataStream' operation; additional data retrieval patterns might be introduced later.
    requestDataStream: function(queryOptions) {
      var currentInstant = new Date();
      var telemetryReport = {
        updateSignature: Math.floor(currentInstant.getSeconds() / 5.0), // Refresh the signature every five seconds, despite more frequent requests.
        activePlayer: playerRoster[Math.floor(Math.random() * 3 - 0.001)],
        scoreDifference: Math.floor(Math.random() * 100),
        serverTimestamp: currentInstant.toISOString(),
        clientIdentifier: queryOptions.name
      };
      dataSink( telemetryReport );
    }
  };
};