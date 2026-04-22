(function() {
  'use strict';

  // --- Core Configuration Constants ---
  const STREAM_BASE_PATH = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
  const MANIFEST_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/videos.json';
  const DISPLAY_METER_PIXELS = 600; // Visual width for progress elements

  // --- Device Status Definitions ---
  const CAST_DEVICE_STATUS = {
    'IDLE_STATE': 'IDLE',
    'ACTIVE_SESSION': 'ACTIVE',
    'WARNING_STATE': 'WARNING',
    'ERROR_STATE': 'ERROR'
  };

  // --- Media Playback Status Definitions ---
  const MEDIA_PLAYBACK_STATUS = {
    'INACTIVE': 'INACTIVE',
    'BUFFERING': 'BUFFERING',
    'READY': 'READY',
    'PLAYING': 'PLAYING',
    'PAUSED': 'PAUSED',
    'STOPPED': 'STOPPED',
    'SEEKING': 'SEEKING',
    'FAULTED': 'FAULTED'
  };

  /**
   * Main controller for media streaming, handling both local and Cast playback.
   * Manages device states, media sessions, and UI synchronization.
   */
  const StreamPilotController = function() {
    // Current state of connected Cast device
    this.currentDeviceStatus = CAST_DEVICE_STATUS.IDLE_STATE;

    // Flag indicating if any Cast receivers are discoverable
    this.areReceiversOnline = false;

    // Active Cast media session object
    this.activeStreamSession = null;

    // Playback volume (0.0 to 1.0)
    this.playbackVolume = 0.5;

    // Should media start playing immediately after loading?
    this.autoInitiatePlayback = true;

    // The current Cast session object
    this.activeCastSession = null;

    // Playback status when using Cast
    this.castStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;

    // Playback status when using the local player
    this.localStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;

    // Reference to the local HTML5 video element
    this.primaryLocalPlayer = null;

    // Is the local player in full-screen mode?
    this.isFullScreenMode = false;

    // Is audio currently enabled? (Currently unused, but kept for structural similarity)
    this.isAudioEnabled = true;

    // Index of the currently selected media item in the content manifest
    this.activeMediaIndex = 0;

    // Elapsed time of the current media playback
    this.elapsedStreamTime = 0;

    // Total duration of the current media
    this.totalStreamDuration = -1;

    // Timer for updating the playback progress bar
    this.progressUpdateTimer = null;

    // Interval for progress bar updates in milliseconds
    this.timerIntervalMs = 1000;

    // The parsed JSON object containing all media content details
    this.contentManifest = null;

    // Perform initial setup for both local and Cast environments
    this.setupLocalPlaybackEngine();
    this.initializeCastSystem();
  };

  /**
   * Configures the HTML5 video player for local playback.
   */
  StreamPilotController.prototype.setupLocalPlaybackEngine = function() {
    this.primaryLocalPlayer = document.getElementById('main_video_player');
    if (this.primaryLocalPlayer) {
      this.primaryLocalPlayer.addEventListener('loadeddata', this.onLocalMediaReady.bind(this));
    } else {
      console.error('Local video player element not found.');
    }
  };

  /**
   * Initializes the Google Cast API and sets up listeners.
   * Retries initialization if the API is not yet available.
   */
  StreamPilotController.prototype.initializeCastSystem = function() {
    // Delay initialization if Cast API is not present
    if (typeof chrome === 'undefined' || typeof chrome.cast === 'undefined' || !chrome.cast.isAvailable) {
      setTimeout(this.initializeCastSystem.bind(this), 1500); // Wait a bit longer
      return;
    }

    // Default application ID (replace with your custom ID if needed)
    const receiverAppId = '4F8B3483';

    // Policy for automatically joining existing Cast sessions
    const sessionJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;

    // Create a session request for the specified application
    const sessionInitiationRequest = new chrome.cast.SessionRequest(receiverAppId);

    // Configure the Cast API with listeners and policies
    const castApiConfiguration = new chrome.cast.ApiConfig(
      sessionInitiationRequest,
      this.onSessionEstablished.bind(this),
      this.onReceiverAvailabilityChange.bind(this),
      sessionJoinPolicy
    );

    // Initialize the Cast API
    chrome.cast.initialize(castApiConfiguration, this.handleCastInitSuccess.bind(this), this.handleGenericError.bind(this, 'Cast API Initialization Failed'));

    // Populate the UI with video thumbnails
    this.populateContentThumbnails();
    // Set up interactive elements of the user interface
    this.initializeUserInterface();
  };

  /**
   * Callback executed upon successful Cast API initialization.
   */
  StreamPilotController.prototype.handleCastInitSuccess = function() {
    console.log(`[${Date.now()}] Cast API successfully initialized.`);
    this.refreshControlPanelState();
  };

  /**
   * Generic error handler for Cast operations.
   * @param {string} errorMessage - A descriptive error message.
   */
  StreamPilotController.prototype.handleGenericError = function(errorMessage, errorDetails) {
    console.error(`[${Date.now()}] Error: ${errorMessage}`, errorDetails);
    // Potentially update UI to show error state or message
  };

  /**
   * Handles the establishment of a Cast session.
   * This is triggered when a new session is created or an existing one is joined.
   * @param {!Object} newSession - The newly established Cast session object.
   */
  StreamPilotController.prototype.onSessionEstablished = function(newSession) {
    this.activeCastSession = newSession;
    if (this.activeCastSession) {
      this.currentDeviceStatus = CAST_DEVICE_STATUS.ACTIVE_SESSION;
      const mediaList = this.activeCastSession.media;
      if (mediaList && mediaList.length > 0) {
        const primaryMedia = mediaList[0];
        this.onStreamMediaDiscovered('autoJoin', primaryMedia);
        this.synchronizeStreamContext(primaryMedia.media.contentId);
        this.updateContentSelectionUI(this.activeMediaIndex);
        this.updateStatusDisplay();
      } else {
        // If no media is active in the session, load the current local media
        this.loadStreamContent(this.activeMediaIndex);
      }
      this.activeCastSession.addUpdateListener(this.onCastSessionUpdate.bind(this));
    } else {
      console.warn(`[${Date.now()}] Cast session established but object is null.`);
    }
  };

  /**
   * Matches the current Cast media content to an index in the local manifest.
   * @param {string} castContentUrl - The URL of the media currently playing on Cast.
   */
  StreamPilotController.prototype.synchronizeStreamContext = function(castContentUrl) {
    if (!this.contentManifest) {
      console.warn(`[${Date.now()}] Content manifest not loaded, cannot sync media.`);
      return;
    }
    for (let idx = 0; idx < this.contentManifest.length; idx++) {
      if (castContentUrl === this.contentManifest[idx].sources[0]) {
        this.activeMediaIndex = idx;
        return;
      }
    }
    console.warn(`[${Date.now()}] No matching media found for URL: ${castContentUrl}`);
  };

  /**
   * Callback for when Cast receiver availability changes.
   * @param {string} availabilityStatus - 'available' or 'unavailable'.
   */
  StreamPilotController.prototype.onReceiverAvailabilityChange = function(availabilityStatus) {
    this.areReceiversOnline = (availabilityStatus === 'available');
    this.refreshControlPanelState();
    console.log(`[${Date.now()}] Receiver availability: ${availabilityStatus}`);
  };

  /**
   * Listener for updates to the active Cast session (e.g., session termination).
   * @param {boolean} isSessionAlive - True if the session is still active, false otherwise.
   */
  StreamPilotController.prototype.onCastSessionUpdate = function(isSessionAlive) {
    if (!isSessionAlive) {
      this.activeCastSession = null;
      this.currentDeviceStatus = CAST_DEVICE_STATUS.IDLE_STATE;
      this.castStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;
      this.activeStreamSession = null;
      clearInterval(this.progressUpdateTimer);
      this.updateStatusDisplay();

      // If online, gracefully transition to local playback
      if (navigator.onLine) {
        console.log(`[${Date.now()}] Cast session ended, resuming local playback from: ${this.elapsedStreamTime}s`);
        this.activateLocalPlayback();
        this.refreshControlPanelState();
      }
    }
  };

  /**
   * Selects a media item from the manifest and initiates playback.
   * @param {number} contentIndex - The index of the chosen media item.
   */
  StreamPilotController.prototype.chooseStreamContent = function(contentIndex) {
    if (contentIndex < 0 || !this.contentManifest || contentIndex >= this.contentManifest.length) {
      console.error(`[${Date.now()}] Invalid media content index: ${contentIndex}`);
      return;
    }

    this.activeMediaIndex = contentIndex;
    this.elapsedStreamTime = 0; // Reset playback time for new selection

    // Reset progress bar UI elements
    const progressBar = document.getElementById("progress_bar");
    const progressIndicator = document.getElementById("progress_handle");
    if (progressBar && progressIndicator) {
      progressBar.style.width = '0px';
      progressIndicator.style.marginLeft = `${-21 - DISPLAY_METER_PIXELS}px`;
    }

    if (!this.activeStreamSession) { // No active Cast session, play locally
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;
      this.activateLocalPlayback();
    } else { // Active Cast session, load on Cast device
      this.castStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;
      this.loadStreamContent(this.activeMediaIndex);
    }
    this.updateContentSelectionUI(contentIndex);
  };

  /**
   * Initiates a request to start or join a Cast application session.
   */
  StreamPilotController.prototype.startCastApplication = function() {
    console.log(`[${Date.now()}] Attempting to launch Cast application...`);
    chrome.cast.requestSession(
      this.handleRequestSessionSuccess.bind(this),
      this.handleApplicationLaunchError.bind(this, 'Failed to request Cast session')
    );
    if (this.progressUpdateTimer) {
      clearInterval(this.progressUpdateTimer);
    }
  };

  /**
   * Callback for successful Cast session request.
   * @param {Object} sessionObj - The chrome.cast.Session object.
   */
  StreamPilotController.prototype.handleRequestSessionSuccess = function(sessionObj) {
    console.log(`[${Date.now()}] Cast session established: ${sessionObj.sessionId}`);
    this.activeCastSession = sessionObj;
    this.currentDeviceStatus = CAST_DEVICE_STATUS.ACTIVE_SESSION;
    this.refreshControlPanelState();
    this.loadStreamContent(this.activeMediaIndex);
    this.activeCastSession.addUpdateListener(this.onCastSessionUpdate.bind(this));
  };

  /**
   * Callback for errors encountered during Cast application launch.
   * @param {string} message - Error message.
   * @param {Object} error - Error object from Cast API.
   */
  StreamPilotController.prototype.handleApplicationLaunchError = function(message, error) {
    console.error(`[${Date.now()}] Application launch error: ${message}`, error);
    this.currentDeviceStatus = CAST_DEVICE_STATUS.ERROR_STATE;
    this.refreshControlPanelState();
  };

  /**
   * Stops the running Cast application associated with the current session.
   */
  StreamPilotController.prototype.terminateCastApplication = function() {
    if (this.activeCastSession) {
      this.activeCastSession.stop(
        this.onApplicationTerminationSuccess.bind(this, 'Cast session successfully stopped.'),
        this.handleGenericError.bind(this, 'Failed to stop Cast session.')
      );
    } else {
      console.warn(`[${Date.now()}] No active Cast session to stop.`);
    }
  };

  /**
   * Callback for successful termination of the Cast application.
   * @param {string} confirmationMessage - Message confirming the stop operation.
   */
  StreamPilotController.prototype.onApplicationTerminationSuccess = function(confirmationMessage) {
    console.log(`[${Date.now()}] ${confirmationMessage}`);
    this.currentDeviceStatus = CAST_DEVICE_STATUS.IDLE_STATE;
    this.castStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;
    this.activeStreamSession = null;
    clearInterval(this.progressUpdateTimer);
    this.updateStatusDisplay();

    // Transition to local playback from the last known Cast time
    console.log(`[${Date.now()}] Current media time when stopping Cast: ${this.elapsedStreamTime}s`);
    this.activateLocalPlayback();
    this.refreshControlPanelState();
  };

  /**
   * Loads the selected media content onto the active Cast receiver.
   * @param {number} contentIndex - The index of the media item to load.
   */
  StreamPilotController.prototype.loadStreamContent = function(contentIndex) {
    if (!this.activeCastSession) {
      console.warn(`[${Date.now()}] Cannot load media: No active Cast session.`);
      return;
    }
    if (!this.contentManifest || contentIndex < 0 || contentIndex >= this.contentManifest.length) {
      console.error(`[${Date.now()}] Invalid content index or manifest not loaded for loading: ${contentIndex}`);
      return;
    }

    const mediaItem = this.contentManifest[contentIndex];
    console.log(`[${Date.now()}] Loading media: ${mediaItem.title}`);

    const mediaInfo = new chrome.cast.media.MediaInfo(mediaItem.sources[0]);
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
    mediaInfo.contentType = 'video/mp4'; // Assuming MP4 for simplicity

    mediaInfo.metadata.title = mediaItem.title;
    mediaInfo.metadata.images = [{
      url: STREAM_BASE_PATH + mediaItem.thumb
    }];

    const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
    loadRequest.autoplay = this.autoInitiatePlayback;

    // If local player was active, transfer its current time to the Cast session
    const wasLocalPlaying = (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING);
    if (wasLocalPlaying) {
      loadRequest.currentTime = this.primaryLocalPlayer.currentTime;
      this.primaryLocalPlayer.pause();
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.STOPPED;
    } else {
      loadRequest.currentTime = 0;
    }

    this.castStreamStatus = MEDIA_PLAYBACK_STATUS.BUFFERING;
    this.activeCastSession.loadMedia(
      loadRequest,
      this.onStreamMediaDiscovered.bind(this, 'loadOperation'),
      this.handleStreamLoadError.bind(this)
    );

    // Update UI with current media details
    document.getElementById("display_title_area").textContent = mediaItem.title;
    document.getElementById("display_subtitle_area").textContent = mediaItem.subtitle;
    document.getElementById("display_description_area").textContent = mediaItem.description;
  };

  /**
   * Callback for when media is discovered or loaded on the Cast device.
   * @param {string} discoveryMethod - Indicates how the media was discovered ('loadOperation', 'autoJoin').
   * @param {Object} mediaSession - The chrome.cast.media.Media object representing the loaded media.
   */
  StreamPilotController.prototype.onStreamMediaDiscovered = function(discoveryMethod, mediaSession) {
    console.log(`[${Date.now()}] New Cast media session ID: ${mediaSession.mediaSessionId} (method: ${discoveryMethod})`);
    this.activeStreamSession = mediaSession;

    if (discoveryMethod === 'loadOperation') {
      this.castStreamStatus = this.autoInitiatePlayback ? MEDIA_PLAYBACK_STATUS.PLAYING : MEDIA_PLAYBACK_STATUS.READY;
    } else if (discoveryMethod === 'autoJoin') {
      this.castStreamStatus = mediaSession.playerState;
      this.elapsedStreamTime = mediaSession.currentTime;
    }

    if (this.castStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING) {
      this.startProgressTracker(this.advancePlaybackTime);
    }

    this.activeStreamSession.addUpdateListener(this.onStreamStatusChange.bind(this));
    this.totalStreamDuration = this.activeStreamSession.media.duration;

    // Format and display media duration
    document.getElementById("media_duration_display").textContent = this.formatTime(this.totalStreamDuration);

    // If local player was active, hide it and update its status
    if (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING) {
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.STOPPED;
      document.getElementById('video_poster_image').style.display = 'block';
      this.primaryLocalPlayer.style.display = 'none';
      this.startProgressTracker(this.advancePlaybackTime); // Ensure timer is running if local playback was paused
    }

    // Update all relevant UI components
    this.refreshControlPanelState();
    this.updateStatusDisplay();
  };

  /**
   * Callback for errors during media loading on Cast.
   * @param {Object} error - The error object.
   */
  StreamPilotController.prototype.handleStreamLoadError = function(error) {
    console.error(`[${Date.now()}] Cast media load error:`, error);
    this.castStreamStatus = MEDIA_PLAYBACK_STATUS.FAULTED;
    this.refreshControlPanelState();
    this.updateStatusDisplay();
  };

  /**
   * Callback for status updates from the Cast media session.
   * @param {!boolean} isAlive - True if the media session is still active.
   */
  StreamPilotController.prototype.onStreamStatusChange = function(isAlive) {
    if (!isAlive) {
      this.elapsedStreamTime = 0;
      this.castStreamStatus = MEDIA_PLAYBACK_STATUS.INACTIVE;
      clearInterval(this.progressUpdateTimer); // Stop timer if session died
    }
    console.log(`[${Date.now()}] Cast media status updated. Session active: ${isAlive}`);
    this.updateProgressBarBasedOnStatus();
    this.updateStatusDisplay();
    this.refreshControlPanelState();
  };

  /**
   * Utility to format a time in seconds into a human-readable string (MM:SS or HH:MM:SS).
   * @param {number} totalSeconds - The total number of seconds.
   * @returns {string} Formatted time string.
   */
  StreamPilotController.prototype.formatTime = function(totalSeconds) {
    let seconds = Math.floor(totalSeconds % 60);
    let minutes = Math.floor((totalSeconds / 60) % 60);
    let hours = Math.floor(totalSeconds / 3600);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      return `${minutes}:${pad(seconds)}`;
    }
  };

  /**
   * Advances the current media playback time by one second.
   * This function is called repeatedly by the progress update timer.
   */
  StreamPilotController.prototype.advancePlaybackTime = function() {
    const isPlaying = (this.castStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING || this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING);

    if (isPlaying) {
      if (this.elapsedStreamTime < this.totalStreamDuration) {
        this.elapsedStreamTime += 1;
        this.updateProgressBarVisually();
      } else {
        // Media has finished playing
        this.elapsedStreamTime = 0;
        clearInterval(this.progressUpdateTimer);
        this.progressUpdateTimer = null;
        // Optionally, transition to next media or stop
      }
    }
  };

  /**
   * Initiates playback of the selected media using the local HTML5 video player.
   */
  StreamPilotController.prototype.activateLocalPlayback = function() {
    const posterElement = document.getElementById('video_poster_image');
    if (posterElement) posterElement.style.display = 'none';
    if (this.primaryLocalPlayer) this.primaryLocalPlayer.style.display = 'block';

    const isCurrentlyPlayingOrPaused = (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING || this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PAUSED);

    if (!isCurrentlyPlayingOrPaused) {
      if (!this.contentManifest || this.activeMediaIndex < 0 || this.activeMediaIndex >= this.contentManifest.length) {
        console.error(`[${Date.now()}] Cannot activate local playback: Invalid media index or manifest.`);
        return;
      }
      this.primaryLocalPlayer.src = this.contentManifest[this.activeMediaIndex].sources[0];
      this.primaryLocalPlayer.load();
      this.primaryLocalPlayer.currentTime = this.elapsedStreamTime; // Set starting time
      this.primaryLocalPlayer.play();
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.PLAYING;
      this.startProgressTracker(this.trackLocalPlayerProgress);
    } else if (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PAUSED) {
      this.primaryLocalPlayer.play();
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.PLAYING;
      this.startProgressTracker(this.trackLocalPlayerProgress);
    }

    // Update UI with local media details
    const currentMedia = this.contentManifest[this.activeMediaIndex];
    document.getElementById("display_title_area").textContent = currentMedia.title;
    document.getElementById("display_subtitle_area").textContent = currentMedia.subtitle;
    document.getElementById("display_description_area").textContent = currentMedia.description;

    this.refreshControlPanelState();
    this.updateStatusDisplay();
  };

  /**
   * Callback for when local media is loaded and ready to play.
   */
  StreamPilotController.prototype.onLocalMediaReady = function() {
    console.log(`[${Date.now()}] Local media loaded and ready.`);
    this.totalStreamDuration = this.primaryLocalPlayer.duration;
    document.getElementById("media_duration_display").textContent = this.formatTime(this.totalStreamDuration);
    if (this.autoInitiatePlayback) {
      this.primaryLocalPlayer.play();
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.PLAYING;
      this.startProgressTracker(this.trackLocalPlayerProgress);
    } else {
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.READY;
    }
    this.refreshControlPanelState();
    this.updateStatusDisplay();
  };

  /**
   * Tracks the progress of the local player.
   * This is a separate progress tracker specifically for the HTML5 video element.
   */
  StreamPilotController.prototype.trackLocalPlayerProgress = function() {
    this.elapsedStreamTime = this.primaryLocalPlayer.currentTime;
    this.updateProgressBarVisually();
    if (this.primaryLocalPlayer.ended) {
      clearInterval(this.progressUpdateTimer);
      this.progressUpdateTimer = null;
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.STOPPED;
      this.elapsedStreamTime = 0;
      this.refreshControlPanelState();
      this.updateStatusDisplay();
    }
  };

  /**
   * Toggles playback state (play/pause) for either Cast or local player.
   */
  StreamPilotController.prototype.togglePlayback = function() {
    if (this.activeCastSession && this.activeStreamSession) {
      this.toggleCastPlayback();
    } else {
      this.toggleLocalPlayback();
    }
  };

  /**
   * Toggles play/pause for the Cast media session.
   */
  StreamPilotController.prototype.toggleCastPlayback = function() {
    if (!this.activeStreamSession) {
      console.warn(`[${Date.now()}] No active Cast media session to toggle playback.`);
      return;
    }

    const mediaRequest = new chrome.cast.media.PauseRequest();
    if (this.castStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING) {
      this.activeStreamSession.pause(
        () => {
          console.log(`[${Date.now()}] Cast media paused.`);
          this.castStreamStatus = MEDIA_PLAYBACK_STATUS.PAUSED;
          clearInterval(this.progressUpdateTimer);
          this.refreshControlPanelState();
          this.updateStatusDisplay();
        },
        this.handleGenericError.bind(this, 'Failed to pause Cast media.')
      );
    } else if (this.castStreamStatus === MEDIA_PLAYBACK_STATUS.PAUSED || this.castStreamStatus === MEDIA_PLAYBACK_STATUS.READY) {
      this.activeStreamSession.play(
        () => {
          console.log(`[${Date.now()}] Cast media playing.`);
          this.castStreamStatus = MEDIA_PLAYBACK_STATUS.PLAYING;
          this.startProgressTracker(this.advancePlaybackTime);
          this.refreshControlPanelState();
          this.updateStatusDisplay();
        },
        this.handleGenericError.bind(this, 'Failed to play Cast media.')
      );
    }
  };

  /**
   * Toggles play/pause for the local HTML5 video player.
   */
  StreamPilotController.prototype.toggleLocalPlayback = function() {
    if (!this.primaryLocalPlayer) {
      console.warn(`[${Date.now()}] No local player available to toggle playback.`);
      return;
    }

    if (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING) {
      this.primaryLocalPlayer.pause();
      this.localStreamStatus = MEDIA_PLAYBACK_STATUS.PAUSED;
      clearInterval(this.progressUpdateTimer);
      console.log(`[${Date.now()}] Local media paused.`);
    } else if (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PAUSED || this.localStreamStatus === MEDIA_PLAYBACK_STATUS.READY || this.localStreamStatus === MEDIA_PLAYBACK_STATUS.INACTIVE || this.localStreamStatus === MEDIA_PLAYBACK_STATUS.STOPPED) {
      // If stopped or inactive, load and play the current media
      if (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.STOPPED || this.localStreamStatus === MEDIA_PLAYBACK_STATUS.INACTIVE) {
        this.activateLocalPlayback();
      } else {
        this.primaryLocalPlayer.play();
        this.localStreamStatus = MEDIA_PLAYBACK_STATUS.PLAYING;
        this.startProgressTracker(this.trackLocalPlayerProgress);
      }
      console.log(`[${Date.now()}] Local media playing.`);
    }
    this.refreshControlPanelState();
    this.updateStatusDisplay();
  };


  // --- UI Management Functions ---

  /**
   * Dynamically adds video thumbnails to the UI based on the content manifest.
   */
  StreamPilotController.prototype.populateContentThumbnails = function() {
    const galleryContainer = document.getElementById('media_gallery');
    if (!galleryContainer) {
      console.error('Media gallery container not found.');
      return;
    }

    fetch(MANIFEST_URL)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        this.contentManifest = data.categories[0].videos; // Assuming a specific structure
        galleryContainer.innerHTML = ''; // Clear existing content

        this.contentManifest.forEach((item, index) => {
          const thumbDiv = document.createElement('div');
          thumbDiv.className = 'video-thumb';
          thumbDiv.dataset.index = index;
          thumbDiv.onclick = () => this.chooseStreamContent(index);

          const img = document.createElement('img');
          img.src = STREAM_BASE_PATH + item.thumb;
          img.alt = item.title;

          const titleSpan = document.createElement('span');
          titleSpan.textContent = item.title;

          thumbDiv.appendChild(img);
          thumbDiv.appendChild(titleSpan);
          galleryContainer.appendChild(thumbDiv);
        });

        // Initialize display with the first media item
        if (this.contentManifest.length > 0) {
          this.updateContentSelectionUI(0);
          this.loadInitialMediaDetails(0);
        }
      })
      .catch(error => console.error(`[${Date.now()}] Failed to load content manifest:`, error));
  };

  /**
   * Initializes various UI elements and attaches event listeners.
   */
  StreamPilotController.prototype.initializeUserInterface = function() {
    document.getElementById('cast_button').addEventListener('click', () => {
      if (this.currentDeviceStatus === CAST_DEVICE_STATUS.IDLE_STATE) {
        this.startCastApplication();
      } else if (this.currentDeviceStatus === CAST_DEVICE_STATUS.ACTIVE_SESSION) {
        this.terminateCastApplication();
      }
    });

    document.getElementById('play_pause_button').addEventListener('click', this.togglePlayback.bind(this));

    const progressBar = document.getElementById("progress_bar");
    if (progressBar) {
      progressBar.addEventListener('click', this.seekToPosition.bind(this));
    }
  };

  /**
   * Updates the UI to reflect the selected media item.
   * @param {number} index - The index of the currently selected media.
   */
  StreamPilotController.prototype.updateContentSelectionUI = function(index) {
    const thumbnails = document.querySelectorAll('.video-thumb');
    thumbnails.forEach((thumb, idx) => {
      if (idx === index) {
        thumb.classList.add('selected');
      } else {
        thumb.classList.remove('selected');
      }
    });
  };

  /**
   * Loads initial media details (title, subtitle, description) into the display area.
   * @param {number} index - The index of the media item to display.
   */
  StreamPilotController.prototype.loadInitialMediaDetails = function(index) {
    if (!this.contentManifest || index < 0 || index >= this.contentManifest.length) {
      console.warn(`[${Date.now()}] Cannot load initial details: Invalid index or manifest.`);
      return;
    }
    const mediaItem = this.contentManifest[index];
    document.getElementById("display_title_area").textContent = mediaItem.title;
    document.getElementById("display_subtitle_area").textContent = mediaItem.subtitle;
    document.getElementById("display_description_area").textContent = mediaItem.description;
    document.getElementById("video_poster_image").src = STREAM_BASE_PATH + mediaItem.thumb;
  };

  /**
   * Updates the main control panel buttons and indicators based on current state.
   */
  StreamPilotController.prototype.refreshControlPanelState = function() {
    const castButton = document.getElementById('cast_button');
    const playPauseButton = document.getElementById('play_pause_button');
    const playPauseIcon = document.getElementById('play_pause_icon');
    const mediaControls = document.getElementById('media_controls');

    // Update Cast button state
    if (this.areReceiversOnline) {
      castButton.style.display = 'block';
      if (this.currentDeviceStatus === CAST_DEVICE_STATUS.ACTIVE_SESSION) {
        castButton.classList.add('active');
        castButton.textContent = 'Stop Casting';
      } else {
        castButton.classList.remove('active');
        castButton.textContent = 'Cast';
      }
    } else {
      castButton.style.display = 'none';
    }

    // Update Play/Pause button state
    if (this.currentDeviceStatus === CAST_DEVICE_STATUS.ACTIVE_SESSION) {
      mediaControls.classList.add('cast-active');
      if (this.castStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING) {
        playPauseIcon.className = 'fa fa-pause';
      } else {
        playPauseIcon.className = 'fa fa-play';
      }
    } else {
      mediaControls.classList.remove('cast-active');
      if (this.localStreamStatus === MEDIA_PLAYBACK_STATUS.PLAYING) {
        playPauseIcon.className = 'fa fa-pause';
      } else {
        playPauseIcon.className = 'fa fa-play';
      }
    }
  };

  /**
   * Updates the progress bar visually based on elapsed time and total duration.
   */
  StreamPilotController.prototype.updateProgressBarVisually = function() {
    const progressBar = document.getElementById("progress_bar");
    const progressHandle = document.getElementById("progress_handle");
    const currentTimeDisplay = document.getElementById("current_time_display");

    if (progressBar && progressHandle && currentTimeDisplay && this.totalStreamDuration > 0) {
      const progressFraction = this.elapsedStreamTime / this.totalStreamDuration;
      const barWidth = progressFraction * DISPLAY_METER_PIXELS;
      progressBar.style.width = `${barWidth}px`;
      progressHandle.style.marginLeft = `${barWidth - 21}px`; // Adjust for handle width

      currentTimeDisplay.textContent = this.formatTime(this.elapsedStreamTime);
    }
  };

  /**
   * Initiates or restarts the progress tracking timer.
   * @param {function} updateFn - The function to call periodically for updates.
   */
  StreamPilotController.prototype.startProgressTracker = function(updateFn) {
    if (this.progressUpdateTimer) {
      clearInterval(this.progressUpdateTimer);
    }
    this.progressUpdateTimer = setInterval(updateFn.bind(this), this.timerIntervalMs);
  };

  /**
   * Updates the progress bar, specifically for status events that might provide exact time.
   * @param {Object} [statusEvent] - Optional media status event object.
   */
  StreamPilotController.prototype.updateProgressBarBasedOnStatus = function(statusEvent) {
    // If an event provides current time, use it
    if (statusEvent && statusEvent.currentTime !== undefined) {
      this.elapsedStreamTime = statusEvent.currentTime;
    }
    this.updateProgressBarVisually();
  };

  /**
   * Updates the message displayed to the user regarding current device/playback state.
   */
  StreamPilotController.prototype.updateStatusDisplay = function() {
    const statusTextElement = document.getElementById('status_message');
    if (!statusTextElement) return;

    let message = '';
    switch (this.currentDeviceStatus) {
      case CAST_DEVICE_STATUS.ACTIVE_SESSION:
        message = `Casting: ${this.castStreamStatus}`;
        break;
      case CAST_DEVICE_STATUS.WARNING_STATE:
        message = 'Cast device in warning state.';
        break;
      case CAST_DEVICE_STATUS.ERROR_STATE:
        message = 'Cast error occurred.';
        break;
      default: // IDLE_STATE
        message = `Local Playback: ${this.localStreamStatus}`;
        if (this.areReceiversOnline) {
          message += ' (Cast devices available)';
        }
        break;
    }
    statusTextElement.textContent = message;
  };

  /**
   * Handles seeking to a new position in the media based on a click on the progress bar.
   * @param {Event} event - The click event.
   */
  StreamPilotController.prototype.seekToPosition = function(event) {
    const progressBarContainer = document.getElementById('progress_container');
    if (!progressBarContainer || this.totalStreamDuration <= 0) return;

    const clickX = event.clientX - progressBarContainer.getBoundingClientRect().left;
    const seekFraction = Math.max(0, Math.min(1, clickX / DISPLAY_METER_PIXELS));
    const seekTime = seekFraction * this.totalStreamDuration;

    if (this.activeCastSession && this.activeStreamSession) {
      this.seekCastMedia(seekTime);
    } else if (this.primaryLocalPlayer) {
      this.seekLocalMedia(seekTime);
    }
  };

  /**
   * Sends a seek request to the Cast media session.
   * @param {number} targetTime - The time in seconds to seek to.
   */
  StreamPilotController.prototype.seekCastMedia = function(targetTime) {
    if (!this.activeStreamSession) {
      console.warn(`[${Date.now()}] No active Cast media session to seek.`);
      return;
    }

    const seekRequest = new chrome.cast.media.SeekRequest();
    seekRequest.currentTime = targetTime;

    this.activeStreamSession.seek(
      () => {
        console.log(`[${Date.now()}] Cast media seeked to: ${targetTime}s`);
        this.elapsedStreamTime = targetTime;
        this.castStreamStatus = MEDIA_PLAYBACK_STATUS.PLAYING; // Assume playing after seek
        this.updateProgressBarVisually();
      },
      this.handleGenericError.bind(this, 'Failed to seek Cast media.')
    );
  };

  /**
   * Seeks the local HTML5 video player to a new position.
   * @param {number} targetTime - The time in seconds to seek to.
   */
  StreamPilotController.prototype.seekLocalMedia = function(targetTime) {
    if (!this.primaryLocalPlayer) {
      console.warn(`[${Date.now()}] No local player available to seek.`);
      return;
    }
    this.primaryLocalPlayer.currentTime = targetTime;
    this.elapsedStreamTime = targetTime;
    this.updateProgressBarVisually();
    console.log(`[${Date.now()}] Local media seeked to: ${targetTime}s`);
  };


  // Expose the controller globally for UI interaction
  window.streamPilot = new StreamPilotController();

})();