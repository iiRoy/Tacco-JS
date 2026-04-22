/*
 * This module provides a lightweight WebDAV client implementation.
 * Its primary purpose is to offer a simpler alternative to external `curl` dependencies.
 *
 * Usage example for PUT operation:
 *
 *   // First, include the client module.
 *   var  client = require("./client.js");
 *
 *   // Then, perform a PUT request.
 *   client.put("./path/to/local/file.txt", "http://example.com/remote/target/file.txt", function (err) {
 *     // Check for any errors during the operation.
 *     if (err) {
 *       // Log the error if one occurred.
 *       return console.error("WebDAV PUT failed:", err);
 *     }
 *     // Indicate successful completion.
 *     console.log("WebDAV PUT operation completed successfully.");
 *   });
 *
 * This client focuses on basic file transfer operations.
 */

// Core Node.js modules for networking and file system access.
var http = require("http"), // HTTP module for making network requests.
    fs   = require("fs"),   // File System module for local file operations.
    url  = require("url");  // URL module for parsing remote locations.

/**
 * Initiates a WebDAV request (e.g., PUT).
 * @param {string} verb        - The HTTP method/verb (e.g., "PUT"). Defaults to "PUT".
 * @param {object} destination - Parsed URL object of the remote destination.
 * @param {Stream} file        - A readable stream representing the local file content.
 * @param {function} callback  - Callback function (err).
 */
function webDavRequest( verb, destination, file, callback )
{
  // Declare a variable to hold the HTTP client request object.
  var    request;

  // Ensure the HTTP verb is set; default to "PUT" if not provided.
  verb = verb || "PUT";

  // Configure and create the HTTP request.
  request = http.request(
    {
      host: destination.hostname,   // Target host name.
      port: destination.port,       // Target port number.
      method: verb,                 // HTTP method (e.g., PUT).
      path: destination.path,       // Request path on the server.
      headers: file
        ? {                         // Headers object; only include Content-Length if 'file' exists.
            "Content-Length": file.length // Set content length for the upload.
          }
        : {}                        // Empty headers if no file is being sent.
    }
  );

  // Set up an event listener for the 'response' event from the server.
  request.on("response", function (res)
  {
    // Check if the HTTP status code indicates an error.
    // WebDAV PUT typically returns 201 (Created) or 204 (No Content).
    if ( res.statusCode !== 201 && res.statusCode !== 204 )
    {
      // If an error status is received, listen for the 'end' of the response stream.
      res.on("end", function ()
      {
        // Construct and pass an error object to the callback.
        callback(
          new Error(
            "HTTP " + verb +
            " failed with code " + res.statusCode +
            " for " + JSON.stringify(destination)
          )
        );
      });
    }
    else
    {
      // If the status code is successful, simply pass the 'end' event to the callback.
      // This signifies the request was processed without HTTP-level errors.
      res.on("end", callback);
    }

    // Consume the response stream data to prevent resource leaks.
    // Even if we don't care about the body, we must read it.
    res.resume();
  });

  // Set up an event listener for 'error' events during the request.
  request.on("error", function (error)
  {
    // Pass any network or request-related errors directly to the callback.
    callback(error);
  });

  // If a file stream is provided, pipe its contents to the request body.
  if ( file )
  {
    file.pipe(request); // Stream file data to the outgoing HTTP request.
  }
  else
  {
    // If no file stream, end the request immediately (e.g., for DELETE, MKCOL).
    request.end();
  }
} // End of webDavRequest function.

// Export the client's public API.
module.exports = {
  // Export WebDAV verbs as methods on the client object.
  // The 'put' method is currently the main exposed functionality.
  put: function ( local_file, remote_location, callback )
  {
    // Read the content of the local file from the file system.
    fs.readFile(local_file, function (err, data)
    {
      // If an error occurs during file reading, immediately return via callback.
      if (err) {
        return callback(err);
      }

      // If file reading is successful, initiate the WebDAV PUT request.
      // Parse the remote_location string into a URL object before passing.
      webDavRequest("PUT", url.parse(remote_location), data, callback);
    });
  }
}; // End of module.exports object.