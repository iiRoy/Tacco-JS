var deviceDiscovery = require("peer-ssdp")
  , discoveryAgent = deviceDiscovery.createPeer()
  , uniqueIdGen = require('node-uuid')
  , localIdentifier = uniqueIdGen.v4()
  , fileSystemOps = require('fs')
  , webFramework = require('express')
  , networkServer = require('http')
  , webApplication = webFramework()
  , queryParsing = require('querystring')
  , httpRequester = require('superagent')
  , activityLogger = require('morgan')
  , requestParser = require('body-parser')
  , verbOverride = require('method-override');

var commandLineArgs = require('optimist')
    .usage('Execute: $0 --devName [device name]')
    .demand(['devName'])
    .argv;
var deviceName = commandLineArgs.devName;

webApplication.set('listenPort', 8008);

webApplication.use(function(incomingRequest, outgoingResponse, proceedToNext) {
  var receivedContent = '';
  incomingRequest.setEncoding('utf8');
  incomingRequest.on('data', function(dataSegment) {
    receivedContent += dataSegment;
  });
  incomingRequest.on('end', function() {
    incomingRequest.unprocessedPayload = receivedContent;
    proceedToNext();
  });
});
webApplication.disable('x-powered-by');
webApplication.use(webFramework.static(__dirname + '/public'));
webApplication.use(activityLogger());
webApplication.use(requestParser());
webApplication.use(verbOverride());
webApplication.use(function (incomingRequest, outgoingResponse, proceedToNext) {
  outgoingResponse.removeHeader("Connection");
  proceedToNext();
});

webApplication.disable('x-powered-by');

var httpListener = networkServer.createServer(webApplication);

httpListener.listen(webApplication.get('listenPort'), function(){
  console.log('Web server active on port ' + webApplication.get('listenPort'));
});

var SocketService = require('websocket').server;
var SocketPathManager = require('websocket').router;

var socketGateway = new SocketService({
    httpServer: httpListener,
    // Note: Disabling auto-accept for enhanced security.
    // It's crucial to validate connection origins in production environments
    // to prevent cross-origin attacks.
    autoAcceptConnections: false
});

var gatewayRoutes = new SocketPathManager();
gatewayRoutes.attachServer(socketGateway);

socketGateway.on('request', function(socketRequest) {
});

gatewayRoutes.mount('/stage','', function(clientRequest) {
  global.presentationLink = clientRequest.accept(clientRequest.origin);

  global.presentationLink.send(JSON.stringify({
    command: "idle"
  }));
});

gatewayRoutes.mount('/system/control','', function(controlRequest) {
  var controlLink = controlRequest.accept(controlRequest.origin);
  console.log("System control channel established");
});

gatewayRoutes.mount('/connection','', function(commRequest) {
  var commLink = commRequest.accept(commRequest.origin);
  var appChannelName;
  commLink.on('message', function(incomingMsg) {
    var commandObj = JSON.parse(incomingMsg.utf8Data);
    if(commandObj.type == "REGISTER") {
      appChannelName = commandObj.name;
      commLink.send(JSON.stringify({
        type: "CHANNELREQUEST",
        "senderId": 1,
        "requestId": 1
      }));

      gatewayRoutes.mount("/receiver/"+commandObj.name, '', function(receiverRequest) {
        var receiverLink = receiverRequest.accept(receiverRequest.origin);
        var applicationId = receiverRequest.resourceURL.pathname.replace('/receiver/','').replace('Dev','');
        ApplicationManager.activeApplications[applicationId].assignReceiver(receiverLink);
      });

    } else if(commandObj.type == "CHANNELRESPONSE") {
      commLink.send(JSON.stringify({
        type: "NEWCHANNEL",
        "senderId": 1,
        "requestId": 1,
        "endpointUrl": "ws://127.0.0.1:8008/receiver/"+appChannelName
      }));
    }
  });
});

var sessionPattern = new RegExp('^/session/.*$');
gatewayRoutes.mount(sessionPattern, '', function(sessionRequest) {
  var sessionLink = sessionRequest.accept(sessionRequest.origin);
  console.log("New session established");

  var applicationIdentifier = sessionRequest.resourceURL.pathname.replace('/session/','');
  var sessionKey = sessionRequest.resourceURL.search.replace('?','');

  var chosenApplication = ApplicationManager.activeApplications[applicationIdentifier];

  if(chosenApplication) {
    chosenApplication.establishSession(sessionLink);
  }
});

