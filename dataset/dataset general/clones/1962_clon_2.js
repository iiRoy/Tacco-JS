var     processedAudioFiles =   []; /* Global storage for URLs of audio resources that have been processed or are being handled */

/**
 * Initiates the sequence for obtaining a specific media file.
 * This function first ensures no previous web request listener interferes,
 * then dispatches a message to a browser tab, and finally re-enables the listener.
 *
 * @param {string} resourceLink - The complete URL string of the media resource to acquire.
 * @param {number} targetTabIdentifier - The unique numerical identifier of the browser tab where the action should occur.
 */
const initiateMediaAcquisition = function ( resourceLink, targetTabIdentifier ) {
  // Verify if there are any active listeners for web requests before proceeding
  if ( chrome . webRequest . onBeforeRequest . hasListeners ( ) ) {
    // If listeners exist, remove the specific detection listener to prevent duplicate processing during the acquisition phase
    chrome.webRequest.onBeforeRequest.removeListener ( detectAudioRequests );
  }

  // Transmit a directive to the designated browser tab to begin fetching the audio content
  chrome.tabs.sendMessage( targetTabIdentifier , { activity: "fetchAudio", mediaLocation : resourceLink } );
  
  // Set a delayed execution to reactivate the web request monitoring system after a short interval
  setTimeout( ( ) => { beginMonitoring ( ); } , 500 ) ;
};

/*
 * This crucial callback function is designed to intercept and analyze web request details.
 * Its primary role is to identify incoming requests that correspond to specific audio files
 * from a predefined content delivery network (CDN).
 *
 * @param {object} requestInformation - An object containing comprehensive details about the intercepted web request.
 * @returns {void} This function does not return any value; it acts by initiating further processes or by early exit.
 */
const detectAudioRequests = function ( requestInformation ) {
  // First, check if the requested web address contains the specific CDN path for MP3s.
  // Second, verify that this particular audio file has not already been added to our processed list.
  if ( requestInformation.webAddress.indexOf( "cdn.audio.com/mp3/" ) === -1 || processedAudioFiles.includes( requestInformation.webAddress ) ) {
    return; // If either condition is true (not an MP3 from target CDN or already processed), terminate execution for this request.
  }
  
  // If the request passes the filtering criteria, proceed to initiate the acquisition process for the identified audio file.
  initiateMediaAcquisition ( requestInformation.webAddress , requestInformation.associatedTabId ) ;
};

/**
 * Establishes and activates the primary web request listener within the browser environment.
 * This listener is configured to monitor all incoming web requests and trigger the
 * 'detectAudioRequests' callback for URLs matching a specific pattern.
 */
const beginMonitoring = function ( ) {
  // Attach a new listener to the 'onBeforeRequest' event of the chrome.webRequest API.
  chrome.webRequest.onBeforeRequest.addListener(
    detectAudioRequests, // The function to be invoked when a web request matches the specified criteria.
    { urls: [ "*://*.cdn.audio.com/mp3/*" ] }, // An array of URL patterns that the listener should intercept.
    [ 'blocking' ] // Specifies that the listener is capable of blocking or modifying the request.
  );
};

// Immediately invoke the monitoring setup function upon script execution to ensure continuous operation.
beginMonitoring ( );