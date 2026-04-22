/*
 * This script manages the HTML5 player functionality for YouTube.
 * It checks for HTML5 status, provides UI for switching, and handles player creation.
 */


// Initiates a request to check HTML5 status and then performs actions based on the response.
sendRequest('http://www.youtube.com/html5',
  function ( token ) {
    // Declare variables for request parameters and XHR object.
    var params;
    var xhr2 = new XMLHttpRequest();

    // Construct the parameters for enabling HTML5.
    params = 'enable_html5=true&session_token=' + token;

    // Open a POST request to the HTML5 endpoint.
    xhr2.open( "POST", 'http://www.youtube.com/html5', true );

    // Set the request header for URL-encoded form data.
    xhr2.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );

    // Send the request with the constructed parameters.
    xhr2.send( params );

    // Define the callback for when the ready state changes.
    xhr2.onreadystatechange = function() {
      // Check if the request is complete.
      if ( xhr2.readyState == 4 ) {
        // No specific action needed here for this XHR, as the main logic
        // is handled by the initial sendRequest callback.
      }
    };
  }
);


// Global variable to track if rollback is needed (i.e., if HTML5 player is active).
var rollback = 0;

// Global variable to store the original HTML of the player API div before HTML5 conversion.
var html5String;


// Define paths to image assets for Flash and HTML5 buttons.
var flash = chrome.runtime.getURL( '../images/htmlify.png' );
var html5 = chrome.runtime.getURL( '../images/htmlhov.png' );


// Check if the page already uses an HTML5 video player.
if ( $( '.html5-video-player' ).length > 0 ) {

  // If HTML5 player is detected, append a button to the watch-like-dislike-buttons container.
  $( "#watch-like-dislike-buttons" ) . append (

    // Create an image element.
    $( '<img></img>' )
      // Set multiple attributes for the image button.
      . attr ( {
        'class' : 'yt-uix-button yt-uix-button-icon yt-uix-button-empty',
        'type'  : 'image',
        'id'    : 'buttonHTML5',
        'src'   : html5
      } )
      // Set the value (tooltip text) for the button.
      . val ( "HTML5 me baby" )
      // Attach a click event handler.
      . click (
        function () {
          // Call the defaultHTML5 function when clicked.
          defaultHTML5();
        }
      )
      // Apply CSS styles to the button.
      . css ( {
        'border-style'   : 'none',
        'padding-bottom' : '5px'
      } )
  );

  // Set up hover effects for the button, using the HTML5 image for both initial and hover states.
  setHover( html5, html5 );

  // Exit the script as the HTML5 player is already active.
  return;
}


// If no HTML5 player is detected, append a button to initiate HTML5 playback.
$( "#watch-like-dislike-buttons" ) . append (
  $( '<img></img>' )
    . attr ( {
      'class' : 'yt-uix-button yt-uix-button-icon yt-uix-button-empty',
      'type'  : 'image',
      'id'    : 'buttonHTML5',
      'src'   : flash // Use the flash image as the initial state.
    } )
    . val ( "HTML5 me baby" )
    . click (
      function () {
        // Call the main HTML5 function to switch player types.
        HTML5();
      }
    )
    . css ( {
      'border-style'   : 'none',
      'padding-bottom' : '5px'
    } )
);

// Set up hover effects for the button, transitioning from flash to html5 image.
setHover( flash, html5 );


/**
 * Toggles between the default (Flash) player and the HTML5 player.
 */
function HTML5 ( ) {

  // Check the 'rollback' flag to determine current player state.
  if ( rollback ) {

    // If rollback is true, it means we are currently in HTML5 mode and need to revert.
    $( '#html5_movie' ). remove ( ); // Remove the HTML5 iframe.

    // No need to set URL here, as we are restoring original content.
    // var url = "http://www.youtube.com/embed/"+getId()+"?autoplay=1";

    // Restore the original content of the player-api div.
    document . getElementById( 'player-api' ) . innerHTML = html5String;

    // Update hover images to reflect the Flash player state.
    setHover( flash, html5 );

    // Reset rollback flag.
    rollback = 0;

  } else {

    // If rollback is false, it means we are in Flash mode and need to switch to HTML5.

    // Store the current HTML of the player-api div for later rollback.
    html5String = $( "#player-api" ) . html ( );

    // Remove the existing Flash player.
    $( '#movie_player' ) . remove ( );

    // Construct the URL for the HTML5 embed.
    var url = "http://www.youtube.com/embed/" + getId( ) + "?feature=player_detailpage&html5=1&autoplay=1&cc_load_policy=1";

    // Create and embed the new HTML5 player iframe.
    createPlayer( 'iframe', 'html5_movie', url );

    // Update hover images to reflect the HTML5 player state.
    setHover( html5, flash );

    // Set rollback flag to true.
    rollback = 1;

  }
}


