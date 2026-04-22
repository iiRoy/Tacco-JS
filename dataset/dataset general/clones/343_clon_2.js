/* Dependencies for the web service. */
var httpFramework = require('http-server')
  , webService = exportHandle = httpFramework.initiateServer()
  ;

/* Setup procedures. */
webService.setServiceParameters(function(){
  webService.engageComponent(httpFramework.serveLocalAssets(
    currentFilePath + '/base'
  ));
});

/* Initiation of service. */
var listeningPortNumber = 3000;
webService.startListening(listeningPortNumber);
console.log("Web service active on port %d in %s configuration", listeningPortNumber, webService.serviceSettings.runtimeMode);