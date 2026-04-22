/*
 * This module, adapted from a web-based multimedia streaming example,
 * provides core functionalities for managing media playback via a casting device.
 * Original source: a popular web media framework.
 *
 * It has been refined to focus on fundamental casting operations,
 * with enhancements for audio level adjustments and muting.
 *
 * Future enhancements might include:
 * - A more intuitive user interface.
 * - Integration of keyboard controls.
 */

// Global state variables for the casting interface.
let activeStreamContext = null;
let presentLoudness = 0.5;
let advancementIndicator = 1;
let loudnessControlActive = 1;
let streamElapsedDuration = 0;
let connectionHandle = null;

let activeStreamLink = "";

/**
 * Initiates the application and begins media playback.
 * This function handles session establishment and then loads the selected media.
 */
function initiateAndCommencePlayback() {
  // The user interface should prevent this call until a casting connection is ready.

  if (connectionHandle === null) {
    // Attempt to establish a new casting session.
    chrome.cast.requestSession(
      function (eventData) {
        onConnectionEstablishmentSuccess(eventData);
        // Once the session is active, proceed to load the content.
        loadStreamContent();
      },
      onInitiationFailure
    );
  } else {
    // If a session already exists, simply load the content.
    loadStreamContent();
  }
}

/**
 * Triggers the casting service initialization process.
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(setupCastingService, 1000);
}

/**
 * Performs the necessary setup for the casting API.
 */
function setupCastingService() {
  // Default application ID for general media receivers.
  // This can be customized to a specific application ID if needed.
  const appIdentifier = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  const connectionRequest = new chrome.cast.SessionRequest(appIdentifier);
  const interfaceConfiguration = new chrome.cast.ApiConfig(
    connectionRequest,
    connectionObserver,
    deviceDiscoveryListener
  );

  chrome.cast.initialize(interfaceConfiguration, onServiceSetupSuccess, onGeneralFault);
}

/**
 * Callback invoked upon successful API initialization.
 */
function onServiceSetupSuccess() {
  logToDebugConsole("Service initialization successful.");
}

/**
 * Callback invoked when an error occurs during API initialization.
 */
function onGeneralFault() {
  console.log("An error occurred.");
  logToDebugConsole("Operation failed.");
}

/**
 * A general-purpose success callback.
 * @param {string} statusMessage A descriptive message.
 */
function onGenericSuccess(statusMessage) {
  console.log(statusMessage);
}

/**
 * Callback executed when the application is successfully stopped.
 */
function onApplicationTerminationSuccess() {
  console.log('Application session terminated.');
  logToDebugConsole('Session terminated.');
  connectionHandle = null;
}

/**
 * Listener for new casting sessions during service startup.
 * @param {Object} eventData The session event object.
 */
function connectionObserver(eventData) {
  console.log('New connection identifier: ' + eventData.sessionId);
  logToDebugConsole('New connection ID:' + eventData.sessionId);
  connectionHandle = eventData;
  if (connectionHandle.media.length !== 0) {
    logToDebugConsole(
      'Discovered ' + connectionHandle.media.length + ' existing media streams.'
    );
    onStreamContentFound('onConnectionEstablishmentSuccess_', connectionHandle.media[0]);
  }
  connectionHandle.addMediaListener(
    onStreamContentFound.bind(this, 'addMediaListener')
  );
  connectionHandle.addUpdateListener(connectionUpdateObserver.bind(this));
}

/**
 * Listener for updates to the casting session.
 * @param {boolean} isStillActive Indicates if the session is still alive.
 */
function connectionUpdateObserver(isStillActive) {
  let statusMessage = isStillActive ? 'Connection Updated' : 'Connection Removed';
  statusMessage += ': ' + connectionHandle.sessionId;
  logToDebugConsole(statusMessage);
  if (!isStillActive) {
    connectionHandle = null;
  }
}

/**
 * Listener for detecting available receiver devices.
 * @param {string} availabilityStatus The status of receiver availability.
 */
