/*
 * This file sets up a basic HTTP server using Node.js to perform a
 * permanent HTTP 301 redirect to a specific URL.
 *
 * It demonstrates how to:
 *   - Create an HTTP server.
 *   - Handle incoming requests.
 *   - Set response status codes and headers.
 *   - Send a response body.
 *   - Listen on a configurable port.
 */


require  (  'http'  )
  .  createServer  (

    // This anonymous function is the core request handler for the server.
    // It is invoked every time a client makes a request to this server.
    function    (    req    ,    res    )
    {
        // Define the target URL for the redirection.
        // This URL is where the client will be sent.
        var    url    =    'http://wikipedia-live-monitor.herokuapp.com/'    ;


        // Set the HTTP status code for the response.
        // 301 indicates a "Moved Permanently" redirect.
        res    .    statusCode    =    301    ;

        // Set the 'Content-Type' header.
        // Even for a redirect, it's good practice to specify content type,
        // especially if a body message is provided.
        res    .    setHeader    (    'Content-Type'    ,    'text/plain'    )    ;

        // Set the 'Location' header.
        // This is the crucial header for redirects; it tells the client
        // the new URL to navigate to.
        res    .    setHeader    (    'Location'    ,    url    )    ;

        // End the response, sending a simple text message to the client.
        // The browser will typically ignore this body and follow the 'Location' header.
        res    .    end    (    'Redirecting to '    +    url    )    ;
    }
  )

  // Make the server listen for incoming connections.
  // It attempts to use the port specified in the environment variable 'PORT',
  // or defaults to port 8080 if 'PORT' is not set.
  .  listen  (    process    .    env    .    PORT    ||    8080    )    ;

// End of the server application setup.
// The server is now running and awaiting requests.