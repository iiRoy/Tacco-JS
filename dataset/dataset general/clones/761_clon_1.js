/*
 *  This JavaScript file, originally sourced from Google's example `helloVideos.js`,
 *  is designed to provide a foundational set of APIs for initiating
 *  media playback on a Chromecast device. It is largely based on the
 *  implementation found in the repository:
 *  https://github.com/googlecast/CastHelloVideo-chrome
 *
 *  The original Google example code is distributed under the terms of the
 *  Apache 2.0 license.
 *
 *  Modifications have been applied to this file. Specifically,
 *  video-application-specific code elements have been removed,
 *  while the core boilerplate for Chrome Cast API initialization has been retained.
 *  Improvements were also made concerning the updating mechanisms for
 *  volume and mute states.
 *
 *  Future enhancements considered (TODO):
 *  -   Implementation of a more basic user interface.
 *  -   Addition of keyboard shortcuts for media control.
 *
 */

//  Declaration of global variables utilized throughout the script.
var currentMediaSession = null;  // Represents the active media session object.

var currentVolume = 0.5; // Stores the current volume level, initialized to 0.5.

var progressFlag = 1;      // Flag to control progress bar updates.

var volumeFlag = 1;        // Flag to control volume slider updates.

var mediaCurrentTime = 0; // Tracks the current playback time of the media.

var session = null;      // Represents the active Chromecast session.

var currentMediaURL = ""; // Stores the URL of the media currently selected for playback.


/**
 * Initiates the process of loading and playing media on the Chromecast.
 * This function first attempts to establish a Chromecast session if one
 * does not already exist. Once a session is active, it proceeds to
 * load and autoplay the selected media.
 *
 * Note: The UI should prevent this function from being invoked
 * until a Chromecast session is properly established or requested.
 */
function loadAndPlayMedia( )
{
  // The workflow involves:
  // 1. Launching the Chromecast application.
  // 2. Obtaining an active session.
  // 3. Initiating media loading with autoplay enabled.


  if ( session == null )
  {
    // If no active session exists, attempt to request and start a new one.
    chrome.cast.requestSession(
      function( e )
      {
        onRequestSessionSuccess( e ); // Handle successful session establishment.
        // With the session now set up, proceed to load the media.
        loadMedia( );
      },
      onLaunchError  // Callback for handling errors during session launch.
    );

  } else {
    // If a session is already active, simply proceed with loading the media.
    loadMedia();
  }
}

/**
 * Entry point for Chromecast API initialization.
 * A timeout is used to ensure the DOM is ready before attempting
 * to initialize the Cast API.
 */
if ( !chrome.cast || !chrome.cast.isAvailable )
{
  setTimeout( initializeCastApi, 1000 );
}

/**
 * Core function for initializing the Chromecast API.
 * This sets up the application ID, session request, and API configuration
 * including listeners for session and receiver events.
 */
function initializeCastApi( )
{
  // The default application ID is set to the default media receiver app.
  // This can be optionally changed to a custom application ID if needed.
  var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  var sessionRequest = new chrome.cast.SessionRequest( applicationID );
  var apiConfig = new chrome.cast.ApiConfig(
    sessionRequest,
    sessionListener,  // Listener for session events.
    receiverListener  // Listener for receiver availability.
  );

  // Initialize the Chromecast API with the defined configuration.
  chrome.cast.initialize( apiConfig, onInitSuccess, onError );
};

/**
 * Callback function executed upon successful initialization of the
 * Chromecast API.
 */
function onInitSuccess( )
{
  appendMessage("init success"); // Log success message.
}

/**
 * Callback function invoked when an error occurs during the
 * initialization of the Chromecast API.
 */
function onError( )
{
  console.log("error");           // Output error to console.
  appendMessage("error");         // Display error message in debug window.
}

/**
 * A generic success callback function used for various operations.
 * @param {string} message The message to be logged and displayed.
 */
function onSuccess( message )
{
  console.log( message ); // Log the success message to the console.
}

/**
 * Callback function for successful stopping of the Chromecast application.
 * Clears the current session and updates the UI status.
 */
function onStopAppSuccess( )
{
  console.log('Session stopped'); // Log session stopped event.
  appendMessage('Session stopped'); // Display session stopped message.
  // document.getElementById("casticon").src = 'images/cast_icon_idle.png'; // UI update for cast icon (commented out).
  session = null; // Reset the session variable.
}

