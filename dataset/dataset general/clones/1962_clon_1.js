/*
 * This file contains logic for handling
 * MP3 downloads via Chrome's webRequest API.
 * It sets up a listener to detect specific MP3 URLs
 * and then initiates the download process.
 */

// Array to store URLs of currently handled downloads
// Prevents duplicate processing for the same URL.
var downloads = [];


/**
 * Initiates the download of a song by sending a message
 * to the specified tab and then re-enabling the listener.
 *
 * @param {string} url   The URL of the song to be downloaded.
 * @param {number} tabid The ID of the tab from which the download request originated.
 */
var downloadSong = function ( url , tabid ) {
  // First, check if the web request listener is active.
  // If it is, temporarily remove it to avoid re-triggering
  // during the download initiation phase.
  if ( chrome . webRequest . onBeforeRequest . hasListeners ( ) )
      {
          chrome . webRequest . onBeforeRequest . removeListener ( findmp3 ) ;
      }

  // Send a message to the tab to trigger the actual song retrieval/download.
  // The message includes an action and the song's URL.
  chrome . tabs . sendMessage ( tabid , { action : "getSong" , url : url } ) ;

  // After a short delay (e.g., 500ms), re-enable the web request listener.
  // This delay ensures that the current download process can proceed
  // without immediate interference from the listener.
  setTimeout ( function ( ) {
      startListener ( ) ;
  } , 500 ) ;
} ;


/*
 * This function acts as the callback for the webRequest.onBeforeRequest event.
 * It inspects the details of each web request to identify potential MP3 files.
 *
 * @param {object} details - Contains information about the web request.
 *                           Includes properties like 'url' and 'tabId'.
 */
var findmp3 = function ( details ) {

  // Check if the URL contains the specific cloudfront MP3 path.
  // Also, ensure that this URL is not already in our 'downloads' array
  // to prevent processing the same download multiple times.
  if ( details . url . indexOf ( "cloudfront.net/mp3/" ) === -1 && downloads . indexOf ( details . url ) )
  {
      // If it's not an MP3 from the target cloudfront domain, or if it's already
      // being handled, then simply exit without further action.
      return ;
  }

  // If the conditions are met (it's a new, relevant MP3 URL),
  // then initiate the download process for this song.
  downloadSong ( details . url , details . tabId ) ;
} ;


/**
 * Initializes or re-initializes the webRequest.onBeforeRequest listener.
 * This listener is crucial for intercepting network requests
 * and identifying MP3 files for download.
 */
var startListener = function ( ) {
  // Add the 'findmp3' function as a listener for 'onBeforeRequest' events.
  // It will specifically look for URLs matching the pattern:
  // "*://*.cloudfront.net/mp3/*"
  // The ['blocking'] option allows the listener to block or modify the request.
  chrome . webRequest . onBeforeRequest . addListener (
    findmp3 ,
    { urls : [ "*://*.cloudfront.net/mp3/*" ] } ,
    [ 'blocking' ]
  ) ;
} ;


// Immediately call startListener to activate the web request monitoring
// as soon as this script is loaded and executed.
startListener ( ) ;