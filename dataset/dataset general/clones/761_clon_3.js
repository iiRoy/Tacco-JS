// This module encapsulates media casting capabilities, leveraging Google's Cast SDK.
// It's a refactored and enhanced version of a basic Cast player example,
// designed for robustness and clearer separation of concerns.

// --- Core Application State ---
let activePlaybackSession = null;    // Represents the media session actively streaming on a Cast device.
let storedVolumeLevel = 0.5;         // The last known desired volume (0.0 to 1.0).
let allowProgressUIUpdate = true;    // Flag to gate updates to the playback progress UI.
let allowVolumeUIUpdate = true;      // Flag to gate updates to the volume control UI.
let currentStreamPosition = 0;       // The current timestamp of the media being played.
let activeCastConnection = null;     // The overarching Cast SDK session.

let chosenContentUri = "";           // The URI of the media selected for casting.

// --- DOM Interaction Utilities ---

/**
 * Retrieves a DOM element by its ID, providing a safer access pattern.
 * @param {string} elemIdentifier The ID of the HTML element.
 * @returns {HTMLElement|null} The DOM element or null if not found.
 */
const retrieveElement = (elemIdentifier) => {
  const element = document.getElementById(elemIdentifier);
  if (!element) {
    console.warn(`UI element with ID '${elemIdentifier}' not found.`);
  }
  return element;
};

/**
 * Converts a total number of seconds into a stylized H:M:S string format.
 * @param {number} totalSecs The duration in seconds.
 * @returns {string} Formatted duration string (e.g., "1h 2m 3s").
 */
function formatDurationString(totalSecs) {
  if (typeof totalSecs !== 'number' || isNaN(totalSecs) || totalSecs < 0) {
    return "0s"; // Default for invalid input.
  }
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = Math.floor(totalSecs % 60);

  let formatted = [];
  if (hours > 0) formatted.push(`${hours}h`);
  if (minutes > 0) formatted.push(`${minutes}m`);
  formatted.push(`${seconds}s`); // Always include seconds.

  return formatted.join(' ') || "0s";
}

/**
 * Displays a status message within the application's debug console UI.
 * @param {any} messageContent The data or text to be logged.
 */
function displayStatusMessage(messageContent) {
  const consoleDisplay = retrieveElement("debugmessage");
  if (consoleDisplay) {
    consoleDisplay.innerHTML += `\n${JSON.stringify(messageContent)}`;
    consoleDisplay.scrollTop = consoleDisplay.scrollHeight; // Auto-scroll.
  } else {
    console.error("Debug console UI element is missing.");
  }
}

// --- Cast SDK Initialization Routines ---

/**
 * Initializes the Google Cast SDK, setting up application ID and listeners.
 * Includes a retry mechanism for asynchronous SDK loading.
 */
function initializeCastSDK() {
  // Guard clause for Chrome Cast API availability.
  if (!window.chrome || !window.chrome.cast || !window.chrome.cast.isAvailable) {
    console.log("Cast API not ready. Retrying SDK initialization...");
    setTimeout(initializeCastSDK, 1000); // Retry after 1 second.
    return;
  }

  // Defining the default receiver application ID.
  const DEFAULT_RECEIVER_APP_ID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  const sessionInitiationRequest = new chrome.cast.SessionRequest(DEFAULT_RECEIVER_APP_ID);

  const sdkConfiguration = new chrome.cast.ApiConfig(
    sessionInitiationRequest,
    onCastSessionConnected,       // Callback for new session establishments.
    onReceiverDeviceDiscovered    // Callback for Cast device discovery.
  );

  chrome.cast.initialize(sdkConfiguration, onCastSDKReady, handleCastError);
}

/**
 * Callback function executed upon successful Cast SDK initialization.
 */
function onCastSDKReady() {
  console.info("Google Cast SDK successfully initialized.");
  displayStatusMessage("SDK Initialization: Success");
}

// --- Error Handling & Logging ---

/**
 * Centralized error handler for all Cast SDK operations.
 * @param {object} errorPayload The error object provided by the Cast SDK.
 */
function handleCastError(errorPayload) {
  console.error("Cast Operation Failed:", errorPayload);
  displayStatusMessage(`Error: ${JSON.stringify(errorPayload)}`);
  // Consider updating specific UI components to indicate error state.
}

/**
 * Logs the successful execution of a Cast SDK command.
 * @param {string} statusMessage A descriptive string for the successful operation.
 */