function deviceDiscoveryListener(availabilityStatus) {
  if (availabilityStatus === 'available') {
    console.log("Casting device found.");
    logToDebugConsole("Receiver device detected.");
  } else {
    console.log("No casting devices found.");
    logToDebugConsole("Receiver list empty.");
  }
}

/**
 * Designates a media URL for playback.
 * @param {string} contentLink The URL of the media to be played.
 */
function chooseStreamContent(contentLink) {
  console.log("Media content selected: " + contentLink);
  logToDebugConsole("Stream content chosen: " + contentLink);
  activeStreamLink = contentLink;
  const playPauseResumeButton = document.getElementById("playpauseresume");
}

/**
 * Initiates the application and requests a casting session.
 */
function startApplication() {
  console.log("Launching application...");
  logToDebugConsole("Initiating application launch...");
  chrome.cast.requestSession(onConnectionEstablishmentSuccess, onInitiationFailure);
}

/**
 * Callback for successful session requests.
 * @param {Object} sessionObject A non-null object representing the new session.
 */
function onConnectionEstablishmentSuccess(sessionObject) {
  console.log("Session established: " + sessionObject.sessionId);
  logToDebugConsole("Connection successful: " + sessionObject.sessionId);
  connectionHandle = sessionObject;
}

/**
 * Callback for errors during application launch.
 * @param {Object} errorDetails The error object.
 */
function onInitiationFailure(errorDetails) {
  console.log("Application launch error.");
  logToDebugConsole("Launch process failed.");
  console.log(errorDetails);
}

/**
 * Halts the current application/session.
 */
function haltApplication() {
  connectionHandle.stop(onApplicationTerminationSuccess, onGeneralFault);
}

/**
 * Loads the specified stream content onto the casting device.
 */
function loadStreamContent() {
  if (!connectionHandle) {
    console.log("No active session.");
    logToDebugConsole("No connection available.");
    return;
  }
  console.log("Loading content: " + activeStreamLink);
  logToDebugConsole("Initiating content load for: " + activeStreamLink);
  const streamDetails = new chrome.cast.media.MediaInfo(activeStreamLink);
  streamDetails.contentType = 'video/mp4';

  const operationRequest = new chrome.cast.media.LoadRequest(streamDetails);
  operationRequest.autoplay = true; // Automatically start playback upon loading.
  operationRequest.currentTime = 0;

  connectionHandle.loadMedia(
    operationRequest,
    onStreamContentFound.bind(this, 'loadStreamContent'),
    onStreamContentFault
  );
}

/**
 * Callback for successful discovery or loading of media.
 * @param {string} methodOrigin Describes how the media was discovered/loaded.
 * @param {Object} streamContext A non-null media session object.
 */
function onStreamContentFound(methodOrigin, streamContext) {
  console.log("New media stream ID:" + streamContext.mediaSessionId);
  logToDebugConsole("New stream context ID:" + streamContext.mediaSessionId + ' (' + methodOrigin + ')');
  activeStreamContext = streamContext;
  streamContext.addUpdateListener(onStreamStatusRefresh);
  streamElapsedDuration = activeStreamContext.currentTime;

  onStreamStatusRefresh(true); // Manually trigger an update.
}

/**
 * Callback for errors encountered during media loading.
 * @param {Object} errorObject A non-null error object.
 */
function onStreamContentFault(errorObject) {
  console.log("Media error: code: " + errorObject.code + " description: " + errorObject.description + " details: " + errorObject.details);
  logToDebugConsole("Stream content error: code: " + errorObject.code + " description: " + errorObject.description + " details: " + errorObject.details);
}

/**
 * Converts a total number of seconds into a human-readable H:M:S format.
 * @param {number} durationInSeconds The total duration in seconds.
 * @returns {string} Formatted time string.
 */
