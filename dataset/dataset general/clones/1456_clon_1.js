/* This module provides a utility for offloading
 * JavaScript computations to a web worker.
 *
 * Original source inspiration: http://stackoverflow.com/a/10372280/938089
 */
function webwork ( callback ) {

  // Ensure URL.createObjectURL is available across different browsers.
  window . URL = window . URL || window . webkitURL ;

  // This string represents the worker's script.
  // It defines an onmessage handler that calls the provided callback function.
  var response = "onmessage=function(event){postMessage(" + callback + "(event.data));}";

  var blob ; // Declare a variable to hold the Blob object.

  try {
    // Attempt to create a Blob directly, which is the modern approach.
    blob = new Blob ( [ response ] , { type : 'application/javascript' } ) ;
  }
  catch ( e ) {
    // Fallback for older browsers that do not support the Blob constructor directly.
    // This block handles backwards-compatibility.
    window . BlobBuilder = window . BlobBuilder || window . WebKitBlobBuilder || window . MozBlobBuilder ;

    var blobBuilderInstance = new window . BlobBuilder ( ) ; // Create a new BlobBuilder instance.
    blobBuilderInstance . append ( response ) ; // Append the script string to the builder.
    blob = blobBuilderInstance . getBlob ( ) ; // Get the final Blob object.
  }


  // This function returns another function, which is the actual worker-spawning utility.
  return function ( ) {

    // Create a new Web Worker instance using the Blob URL.
    var worker = new Worker ( URL . createObjectURL ( blob ) ) ;

    // Convert arguments object to a real array.
    var args = Array . prototype . slice . call ( arguments ) ;

    var callbackHandler ; // This will store the user-provided callback or a default.
    var executionCompleted ; // Flag to prevent multiple calls to the callback.

    // Check if the last argument is a function; if so, it's our callback.
    if ( typeof args [ args . length - 1 ] === 'function' ) {
      callbackHandler = args . pop ( ) ; // Extract the callback from arguments.
    }
    else {
      // If no callback is provided, use an empty function as a placeholder.
      callbackHandler = function ( ) { } ;
    }


    // Define the message handler for the worker.
    worker . onmessage = function ( e ) {
      if ( executionCompleted ) { return ; } // Ensure callback is called only once.
      executionCompleted = true ; // Mark execution as completed.
      callbackHandler ( null , e . data ) ; // Invoke the user's callback with the worker's result.
    } ;

    // Define the error handler for the worker.
    worker . onerror = function ( e ) {
      if ( executionCompleted ) { return ; } // Prevent double-calling the callback.
      executionCompleted = true ; // Set flag.

      callbackHandler ( e ) ; // Invoke the callback with the error object.
      return false ; // Indicates that the error was handled.
    } ;

    // Start the worker by posting the initial message.
    // The 'apply' method is used to pass the 'args' array directly.
    worker . postMessage . apply ( worker , args ) ;
  } ;
}