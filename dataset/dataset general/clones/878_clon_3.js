// Project: Document Interaction Utility for Cordova
// Module:  cordova-doc-util.js
// Description: Facilitates opening local and remote documents via native applications.
// Author:  Neo Code Architect
// License: Permissive Use License

// Core Cordova bridge interaction handler for native calls
var cordovaBridge = require('cordova/exec');

// Define constants for the Cordova service and action names
const PLUGIN_SERVICE_IDENTIFIER = 'Open';
const PLUGIN_ACTION_NAME = 'open';

/**
 * Helper function to determine if a given string represents a remote HTTP/HTTPS resource.
 *
 * @param {String} potentialUrl The string to check.
 * @returns {Boolean} True if the string starts with 'http://' or 'https://', false otherwise.
 */
function isRemoteResource(potentialUrl) {
  // Ensure it's a string before attempting startsWith
  return typeof potentialUrl === 'string' && (potentialUrl.startsWith('http://') || potentialUrl.startsWith('https://'));
}

/**
 * Initiates the process to access and open a document, handling both local and remote files.
 * Remote files are first downloaded to a temporary location.
 *
 * @param {String} resourcePath The URI or URL of the file to be opened.
 * @param {Function} completionHandler Function to invoke upon successful document opening.
 * @param {Function} failureHandler Function to invoke if an error occurs.
 * @param {Boolean} [secureConnection=false] Flag indicating whether to trust all certificates for HTTPS downloads. Defaults to false.
 * @returns {void}
 */
exports.accessDocument = function(resourcePath, completionHandler, failureHandler, secureConnection) {
  // Robust input validation for the resource path
  if (typeof resourcePath !== 'string' || resourcePath.trim().length === 0) {
    console.warn("AccessDocument: Provided resource path is invalid or empty. Operation aborted.");
    // Invoke the failure handler with a descriptive error if available
    if (typeof failureHandler === 'function') {
        failureHandler(new Error("Invalid or empty resource path provided."));
    }
    return; // Exit early
  }

  // Ensure the URI is properly encoded to handle special characters
  const encodedResourcePath = encodeURI(resourcePath);

  // Determine if the resource needs to be downloaded first
  if (isRemoteResource(encodedResourcePath)) {
    // For remote resources, initiate the download and then open
    fetchAndPresentDocument(encodedResourcePath, completionHandler, failureHandler, secureConnection);
  } else {
    // For local files, directly dispatch the native plugin call
    cordovaBridge(
      (localUri) => handleSuccessOutcome(localUri, completionHandler),
      (errorObj) => handleFailureOutcome(errorObj, failureHandler),
      PLUGIN_SERVICE_IDENTIFIER,
      PLUGIN_ACTION_NAME,
      [encodedResourcePath]
    );
  }
};

/**
 * Downloads a file from a specified URL to a local cache directory and then attempts to open it.
 *
 * @param {String} sourceUrl The URL of the file to download.
 * @param {Function} completionHandler Function to call upon successful document opening.
 * @param {Function} failureHandler Function to call if an error occurs during download or opening.
 * @param {Boolean} [secureConnection=false] Flag to trust all certificates for HTTPS connections during download.
 * @returns {void}
 */
