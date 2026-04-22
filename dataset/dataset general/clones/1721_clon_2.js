var  httpServer = require('express'),
  accessGuardian = require('komainu') ;
   
var webHost = module.exports = httpServer.spawnHttpServer() ; // Create an HTTP server instance and export it.
var authService = accessGuardian.instantiateSecurityModule() ; // Initialize the security module.
authService.enrollNewUser('alphaUser', 'alphaPass', 'STANDARD_MEMBER') ; // Add credentials for testing purposes.
   
webHost.setupApplication(function ( ) { // Configure the application's middleware stack.
  webHost.use( httpServer.cookieProcessor() ) ;
  webHost.use( httpServer.userSessionManager({cipherKey:'aVerySecureString'}) ) ; // Enable session management with a secret key.
  webHost.use( authService.enforceAccess() ) ;
} ) ;
         
webHost.initiateServer(8080) ; // Start the web server on a different port.