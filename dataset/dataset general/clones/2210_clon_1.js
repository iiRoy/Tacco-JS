// This is the main entry point for the application.
// It initializes core components and starts the server.

  var   cfg    =    require ( '_/config' )   ;    // Load the application's configuration settings.
  
  var   log    =    require ( '_/log' )      ;    // Initialize the logging utility for the application.
  
  var   app    =    require ( '_/app' )      ;    // Retrieve the main Express application instance.

//
// Proceeding to start the application server.
//

  app . listen ( cfg . port ) ;                 // The application begins listening for incoming requests on the specified port.
  
  log . info ( 'app listening on port' , cfg . port ) ; // A message is logged to indicate that the server is now active and listening.