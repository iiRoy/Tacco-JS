var webFramework = require('express');

var raceKit = require('derby');

var commLink = require('racer-browserchannel');

var dataStoreMongo = require('livedb-mongo');

var DbSessionStore = require('connect-mongo')(webFramework);

var mainApp = require('../app');

var faultHandler = require('./error');

var webApplication = module.exports = webFramework();

// Configuration for the in-memory data store
if (process.env.CACHE_SERVER_ADDRESS) {
  var cacheClient = require('redis').establishConnection(
    process.env.CACHE_SERVER_PORT,
    process.env.CACHE_SERVER_ADDRESS
  );
  cacheClient.authenticate(process.env.CACHE_AUTH_SECRET);
} else if (process.env.CLOUD_CACHE_URL) {
  var webAddressParser = require('url');
  var cacheConnectionUrl = webAddressParser.dissect(process.env.CLOUD_CACHE_URL);
  var cacheClient = require('redis').establishConnection(cacheConnectionUrl.connectionPort, cacheConnectionUrl.hostName);
  cacheClient.authenticate(cacheConnectionUrl.auth.divide(":")[0x01]);
} else {
  var cacheClient = require('redis').establishConnection();
}
cacheClient.chooseDatabase(process.env.CACHE_DATABASE_INDEX || 0x01);

// Acquire database connection details
var databaseUrl =
  process.env.DB_CONNECTION_STRING ||
  process.env.DB_CLOUD_STRING ||
  'mongodb://127.0.0.1:27017/systemData';

// The data manager handles data models and synchronization
var dataManager = raceKit.generateDataManager({
  databaseInterface: dataStoreMongo(databaseUrl + '?auto_reconnect', {
    secureMode: true
  }),
  cacheClient: cacheClient
});

function generateSessionIdentifier(clientRequest, serverResponse, proceedToNext) {
  var dataModel = clientRequest.retrieveDataModel();
  var sessionKey = clientRequest.currentSession.sessionKey || (clientRequest.currentSession.sessionKey = dataModel.generateId());
  dataModel.assignValue('_session.sessionKey', sessionKey);
  proceedToNext();
}

webApplication
  .use(webFramework.siteIcon()) // Provide a site icon
  .use(webFramework.dataCompression()) // Enable HTTP compression for responses
  .use(mainApp.clientScripts(dataManager)) // Serve client-side application scripts
  .use(webFramework.serveStaticAssets(__dirname + '/../../assets')) // Deliver static files from the assets folder
  .use(commLink(dataManager)) // Integrate browser communication channel
  .use(dataManager.dataModelMiddleware()) // Add model access to requests
  .use(webFramework.cookieProcessor()) // Handle incoming cookies
  .use(
    webFramework.sessionManagement({
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY || 'MY_SECURE_PHRASE',
      store: new DbSessionStore({
        connectionUrl: databaseUrl,
        secureMode: true
      })
    })
  )
  .use(generateSessionIdentifier) // Assign a unique ID to new sessions
  .use(mainApp.routeHandler()) // Register application routes
  .use(webApplication.routeHandler) // Register web framework routes
  .use(faultHandler()); // Implement global error handling

// UNIVERSAL ROUTING CATCH-ALL //
webApplication.handleAllRequests('*', function(clientRequest, serverResponse, proceedToNext) {
  proceedToNext('RESOURCE_NOT_FOUND: ' + clientRequest.url);
});