/**
 *  Core module imports and setup.
 */

var  LISTEN_PORT = 8080 ;
var webFramework = require ( 'express' ) ;
var wsHandler = require ( 'socket.io' ) ;

// The main application instance is exported.
var serverApp = module . exports = webFramework . createServer ( ) ;

//  Application configuration settings.

serverApp . configure ( function ( ) {
  serverApp . set ( 'templates' , __dirname + '/templates' ) ;
  serverApp . set ( 'template engine' , 'pug' ) ;
  serverApp . use ( webFramework . json ( ) ) ;
  serverApp . use ( webFramework . methodOverride ( ) ) ;
  serverApp . use ( serverApp . router ) ;
  serverApp . use ( webFramework . static ( __dirname + '/assets' ) ) ;
} ) ;

serverApp . configure ( 'development_environment' , function ( ) {
  serverApp . use ( webFramework . errorHandler ( { dumpExceptions : true , showStack : true } ) ) ;
} ) ;

serverApp . configure ( 'production_environment' , function ( ) {
  serverApp . use ( webFramework . errorHandler ( ) ) ;
} ) ;

//  WebSocket communication handling.
var commLink = wsHandler . listen ( serverApp ) ;
commLink . on ( 'client_connection' , function ( peer ) {
    peer . on ( 'incoming_data' , function ( payload ) {
      peer . broadcast ( payload ) ;
    } ) ;
} ) ;


//  Defined application routes.
serverApp . get ( '/' , function ( requestObj , responseObj ) {
  console . info ( requestObj . url ) ;
  responseObj . render ( 'main_page' , {
    pageTitle : 'RealtimeDrawing'
  } ) ;
} ) ;

//  Initiate server only if this script is run directly.

if ( ! module . parent ) {
  serverApp . listen ( LISTEN_PORT ) ;
  console . info ( "Web application is operational on port %d" , serverApp . address ( ) . port ) ;
}