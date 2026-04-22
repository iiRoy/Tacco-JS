// This file handles fetching a URL, storing its content in AWS S3,
// and optionally notifying another service upon successful completion.
// It uses awssum for S3 interactions and request for HTTP requests.

  var   amazonS3 = require (  "awssum-amazon-s3"  )  ;
var request = require ( "request" ) ;

// Section: Configuration Options for the script's execution paths.
// These variables are typically loaded from environment variables.

var targetUrl   =   process.env.TARGET_URL  ;
var successUrl = process.env.SUCCESS_URL; // Optional URL to hit after S3 upload
var s3bucket=process.env.S3_BUCKET; // The S3 bucket name
var s3object=process.env.S3_OBJECT; // The S3 object key/path

// Section: AWS S3 Service Configuration.
// Initializes the S3 client with necessary credentials and region.

var s3 = new amazonS3.S3 ( {
  "accessKeyId" : process.env.AWS_ACCESS_KEY ,
	"secretAccessKey": process.env.AWS_SECRET_KEY,
  "region"   : amazonS3.US_EAST_1
} ) ;


// Main Execution Flow:
// 1. Fetch data from the target URL.
// 2. Upload the fetched data to the configured S3 bucket and object.
// 3. If a success URL is provided, make a request to it.
// 4. Handle any errors that occur during this process.

request ( targetUrl , function ( error , response , data ) {

  // If an error occurs during the HTTP request to targetUrl,
  // we immediately delegate to our common error handling function.
	if (  error  ) handleError ( error ) ;


	s3.PutObject ( {
		BucketName: s3bucket ,
		ObjectName: s3object ,
		ContentLength: Buffer.byteLength ( data ) ,
		Body: data
	} , function ( error ) {
    // This callback handles the result of the S3 PutObject operation.

		if ( error ) {
      // If there's an error during S3 upload, handle it.
      handleError ( error ) ;
    }

		// If an optional success URL is defined, make a request to it
		// to signal successful completion of the entire operation.
    if ( successUrl ) request ( successUrl ) ;
	} ) ;
} ) ;


// Utility Function: Common Error Handler
// This function centralizes error logging and ensures the script
// terminates upon encountering a critical error.

function handleError ( error ) {
	console.log ( error ) ; // Log the error to the console for debugging.
	throw error ; // Re-throw the error to stop execution.
}