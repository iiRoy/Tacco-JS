/*
   Audio Engine Core: Modern Web Audio Management
   -----------------------------------------------
   https://example.com/audioengine/ (hypothetical new project URL)

   Copyright (c) 2023, Your Name/Company. All rights reserved.
   Licensed under the MIT License:
   https://opensource.org/licenses/MIT

   Version 3.1.0.20231027
*/

var globalAudioEngine = null;
var DEFER_AUDIO_ENGINE_INIT = true; // Flag to delay engine startup

/**
 * Core class for managing audio playback via a plugin (e.g., Flash).
 * @param {string} corePath - Path to the plugin SWF file.
 * @param {string} instanceId - Unique ID for the plugin instance.
 */
function AudioEngineCore(corePath, instanceId) {
  // --- Core Configuration Settings ---
  this.pluginVersion = 9;             // Required plugin version (8 or 9). Flash 9 offers more features.
  this.verboseLogging = true;         // Enable detailed logging to console/debug element.
  this.logToConsole = true;           // Use browser's console.log() if available.
  this.consoleExclusive = false;      // If using console, do not write to a debug HTML element.
  this.deferUntilWindowLoad = false;  // Wait for window.onload before signaling engine ready.
  this.emptyAudioClipPath = 'assets/null.mp3'; // Path to a minimal MP3, used for unloading (Plugin 8 only).
  this.enableStatusPolling = true;    // Allow plugin to periodically report playback status (needed for `onPlaybackTick`, peak data etc.).
  this.enableAdvancedFormats = false; // Enable support for Plugin 9.0r115+ MPEG4 formats (AAC, M4V, FLV, MOV etc.).
  this.pluginBackgroundColor = '#ffffff'; // Plugin embed background color.
  this.optimizePluginPosition = false; // Use `position:fixed` for plugin for potentially better JS/plugin communication.
  this.pluginLoadTimeoutMs = 1200;    // Milliseconds to wait for plugin to load before declaring failure (0 = infinite).
  this.pluginRenderMode = null;       // Rendering mode for the plugin: null, 'transparent', 'opaque'.
  this.allowFullscreenPlayback = true; // Allow fullscreen mode for Plugin 9+ video.

  // --- Default Audio Track Settings ---
  this.baseSoundSettings = {
    'preloadContent': false,          // Automatically load audio content upon creation.
    'streamOnDemand': true,           // Allow playback to start before entire file is downloaded (recommended).
    'startPlaybackImmediately': false,// Begin playback as soon as possible (works best with `streamOnDemand: true`).
    'onMetaDataReceived': null,       // Callback when ID3 or other metadata is available.
    'onContentReady': null,           // Callback when entire content has finished loading.
    'onDownloadProgress': null,       // Callback during content download (bytes received/total).
    'onPlaybackStart': null,          // Callback when playback begins.
    'onPlaybackPause': null,          // Callback when playback is paused.
    'onPlaybackResume': null,         // Callback when playback is resumed from a pause.
    'onPlaybackTick': null,           // Callback during active playback (position updates).
    'onPlaybackStop': null,           // Callback when playback is explicitly stopped by user/API.
    'onPlaybackComplete': null,       // Callback when playback naturally finishes.
    'onPreFinishEvent': null,         // Callback triggered before end of sound.
    'preFinishOffsetMs': 5000,        // Time (ms) before end of sound to trigger `onPreFinishEvent`.
    'onPreFinishCallback': null,      // Function to call when `onPreFinishEvent` fires AND sound finishes.
    'onNearEndEvent': null,           // Callback for a very short duration before end of current sound.
    'nearEndOffsetMs': 200,           // Time (ms) for `onNearEndEvent`. Set to 0 to disable.
    'allowLayeredPlayback': true,     // Allow multiple instances of the same sound to play concurrently.
    'initialSeekPosition': null,      // Starting position (ms) within the audio data.
    'stereoBalance': 0,               // Stereo pan: -100 (left) to 100 (right).
    'outputVolume': 100               // Volume level: 0-100.
  };

  // --- Plugin 9+ Specific Settings ---
  this.advancedPluginSettings = {
    'isAdvancedFormat': null,         // For 'MovieStar' content. Null = auto-detect. true = force advanced format.
    'enablePeakAnalysis': false,      // Enable left/right channel peak data.
    'enableWaveformAnalysis': false,  // Enable raw waveform data (CPU intensive).
    'enableEQAnalysis': false,        // Enable frequency spectrum data (CPU intensive).
    'onBufferStatusChange': null,     // Callback for buffering status changes.
    'onAnalysisDataError': null       // Callback for waveform/EQ data access errors.
  };

  // --- Video Playback Settings (Plugin 9.0r115+ "MovieStar") ---
  this.videoPlaybackSettings = {
    'onVideoMetadata': null,          // Callback for video metadata (width, height, etc.).
    'enableVideoOutput': false,       // Whether to display video for advanced formats.
    'videoBufferTimeSec': null        // Seconds of data to buffer before playback. (null = plugin default 0.1s).
  };

  // --- Internal State and Utilities ---
  /* global AudioTrack, console, document, navigator, setTimeout, window */ // JSLint declarations

  var _selfRef = this; // Self-reference for inner scopes

  this.engineVersionText = null;
  this.engineVersionId = '3.1.0.20231027';
  this.pluginAssetUrl = null;         // Path to the main plugin SWF.
  this.baseUrl = corePath;            // Base URL provided during initialization.
  this.fallbackUrl = null;            // Alternative URL if served locally.
  this.pluginReady = false;           // True when the plugin SWF has successfully loaded.
  this.isActive = false;              // True when the engine is fully initialized and operational.
  this.pluginObject = null;           // Reference to the embedded plugin DOM object.
  this.managerInstanceId = (instanceId || 'aeMovie'); // ID of the plugin DOM element.
  this.activeTracks = {};             // Stores all created AudioTrack instances.
  this.trackIds = [];                 // Array of IDs for active tracks.
  this.isGloballyMuted = false;       // Global mute state.
  this.isPluginFullscreen = false;    // Plugin fullscreen state (Plugin 9+).

  // Browser detection (simplified, may need modern feature detection for robust apps)
  this.isBrowserIE = (navigator.userAgent.match(/MSIE/i) !== null);
  this.isBrowserSafari = (navigator.userAgent.match(/safari/i) !== null);
  this.isBrowserGecko = (navigator.userAgent.match(/gecko/i) !== null);

  this.debugOutputElementId = 'audioengine-debug'; // ID for the debug output DIV.
  this.needsWmodeWorkaround = false;  // Flag for specific plugin rendering issues.
  this._loggingPanelVisible = true;   // Initial state of the debug panel.
  this._pluginAppended = false;       // Has the plugin been added to the DOM?
  this._pluginAppendSuccessful = false; // Was plugin DOM insertion successful?
  this._engineInitialized = false;    // Has the engine completed its initialization routine?
  this._isPermanentlyDisabled = false; // Has the engine been explicitly disabled?
  this._domContentLoaded = false;     // Has `window.onload` fired?
  this._consoleAvailable = (typeof console !== 'undefined' && typeof console.log !== 'undefined');
  this._logSeverityLevels = ['log', 'info', 'warn', 'error'];
  this._fallbackPluginVersion = 8;    // Default plugin version if invalid is specified.
  this._removedPluginRef = null;      // Reference to a removed plugin object.
  this._removedPluginHtml = null;     // HTML of a removed plugin object.

  /**
   * Internal utility to get a DOM element by ID.
   * @param {string} elementId - The ID of the element to retrieve.
   * @returns {HTMLElement|null} The DOM element or null if not found.
   */
  var _getDomElement = function(elementId) {
    return document.getElementById(elementId);
  };

  /**
   * Regex patterns for supported file types.
   */
  this.supportedFileRegex = {
    pluginV8: /\.mp3(\?.*)?$/i,
    pluginV9: /\.mp3(\?.*)?$/i
  };

  /**
   * List of advanced media formats supported by Plugin v9.0r115+ ("MovieStar").
   */
  this.advancedMediaFormats = ['aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'mp4v', '3gp', '3g2'];
  this.advancedFormatRegex = new RegExp('\\.(' + this.advancedMediaFormats.join('|') + ')(\\?.*)?$', 'i');

  this.currentFileRegex = null; // The active regex pattern based on plugin version.

  /**
   * Engine capabilities, determined by plugin version and configuration.
   */
  this.engineCapabilities = {
    streamBuffering: false,
    peakLevelAnalysis: false,
    waveformVisualization: false,
    equalizerAnalysis: false,
    advancedMediaSupport: false // "MovieStar"
  };

  /**
   * Security context information for the plugin.
   * (Primarily for informational logging, actual security handled by browser/plugin).
   */
  this.securityContext = {
    contextType: null,
    contextDefinitions: {
      remoteDomainPolicy: 'remote (domain-based) rules',
      localFileAccess: 'local with file access (no internet access)',
      localNetworkOnly: 'local with network (internet access only, no local access)',
      localTrustedAccess: 'local, trusted (local + internet access)'
    },
    contextDescription: null,
    noRemoteAccess: null,
    noLocalAccess: null
  };

  /**
   * Configures engine version and updates capabilities based on `pluginVersion`.
   * Merges appropriate settings into `baseSoundSettings`.
   */
  this._configureEngineVersion = function() {
    if (_selfRef.pluginVersion !== 8 && _selfRef.pluginVersion !== 9) {
      _selfRef._logWarn('AudioEngineCore.pluginVersion must be 8 or 9. "' + _selfRef.pluginVersion + '" is invalid. Reverting to ' + _selfRef._fallbackPluginVersion + '.');
      _selfRef.pluginVersion = _selfRef._fallbackPluginVersion;
    }

    _selfRef.engineVersionText = _selfRef.engineVersionId + (_selfRef.pluginVersion === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)');

    // Apply Plugin 9+ specific options
    if (_selfRef.pluginVersion > 8) {
      _selfRef.baseSoundSettings = _selfRef._deepMerge(_selfRef.baseSoundSettings, _selfRef.advancedPluginSettings);
      _selfRef.engineCapabilities.streamBuffering = true;
    }

    // Apply MovieStar (advanced format) options if enabled and Plugin 9+
    if (_selfRef.pluginVersion > 8 && _selfRef.enableAdvancedFormats) {
      _selfRef.baseSoundSettings = _selfRef._deepMerge(_selfRef.baseSoundSettings, _selfRef.videoPlaybackSettings);
      _selfRef.supportedFileRegex.pluginV9 = new RegExp('\\.(mp3|' + _selfRef.advancedMediaFormats.join('|') + ')(\\?.*)?$', 'i');
      _selfRef.engineCapabilities.advancedMediaSupport = true;
    } else {
      _selfRef.enableAdvancedFormats = false; // Ensure flag is consistent with capabilities
      _selfRef.engineCapabilities.advancedMediaSupport = false;
    }

    _selfRef.currentFileRegex = _selfRef.supportedFileRegex[(_selfRef.pluginVersion !== 8 ? 'pluginV9' : 'pluginV8')];
    _selfRef.pluginAssetUrl = (_selfRef.pluginVersion === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf');
    _selfRef.engineCapabilities.peakLevelAnalysis = _selfRef.engineCapabilities.waveformVisualization = _selfRef.engineCapabilities.equalizerAnalysis = (_selfRef.pluginVersion > 8);
  };

  this._isServedViaHttp = (document.location && document.location.protocol.match(/http/i) !== null);
  this._pendingExternalInterface = false; // Is external interface communication pending?
  this._initializationQueued = false; // Is engine initialization waiting?
  this._initOnFocusRequired = (this.isBrowserSafari && typeof document.hasFocus === 'undefined'); // Safari quirk
  this._documentHasFocus = (typeof document.hasFocus !== 'undefined' ? document.hasFocus() : null);
  this._canSafelyDisable = !this._initOnFocusRequired; // Can we disable without issues?

  this.useFallbackUrlIfLocal = !this._isServedViaHttp; // Use fallback URL if content is loaded via file://

  var pluginSettingsLink = 'http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html';

  this.messages = {
    engineNotInitialized: 'Engine not yet initialized - wait for audioEngine.onEngineReady() before using audio methods.',
    domAppendError: 'AudioEngineCore._createPluginEmbed(): DOM append failed. Check app/xhtml+xml MIME type.'
  };

  // --- Internal Logging Functions ---
  this._logDebug = function(message, severity) {
    if (!_selfRef.verboseLogging) return;
    severity = (severity === undefined ? 0 : parseInt(severity, 10));
    var level = _selfRef._logSeverityLevels[severity] || 'log';

    if (_selfRef._consoleAvailable && _selfRef.logToConsole) {
      if (console[level]) {
        console[level]('[AudioEngine] ' + message);
      } else {
        console.log('[AudioEngine] ' + level.toUpperCase() + ': ' + message);
      }
    }
    // TODO: Implement writing to debugOutputElementId if consoleExclusive is false
    // For now, only console logging is implemented.
  };

  this._logInfo = function(message) { _selfRef._logDebug(message, 1); };
  this._logWarn = function(message) { _selfRef._logDebug(message, 2); };
  this._logError = function(message) { _selfRef._logDebug(message, 3); };

  /**
   * Raises an error, logging it and potentially throwing.
   * @param {string} message - Error message.
   * @param {function} caller - Optional reference to the calling function (for stack trace, if needed).
   * @returns {Error} The error object.
   */
  this._emitError = function(message) {
    _selfRef._logError(message);
    return new Error(message);
  };

  /**
   * Deep merges properties from source objects into a target object.
   * Modifies and returns the target.
   * @param {object} target - The object to merge into.
   * @param {...object} sources - One or more source objects.
   * @returns {object} The merged target object.
   */
  this._deepMerge = function(target) {
    var sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
            target[key] = _selfRef._deepMerge(target[key] || {}, source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    });
    return target;
  };

  /**
   * Checks if a track ID is valid and registered.
   * @param {string} trackId - The ID to check.
   * @param {boolean} [suppressWarning=false] - If true, no warning is logged.
   * @returns {boolean} True if the track ID is valid and exists, false otherwise.
   */
  this._isTrackRegistered = function(trackId, suppressWarning) {
    if (!trackId || !_selfRef.activeTracks[trackId]) {
      if (!suppressWarning) {
        _selfRef._logWarn('Track ID "' + trackId + '" not registered with engine.');
      }
      return false;
    }
    return true;
  };

  /**
   * Ensures the engine is initialized before proceeding with an operation.
   * @param {string} methodName - Name of the method calling this guard.
   * @returns {boolean} True if engine is ready, false otherwise.
   */
  this._verifyEngineReady = function(methodName) {
    if (!_selfRef._engineInitialized) {
      throw _selfRef._emitError(methodName + '(): ' + _selfRef.messages.engineNotInitialized);
    }
    return true;
  };

  /**
   * Invalidates an object by setting its properties to null or undefined.
   * Used for cleanup.
   * @param {object} obj - The object to invalidate.
   */
  this._deactivateInstance = function(obj) {
    if (obj) {
      for (var key in obj) {
        if (typeof obj[key] === 'function') {
          obj[key] = function() {}; // Replace functions with no-ops
        } else {
          obj[key] = null;
        }
      }
    }
  };

  // --- Public API Methods ---

  /**
   * Checks if the audio engine is fully operational.
   * @returns {boolean} True if active and not disabled.
   */
  this.isEngineOperational = function() {
    return (_selfRef._engineInitialized && !_selfRef._isPermanentlyDisabled);
  };

  /**
   * Retrieves the embedded plugin object.
   * @param {string} [elementId] - Optional ID of the plugin element. Defaults to managerInstanceId.
   * @returns {HTMLElement|null} The plugin DOM object.
   */
  this.getPluginObject = function(elementId) {
    elementId = elementId || _selfRef.managerInstanceId;
    // Handle different browser access patterns for embedded objects
    if (_selfRef.isBrowserIE) {
      return window[elementId];
    } else if (_selfRef.isBrowserSafari) {
      return _getDomElement(elementId) || document[elementId];
    } else {
      return _getDomElement(elementId);
    }
  };

  /**
   * Instructs the plugin to load configuration from an XML URL.
   * (Plugin-specific feature)
   * @param {string} xmlUrl - URL of the XML configuration file.
   * @returns {boolean} True on success, false on failure.
   */
  this.loadConfigurationFromXml = function(xmlUrl) {
    if (!_selfRef._verifyEngineReady('loadConfigurationFromXml')) return false;
    try {
      _selfRef.pluginObject._loadFromXML(xmlUrl);
      return true;
    } catch (e) {
      _selfRef._logError('Failed to load XML configuration: ' + e.message);
      // _selfRef._failSafely(); // Original had this, but implies a full engine failure.
      return false;
    }
  };

  /**
   * Creates a new audio track instance.
   * @param {object|string} trackOptions - Options object or track ID string.
   * @param {string} [trackUrl] - URL if `trackOptions` is a string ID.
   * @returns {AudioTrack|null} The newly created or existing AudioTrack instance.
   */
  this.createAudioTrack = function(trackOptions, trackUrl) {
    if (!_selfRef._verifyEngineReady('createAudioTrack')) return null;

    var _currentTrackOpts = {};
    if (typeof trackOptions === 'string' && trackUrl) {
      _currentTrackOpts = { 'id': trackOptions, 'url': trackUrl };
    } else if (typeof trackOptions === 'object' && trackOptions !== null) {
      _currentTrackOpts = _selfRef._deepMerge({}, trackOptions); // Deep copy to avoid modifying original
    } else {
      _selfRef._logError('createAudioTrack(): Invalid parameters. Expected (options) or (id, url).');
      return null;
    }

    _selfRef._deepMerge(_currentTrackOpts, _selfRef.baseSoundSettings, _currentTrackOpts); // Merge defaults with provided options

    _selfRef._logDebug('createAudioTrack(): ' + _currentTrackOpts.id + ' (' + _currentTrackOpts.url + ')', 1);

    if (_selfRef._isTrackRegistered(_currentTrackOpts.id, true)) {
      _selfRef._logDebug('createAudioTrack(): Track "' + _currentTrackOpts.id + '" already exists. Returning existing instance.', 1);
      return _selfRef.activeTracks[_currentTrackOpts.id];
    }

    // Advanced format detection and capability checks
    if (_selfRef.pluginVersion > 8 && _selfRef.enableAdvancedFormats) {
      if (_currentTrackOpts.isAdvancedFormat === null) {
        _currentTrackOpts.isAdvancedFormat = (_currentTrackOpts.url && _currentTrackOpts.url.match(_selfRef.advancedFormatRegex) !== null);
      }
      if (_currentTrackOpts.isAdvancedFormat) {
        _selfRef._logDebug('createAudioTrack(): Using advanced format handling for "' + _currentTrackOpts.id + '".');
      }
      if (_currentTrackOpts.isAdvancedFormat && (_currentTrackOpts.enablePeakAnalysis || _currentTrackOpts.enableWaveformAnalysis || _currentTrackOpts.enableEQAnalysis)) {
        _selfRef._logWarn('Warning: Peak/waveform/EQ analysis features are generally unsupported for non-MP3 advanced formats. Disabling for "' + _currentTrackOpts.id + '".');
        _currentTrackOpts.enablePeakAnalysis = false;
        _currentTrackOpts.enableWaveformAnalysis = false;
        _currentTrackOpts.enableEQAnalysis = false;
      }
    }

    _selfRef.activeTracks[_currentTrackOpts.id] = new AudioTrack(_currentTrackOpts);
    _selfRef.trackIds.push(_currentTrackOpts.id);

    // Call plugin's internal sound creation method
    if (_selfRef.pluginVersion === 8) {
      _selfRef.pluginObject._createSound(_currentTrackOpts.id, _currentTrackOpts.nearEndOffsetMs);
    } else {
      _selfRef.pluginObject._createSound(
        _currentTrackOpts.id,
        _currentTrackOpts.url,
        _currentTrackOpts.nearEndOffsetMs,
        _currentTrackOpts.enablePeakAnalysis,
        _currentTrackOpts.enableWaveformAnalysis,
        _currentTrackOpts.enableEQAnalysis,
        _currentTrackOpts.isAdvancedFormat,
        (_currentTrackOpts.isAdvancedFormat ? _currentTrackOpts.enableVideoOutput : false),
        (_currentTrackOpts.isAdvancedFormat ? _currentTrackOpts.videoBufferTimeSec : false)
      );
    }

    // Auto-load or auto-play logic
    if (_currentTrackOpts.preloadContent || _currentTrackOpts.startPlaybackImmediately) {
      if (_selfRef.activeTracks[_currentTrackOpts.id]) {
        _selfRef.activeTracks[_currentTrackOpts.id].loadContent(_currentTrackOpts);
      }
    }
    if (_currentTrackOpts.startPlaybackImmediately) {
      _selfRef.activeTracks[_currentTrackOpts.id].startPlayback();
    }

    return _selfRef.activeTracks[_currentTrackOpts.id];
  };

  /**
   * Creates a video track (requires Plugin 9+ and advanced format support).
   * @param {object|string} videoOptions - Options object or track ID string.
   * @param {string} [videoUrl] - URL if `videoOptions` is a string ID.
   * @returns {AudioTrack|boolean} The video track instance or false if not supported.
   */
  this.createVideoTrack = function(videoOptions, videoUrl) {
    if (typeof videoOptions === 'string' && videoUrl) {
      videoOptions = { 'id': videoOptions, 'url': videoUrl };
    }

    if (_selfRef.pluginVersion < 9) {
      _selfRef._logError('createVideoTrack(): Plugin version 9 or higher is required for video playback. Exiting.', 2);
      return false;
    }
    if (!_selfRef.enableAdvancedFormats) {
      _selfRef._logError('createVideoTrack(): Advanced format (MovieStar) mode is not enabled. Exiting.', 2);
      return false;
    }

    videoOptions.isAdvancedFormat = true;
    videoOptions.enableVideoOutput = true;
    return _selfRef.createAudioTrack(videoOptions);
  };

  /**
   * Destroys an audio track instance and removes it from the engine.
   * @param {string} trackId - The ID of the track to destroy.
   * @param {boolean} [calledFromTrackInstance=false] - Internal flag to prevent recursive calls.
   * @returns {boolean} True if destroyed, false if track not found.
   */
  this.destroyAudioTrack = function(trackId, calledFromTrackInstance) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }

    // Remove ID from the list
    _selfRef.trackIds = _selfRef.trackIds.filter(function(id) {
      return id !== trackId;
    });

    // Unload content and dispose of the track instance
    _selfRef.activeTracks[trackId].unloadContent();
    if (!calledFromTrackInstance) {
      _selfRef.activeTracks[trackId].dispose(); // Call destructor on the JS object
    }
    delete _selfRef.activeTracks[trackId];
    _selfRef._logDebug('destroyAudioTrack(): Track "' + trackId + '" removed.', 1);
    return true;
  };

  this.destroyVideoTrack = this.destroyAudioTrack; // Alias for video tracks

  /**
   * Loads content for a specific track.
   * @param {string} trackId - ID of the track.
   * @param {object} [options] - Optional loading options.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.loadTrackContent = function(trackId, options) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].loadContent(options);
    return true;
  };

  /**
   * Unloads content for a specific track.
   * @param {string} trackId - ID of the track.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.unloadTrackContent = function(trackId) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].unloadContent();
    return true;
  };

  /**
   * Starts playback for a specific track.
   * If the track doesn't exist, attempts to create and play it.
   * @param {string} trackId - ID of the track.
   * @param {object|string} [options] - Optional playback options or URL.
   * @returns {boolean} True if successful, false if track cannot be played.
   */
  this.startPlayback = function(trackId, options) {
    if (!_selfRef._verifyEngineReady('startPlayback')) return false;

    if (!_selfRef._isTrackRegistered(trackId, true)) { // Suppress warning, as we might create it
      if (typeof options === 'string') { // If options is just a URL
        options = { url: options };
      }
      if (options && options.url) {
        _selfRef._logDebug('startPlayback(): Attempting to create and play new track "' + trackId + '" from URL.', 1);
        options.id = trackId;
        _selfRef.createAudioTrack(options);
        if (!_selfRef._isTrackRegistered(trackId)) { // Check if creation succeeded
          _selfRef._logError('startPlayback(): Failed to create track "' + trackId + '".');
          return false;
        }
      } else {
        _selfRef._logWarn('startPlayback(): Track "' + trackId + '" not found and no URL provided for creation.');
        return false;
      }
    }
    _selfRef.activeTracks[trackId].startPlayback(options);
    return true;
  };

  this.initiatePlayback = this.startPlayback; // Convenience alias

  /**
   * Sets the playback position for a track.
   * @param {string} trackId - ID of the track.
   * @param {number} positionOffsetMs - Position in milliseconds.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.setPlaybackPosition = function(trackId, positionOffsetMs) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].setPlaybackPosition(positionOffsetMs);
    return true;
  };

  /**
   * Stops playback for a specific track.
   * @param {string} trackId - ID of the track.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.stopPlayback = function(trackId) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef._logDebug('stopPlayback(' + trackId + ')', 1);
    _selfRef.activeTracks[trackId].stopPlayback();
    return true;
  };

  /**
   * Stops playback for all active tracks.
   */
  this.stopAllPlayback = function() {
    _selfRef._logDebug('stopAllPlayback()', 1);
    _selfRef.trackIds.forEach(function(trackId) {
      var currentTrack = _selfRef.activeTracks[trackId];
      if (currentTrack instanceof AudioTrack) { // Ensure it's a valid track object
        currentTrack.stopPlayback();
      }
    });
  };

  /**
   * Pauses playback for a specific track.
   * @param {string} trackId - ID of the track.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.pausePlayback = function(trackId) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].pausePlayback();
    return true;
  };

  /**
   * Pauses playback for all active tracks.
   */
  this.pauseAllTracks = function() {
    _selfRef.trackIds.slice().reverse().forEach(function(trackId) { // Iterate in reverse to avoid issues if array modified
      _selfRef.activeTracks[trackId].pausePlayback();
    });
  };

  /**
   * Resumes playback for a specific track.
   * @param {string} trackId - ID of the track.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.resumePlayback = function(trackId) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].resumePlayback();
    return true;
  };

  /**
   * Resumes playback for all active tracks.
   */
  this.resumeAllTracks = function() {
    _selfRef.trackIds.slice().reverse().forEach(function(trackId) {
      _selfRef.activeTracks[trackId].resumePlayback();
    });
  };

  /**
   * Toggles the pause state for a specific track.
   * @param {string} trackId - ID of the track.
   * @returns {boolean} True if successful, false if track not found.
   */
  this.togglePlaybackPause = function(trackId) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].togglePauseState();
    return true;
  };

  /**
   * Adjusts the stereo balance (pan) for a track.
   * @param {string} trackId - ID of the track.
   * @param {number} balanceValue - Pan value (-100 to 100).
   * @returns {boolean} True if successful, false if track not found.
   */
  this.setStereoBalance = function(trackId, balanceValue) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].adjustStereoBalance(balanceValue);
    return true;
  };

  /**
   * Adjusts the output volume for a track.
   * @param {string} trackId - ID of the track.
   * @param {number} volumeLevel - Volume level (0-100).
   * @returns {boolean} True if successful, false if track not found.
   */
  this.setOutputVolume = function(trackId, volumeLevel) {
    if (!_selfRef._isTrackRegistered(trackId)) {
      return false;
    }
    _selfRef.activeTracks[trackId].adjustOutputVolume(volumeLevel);
    return true;
  };

  /**
   * Mutes a specific track or all tracks if no ID is provided.
   * @param {string} [trackId] - Optional ID of the track to mute.
   */
  this.muteTrack = function(trackId) {
    if (typeof trackId !== 'string' || !trackId) {
      _selfRef._logDebug('muteTrack(): Muting all tracks.');
      _selfRef.trackIds.forEach(function(id) {
        _selfRef.activeTracks[id].muteTrack();
      });
      _selfRef.isGloballyMuted = true;
    } else {
      if (!_selfRef._isTrackRegistered(trackId)) {
        return;
      }
      _selfRef._logDebug('muteTrack(): Muting "' + trackId + '".');
      _selfRef.activeTracks[trackId].muteTrack();
    }
  };

  this.muteAllTracks = function() {
    _selfRef.muteTrack();
  };

  /**
   * Unmutes a specific track or all tracks if no ID is provided.
   * @param {string} [trackId] - Optional ID of the track to unmute.
   */
  this.unmuteTrack = function(trackId) {
    if (typeof trackId !== 'string' || !trackId) {
      _selfRef._logDebug('unmuteTrack(): Unmuting all tracks.');
      _selfRef.trackIds.forEach(function(id) {
        _selfRef.activeTracks[id].unmuteTrack();
      });
      _selfRef.isGloballyMuted = false;
    } else {
      if (!_selfRef._isTrackRegistered(trackId)) {
        return;
      }
      _selfRef._logDebug('unmuteTrack(): Unmuting "' + trackId + '".');
      _selfRef.activeTracks[trackId].unmuteTrack();
    }
  };

  this.unmuteAllTracks = function() {
    _selfRef.unmuteTrack();
  };

  /**
   * Retrieves the memory usage reported by the plugin.
   * (Not supported in Plugin 8).
   * @returns {number} Memory usage in bytes, or 0 if not supported/available.
   */
  this.getPluginMemoryUsage = function() {
    if (_selfRef.pluginVersion === 8) {
      _selfRef._logInfo('getPluginMemoryUsage(): Not supported in Plugin version 8.');
      return 0;
    }
    if (_selfRef.pluginObject && _selfRef.pluginObject.queryMemoryUsage) {
      return parseInt(_selfRef.pluginObject.queryMemoryUsage(), 10);
    }
    return 0;
  };

  /**
   * Enables or disables polling for status updates from the plugin.
   * @param {boolean} pollingEnabled - True to enable, false to disable.
   * @returns {boolean} True if successful, false if not allowed or plugin not ready.
   */
  this.enablePluginPolling = function(pollingEnabled) {
    if (!_selfRef.pluginObject || !_selfRef.enableStatusPolling) {
      _selfRef._logWarn('enablePluginPolling(): Polling is not enabled or plugin object is not ready.');
      return false;
    }
    _selfRef.pluginObject.setPollingState(pollingEnabled);
    return true;
  };

  /**
   * Disables the audio engine, destroying all tracks and stopping operations.
   * @param {boolean} [skipCompleteSignal=false] - If true, `onEngineReady` will not be called.
   * @returns {boolean} False if already disabled.
   */
  this.deactivateEngine = function(skipCompleteSignal) {
    if (_selfRef._isPermanentlyDisabled) {
      return false;
    }
    _selfRef._isPermanentlyDisabled = true;
    _selfRef._logInfo('deactivateEngine(): Shutting down audio engine.');

    // Destroy all existing tracks
    _selfRef.trackIds.slice().reverse().forEach(function(trackId) {
      _selfRef.destroyAudioTrack(trackId, false);
    });

    // Invalidate the engine's public methods if desired (for a full shutdown)
    // _selfRef._deactivateInstance(_selfRef); // Can be commented out to allow reboot()

    _selfRef.signalEngineReady(skipCompleteSignal); // Signal completion (even if failed)
    _selfRef._cleanupPlugin(); // Remove plugin from DOM
    return true;
  };

  /**
   * Checks if a given URL is playable by the current engine configuration.
   * @param {string} contentUrl - The URL to check.
   * @returns {boolean|null} True if playable, false if not, null if URL is empty.
   */
  this.isUrlPlayable = function(contentUrl) {
    if (!contentUrl) {
      _selfRef._logWarn('isUrlPlayable(): Provided URL is empty.');
      return null;
    }
    return (contentUrl.match(_selfRef.currentFileRegex) !== null);
  };

  /**
   * Retrieves an AudioTrack instance by its ID.
   * @param {string} trackId - The ID of the track.
   * @param {boolean} [suppressLogging=false] - If true, no debug messages are logged for missing tracks.
   * @returns {AudioTrack|null} The AudioTrack instance or null if not found.
   */
  this.getTrackById = function(trackId, suppressLogging) {
    if (!trackId) {
      throw _selfRef._emitError('AudioEngine.getTrackById(): trackId is null/undefined.');
    }
    var result = _selfRef.activeTracks[trackId];
    if (!result && !suppressLogging) {
      _selfRef._logWarn('getTrackById(): Track ID "' + trackId + '" is invalid or not found.');
    }
    return result;
  };

  /**
   * Placeholder: This function is called when the engine is ready.
   * Override this in your application to perform actions after initialization.
   */
  this.onEngineReady = function() {
    _selfRef._logWarn('Warning: audioEngine.onEngineReady() is undefined. Override this function in your script.');
  };

  /**
   * Internal method to signal that the engine is ready or has completed initialization.
   * @param {boolean} [skipCompleteSignal=false] - If true, `onEngineReady` is not called.
   */
  this.signalEngineReady = function(skipCompleteSignal) {
    if (_selfRef._engineInitialized) return; // Only signal once
    _selfRef._engineInitialized = true;
    if (!skipCompleteSignal) {
      _selfRef.onEngineReady();
    }
  };

  /**
   * Internal method for cleaning up the plugin embed.
   */
  this._cleanupPlugin = function() {
    if (_selfRef.pluginObject && _selfRef.pluginObject.parentNode) {
      _selfRef._logDebug('Removing plugin from DOM.', 1);
      _selfRef._removedPluginRef = _selfRef.pluginObject;
      _selfRef._removedPluginHtml = _selfRef.pluginObject.outerHTML; // Store for debugging
      _selfRef.pluginObject.parentNode.removeChild(_selfRef.pluginObject);
      _selfRef.pluginObject = null;
      _selfRef._pluginAppended = false;
      _selfRef._pluginAppendSuccessful = false;
    }
  };

  // --- Placeholder for AudioTrack class (would be defined externally or within this file) ---
  // For the purpose of this clone, assume AudioTrack is globally available or defined later.
  // Example structure:
  /*
  function AudioTrack(options) {
    var _track = this;
    this.options = options;
    this.id = options.id;
    this.url = options.url;
    this.pluginApi = globalAudioEngine.pluginObject; // Reference to the plugin's API

    // Public methods for a single track
    this.loadContent = function(loadOptions) {
      _selfRef._logDebug('Track "' + _track.id + '": Loading content from ' + _track.url);
      _track.pluginApi._loadSound(_track.id, _track.url, false, _track.options.streamOnDemand, _track.options.autoPlay);
    };
    this.unloadContent = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Unloading content.');
      if (_selfRef.pluginVersion === 8) {
        _track.pluginApi._unloadSound(_track.id, _selfRef.emptyAudioClipPath); // Flash 8 workaround
      } else {
        _track.pluginApi._unloadSound(_track.id);
      }
    };
    this.startPlayback = function(playOptions) {
      _selfRef._logDebug('Track "' + _track.id + '": Starting playback.');
      playOptions = _selfRef._deepMerge({}, _track.options, playOptions);
      _track.pluginApi._startSound(
        _track.id,
        playOptions.loop || 1,
        playOptions.offset || 0,
        playOptions.pan || 0,
        playOptions.volume || 100,
        playOptions.url || _track.url,
        false // no_auto_play, handled by SM2 itself
      );
    };
    this.stopPlayback = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Stopping playback.');
      _track.pluginApi._stopSound(_track.id);
    };
    this.pausePlayback = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Pausing playback.');
      _track.pluginApi._pauseSound(_track.id);
    };
    this.resumePlayback = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Resuming playback.');
      _track.pluginApi._resumeSound(_track.id);
    };
    this.togglePauseState = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Toggling pause.');
      _track.pluginApi._togglePause(_track.id);
    };
    this.setPlaybackPosition = function(pos) {
      _selfRef._logDebug('Track "' + _track.id + '": Setting position to ' + pos + 'ms.');
      _track.pluginApi._setSoundPosition(_track.id, pos);
    };
    this.adjustStereoBalance = function(pan) {
      _selfRef._logDebug('Track "' + _track.id + '": Setting pan to ' + pan + '.');
      _track.pluginApi._setSoundPan(_track.id, pan);
    };
    this.adjustOutputVolume = function(vol) {
      _selfRef._logDebug('Track "' + _track.id + '": Setting volume to ' + vol + '.');
      _track.pluginApi._setSoundVolume(_track.id, vol);
    };
    this.muteTrack = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Muting.');
      _track.pluginApi._muteSound(_track.id);
    };
    this.unmuteTrack = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Unmuting.');
      _track.pluginApi._unmuteSound(_track.id);
    };
    this.dispose = function() {
      _selfRef._logDebug('Track "' + _track.id + '": Disposing instance.');
      // Clean up references and properties
      for (var key in _track) {
        if (_track.hasOwnProperty(key)) {
          _track[key] = null;
        }
      }
    };
  }
  */
}