function formatSecondsToHMS(durationInSeconds) {
  const timeObject = new Date(0, 0, 0, 0, 0, durationInSeconds, 0);
  let formattedTimeText = "";
  if (timeObject.getHours() > 0) {
    formattedTimeText += timeObject.getHours() + "h";
  }
  if (timeObject.getMinutes() > 0) {
    formattedTimeText += timeObject.getMinutes() + "m";
  }
  formattedTimeText += timeObject.getSeconds() + "s";

  return formattedTimeText;
}

/**
 * Callback for updates to the media stream's status.
 * @param {Object} updateEvent A non-null event object (or boolean indicating activity).
 */
function onStreamStatusRefresh(updateEvent) {
  console.log('Stream status updated.');
  if (advancementIndicator) {
    document.getElementById("progress").value = parseInt(100 * activeStreamContext.currentTime / activeStreamContext.media.duration);
  }
  if (loudnessControlActive) {
    document.getElementById("volume").value = (1 - activeStreamContext.volume.level) * 100;
  }
  if (activeStreamContext.volume.muted) {
    document.getElementById("mutebox").checked = true;
    document.getElementById('muteText').innerHTML = 'Unmute media';
  } else {
    document.getElementById("mutebox").checked = false;
    document.getElementById('muteText').innerHTML = 'Mute media';
  }

  const playPauseResumeButton = document.getElementById("playpauseresume");
  switch (activeStreamContext.playerState) {
    case "BUFFERING":
    case "PLAYING":
      playPauseResumeButton.innerHTML = 'Pause';
      break;
    case "PAUSED":
      playPauseResumeButton.innerHTML = 'Resume';
      break;
    case "IDLE":
      playPauseResumeButton.innerHTML = 'Play';
      break;
  }
  document.getElementById("currentmedianame").innerHTML = activeStreamContext.media.contentId;

  document.getElementById("currentmedia_duration").innerHTML = formatSecondsToHMS(activeStreamContext.media.duration);
  document.getElementById("currentmedia_progress").innerHTML = formatSecondsToHMS(activeStreamContext.currentTime);

  document.getElementById("playerstate").innerHTML = activeStreamContext.playerState;
}

/**
 * Initiates or resumes playback of the current media.
 */
function commencePlayback() {
  if (!activeStreamContext)
    return;

  const playPauseResumeButton = document.getElementById("playpauseresume");
  if (playPauseResumeButton.innerHTML === 'Play') {
    activeStreamContext.play(null,
      streamOperationSuccessCallback.bind(this, "Playback started for " + activeStreamContext.sessionId),
      onGeneralFault);
    playPauseResumeButton.innerHTML = 'Pause';
    logToDebugConsole("Playback initiated.");
  } else if (playPauseResumeButton.innerHTML === 'Pause') {
    activeStreamContext.pause(null,
      streamOperationSuccessCallback.bind(this, "Paused playback for " + activeStreamContext.sessionId),
      onGeneralFault);
    playPauseResumeButton.innerHTML = 'Resume';
    logToDebugConsole("Playback paused.");
  } else if (playPauseResumeButton.innerHTML === 'Resume') {
    activeStreamContext.play(null,
      streamOperationSuccessCallback.bind(this, "Resumed playback for " + activeStreamContext.sessionId),
      onGeneralFault);
    playPauseResumeButton.innerHTML = 'Pause';
    logToDebugConsole("Playback resumed.");
  }
}

/**
 * Halts playback of the current media.
 */
function terminatePlayback() {
  if (!activeStreamContext)
    return;

  activeStreamContext.stop(null,
    streamOperationSuccessCallback.bind(this, "Playback stopped for " + activeStreamContext.sessionId),
    onGeneralFault);
  const playPauseResumeButton = document.getElementById("playpauseresume");
  playPauseResumeButton.innerHTML = 'Play';
  logToDebugConsole("Media playback terminated.");
}

