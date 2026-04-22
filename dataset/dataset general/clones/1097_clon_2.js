// This file is part of a demonstration project.
//
// Copyright (c) 2023 Example Corp. All rights reserved.
//
// This software is provided "as is", without any express or implied warranties.
// For full terms and conditions, refer to the accompanying license agreement.


(function() {
  'use strict';

/**
 * Base URI for multimedia assets.
 **/
var ASSET_BASE_URI = 'http://example.com/assets/media/';

/**
 * URI for the list of available multimedia assets in JSON format.
 **/
var ASSET_LIST_URI = 'http://example.com/assets/media/playlist.json';

/**
 * Visual width of the playback progress indicator in pixels.
 **/
var VISUAL_PROGRESS_BAR_SIZE = 750;

/**
 * Status constants for the external display apparatus.
 **/
var APPARATUS_STATUS = {
  'DORMANT' : false, 
  'OPERATIONAL' : true, 
  'ALERT' : null, 
  'FAILURE' : undefined,
};

/**
 * Status constants for the content viewer.
 **/
var VIEWER_STATUS = {
  'INACTIVE' : 'INACTIVE', 
  'FETCHING' : 'FETCHING', 
  'READY' : 'READY', 
  'RENDERING' : 'RENDERING',
  'SUSPENDED' : 'SUSPENDED',
  'HALTED' : 'HALTED',
  'NAVIGATING' : 'NAVIGATING',
  'ISSUE' : 'ISSUE'
};

/**
 * Manages content streaming to local or remote displays.
 * Key properties:
 *  - apparatusStatus: Tracks the state of the connected display system.
 *    DORMANT: No active display activity.
 *    OPERATIONAL: Display is active and responsive.
 *    ALERT: Display is active but has encountered minor issues.
 *    FAILURE: Display is in an unrecoverable error state.
 *  - Stream-specific variables for controlling remote content playback.
 *  - Local playback variables for controlling content on the local device.
 *  - Current content variables for switching between local and remote modes.
 */
var ContentStreamer = function() {
  /* Apparatus status variables */
  // @type {APPARATUS_STATUS} The current state of the display apparatus.
  this.apparatusStatus = APPARATUS_STATUS.DORMANT;

  /* Remote display availability */
  // @type {boolean} Indicates if any display units are discoverable.
  this.displayUnitsPresent = false;

  /* Remote stream variables */
  // @type {Object} An active chrome.cast.media.Media object.
  this.activeStreamSession = null;
  // @type {Number} Playback sound volume (0.0 to 1.0).
  this.audioLevel = 0.6;
  // @type {Boolean} Flag to start playback automatically after loading.
  this.autoPlayEnabled = true;
  // @type {string} The active chrome.cast.Session object.
  this.connectionSession = null;
  // @type {VIEWER_STATUS} The state of the remote content viewer.
  this.streamViewerStatus = VIEWER_STATUS.INACTIVE;

  /* Local playback variables */
  // @type {VIEWER_STATUS} The state of the local content viewer.
  this.localViewerStatus = VIEWER_STATUS.INACTIVE;
  // @type {HTMLElement} Reference to the local HTML video element.
  this.videoElement = null;
  // @type {Boolean} Indicates if fullscreen mode is active.
  this.fullScreenMode = false;

  /* Current content tracking variables */
  // @type {Boolean} Master switch for audio output.
  this.soundEnabled = true;
  // @type {Number} Index of the currently selected content item.
  this.currentContentIndex = 0;
  // @type {Number} Current playback time in seconds.
  this.currentPlayTime = 0;
  // @type {Number} Total duration of the current content in seconds.
  this.contentTotalDuration = -1;
  // @type {Timer} A timer for periodically updating playback progress.
  this.progressTracker = null;
  // @type {Boolean} Flag to prevent timer updates when status is received from the display.
  this.trackUpdateFlag = true;
  // @type {Number} Interval in milliseconds for progress timer updates.
  this.trackingInterval = 1200;

  /* Loaded content metadata from JSON */
  this.contentItems = null;

  this.setupStreamer();
  this.setupLocalPlayer();
};

/**
 * Initializes the local HTML5 video player.
 */
ContentStreamer.prototype.setupLocalPlayer = function() {
  this.videoElement = document.getElementById('video_element');
  this.videoElement.addEventListener('loadeddata', this.onLocalContentReady.bind(this));
};

/**
 * Initializes the remote streaming client.
 * This function attempts to initialize the Cast API. If not available, it retries.
 * Success or error callbacks are invoked upon API initialization completion.
 * Session and receiver listeners may be called multiple times thereafter.
 */
ContentStreamer.prototype.setupStreamer = function() {

  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(this.setupStreamer.bind(this), 1500);
    return;
  }
  // Application ID for the receiver.
  // This can be changed to a custom ID for a specific receiver application.
  var appIdentifier = '5C9D7E2F';

  // Auto-join policy determines how sessions are joined.
  var joinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;

  // Create a session request for the application.
  var sessionReq = new chrome.cast.SessionRequest(appIdentifier);
  var apiCfg = new chrome.cast.ApiConfig(sessionReq,
    this.connectionSessionListener.bind(this),
    this.displayUnitListener.bind(this),
    joinPolicy);

  chrome.cast.initialize(apiCfg, this.onInitializationSuccess.bind(this), this.onGeneralError.bind(this));

  this.addVideoThumbs();
  this.initializeUI();
};

/**
 * Callback executed upon successful API initialization.
 */
ContentStreamer.prototype.onInitializationSuccess = function() {
  console.log("Streamer API initialized successfully.");
  this.updatePlaybackControls();
};

/**
 * General error handler callback.
 */
ContentStreamer.prototype.onGeneralError = function() {
  console.error("An error occurred during streamer operation.");
};

/**
 * @param {!Object} evt A newly established session object.
 * This listener handles automatic session joining when a page reloads.
 * If an active session is found, playback transitions to remote mode,
 * and media status is synchronized with the session's current media.
 */
ContentStreamer.prototype.connectionSessionListener = function(evt) {
  this.connectionSession = evt;
  if( this.connectionSession ) {
    this.apparatusStatus = APPARATUS_STATUS.OPERATIONAL;
    if( this.connectionSession.media[0] ) {
      this.onStreamDiscovered('rejoinedSession', this.connectionSession.media[0]);
      this.alignCurrentContent(this.connectionSession.media[0].media.contentId);
      this.updateUIForContentSelection(this.currentContentIndex);
      this.refreshStatusDisplay();
    }
    else {
      this.loadStream(this.currentContentIndex);
    }
    this.connectionSession.addUpdateListener(this.connectionUpdateListener.bind(this));
  }
}

/**
 * @param {string} contentUri The URI of the currently playing content.
 */
ContentStreamer.prototype.alignCurrentContent = function(contentUri) {
  for(var k = 0; k < this.contentItems.length; k++) {
    if( contentUri == this.contentItems[k].assetLinks[0] ) {
      this.currentContentIndex = k;
    }
  }
}

/**
 * @param {string} status The availability status of display units.
 * This indicates general availability but doesn't list specific devices.
 */
ContentStreamer.prototype.displayUnitListener = function(status) {
  if( status === 'available' ) {
    this.displayUnitsPresent = true;
    this.updatePlaybackControls();
    console.info("Remote display units detected.");
  }
  else {
    console.warn("No remote display units found.");
  }
};

/**
 * Listener for updates to the connection session.
 */
ContentStreamer.prototype.connectionUpdateListener = function(isLive) {
  if (!isLive) {
    this.connectionSession = null;
    this.apparatusStatus = APPARATUS_STATUS.DORMANT;
    this.streamViewerStatus = VIEWER_STATUS.INACTIVE;
    this.activeStreamSession = null;
    clearInterval(this.progressTracker);
    this.refreshStatusDisplay();

    var isOnline = navigator.onLine;
    if( isOnline === true ) {
      // Continue playback on the local device
      console.log("Current playback time (local fallback): " + this.currentPlayTime + " seconds.");
      this.playContentLocally();
      this.updatePlaybackControls();
    }
  }
};


/**
 * Selects a specific content item for playback.
 * @param {Number} contentIdx The index of the content item.
 */
ContentStreamer.prototype.chooseContent = function(contentIdx) {
  console.log("Content item selected: " + contentIdx);

  this.currentContentIndex = contentIdx;
  // Reset visual progress indicator
  var indicator = document.getElementById("progress_indicator"); 
  var bar = document.getElementById("progress"); 

  // Reset current playback time
  this.currentPlayTime = 0;

  bar.style.width = '0px';
  indicator.style.marginLeft = -21 - VISUAL_PROGRESS_BAR_SIZE + 'px';

  if( !this.activeStreamSession ) {
    this.localViewerStatus = VIEWER_STATUS.INACTIVE;
    this.playContentLocally();
  }
  else {
    this.streamViewerStatus = VIEWER_STATUS.INACTIVE;
    this.playStream();
  }
  this.updateUIForContentSelection(contentIdx);
};

/**
 * Requests to start or join a receiver application session.
 * The default session request from initialization is used unless overridden.
 */
ContentStreamer.prototype.startApplication = function() {
  console.log("Initiating application launch...");
  chrome.cast.requestSession(
    this.connectionSessionListener.bind(this),
    this.onApplicationLaunchError.bind(this));
  if( this.progressTracker ) {
    clearInterval(this.progressTracker);
  }
};

/**
 * Callback for successful session request.
 * @param {Object} evt A chrome.cast.Session object.
 */
ContentStreamer.prototype.onRequestSessionSuccess = function(evt) {
  console.log("Session established successfully: " + evt.sessionId);
  this.connectionSession = evt;
  this.apparatusStatus = APPARATUS_STATUS.OPERATIONAL;
  this.updatePlaybackControls();
  this.loadStream(this.currentContentIndex);
  this.connectionSession.addUpdateListener(this.connectionUpdateListener.bind(this));
};

/**
 * Callback for errors during application launch.
 */
ContentStreamer.prototype.onApplicationLaunchError = function() {
  console.error("Failed to launch receiver application.");
  this.apparatusStatus = APPARATUS_STATUS.FAILURE;
};

/**
 * Terminates the receiver application associated with the current session.
 */
ContentStreamer.prototype.haltApplication = function() {
  this.connectionSession.stop(this.onApplicationHaltSuccess.bind(this, 'Session terminated'),
      this.onGeneralError.bind(this));    

};

/**
 * Callback upon successful application termination.
 */
ContentStreamer.prototype.onApplicationHaltSuccess = function(message) {
  console.log(message);
  this.apparatusStatus = APPARATUS_STATUS.DORMANT;
  this.streamViewerStatus = VIEWER_STATUS.INACTIVE;
  this.activeStreamSession = null;
  clearInterval(this.progressTracker);
  this.refreshStatusDisplay();

  // Continue playing content locally
  console.log("Current playback time (local continuation): " + this.currentPlayTime + " seconds.");
  this.playContentLocally();
  this.updatePlaybackControls();
};

/**
 * Loads a media stream into the active receiver application.
 * @param {Number} contentIdx The index of the content item to load.
 */
ContentStreamer.prototype.loadStream = function(contentIdx) {
  if (!this.connectionSession) {
    console.warn("No active connection session available.");
    return;
  }
  console.log("Loading stream: " + this.contentItems[contentIdx].title);
  var mediaData = new chrome.cast.media.MediaInfo(this.contentItems[contentIdx].assetLinks[0]);

  mediaData.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaData.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
  mediaData.contentType = 'video/mp4';

  mediaData.metadata.title = this.contentItems[contentIdx].title;
  mediaData.metadata.images = [{'url': ASSET_BASE_URI + this.contentItems[contentIdx].thumbnail}];

  var streamRequest = new chrome.cast.media.LoadRequest(mediaData);
  streamRequest.autoplay = this.autoPlayEnabled;
  if( this.localViewerStatus == VIEWER_STATUS.RENDERING ) {
    streamRequest.currentTime = this.videoElement.currentTime;
    this.videoElement.pause();
    this.localViewerStatus = VIEWER_STATUS.HALTED;
  }
  else {
    streamRequest.currentTime = 0;
  } 

  this.streamViewerStatus = VIEWER_STATUS.FETCHING;
  this.connectionSession.loadMedia(streamRequest,
    this.onStreamDiscovered.bind(this, 'loadStream'),
    this.onStreamLoadError.bind(this));

  document.getElementById("media_title").innerHTML = this.contentItems[this.currentContentIndex].title;
  document.getElementById("media_subtitle").innerHTML = this.contentItems[this.currentContentIndex].subtitle;
  document.getElementById("media_desc").innerHTML = this.contentItems[this.currentContentIndex].description;

};

/**
 * Callback for successful media stream discovery/loading.
 * @param {string} trigger How the media was discovered (e.g., 'loadStream', 'rejoinedSession').
 * @param {Object} streamObj A new chrome.cast.media.Media object.
 */
ContentStreamer.prototype.onStreamDiscovered = function(trigger, streamObj) {
  console.log("New stream session ID: " + streamObj.mediaSessionId + ' (triggered by: ' + trigger + ')');
  this.activeStreamSession = streamObj;
  if( trigger == 'loadStream' ) {
    if( this.autoPlayEnabled ) {
      this.streamViewerStatus = VIEWER_STATUS.RENDERING;
    }
    else {
      this.streamViewerStatus = VIEWER_STATUS.READY;
    }
  }

  if( trigger == 'rejoinedSession' ) {
    this.streamViewerStatus = this.connectionSession.media[0].playerState; 
    this.currentPlayTime = this.connectionSession.media[0].currentTime; 
  }

  if( this.streamViewerStatus == VIEWER_STATUS.RENDERING ) {
    // Begin updating progress timer
    this.startProgressTimer(this.advancePlayTime);
  }

  this.activeStreamSession.addUpdateListener(this.onStreamStatusUpdate.bind(this));

  this.contentTotalDuration = this.activeStreamSession.media.duration;
  var totalSeconds = this.contentTotalDuration;
  var hours = parseInt(totalSeconds / 3600);
  totalSeconds -= hours * 3600;
  var minutes = parseInt(totalSeconds / 60);
  var seconds = parseInt(totalSeconds % 60);
  var formattedDuration;
  if ( hours > 0 ) {
    formattedDuration = hours + ":" + minutes + ":" + seconds;
  }
  else {
    if( minutes > 0 ) {
      formattedDuration = minutes + ":" + seconds;
    }
    else {
      formattedDuration = seconds;
    }
  }
  document.getElementById("duration").innerHTML = formattedDuration;

  if( this.localViewerStatus == VIEWER_STATUS.RENDERING ) {
    this.localViewerStatus = VIEWER_STATUS.HALTED;
    var videoImage = document.getElementById('video_image');
    videoImage.style.display = 'block';
    this.videoElement.style.display = 'none';
    // Start remote progress timer
    this.startProgressTimer(this.advancePlayTime);
  }
  // Refresh user interface elements
  this.updatePlaybackControls();
  this.refreshStatusDisplay();
};

/**
 * Callback function when stream loading encounters an error.
 */
ContentStreamer.prototype.onStreamLoadError = function(errorEvent) {
  console.error("Stream loading failed:", errorEvent);
  this.streamViewerStatus = VIEWER_STATUS.INACTIVE;
  // Refresh user interface elements
  this.updatePlaybackControls();
  this.refreshStatusDisplay();
};

/**
 * Callback function for stream status updates from the receiver.
 * @param {!Boolean} isActive Indicates if the media session is still active.
 */
ContentStreamer.prototype.onStreamStatusUpdate = function(isActive) {
  if( isActive == false ) {
    this.currentPlayTime = 0;
    this.streamViewerStatus = VIEWER_STATUS.INACTIVE;
  }
  console.log("Updating stream status...");
  this.updateVisualProgress(isActive);
  this.refreshStatusDisplay();
  this.updatePlaybackControls();
};

/**
 * Helper function to advance the current media position by one second.
 */
ContentStreamer.prototype.advancePlayTime = function() {
  if( this.streamViewerStatus == VIEWER_STATUS.RENDERING || this.localViewerStatus == VIEWER_STATUS.RENDERING ) {
    if( this.currentPlayTime < this.contentTotalDuration ) {
      this.currentPlayTime += 1;
      this.updateVisualProgressByTimer();
    }
    else {
      this.currentPlayTime = 0;
      clearInterval(this.progressTracker);
    }
  }
};

/**
 * Initiates content playback on the local player.
 */
ContentStreamer.prototype.playContentLocally = function() {
  var videoImagePlaceholder = document.getElementById('video_image');
  videoImagePlaceholder.style.display = 'none';
  this.videoElement.style.display = 'block';
  if( this.localViewerStatus != VIEWER_STATUS.RENDERING && this.localViewerStatus != VIEWER_STATUS.SUSPENDED ) { 
    this.videoElement.src = this.contentItems[this.currentContentIndex].assetLinks[0];
    this.videoElement.load();
  }
  else {
    // Original code ends here without further actions in the else block.
    // Maintaining identical structure.
  }
};

/**
 * Placeholder for adding video thumbnail elements to the UI.
 * (Implementation not provided in original snippet)
 */
ContentStreamer.prototype.addVideoThumbs = function() {
  console.log("Adding video thumbnails (placeholder)...");
};

/**
 * Placeholder for initializing other UI components.
 * (Implementation not provided in original snippet)
 */
ContentStreamer.prototype.initializeUI = function() {
  console.log("Initializing UI (placeholder)...");
};

/**
 * Starts a periodic timer to update playback progress.
 * @param {function} timeIncrementer The function to call periodically to advance time.
 */
ContentStreamer.prototype.startProgressTimer = function(timeIncrementer) {
  this.progressTracker = setInterval(timeIncrementer.bind(this), this.trackingInterval);
  console.log("Progress timer initiated.");
};

/**
 * Initiates playback for the currently selected content on the remote display.
 */
ContentStreamer.prototype.playStream = function() {
  if (this.connectionSession && this.activeStreamSession) {
    console.log("Sending play command to remote stream.");
    this.streamViewerStatus = VIEWER_STATUS.RENDERING;
    this.startProgressTimer(this.advancePlayTime);
    this.updatePlaybackControls();
    this.refreshStatusDisplay();
  } else {
    console.warn("Cannot play remote stream: no active session or media.");
  }
};

/**
 * Placeholder for updating the UI based on local media loaded event.
 */
ContentStreamer.prototype.onLocalContentReady = function() {
  this.localViewerStatus = VIEWER_STATUS.READY;
  this.videoElement.play();
  this.localViewerStatus = VIEWER_STATUS.RENDERING;
  this.contentTotalDuration = this.videoElement.duration;
  this.startProgressTimer(this.advancePlayTime);
  this.updatePlaybackControls();
  this.refreshStatusDisplay();
  console.log("Local content ready and playing.");
};

/**
 * Placeholder for updating the visual progress bar based on status events.
 * @param {boolean} statusActive Indicates if the media session is active.
 */
ContentStreamer.prototype.updateVisualProgress = function(statusActive) {
  if (this.trackUpdateFlag && statusActive) {
    this.currentPlayTime = this.activeStreamSession.currentTime;
    // Assume progress bar logic here
    console.log("Visual progress updated by status event.");
  }
};

/**
 * Placeholder for updating the visual progress bar based on the timer.
 */
ContentStreamer.prototype.updateVisualProgressByTimer = function() {
  // Assume progress bar logic here, using this.currentPlayTime
  // For instance:
  var progressElement = document.getElementById("progress");
  var indicatorElement = document.getElementById("progress_indicator");
  if (this.contentTotalDuration > 0) {
    var percentage = (this.currentPlayTime / this.contentTotalDuration) * 100;
    var barWidth = (percentage / 100) * VISUAL_PROGRESS_BAR_SIZE;
    progressElement.style.width = barWidth + 'px';
    indicatorElement.style.marginLeft = (barWidth - 21) + 'px'; // Adjust for indicator size
  }
  console.log("Visual progress updated by timer: " + this.currentPlayTime + "s");
};

/**
 * Placeholder for updating media control UI elements.
 */
ContentStreamer.prototype.updatePlaybackControls = function() {
  console.log("Updating playback controls UI (placeholder)...");
};

/**
 * Placeholder for updating the UI after content selection.
 * @param {Number} contentIdx The index of the selected content.
 */
ContentStreamer.prototype.updateUIForContentSelection = function(contentIdx) {
  console.log("Updating UI for content selection (placeholder): " + contentIdx);
};

/**
 * Placeholder for refreshing the status display message.
 */
ContentStreamer.prototype.refreshStatusDisplay = function() {
  console.log("Refreshing status display (placeholder)...");
};


})();