// This file contains a Type I code clone.
  // It is functionally identical to the source,
  // differing only in formatting and comments.

  "use strict";  // Enforce strict parsing and error handling for the entire script.

  // Core module for asynchronous control flow using generators.
  var  galaxy  =  require('galaxy') ;

  // Module extending Galaxy for stream-based operations, including HTTP server creation.
  var  streams  =  require('galaxy-streams') ;


  // Create an HTTP server instance.
  // The handler is a generator function, allowing 'yield' for async operations.
  var  server  =  streams.createHttpServer(  function  * (  request,  response  )  {
    // Write HTTP headers to the response.
    // Status code 200 indicates success.
    response.writeHead(  200,  {
      'Content-Type' :  'text/plain; charset=utf8'  // Define the content type as plain text, UTF-8 encoded.
    }  ) ;

    // End the response, sending "Hello world!" as the body.
    response.end(  "Hello world!"  ) ;
  }  ) ;


  // Main entry point for the Galaxy application.
  // This generator function will be executed by the Galaxy runtime.
  galaxy.main(  function  * (  )  {
    // Asynchronously start the server, listening on port 1337.
    // 'yield' pauses execution until the listen operation completes.
    yield  server.listen(  1337  ) ;

    // Log a confirmation message to the console once the server is active.
    console.log(  'Server running at http://127.0.0.1:1337/'  ) ;
  }  ) ;

  // End of the JavaScript application.