/**
 * Listener function for new Chromecast sessions established during initialization.
 * It logs session details, identifies existing media sessions, and
 * sets up listeners for media and session updates.
 * @param {Object} e The session object provided by the Cast API.
 */
function sessionListener( e )
{
  console.log( 'New session ID: ' + e.sessionId ); // Log the new session ID.
  appendMessage( 'New session ID:' + e.sessionId ); // Display new session ID.
  session = e; // Assign the new session to the global session variable.

  if ( session.media.length != 0 )
  {
    appendMessage(
        'Found ' + session.media.length + ' existing media sessions.'
    );
    // If existing media sessions are found, discover the first one.
    onMediaDiscovered( 'onRequestSessionSuccess_', session.media[0] );
  }

  // Add a listener for new media being discovered within the session.
  session.addMediaListener(
      onMediaDiscovered.bind( this, 'addMediaListener' )
  );
  // Add a listener for updates to the session itself.
  session.addUpdateListener( sessionUpdateListener.bind( this ) );
}

/**
 * Listener for updates to the Chromecast session.
 * It determines if the session is still alive and updates the global
 * session variable accordingly.
 * @param {boolean} isAlive Indicates if the session is still active.
 */
function sessionUpdateListener( isAlive )
{
  var message = isAlive ? 'Session Updated' : 'Session Removed'; // Determine message based on session status.
  message += ': ' + session.sessionId; // Append session ID to the message.
  appendMessage( message ); // Display the session update message.
  if ( !isAlive )
  {
    session = null; // If session is no longer alive, reset the global session variable.
  }
};

/**
 * Listener function for receiver availability during initialization.
 * It logs and displays whether a Chromecast receiver is found or not.
 * @param {string} e The status of receiver availability ('available' or 'unavailable').
 */
function receiverListener( e )
{
  if ( e === 'available' )
  {
    console.log("receiver found");     // Log receiver found.
    appendMessage("receiver found");   // Display receiver found message.
  }
  else
  {
    console.log("receiver list empty"); // Log receiver list empty.
    appendMessage("receiver list empty"); // Display receiver list empty message.
  }
}

/**
 * Selects a media URL for playback.
 * This function updates the `currentMediaURL` and can trigger UI updates.
 * @param {string} url The URL of the media to be selected.
 */
function selectMedia( url )
{
  console.log("media selected " + url);     // Log the selected media URL.
  appendMessage("media selected " + url);   // Display the selected media URL.
  currentMediaURL = url;                    // Update the global current media URL.
  var playpauseresume = document.getElementById("playpauseresume"); // Get UI element (variable not used further in this function).
}

/**
 * Launches the Chromecast application and requests a new session.
 */
function launchApp( )
{
  console.log("launching app...");          // Log app launch attempt.
  appendMessage("launching app...");        // Display app launch message.
  chrome.cast.requestSession( onRequestSessionSuccess, onLaunchError ); // Request a new session.
}

/**
 * Callback function executed upon successful request for a Chromecast session.
 * @param {Object} e A non-null object representing the new session.
 */
function onRequestSessionSuccess( e )
{
  console.log("session success: " + e.sessionId);     // Log session success with ID.
  appendMessage("session success: " + e.sessionId);   // Display session success message.
  session = e;                                        // Assign the new session globally.
}

/**
 * Callback function for handling errors during the launching of a Chromecast session.
 * @param {Object} e The error object.
 */
function onLaunchError( e )
{
  console.log("launch error");         // Log launch error.
  appendMessage("launch error");       // Display launch error message.
  console.log( e );                    // Log the error object for details.
}

/**
 * Stops the current Chromecast application and session.
 */
function stopApp( )
{
  session.stop( onStopAppSuccess, onError ); // Request to stop the session.
}

/**
 * Loads media onto the Chromecast device.
 * Requires an active session and a `currentMediaURL`.
 */