function logCastOperationSuccess(statusMessage) {
  console.log(statusMessage);
  displayStatusMessage(statusMessage);
}

// --- Cast Session & Receiver Management ---

/**
 * Handler for newly established Cast sessions.
 * This function processes the session object and registers listeners for updates.
 * @param {chrome.cast.Session} sessionInstance The active Cast session object.
 */
function onCastSessionConnected(sessionInstance) {
  console.log(`New Cast Session Established: ${sessionInstance.sessionId}`);
  displayStatusMessage(`Session Connected: ${sessionInstance.sessionId}`);
  activeCastConnection = sessionInstance;

  // If there are existing media sessions, attach to the first one.
  if (sessionInstance.media && sessionInstance.media.length > 0) {
    displayStatusMessage(`Found ${sessionInstance.media.length} existing media streams.`);
    onMediaSessionEstablished("ExistingMedia", sessionInstance.media[0]);
  }

  // Register listeners for media events and session status changes.
  sessionInstance.addMediaListener(onMediaSessionEstablished.bind(null, "MediaAdded"));
  sessionInstance.addUpdateListener(onSessionStatusChanged);
}

/**
 * Listener for changes in the Cast session's status (e.g., disconnection).
 * @param {boolean} sessionIsActive True if the session is still active, false otherwise.
 */
function onSessionStatusChanged(sessionIsActive) {
  if (!activeCastConnection) return; // Guard against null session.

  const statusMsg = sessionIsActive
    ? `Session Updated: ${activeCastConnection.sessionId}`
    : `Session Ended: ${activeCastConnection.sessionId}`;

  displayStatusMessage(statusMsg);

  if (!sessionIsActive) {
    activeCastConnection = null; // Clear the primary session reference.
    activePlaybackSession = null; // Clear the media session reference.
    resetPlayerUI(); // Reset UI to default idle state.
  }
}

/**
 * Monitors and reports the availability of Cast receiver devices on the network.
 * @param {string} receiverStatus 'available' if devices are found, 'unavailable' otherwise.
 */
function onReceiverDeviceDiscovered(receiverStatus) {
  const message = (receiverStatus === 'available') ? "Cast devices detected." : "No Cast devices nearby.";
  console.log(message);
  displayStatusMessage(message);
  // UI could update the Cast button's visual state here.
}

// --- Application Flow & Control ---

/**
 * Initiates the full playback sequence: requests a Cast session, then loads media.
 * If a session is already active, it proceeds directly to media loading.
 */
function startPlaybackFlow() {
  if (activeCastConnection === null) {
    // No active session, request a new one.
    chrome.cast.requestSession(function (newSession) {
      onCastSessionConnected(newSession); // Handle the new session.
      loadContentIntoPlayer();            // Then load media.
    }, onCastAppLaunchFailure);
  } else {
    // Session already exists, proceed with media loading.
    loadContentIntoPlayer();
  }
}

/**
 * Callback for when a Cast session request completes successfully.
 * @param {chrome.cast.Session} sessionObj The successfully established session.
 */
function onCastSessionRequestSuccess(sessionObj) {
  console.log(`Cast session successfully requested: ${sessionObj.sessionId}`);
  displayStatusMessage(`Session Request OK: ${sessionObj.sessionId}`);
  activeCastConnection = sessionObj;
  // If content is already selected, proceed to load it.
  if (chosenContentUri) {
    loadContentIntoPlayer();
  }
}

/**
 * Callback for errors encountered during Cast application launch or session request.
 * @param {object} errorInfo The error details.
 */
function onCastAppLaunchFailure(errorInfo) {
  console.error("Chromecast application launch failed:", errorInfo);
  displayStatusMessage(`Launch Error: ${JSON.stringify(errorInfo)}`);
  activeCastConnection = null;
  activePlaybackSession = null;
  resetPlayerUI(); // Ensure UI reflects no active session.
}

/**
 * Terminates the current Cast application and session.
 */
function stopCastApplication() {
  if (!activeCastConnection) {
    displayStatusMessage("No active Cast session to terminate.");
    return;
  }
  displayStatusMessage("Terminating Cast application...");
  activeCastConnection.stop(onApplicationTerminationSuccess, handleCastError);
}

/**
 * Callback for successful termination of the Cast application.
 */
function onApplicationTerminationSuccess() {
  console.log('Cast application session terminated.');
  displayStatusMessage('Application Stopped.');
  activeCastConnection = null;
  activePlaybackSession = null;
  resetPlayerUI(); // Reset all player UI elements.
}