/**
 * Extracts the YouTube video ID from the current page URL.
 * @returns {string} The YouTube video ID.
 */
function getId ( ) {
  // Get the full URL of the current tab.
  var tablink = $( location ) . attr( 'href' );

  // Split the URL by "v=".
  var strs = tablink . split( "v=" );

  // Take the second part (after "v=") and split by "&", then take the first part.
  return strs[1] . split( "&" )[0];
}


/**
 * Creates and appends a new player element (iframe) to the player-api div.
 * @param {string} tag The HTML tag name for the player element (e.g., 'iframe').
 * @param {string} id The ID to assign to the new player element.
 * @param {string} url The source URL for the player.
 */
function createPlayer ( tag, id, url ) {
  // Create a new HTML element of the specified tag.
  var player = document . createElement( tag );

  // Set CSS styles for the player element.
  player . setAttribute( 'style', 'width:100%; height:100%;' );

  // Set the source URL for the player.
  player . setAttribute( 'src', url );

  // Set the ID for the player element.
  player . setAttribute( 'id', id );

  // Set frameborder to 0 for a seamless look.
  player . setAttribute( 'frameborder', '0' );

  // Allow fullscreen mode for the player.
  player . setAttribute( 'allowfullscreen', '' );

  // Append the newly created player element to the 'player-api' div.
  document . getElementById( 'player-api' ) . appendChild( player );
}


/**
 * Sets up hover effects for the HTML5 toggle button.
 * Changes the button's image and border style on hover.
 * @param {string} initial The URL of the image to display initially or on hover out.
 * @param {string} hover The URL of the image to display on hover in.
 */
function setHover ( initial, hover ) {
  // Attach hover event handlers to the button with ID 'buttonHTML5'.
  $( "#buttonHTML5" ) . hover (
    // Function to execute on 'hover in'.
    function ( ) {
      $( "#buttonHTML5" ) . css( "content", "url(" + hover + ")" );
      $( "#buttonHTML5" ) . css( "border-bottom", "3px solid #930" );
      $( "#buttonHTML5" ) . css( "border-radius", "0px" );
    },
    // Function to execute on 'hover out'.
    function ( ) {
      $( "#buttonHTML5" ) . css( "content", "url(" + initial + ")" );
      $( "#buttonHTML5" ) . css( "border-bottom-color", "#FFF" );
    }
  );
}


/**
 * Sends an XMLHttpRequest to a given URL and processes the response.
 * Specifically used to get the session token for HTML5 activation.
 * @param {string} url The URL to send the GET request to.
 * @param {function} callback The function to call with the extracted token.
 */
function sendRequest ( url, callback ) {
  var xhr = new XMLHttpRequest( );

  // Open a GET request to the specified URL.
  xhr . open( "GET", 'http://www.youtube.com/html5', true );

  // Send the request.
  xhr . send( );

  // Define the callback for when the ready state changes.
  xhr . onreadystatechange = function ( ) {
    // Check if the request is complete.
    if ( xhr . readyState == 4 ) {
      // It's important to be careful when processing external content.
      // The original code has a warning about evaluating evil scripts,
      // which is good practice to note.

      // Check if the response indicates HTML5 is not disabled.
      if ( xhr . responseText . indexOf( "disable_html5" ) == -1 ) {

        // Extract the XSRF_TOKEN from the response text.
        token = xhr . responseText . split( "XSRF_TOKEN': '" )[1] . split( "'" )[0];

        // Call the provided callback function with the extracted token.
        callback( token );
      }
    }
  };
}


/**
 * Displays an alert message indicating that the page is already streaming in HTML5.
 */
function defaultHTML5 ( ) {
  alert( "This page is already being streamed in HTML5!" );
}