/**
 * Adjusts the volume level of the stream.
 * @param {number} volumeLevel A numerical value for the desired volume.
 * @param {boolean} isMuted Boolean indicating whether to mute or unmute.
 */
function adjustStreamVolume(volumeLevel, isMuted) {
  if (!activeStreamContext)
    return;

  loudnessControlActive = 0;
  const audioLevel = new chrome.cast.Volume();
  audioLevel.level = volumeLevel;
  presentLoudness = audioLevel.level;
  audioLevel.muted = isMuted;
  const operationRequest = new chrome.cast.media.VolumeRequest();
  operationRequest.volume = audioLevel;
  activeStreamContext.setVolume(operationRequest,
    onVolumeAdjustmentSuccess.bind(this, 'Stream volume adjustment completed.'),
    onGeneralFault);
}

/**
 * Callback for successful volume adjustments.
 * @param {string} statusMessage A message confirming the action.
 */
function onVolumeAdjustmentSuccess(statusMessage) {
  console.log(statusMessage);
  logToDebugConsole(statusMessage);
  setTimeout(function () {
    loudnessControlActive = 1
  }, 1500);
}

// Function to handle muting without immediately re-enabling volume updates
function toggleStreamMute(isMuted) {
  const audioLevel = new chrome.cast.Volume();
  audioLevel.level = presentLoudness;
  audioLevel.muted = isMuted;
  const operationRequest = new chrome.cast.media.VolumeRequest();
  operationRequest.volume = audioLevel;
  activeStreamContext.setVolume(operationRequest,
    onMuteToggleSuccess.bind(this, 'Stream mute state updated.'),
    onGeneralFault);
}

/**
 * Callback for successful mute/unmute operations.
 * @param {string} statusMessage A message confirming the action.
 */
function onMuteToggleSuccess(statusMessage) {
  console.log(statusMessage);
  logToDebugConsole(statusMessage);
}

/**
 * Handles the media mute/unmute action based on a checkbox.
 * @param {HTMLElement} checkboxElement The checkbox DOM element.
 */
function handleMuteToggle(checkboxElement) {
  if (checkboxElement.checked === true) {
    document.getElementById('muteText').innerHTML = 'Unmute media';
    toggleStreamMute(true);
    logToDebugConsole("Media muted.");
  } else {
    document.getElementById('muteText').innerHTML = 'Mute media';
    toggleStreamMute(false);
    logToDebugConsole("Media unmuted.");
  }
}

/**
 * Seeks to a specific position within the media stream.
 * @param {number} positionPercentage The target position as a percentage (0-100).
 */
function jumpStreamPosition(positionPercentage) {
  console.log('Seeking stream ' + activeStreamContext.sessionId + ':' +
    activeStreamContext.mediaSessionId + ' to ' + positionPercentage + "%");
  advancementIndicator = 0;
  const operationRequest = new chrome.cast.media.SeekRequest();
  operationRequest.currentTime = positionPercentage * activeStreamContext.media.duration / 100;
  activeStreamContext.seek(operationRequest,
    onSeekOperationSuccess.bind(this, 'Stream seek operation completed.'),
    onGeneralFault);
}

/**
 * Callback for successful seek operations.
 * @param {string} statusMessage A message confirming the action.
 */
function onSeekOperationSuccess(statusMessage) {
  console.log(statusMessage);
  logToDebugConsole(statusMessage);
  setTimeout(function () {
    advancementIndicator = 1
  }, 1500);
}

/**
 * Generic callback for successful media command executions.
 * @param {string} statusMessage A message describing the successful command.
 */
function streamOperationSuccessCallback(statusMessage) {
  console.log(statusMessage);
  logToDebugConsole(statusMessage);
}

/**
 * Appends a message to the debug console display.
 * @param {string} consoleOutput The message string to display.
 */
function logToDebugConsole(consoleOutput) {
  const debugWindowElement = document.getElementById("debugmessage");
  debugWindowElement.innerHTML += '\n' + JSON.stringify(consoleOutput);
}