function loadMedia( )
{
  if ( !session )
  {
    console.log("no session");      // Log if no session is active.
    appendMessage("no session");    // Display no session message.
    return;                         // Exit if no session.
  }
  console.log("loading..." + currentMediaURL);      // Log media loading attempt.
  appendMessage("loading..." + currentMediaURL);    // Display media loading message.

  var mediaInfo = new chrome.cast.media.MediaInfo( currentMediaURL ); // Create MediaInfo object.
  mediaInfo.contentType = 'video/mp4';                                // Set content type.
  /*
  mediaInfo.customData = {
    "fileurl": currentMediaUrl
  }
  */

  var request = new chrome.cast.media.LoadRequest( mediaInfo ); // Create LoadRequest.
  request.autoplay = true;     // Configure media to autoplay upon loading.
  request.currentTime = 0;     // Start playback from the beginning.

  session.loadMedia( request,
    onMediaDiscovered.bind( this, 'loadMedia' ), // Callback for media discovery.
    onMediaError                                 // Callback for media loading errors.
  );
}

/**
 * Callback function invoked when new media is discovered or loaded.
 * It updates the `currentMediaSession` and sets up an update listener for it.
 * @param {string} how A string indicating how the media was discovered (e.g., 'loadMedia').
 * @param {Object} mediaSession The media session object.
 */
