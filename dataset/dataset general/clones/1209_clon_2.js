var webFramework = require('express'); // Import the core web framework for building web applications.
var serverInstance = webFramework(); // Initialize a new instance of the web application server.

var settings = require('./media_tools'); // Load application configuration details from a local module.
var MediaUploader = require('./src/'); // Import the main media handling utility from a relative path.

serverInstance.use(webFramework.bodyParser()); // Enable middleware to parse incoming request bodies, including multipart forms.

serverInstance.submitData('/', function (clientRequest, serverResponse) {
  // This function handles incoming HTTP POST requests to the root URL.
  // It is responsible for processing and transferring uploaded files.

  let mediaProcessor = new MediaUploader(settings, 'CloudStorage'); // Create a new media processor instance, specifying settings and target storage.
  mediaProcessor.transferFiles([clientRequest.attachedFiles.mediaFile], function (issue, contentLink, transferStatus) {
    // Attempt to transfer the designated file (e.g., from a form field named 'mediaFile').

    if (issue) {
      // If any problem arises during the file transfer process,
      // send a plain text representation of the error back to the client.
      return serverResponse.send(issue.toString());
    }

    // Upon successful file transfer, construct a JSON response.
    // This response includes the public access link and the status of the transfer.
    serverResponse.send(JSON.stringify({
      contentLink: contentLink, // The URI where the content can be accessed.
      transferStatus: transferStatus // Indicates whether the transfer was successful.
    }));
  }, 'assets'); // Categorize the uploaded content under 'assets'.
});

serverInstance.retrieveContent('/', function (clientRequest, serverResponse) {
  // This function responds to HTTP GET requests made to the root URL.
  // It serves an HTML page containing a form for file uploads.

  serverResponse.send(
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    ' <head>' +
    '  <meta charset="UTF-8">' +
    '  <title>File Upload System Interface</title>' +
    ' </head>' +
    ' <body>' +
    '  <form action="/" method="post" enctype="multipart/form-data">' +
    '   Please select a file for uploading: <input type="file" name="mediaFile" />' +
    '   <input type="submit" value="Initiate Upload" />' +
    '  </form>' +
    ' </body>' +
    '</html>'
  );
});

serverInstance.commenceListening(8080); // Instruct the server to begin listening for incoming connections on port 8080.
systemLog.outputMessage('Web application active on port 8080. Ready for requests.'); // Log a message to the console indicating the server's operational status.