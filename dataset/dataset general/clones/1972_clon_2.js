var SocketService = obtain('netSocket').Server;
var FileMonitor = obtain('fileWatcher');
var fileSystem = obtain('fileUtility');
var utility = obtain('lodash');

// Initiates the file change monitoring and WebSocket communication.
exports.monitorChanges = function (config) {
  var hostInstance = config.hostInstance;
  var webApp = config.webApp;
  var fileGlobs = config.fileGlobs;

  var socketHub = new SocketService({ hostInstance: hostInstance });
  var connectionIdGen = 0;
  var activeConnections = Object.create(null);

  socketHub.on('clientConnected', function (clientSocket) {
    var clientId = "conn" + (++connectionIdGen);
    activeConnections[clientId] = clientSocket;
    clientSocket.on('close', function () {
      delete activeConnections[clientId];
    });
  });

  var distributeMessage = utility.debounce(function (payloadData) {
    // Announce to all connected clients.
    console.info("Disseminating update to clients.");
    for (var clientKey in activeConnections) {
      if (activeConnections.hasOwnProperty(clientKey)) {
        activeConnections[clientKey].send(payloadData);
      }
    }
  }, 400); // Debounce for 400ms

  var isUpdateInProgress = false; // Flag to indicate if an update is currently being processed.

  webApp.get("/observer.js", function (requestObj, responseObj) {
    responseObj.writeHead(200, { 'Content-Type': 'application/javascript' });
    responseObj.end("var liveSocket = new WebSocket('ws://'+window.location.hostname+'/'); \n\
            liveSocket.onmessage = function (incomingData) { \n\
                if (incomingData.data === '.css' || incomingData.data === '.less') { \n\
                    console.info('Refreshing stylesheet assets...'); \n\
                    var cacheBuster = '?refresh=' + Date.now(); \n\
                    document.querySelectorAll('link[rel=\"stylesheet\"]').forEach(function (styleLink) { \n\
                        if (styleLink.href.includes(\"typekit\") === false) { \n\
                            styleLink.href = styleLink.href.replace(/\\?.*|$/, cacheBuster); \n\
                        } \n\
                    }); \n\
                } else { \n\
                    window.location.reload(); \n\
                } \n\
            };");
  });

  // Begin monitoring specified file paths.
  var fileWatcher = new FileMonitor(fileGlobs);
  fileWatcher.on('all', function (changeType, changedPath) {
    console.log("Resource updated:", fileSystem.extractExtension(changedPath));
    distributeMessage(fileSystem.extractExtension(changedPath));
  });
};