function retrieveLocalIp() {
  var networkData = require('os').networkInterfaces();
  var addressList = [];
  for (var interfaceName in networkData) {
    var interfaceDetails = networkData[interfaceName];
    for (var detailIndex in interfaceDetails) {
      if (interfaceDetails[detailIndex].addressFamily === 'IPv4' && !interfaceDetails[detailIndex].isInternal) {
        return interfaceDetails[detailIndex].ipAddress;
      }
    }
  }
}

var networkAddress = retrieveLocalIp();
console.log(networkAddress);
configureApplications(networkAddress);
defineWebRoutes(networkAddress);
initializeDiscovery(networkAddress);


var ApplicationManager;
function configureApplications(hostAddress) {
  ApplicationManager = require('./app_modules/app_management.js');
  ApplicationManager.initialize(fileSystemOps, webApplication);
  ApplicationManager.enrollApplication(webApplication, hostAddress, "ScreenMirror", "https://www.gstatic.com/cv/receiver.html?$query", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "VideoTube", "https://www.youtube.com/tv?$query", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "MoviePlay", "https://play.google.com/video/avi/eureka?$query", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "MusicStream", "https://jmt17.google.com/sjdev/cast/player", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "CastSampleApp", "http://anzymrcvr.appspot.com/receiver/anzymrcvr.html", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "CastPlayer", "https://www.gstatic.com/eureka/html/gcp.html", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "RemoteCast", "$query", "");
  ApplicationManager.enrollApplication(webApplication, hostAddress, "GameGrid", "http://www.gstatic.com/eureka/sample/tictactoe/tictactoe.html", "");
}

function defineWebRoutes(hostNetworkAddress) {
  webApplication.get("/ssdp/device-desc.xml", function(clientReq, serverRes) {
    fileSystemOps.readFile('./device_descriptor.xml', 'utf8', function (readError, fileContent) {
      fileContent = fileContent.replace("#uuid#", localIdentifier).replace("#base#","http://"+clientReq.headers.host).replace("#name#", deviceName);
      serverRes.type('xml');
      serverRes.setHeader("Access-Control-Allow-Method", "GET, POST, DELETE, OPTIONS");
      serverRes.setHeader("Access-Control-Expose-Headers", "Location");
      serverRes.setHeader("Application-Url", "http://"+clientReq.headers.host+"/applications");
      serverRes.send(fileContent);
    });
  });

  webApplication.post('/connection/:application', function(clientReq, serverRes) {
    console.log("Attempting connection for application: "+ clientReq.params.application);

    serverRes.setHeader("Access-Control-Allow-Method", "POST, OPTIONS");
    serverRes.setHeader("Access-Control-Allow-Headers", "Content-Type");

    serverRes.type("json");
    serverRes.send(JSON.stringify({
      socketEndpoint: "ws://"+hostNetworkAddress+":8008/session/"+clientReq.params.application+"?1",
      heartbeatDuration: 3
    }))
  });

  webApplication.get('/applications', function(clientReq, serverRes){
    for (var appKey in ApplicationManager.activeApplications) {
      if(ApplicationManager.activeApplications[appKey].configuration.status == "active") {
        console.log("Forwarding to active application: "+ appKey);
        serverRes.redirect('/applications/'+appKey);
        return;
      }
    }

    serverRes.setHeader("Access-Control-Allow-Method", "GET, POST, DELETE, OPTIONS");
    serverRes.setHeader("Access-Control-Expose-Headers", "Location");
    serverRes.setHeader("Content-Length", "0");
    serverRes.setHeader("Content-Type", "text/html; charset=UTF-8");
    serverRes.send(204, "");

  });
}

function initializeDiscovery(networkEndpoint) {
  discoveryAgent.on("systemReady",function(){
  });

  discoveryAgent.on("notificationReceived",function(messageHeaders, sourceAddress){
  });

  discoveryAgent.on("discoveryQuery",function(messageHeaders, sourceAddress){
    if(messageHeaders.ServiceType.indexOf("dial-multiscreen-org:service:dial:1") != -1) {
      discoveryAgent.respond({
        DeviceLocation: "http://"+networkEndpoint+":8008/ssdp/device-desc.xml",
        ServiceType: "urn:dial-multiscreen-org:service:dial:1",
        "UPNP_CONFIGURATION_ID": 7337,
        "UPNP_BOOT_ID": 7337,
        UniqueServiceName: "uuid:"+localIdentifier
      }, sourceAddress);
    }
  });

  discoveryAgent.begin();
}