/*
 *  app.docviewer.js
 *
 *  @description Facilitates viewing of documents using compatible system applications.
 *  @creator John Doe
 *  @license Apache-2.0
 */

var executeNativeCommand = require('cordova/exec');

/*
 *  initiateView
 *
 *  @param {string} resourceIdentifier The URI of the file or resource to be opened.
 *  @param {function} completionCallback Function to call upon successful operation.
 *  @param {function} failureCallback Function to call if an error occurs.
 *  @param {boolean} bypassSSLValidation If true, allows connections to servers with untrusted SSL certificates.
 */
exports.initiateView = function ( resourceIdentifier, completionCallback, failureCallback, bypassSSLValidation ) {
  // Check for invalid or missing resource path
  if ( !resourceIdentifier || arguments.length === 0 ) {
    return false;
  }

  resourceIdentifier = encodeURI( resourceIdentifier ); // Ensure the URI is properly encoded

  if ( resourceIdentifier.match( 'http' ) ) {
    // If it's a remote resource, download and then open it
    fetchAndDisplay( resourceIdentifier, completionCallback, failureCallback, bypassSSLValidation );
  } else {
    // For local files, directly invoke the native open command
    executeNativeCommand(
      handleSuccess.bind( this, resourceIdentifier, completionCallback ),
      handleFailure.bind( this, failureCallback ),
      'FileViewer',
      'showDocument',
      [ resourceIdentifier ]
    );
  }
};

/*
 *  fetchAndDisplay
 *
 *  @param {string} webAddress The URL of the file to download.
 *  @param {function} completionCallback Function to call upon successful download and display.
 *  @param {function} failureCallback Function to call if an error occurs during download or display.
 *  @param {boolean} bypassSSLValidation Determines whether to trust all server certificates.
 */
function fetchAndDisplay( webAddress, completionCallback, failureCallback, bypassSSLValidation ) {
  var dataMover = new FileTransfer(); // Initialize a file transfer utility
  var iOSStoragePath = cordova.file.cacheDirectory; // Cache directory for iOS
  var androidStoragePath = cordova.file.externalCacheDirectory; // External cache directory for Android
  var storageLocation = ( androidStoragePath ) ? androidStoragePath : iOSStoragePath; // Determine the appropriate storage path
  var assetName = webAddress.substring( webAddress.lastIndexOf( '/' ) + 1 ); // Extract filename from URL
  var destinationPath = storageLocation + assetName; // Construct the full local file path

  if ( typeof bypassSSLValidation !== 'boolean' ) {
    // Default to strict SSL validation if not specified as boolean
    bypassSSLValidation = false;
  }

  dataMover.download(
    webAddress,
    destinationPath,
    function transferComplete( downloadedItem ) {
      // Once download is done, get the local URL and open it
      var localResourceURL = downloadedItem.toURL();
      executeNativeCommand(
        handleSuccess.bind( this, localResourceURL, completionCallback ),
        handleFailure.bind( this, failureCallback ),
        'FileViewer',
        'showDocument',
        [ localResourceURL ]
      );
    },
    handleFailure.bind( this, failureCallback ), // Error handler for download
    bypassSSLValidation
  );
}

/*
 *  handleSuccess
 *
 *  @param {string} finalPath The path of the successfully opened file.
 *  @param {function} resultHandler The user-provided callback for success.
 *  @returns {string} The path of the processed file.
 */
function handleSuccess( finalPath, resultHandler ) {
  emitEvent( 'completion', finalPath ); // Notify observers about success
  if ( typeof resultHandler === 'function' ) {
    resultHandler( finalPath ); // Execute the original success handler
  }
  return finalPath;
}

/*
 *  handleFailure
 *
 *  @param {function} resultHandler The user-provided callback for failure.
 *  @returns {number} The error code.
 */
function handleFailure( resultHandler ) {
  var errorCode = ( arguments.length > 1 ) ? arguments[1] : 0; // Retrieve the error code, default to 0
  emitEvent( 'issue', errorCode ); // Notify observers about the error
  if ( typeof resultHandler === 'function' ) {
    resultHandler( errorCode ); // Execute the original error handler
  }
  return errorCode;
}

/*
 *  emitEvent
 *
 *  @param {string} signalType The type of event to emit (e.g., 'completion', 'issue').
 *  @param {any} payloadContent The data associated with the event.
 */
function emitEvent( signalType, payloadContent ) {
  var notificationBus = require( 'cordova/channel' ); // Get Cordova event channel
  var platformAPI = require( 'cordova' ); // Get Cordova platform API
  var messageData = {}; // Initialize data object for the event

  notificationBus.onCordovaReady.subscribe( function () {
    var eventIdentifier = 'docviewer.' + signalType; // Construct event name
    var dataField = ( signalType === 'issue' ) ? 'error' : 'data'; // Determine payload field name
    messageData[ dataField ] = payloadContent; // Assign payload content
    platformAPI.fireDocumentEvent( eventIdentifier, messageData ); // Dispatch the event
  });
}