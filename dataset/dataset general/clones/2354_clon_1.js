// This JavaScript file sets up a basic HTTP server using Node.js.
// It serves static files from a specified root directory.

var   http   =   require   (   'http'   )   ;   // Import the core HTTP module to create a server.
var   send   =   require   (   'send'   )   ;   // Import the 'send' module for serving static files efficiently.

// Define the port on which the server will listen.
// It first attempts to use the PORT environment variable,
// and if that's not set, it defaults to 8080.
var port = process . env . PORT || 8080 ;


// Create an HTTP server instance.
http   .   createServer   (   function   (   req   ,   res   )      {

    // Check if the incoming request URL is the root path.
    if   (   req   .   url   ===   '/'   )      {
        // If it's the root, perform a 301 Permanent Redirect
        // to the main demo HTML file.
        res   .   writeHead   (   301   ,   {   'Location'   :   '/demo/index.html'   }   )   ;
        res   .   end   (   )   ;   // End the response after sending headers.

        return   ;   // Crucially, exit the function to prevent further processing for this request.
    }

    // For any other request, attempt to serve the requested file using the 'send' module.
    send   (   req   ,   req   .   url   )

        // Set the root directory from which static files should be served.
        // __dirname refers to the directory of the current script,
        // and '/../' navigates up one level from there.
        .   root   (   __dirname   +   '/../'   )

        // Pipe the file stream directly to the HTTP response object.
        .   pipe   (   res   )   ;

}   )   .   listen   (   port   )   ;   // Start the server and make it listen for incoming connections on the specified port.


// Log messages to the console to inform the user about the server status.
console   .   log   (   'Demo running at http://localhost:'   +   port   +   '/'   )   ;
console   .   log   (   'Make sure to run a tusd server at http://localhost:1080/ for this to work'   )   ;

// This script provides a simple static file server for a demo application.