// --- Media Content Management ---

/**
 * Registers the URI of the media content to be played.
 * This function only stores the URI; actual loading happens via `loadContentIntoPlayer`.
 * @param {string} contentUrl The URL of the media.
 */
function selectMediaContent(contentUrl) {
  if (!contentUrl || typeof contentUrl !== 'string') {
    console.warn("Invalid content URL provided.");
    displayStatusMessage("Warning: Invalid content URL.");
    return;
  }
  console.log(`Media content chosen: ${contentUrl}`);
  displayStatusMessage(`Content: ${contentUrl}`);
  chosenContentUri = contentUrl;
  // Potentially enable UI elements that require content to be selected.
}

/**
 * Loads the selected media content onto the Cast device.
 * Requires an active Cast session and a selected content URI.
 */
function loadContentIntoPlayer() {
  if (!activeCastConnection) {
    console.warn("Cannot load media: No active Cast session.");
    displayStatusMessage("Warning: No session for media load.");
    return;
  }
  if (!chosenContentUri) {
    console.warn("Cannot load media: No content URI selected.");
    displayStatusMessage("Warning: No content selected.");
    return;
  }

  console.log(`Attempting to load content: ${chosenContentUri}`);
  displayStatusMessage(`Loading: ${chosenContentUri}`);

  const mediaInfo = new chrome.cast.media.MediaInfo(chosenContentUri);
  mediaInfo.contentType = 'video/mp4'; // Default to video/mp4, can be dynamic.
  // Example for custom data, if needed by your receiver.
  // mediaInfo.customData = { origin: "MyCustomCastApp" };

  const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
  loadRequest.autoplay = true; // Start playback automatically.
  loadRequest.currentTime = 0; // Begin from the start of the media.

  activeCastConnection.loadMedia(
    loadRequest,
    onMediaSessionEstablished.bind(null, 'LoadMediaCommand'),
    onMediaLoadError
  );
}

/**
 * Callback invoked when a media session is successfully established on the receiver.
 * @param {string} source A string indicating the event that triggered the callback.
 * @param {chrome.cast.media.Media} mediaSession The active media session object.
 */
function onMediaSessionEstablished(source, mediaSession) {
  console.log(`New media session ID: ${mediaSession.mediaSessionId} (Source: ${source})`);
  displayStatusMessage(`Media Session Active: ${mediaSession.mediaSessionId} (${source})`);
  activePlaybackSession = mediaSession;
  currentStreamPosition = mediaSession.currentTime;

  // Register for continuous updates from the media session.
  mediaSession.addUpdateListener(updatePlayerUIState);

  // Trigger an immediate UI refresh.
  updatePlayerUIState(true);
}

/**
 * Callback for errors that occur during media loading.
 * @param {object} errorDetails The error object.
 */
function onMediaLoadError(errorDetails) {
  console.error("Media content loading failed:", errorDetails);
  displayStatusMessage(`Media Load Error: Code ${errorDetails.code}, Desc: ${errorDetails.description}`);
  // Update UI to indicate a media loading failure.
}

// --- Player UI & Playback Control ---

/**
 * Resets all relevant player UI elements to their default, idle state.
 */
function resetPlayerUI() {
  const playbackButton = retrieveElement("playbackControlBtn");
  if (playbackButton) playbackButton.textContent = 'Play';
  const contentNameDisplay = retrieveElement("currentmedianame");
  if (contentNameDisplay) contentNameDisplay.textContent = 'No Media Loaded';
  const playerStateDisplay = retrieveElement("playerState");
  if (playerStateDisplay) playerStateDisplay.textContent = 'Idle';
  const progressSlider = retrieveElement("progressValue");
  if (progressSlider) progressSlider.value = 0;
  const volumeSlider = retrieveElement("volumeControl");
  if (volumeSlider) volumeSlider.value = 50; // Mid-level default
  const muteCheckbox = retrieveElement("muteToggle");
  if (muteCheckbox) muteCheckbox.checked = false;
  const muteText = retrieveElement("muteText");
  if (muteText) muteText.innerHTML = 'Mute media';
  const durationDisplay = retrieveElement("currentmedia_duration");
  if (durationDisplay) durationDisplay.innerHTML = '--:--';
  const progressDisplay = retrieveElement("currentmedia_progress");
  if (progressDisplay) progressDisplay.innerHTML = '--:--';
}


