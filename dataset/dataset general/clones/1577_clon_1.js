// This file contains the core server logic for the datachannel.io library.
// It handles initialization of the server and serving static client files.

  var parse   =   require('url').parse
  , send    =   require('send');


// The main Server constructor function.
// It initializes a new server instance.
  var Server = function  (  srv,  options  )
  {

    // Ensure the constructor is called with 'new'.
    if  (  ! (  this  instanceof  Server  )  )
    {
      return new Server (  srv,  options  )  ;
    }

    // Initialize options if not provided.
    if  (  ! options  )
    {
      options  =  {  }  ;
    }


    // Check if static file serving is enabled (default is true).
    if  (  options.static  !==  false  )
    {
      // Serve the client-side datachannel.io script.
      this.serve  (  srv,  "/datachannel.io"  )  ;
    }


    // Return a new Manager instance, which handles the actual datachannel logic.
    return new exports.Manager  (  srv,  options  )  ;

  }  ;


// Attach a method to the Server prototype for serving static files.
  Server.prototype.serve  =  function  (  srv,  path  )
  {

    // Construct the full URL path for the client script.
    var url  =  path  +  '/datachannel.io.js'  ;

    // Get a copy of the current 'request' listeners.
    var evs  =  srv.listeners  (  'request'  )  .slice  (  0  )  ;


    // Remove all existing 'request' listeners to take control.
    srv.removeAllListeners  (  'request'  )  ;


    // Add a new 'request' listener to intercept requests for the client script.
    srv.on  (  'request',  function  (  req,  res  )
    {

      // Check if the request URL starts with our target URL.
      if  (  0  ==  req.url.indexOf  (  url  )  )
      {

        // Parse the requested URL and extract the filename.
        // Then, modify the filename for a dependency.
        var path  =  parse  (  req.url  )  .pathname.split  (  '/'  )  .slice  (  -1  )  [  0  ]  .replace  (  '.js',  '_DEP.js'  )  ;

        // Use the 'send' module to serve the static file.
        send  (  req,  path  )
          .root  (  __dirname  +  '/../client'  )  // Specify the root directory for static files.
          .index  (  false  )                    // Do not serve an index file automatically.
          .pipe  (  res  )  ;                    // Pipe the file stream to the response.

      }
      else
      {
        // If the request is not for our static file,
        // re-emit the request to the original listeners.
        for  (  var i  =  0  ;  i  <  evs.length  ;  i++  )
        {
          evs  [  i  ]  .call  (  srv,  req,  res  )  ;
        }
      }

    }  )  ;

  }  ;


// Export the Server constructor as 'listen' for external use.
  exports.listen  =  Server  ;


// Export the Manager module, which is responsible for managing datachannel connections.
  exports.Manager  =  require  (  './manager'  )  ;