function onMediaDiscovered( how, mediaSession )
{
  console.log("new media session ID:" + mediaSession.mediaSessionId); // Log new media session ID.
  appendMessage("new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')'); // Display new media session ID.
  currentMediaSession = mediaSession; // Assign the new media session globally.
  mediaSession.addUpdateListener( onMediaStatusUpdate ); // Add listener for media status updates.
  mediaCurrentTime = currentMediaSession.currentTime; // Update global media current time.

  // Manually call the update function as initial updates might not be immediately triggered.
  onMediaStatusUpdate( true );

  // var playpauseresume = document.getElementById("playpauseresume"); // UI element (commented out).
  // playpauseresume.innerHTML = 'Play'; // UI update (commented out).

  // playMedia(); // Potentially play media immediately (commented out).
  // document.getElementById("casticon").src = 'images/cast_icon_active.png'; // UI update (commented out).
}

/**
 * Callback function for handling errors during media loading.
 * @param {Object} e The error object containing code, description, and details.
 */
function onMediaError( e )
{
  console.log("media error: code: "+e.code+" description: "+e.description+" details: "+e.details); // Log detailed media error.
  appendMessage("media error: code: "+e.code+" description: "+e.description+" details: "+e.details); // Display detailed media error.
  // document.getElementById("casticon").src = 'images/cast_icon_warning.png'; // UI update (commented out).
}

/**
 * Converts a given number of seconds into a human-readable
 * "hours, minutes, seconds" (hms) string format.
 * @param {number} seconds The total number of seconds to convert.
 * @returns {string} The formatted time string (e.g., "1h2m3s").
 */
function convertSeconds2hms( seconds )
{
  var d = new Date( 0, 0, 0, 0, 0, seconds, 0 ); // Create a Date object for calculation.
  var date_string = ""; // Initialize the output string.

  if ( d.getHours() > 0 )
  {
    date_string += d.getHours() + "h"; // Append hours if greater than 0.
  }
  if ( d.getMinutes() > 0 )
  {
    date_string += d.getMinutes() + "m"; // Append minutes if greater than 0.
  }
  date_string += d.getSeconds() + "s"; // Always append seconds.

  return date_string; // Return the formatted string.
}

/**
 * Callback function for media status updates.
 * This function is responsible for updating the UI elements such as
 * progress bar, volume slider, mute status, player state, and media information.
 * @param {boolean} isAlive An optional parameter, usually true when manually called.
 */
function onMediaStatusUpdate( isAlive )
{
  console.log('onMediaStatusUpdate'); // Log that the update function is called.

  if ( progressFlag )
  {
    // Update the progress bar based on current time and media duration.
    document.getElementById("progress").value = parseInt( 100 * currentMediaSession.currentTime / currentMediaSession.media.duration );
  }
  if ( volumeFlag )
  {
    // Update the volume slider based on the current volume level.
    document.getElementById("volume").value = ( 1 - currentMediaSession.volume.level ) * 100;
  }
  if ( currentMediaSession.volume.muted )
  {
    // Update mute checkbox and text if media is muted.
    document.getElementById("mutebox").checked = true;
    document.getElementById('muteText').innerHTML = 'Unmute media';
  } else {
    // Update mute checkbox and text if media is unmuted.
    document.getElementById("mutebox").checked = false;
    document.getElementById('muteText').innerHTML = 'Mute media';
  }

  var playpauseresume = document.getElementById("playpauseresume"); // Get the play/pause/resume button.
  switch( currentMediaSession.playerState )
  {
    case "BUFFERING":
      playpauseresume.innerHTML = 'Pause'; // Change button text to 'Pause' when buffering.
      break;
    case "PLAYING":
      playpauseresume.innerHTML = 'Pause'; // Change button text to 'Pause' when playing.
      break;
    case "PAUSED":
      playpauseresume.innerHTML = 'Resume'; // Change button text to 'Resume' when paused.
      break;
    case "IDLE":
      playpauseresume.innerHTML = 'Play'; // Change button text to 'Play' when idle.
      break;
  }
  // Update the displayed media content ID.
  document.getElementById("currentmedianame").innerHTML = currentMediaSession.media.contentId;

  // Update the displayed total duration of the media.
  document.getElementById("currentmedia_duration").innerHTML = convertSeconds2hms( currentMediaSession.media.duration );

  // Update the displayed current playback progress.
  document.getElementById("currentmedia_progress").innerHTML = convertSeconds2hms( currentMediaSession.currentTime );

  // Update the displayed player state.
  document.getElementById("playerstate").innerHTML = currentMediaSession.playerState;
}

/**
 * Controls media playback (play, pause, resume).
 * This function checks the current state of the play/pause/resume button
 * and sends the appropriate command to the media session.
 */
function playMedia( )
{
  if ( !currentMediaSession )
    return; // Exit if no media session is active.

  var playpauseresume = document.getElementById("playpauseresume"); // Get the UI button.

  if ( playpauseresume.innerHTML == 'Play' )
  {
    // If button says 'Play', start playback.
    currentMediaSession.play( null,
      mediaCommandSuccessCallback.bind( this, "playing started for " + currentMediaSession.sessionId ),
      onError
    );
    playpauseresume.innerHTML = 'Pause'; // Update button text to 'Pause'.
    // currentMediaSession.addListener(onMediaStatusUpdate); // Add listener (commented out, already added).
    appendMessage("play started"); // Display message.
  }
  else
  {
    if ( playpauseresume.innerHTML == 'Pause' )
    {
      // If button says 'Pause', pause playback.
      currentMediaSession.pause( null,
        mediaCommandSuccessCallback.bind( this, "paused " + currentMediaSession.sessionId ),
        onError
      );
      playpauseresume.innerHTML = 'Resume'; // Update button text to 'Resume'.
      appendMessage("paused"); // Display message.
    }
    else
    {
      if ( playpauseresume.innerHTML == 'Resume' )
      {
        // If button says 'Resume', resume playback.
        currentMediaSession.play( null,
          mediaCommandSuccessCallback.bind( this, "resumed " + currentMediaSession.sessionId ),
          onError
        );
        playpauseresume.innerHTML = 'Pause'; // Update button text to 'Pause'.
        appendMessage("resumed"); // Display message.
      }
    }
  }
}

/**
 * Stops the currently playing media.
 */
function stopMedia( )
{
  if ( !currentMediaSession )
    return; // Exit if no media session is active.

  currentMediaSession.stop( null,
    mediaCommandSuccessCallback.bind( this, "stopped " + currentMediaSession.sessionId ),
    onError
  );
  var playpauseresume = document.getElementById("playpauseresume"); // Get the UI button.
  playpauseresume.innerHTML = 'Play'; // Reset button text to 'Play'.
  appendMessage("media stopped"); // Display message.
}

/**
 * Sets the volume level and mute state of the media.
 * This function creates a Volume object and a VolumeRequest, then
 * sends it to the current media session.
 * @param {number} level A number representing the desired volume level (0.0 to 1.0).
 * @param {boolean} mute A boolean indicating whether to mute (true) or unmute (false).
 */
function setMediaVolume( level, mute )
{
  if ( !currentMediaSession )
    return; // Exit if no media session is active.

  volumeFlag = 0; // Temporarily disable volume UI updates.
  var volume = new chrome.cast.Volume(); // Create a new Volume object.
  volume.level = level; // Set the volume level.
  currentVolume = volume.level; // Update the global current volume.
  volume.muted = mute; // Set the mute state.
  var request = new chrome.cast.media.VolumeRequest(); // Create a VolumeRequest.
  request.volume = volume; // Assign the Volume object to the request.

  currentMediaSession.setVolume( request,
    onVolumeSuccess.bind( this, 'media set-volume done' ), // Callback for success.
    onError                                               // Callback for error.
  );
}

/**
 * Callback function for successful volume setting operations.
 * It logs the success message and re-enables volume UI updates after a delay.
 * @param {string} info A message string describing the success.
 */
function onVolumeSuccess( info )
{
  console.log( info );       // Log the success message.
  appendMessage( info );     // Display the success message.
  setTimeout( function( ) { volumeFlag = 1; }, 1500 ); // Re-enable volume flag after 1.5 seconds.
}

/**
 * Sets only the mute state of the media, preserving the current volume level.
 * This function bypasses the `volumeFlag` to allow immediate mute/unmute.
 * @param {boolean} mute A boolean indicating whether to mute (true) or unmute (false).
 */
function setMediaMute( mute )
{
  var volume = new chrome.cast.Volume(); // Create a new Volume object.
  volume.level = currentVolume; // Use the globally stored current volume level.
  volume.muted = mute; // Set the mute state.
  var request = new chrome.cast.media.VolumeRequest(); // Create a VolumeRequest.
  request.volume = volume; // Assign the Volume object to the request.

  currentMediaSession.setVolume( request,
    onMuteSuccess.bind( this, 'media mute done' ), // Callback for success.
    onError                                       // Callback for error.
  );
}

/**
 * Callback function for successful mute/unmute operations.
 * @param {string} info A message string describing the success.
 */
function onMuteSuccess( info )
{
  console.log( info );       // Log the success message.
  appendMessage( info );     // Display the success message.
}

/**
 * Toggles the mute state of the media based on a checkbox input.
 * It updates the UI text for the mute button accordingly.
 * @param {HTMLInputElement} cb The checkbox element that triggered the event.
 */
function muteMedia( cb )
{
  if ( cb.checked == true )
  {
    // If checkbox is checked, mute the media.
    document.getElementById('muteText').innerHTML = 'Unmute media'; // Update UI text.
    setMediaMute( true ); // Call function to mute media.
    appendMessage("media muted"); // Display message.
  }
  else
  {
    // If checkbox is unchecked, unmute the media.
    document.getElementById('muteText').innerHTML = 'Mute media'; // Update UI text.
    setMediaMute( false ); // Call function to unmute media.
    appendMessage("media unmuted"); // Display message.
  }
}

/**
 * Seeks the media to a specified position.
 * The position is provided as a percentage of the total media duration.
 * @param {number} pos A number representing the desired seek position as a percentage (0-100).
 */
function seekMedia( pos )
{
  console.log( 'Seeking ' + currentMediaSession.sessionId + ':' +
    currentMediaSession.mediaSessionId + ' to ' + pos + "%" ); // Log seek attempt.
  progressFlag = 0; // Temporarily disable progress bar updates.
  var request = new chrome.cast.media.SeekRequest(); // Create a SeekRequest.
  request.currentTime = pos * currentMediaSession.media.duration / 100; // Calculate target time.

  currentMediaSession.seek( request,
    onSeekSuccess.bind( this, 'media seek done' ), // Callback for success.
    onError                                       // Callback for error.
  );
}

/**
 * Callback function for successful media seek operations.
 * It logs the success message and re-enables progress bar updates after a delay.
 * @param {string} info A message string describing the success.
 */
function onSeekSuccess( info )
{
  console.log( info );       // Log the success message.
  appendMessage( info );     // Display the success message.
  setTimeout( function( ) { progressFlag = 1; }, 1500 ); // Re-enable progress flag after 1.5 seconds.
}

/**
 * Generic callback function for successful media command executions.
 * It logs and displays the provided information message.
 * @param {string} info A message string describing the success of the command.
 */
function mediaCommandSuccessCallback( info )
{
  console.log( info );       // Log the success message.
  appendMessage( info );     // Display the success message.
}


/**
 * Appends a message to the debug message window in the UI.
 * The message is converted to a JSON string for consistent display.
 * @param {string} message A message string to be appended.
 */
function appendMessage( message )
{
  var dw = document.getElementById("debugmessage"); // Get the debug message display element.
  dw.innerHTML += '\n' + JSON.stringify( message ); // Append the new message, formatted as JSON.
};