/**
 * Updates the UI elements to reflect the current state of the media playback.
 * This function is typically called by the media session's update listener.
 * @param {boolean} [isSessionAlive=true] Indicates if the media session is still active.
 */
function updatePlayerUIState(isSessionAlive = true) {
  if (!activePlaybackSession || !isSessionAlive) {
    resetPlayerUI();
    return;
  }

  // Update playback progress slider.
  if (allowProgressUIUpdate) {
    const progressSlider = retrieveElement("progressValue");
    if (progressSlider && activePlaybackSession.media && activePlaybackSession.media.duration) {
      const progressPercentage = Math.min(100, Math.max(0, Math.round(100 * activePlaybackSession.currentTime / activePlaybackSession.media.duration)));
      progressSlider.value = progressPercentage;
    }
  }

  // Update volume slider and mute status.
  if (allowVolumeUIUpdate) {
    const volumeSlider = retrieveElement("volumeControl");
    if (volumeSlider && activePlaybackSession.volume) {
      // Scale volume (0.0-1.0) to UI slider (0-100), inverted for typical slider behavior.
      volumeSlider.value = Math.round((1 - activePlaybackSession.volume.level) * 100);
      retrieveElement("muteToggle").checked = activePlaybackSession.volume.muted;
      retrieveElement("muteText").innerHTML = activePlaybackSession.volume.muted ? 'Unmute media' : 'Mute media';
    }
  }

  // Update the main playback control button text.
  const playbackButton = retrieveElement("playbackControlBtn");
  if (playbackButton) {
    switch (activePlaybackSession.playerState) {
      case chrome.cast.media.PlayerState.BUFFERING:
      case chrome.cast.media.PlayerState.PLAYING:
        playbackButton.textContent = 'Pause';
        break;
      case chrome.cast.media.PlayerState.PAUSED:
        playbackButton.textContent = 'Resume';
        break;
      case chrome.cast.media.PlayerState.IDLE:
      case chrome.cast.media.PlayerState.UNKNOWN:
      default:
        playbackButton.textContent = 'Play';
        break;
    }
  }

  // Update media information displays.
  const mediaId = activePlaybackSession.media ? activePlaybackSession.media.contentId : "Unknown Content";
  retrieveElement("currentmedianame").innerHTML = mediaId;
  retrieveElement("playerState").innerHTML = activePlaybackSession.playerState;

  // Update current time and total duration displays.
  const mediaDuration = activePlaybackSession.media ? activePlaybackSession.media.duration : 0;
  retrieveElement("currentmedia_duration").innerHTML = formatDurationString(mediaDuration);
  retrieveElement("currentmedia_progress").innerHTML = formatDurationString(activePlaybackSession.currentTime);
}

/**
 * Toggles the playback state (Play/Pause/Resume) of the current media stream.
 */
function toggleMediaPlayback() {
  if (!activePlaybackSession) {
    displayStatusMessage("No active media session to control.");
    return;
  }

  const currentStatus = activePlaybackSession.playerState;
  let commandFunction = null;
  let completionMessage = "";

  switch (currentStatus) {
    case chrome.cast.media.PlayerState.PLAYING:
    case chrome.cast.media.PlayerState.BUFFERING:
      commandFunction = activePlaybackSession.pause;
      completionMessage = "Playback paused.";
      break;
    case chrome.cast.media.PlayerState.PAUSED:
      commandFunction = activePlaybackSession.play;
      completionMessage = "Playback resumed.";
      break;
    case chrome.cast.media.PlayerState.IDLE:
    case chrome.cast.media.PlayerState.UNKNOWN:
    default:
      commandFunction = activePlaybackSession.play;
      completionMessage = "Playback started.";
      break;
  }

  if (commandFunction) {
    commandFunction.call(activePlaybackSession, null,
      logCastOperationSuccess.bind(null, completionMessage),
      handleCastError
    );
  }
}

/**
 * Completely stops the currently playing media content.
 */
function stopMediaContent() {
  if (!activePlaybackSession) {
    displayStatusMessage("No media session to stop.");
    return;
  }

  activePlaybackSession.stop(
    null,
    logCastOperationSuccess.bind(null, `Media stopped for session: ${activePlaybackSession.sessionId}`),
    handleCastError
  );
  displayStatusMessage("Media playback halted.");
  // Immediate UI update to reflect stop, pending callback.
  const playbackButton = retrieveElement("playbackControlBtn");
  if (playbackButton) playbackButton.textContent = 'Play';
}