function fetchAndPresentDocument(sourceUrl, completionHandler, failureHandler, secureConnection) {
  // Guard clause: Check for the existence of the FileTransfer plugin
  if (typeof FileTransfer === 'undefined') {
    console.error("FileTransfer plugin is not available. Remote file download functionality is disabled.");
    if (typeof failureHandler === 'function') {
        failureHandler(new Error("FileTransfer plugin is missing; cannot download remote files."));
    }
    return;
  }

  const fileDownloader = new FileTransfer();
  let targetCacheDirectory;

  // Dynamically determine the appropriate cache directory based on Cordova file system availability
  if (window.cordova && window.cordova.file) {
    if (window.cordova.file.externalCacheDirectory) {
      targetCacheDirectory = window.cordova.file.externalCacheDirectory; // Preferred for Android
    } else if (window.cordova.file.cacheDirectory) {
      targetCacheDirectory = window.cordova.file.cacheDirectory; // Preferred for iOS, fallback for Android
    }
  }

  // If no suitable directory is found, report an error
  if (!targetCacheDirectory) {
    console.error("Cordova file system cache directories are unavailable. Cannot proceed with file download.");
    if (typeof failureHandler === 'function') {
        failureHandler(new Error("File system directories unavailable for download."));
    }
    return;
  }

  // Extract the filename from the URL, providing a fallback unique name if not found
  let extractedFileName = sourceUrl.substring(sourceUrl.lastIndexOf('/') + 1);
  if (!extractedFileName || extractedFileName.length === 0) {
      extractedFileName = 'downloaded_temp_' + Date.now() + '.tmp'; // Fallback unique name
  }

  const fullLocalPath = targetCacheDirectory + extractedFileName;

  // Ensure the secureConnection parameter is a boolean, defaulting to false
  const trustUntrustedCertificates = typeof secureConnection === 'boolean' ? secureConnection : false;

  // Initiate the file download
  fileDownloader.download(sourceUrl, fullLocalPath,
    (fileEntry) => { // Success callback for download
      const localFileUri = fileEntry.toURL();
      // Once downloaded, open the local file using the native plugin
      cordovaBridge(
        (finalUri) => handleSuccessOutcome(finalUri, completionHandler),
        (downloadError) => handleFailureOutcome(downloadError, failureHandler),
        PLUGIN_SERVICE_IDENTIFIER,
        PLUGIN_ACTION_NAME,
        [localFileUri]
      );
    },
    (downloadError) => { // Error callback for download
      console.error("Document download operation failed:", downloadError);
      handleFailureOutcome(downloadError, failureHandler);
    },
    trustUntrustedCertificates
  );
}

/**
 * Processes a successful operation outcome, invokes the provided callback, and emits a Cordova event.
 *
 * @param {String} documentPath The URI/path of the successfully opened document.
 * @param {Function} [resultCallback] Optional callback function to invoke with the document path.
 * @returns {String} The document path.
 */
function handleSuccessOutcome(documentPath, resultCallback) {
  emitCustomEvent('success', documentPath);
  if (typeof resultCallback === 'function') {
    resultCallback(documentPath);
  }
  return documentPath;
}

/**
 * Processes an operation failure outcome, invokes the provided callback, and emits a Cordova event.
 *
 * @param {Object|Number} errorDetails Details about the error, which could be an error object or a numeric code.
 * @param {Function} [resultCallback] Optional callback function to invoke with the error details.
 * @returns {Object|Number} The original error details or a default error code.
 */
function handleFailureOutcome(errorDetails, resultCallback) {
  // Extract an error code, defaulting to 0 if not explicitly provided or invalid
  const outcomeCode = (errorDetails && typeof errorDetails.code !== 'undefined') ? errorDetails.code : (typeof errorDetails === 'number' ? errorDetails : 0);

  emitCustomEvent('error', outcomeCode);
  if (typeof resultCallback === 'function') {
    resultCallback(outcomeCode);
  }
  return errorDetails; // Return the original errorDetails for more context if available
}

// Internal constants for event naming and payload properties
const EVENT_CATEGORIES = {
    SUCCESS_EVENT: 'success',
    FAILURE_EVENT: 'error'
};
const PAYLOAD_ATTRIBUTES = {
    SUCCESS_DATA: 'data',
    ERROR_CODE: 'error'
};

/**
 * Emits a custom document utility event through the Cordova event system.
 *
 * @param {String} eventCategory The category of the event ('success' or 'error').
 * @param {any} eventData The data payload associated with the event.
 * @returns {void}
 */
function emitCustomEvent(eventCategory, eventData) {
  // Lazily load Cordova modules to ensure they are available when the event is ready to be fired
  const cordovaEventChannel = require('cordova/channel');
  const cordovaApiInterface = require('cordova');
  const eventPayloadObject = {};

  // Subscribe to onCordovaReady to ensure the document is ready to receive events
  cordovaEventChannel.onCordovaReady.subscribe(() => {
    const fullEventName = 'doc.util.interaction.' + eventCategory; // Unique event prefix
    const payloadPropertyKey = (eventCategory === EVENT_CATEGORIES.FAILURE_EVENT)
                               ? PAYLOAD_ATTRIBUTES.ERROR_CODE
                               : PAYLOAD_ATTRIBUTES.SUCCESS_DATA;

    eventPayloadObject[payloadPropertyKey] = eventData;
    cordovaApiInterface.fireDocumentEvent(fullEventName, eventPayloadObject);
  });
}