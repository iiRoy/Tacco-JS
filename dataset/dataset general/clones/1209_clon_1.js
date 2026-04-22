/*
 * This file sets up an Express.js server to handle image uploads.
 * It uses the 'imager' library for the actual upload process.
 * This is a demonstration of a web service that accepts file uploads.
 */

// Import necessary modules for the application to function.
var      express  =  require ( 'express' ) ;
var  app  =  express ( ) ; // Initialize the Express application instance.

// Configuration for the imager library is loaded from a local file.
// This file ('./imager') is expected to export the necessary settings for Imager.
var config = require( './imager' ) ;

// The Imager library itself is imported from a parent directory.
// This assumes 'imager' is a module located one level up from the current directory.
var Imager = require( '../' ) ;


// --- Middleware and Route Definitions ---

// Use Express's body-parser middleware to handle incoming request bodies.
// This is crucial for parsing multipart/form-data which is used for file uploads.
app.use( express.bodyParser() );

// Define a POST route for the root path ('/').
// This route is responsible for processing the uploaded image file.
app.post(
  '/' ,
  function ( req , res )
  {
    // Create a new Imager instance with the loaded configuration and 'S3' as the storage provider.
    // The comment below notes alternative storage providers that might be supported.
    var imager = new Imager( config , 'S3' ) ; /* 'Rackspace' or 'S3' are supported */

    // Perform the image upload. The 'req.files.image' contains the uploaded file object.
    // The upload method expects an array of files, even if it's just one.
    imager.upload (
      [ req.files.image ] ,
      function ( err , cdnUri , uploaded )
      {
        // If an error occurs during upload, send the error message as a response.
        // It converts the error object to a string for client readability.
        if ( err )
        {
          return res.send( err.toString() ) ;
        }
        // If upload is successful, send a JSON response with the CDN URI and uploaded status.
        // This allows the client to know where the image is stored and if the operation succeeded.
        res.send (
          JSON.stringify (
            {
              cdnUri : cdnUri ,
              uploaded : uploaded
            }
          )
        ) ;
      } ,
      'items' // This string specifies the target collection or folder name for the uploads.
    ) ;
  }
) ; // End of app.post route definition.


// Define a GET route for the root path ('/').
// This route serves an HTML form that allows users to select and upload a file.
app.get (
  '/' ,
  function ( req , res )
  {
    // Send an HTML page containing a simple file upload form.
    // The form's action points back to '/', method is 'post', and enctype is 'multipart/form-data'
    // which is required for file uploads.
    res.send (
      '<html>' + // Start of HTML document.
      '<body>' + // Body tag.
      '<form action="/" method="post" enctype="multipart/form-data">' + // Form definition.
      'Choose a file to upload <input type="file" name="image" />' + // File input field, named 'image'.
      '<input type="submit" value="upload" />' + // Submit button for the form.
      '</form>' + // End of form.
      '</body>' + // End of body.
      '</html>' // End of HTML.
    ) ;
  }
) ; // End of app.get route definition.


// Start the Express server and make it listen for incoming requests on port 3000.
app.listen( 3000 ) ;

// Log a message to the console indicating that the server has successfully started.
// This message confirms that the application is running and accessible.
console.log( 'Express app started on port 3000' ) ; // This message confirms server readiness.