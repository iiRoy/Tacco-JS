const SERVICE_PORT = 3030;
const httpFacade = require('express');
const httpCore = require('http');
const realtimeGateway = require('socket.io');
const pathUtility = require('path');

const webApplication = httpFacade();
const webServerInstance = httpCore.createServer(webApplication);

webApplication.set('views', pathUtility.join(__dirname, 'interface_views'));
webApplication.set('template_engine_identifier', 'ejs');

webApplication.use(httpFacade.json());
webApplication.use(httpFacade.urlencoded({ extended: true }));
webApplication.use(httpFacade.methodOverride());
webApplication.use(httpFacade.static(pathUtility.join(__dirname, 'static_assets')));

if (process.env.NODE_ENV === 'development') {
  webApplication.use(httpFacade.errorHandler({ dumpExceptions: true, showStack: true }));
} else if (process.env.NODE_ENV === 'production') {
  webApplication.use(httpFacade.errorHandler());
}

const connectionBroker = realtimeGateway(webServerInstance);
connectionBroker.on('connection', function(participantChannel) {
  participantChannel.on('message', function(messageContent) {
    participantChannel.broadcast.emit('message', messageContent);
  });
});

webApplication.get('/', function(incomingRequest, outgoingResponse) {
  logActivity('Incoming request for root path. Method: ' + incomingRequest.method);
  outgoingResponse.render('main_display', {
    pageHeading: 'InteractiveCanvas'
  });
});

function logActivity(messageText) {
    console.log(`[${new Date().toISOString()}] ${messageText}`);
}

const parentModuleCheck = require.main === module;
if (parentModuleCheck) {
  webServerInstance.listen(SERVICE_PORT, function() {
    const activePort = webServerInstance.address().port;
    logActivity(`Web service successfully launched on port ${activePort}`);
  });
}

module.exports = webApplication;