/**
 * Adjusts the volume and mute status of the active media stream.
 * @param {number} newVolumeLevel A float between 0.0 and 1.0.
 * @param {boolean} shouldMute True to mute, false to unmute.
 */
function modifyPlayerVolume(newVolumeLevel, shouldMute) {
  if (!activePlaybackSession) {
    displayStatusMessage("No media session for volume control.");
    return;
  }

  const validatedLevel = Math.max(0, Math.min(1, parseFloat(newVolumeLevel)));
  if (isNaN(validatedLevel)) {
    console.warn("Invalid volume level input.");
    return;
  }

  allowVolumeUIUpdate = false; // Temporarily pause UI updates to prevent slider flickering.

  const volumeCommand = new chrome.cast.Volume();
  volumeCommand.level = validatedLevel;
  storedVolumeLevel = validatedLevel; // Update stored level.
  volumeCommand.muted = shouldMute;

  const volumeRequest = new chrome.cast.media.VolumeRequest();
  volumeRequest.volume = volumeCommand;

  activePlaybackSession.setVolume(
    volumeRequest,
    onVolumeAdjustmentConfirmed.bind(null, 'Volume change applied.'),
    handleCastError
  );
}

/**
 * Callback for successful volume changes. Re-enables UI updates after a short delay.
 * @param {string} confirmationMsg Message indicating volume change success.
 */
function onVolumeAdjustmentConfirmed(confirmationMsg) {
  console.log(confirmationMsg);
  displayStatusMessage(confirmationMsg);
  // Re-enable UI updates after allowing some time for device response.
  setTimeout(() => { allowVolumeUIUpdate = true; }, 1500);
}

/**
 * Handles the user's interaction with the mute/unmute checkbox.
 * @param {HTMLInputElement} muteToggleElement The checkbox element.
 */
function handleMuteToggle(muteToggleElement) {
  if (!activePlaybackSession) {
    displayStatusMessage("Cannot mute/unmute: No active media.");
    if (muteToggleElement) muteToggleElement.checked = !muteToggleElement.checked; // Revert UI.
    return;
  }

  const newMuteStatus = muteToggleElement.checked;
  // Apply mute status using the last known volume level.
  modifyPlayerVolume(storedVolumeLevel, newMuteStatus);

  const muteTextDisplay = retrieveElement('muteText');
  if (muteTextDisplay) {
    muteTextDisplay.innerHTML = newMuteStatus ? 'Unmute media' : 'Mute media';
  }
  displayStatusMessage(newMuteStatus ? "Media muted." : "Media unmuted.");
}

/**
 * Seeks the media stream to a specified percentage position.
 * @param {number} targetPercentage A value from 0 to 100.
 */
function jumpToPlaybackPosition(targetPercentage) {
  if (!activePlaybackSession || !activePlaybackSession.media || !activePlaybackSession.media.duration) {
    displayStatusMessage("Cannot seek: Media session not ready or duration unknown.");
    return;
  }

  const validatedPercentage = Math.max(0, Math.min(100, parseFloat(targetPercentage)));
  if (isNaN(validatedPercentage)) {
    console.warn("Invalid seek percentage provided.");
    return;
  }

  console.log(`Seeking session ${activeCastConnection.sessionId} to ${validatedPercentage}%`);
  allowProgressUIUpdate = false; // Temporarily disable UI updates during seek.

  const seekCommand = new chrome.cast.media.SeekRequest();
  seekCommand.currentTime = (validatedPercentage / 100) * activePlaybackSession.media.duration;

  activePlaybackSession.seek(
    seekCommand,
    onSeekOperationConfirmed.bind(null, `Seek to ${validatedPercentage}% successful.`),
    handleCastError
  );
}

/**
 * Callback for successful seek operations. Re-enables UI updates after a delay.
 * @param {string} confirmationMessage Message about the seek success.
 */
function onSeekOperationConfirmed(confirmationMessage) {
  console.log(confirmationMessage);
  displayStatusMessage(confirmationMessage);
  // Re-enable UI updates.
  setTimeout(() => { allowProgressUIUpdate = true; }, 1500);
}

// --- Initial Application Bootstrapping ---
// Check for Cast API availability and initiate SDK setup.
// A delay is used to accommodate asynchronous SDK script loading.
if (!window.chrome || !window.chrome.cast) {
  console.log("Cast API not detected yet. Scheduling initialization...");
  setTimeout(initializeCastSDK, 1000);
} else {
  initializeCastSDK(); // API is immediately available.
}