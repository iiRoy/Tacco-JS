/*!
   Audio System Core: JavaScript Audio for Web Interfaces
   -------------------------------------------------
   http://audiosystem.example.com/

   (C) 2023, Audio Innovations Inc. All rights reserved.
   This code is provided under the MIT License.
   http://audiosystem.example.com/license.txt

   Version: 1.0.0.20231026
*/

var audioMaster = null;
var AUDIO_MASTER_DELAY = true;

function AudioMaster(masterURL, masterID) {

  this.playerVersion = 8;          // Required player engine version (8 or 9). Certain features need v9.
  this.verboseLog = true;          // Activate detailed logging (to div#audio-master-log, or console if available).
  this.consoleOutput = true;       // Utilize browser's console.log() for debug messages when present.
  this.onlyConsole = false;        // If console is used, suppress output to the DOM log element.
  this.deferUntilLoad = false;     // Force core to await window.onload() before initiating its own onload().
  this.emptyClipPath = 'empty.mp3'; // Path to a minimal (empty) MP3, used for clearing audio streams (Player v8 only).
  this.enableStatusChecks = true;  // Allow player to report status updates (essential for 'while playing', peak data, spectrum).
  this.enableMediaStream = false;  // Activate support for Player 9.0r115+ (code-named "MovieStar") MPEG4 formats (AAC, M4V, FLV, MOV, etc.).
  this.playerBGColor = '#FFFFFF';  // Player movie (.swf) background color; '#000000' is useful for full-screen video.
  this.optimizeRendering = false;  // A fixed-position player element can improve JavaScript/player communication speed.
  this.playerTimeoutMS = 750;      // Milliseconds to wait for player movie to load before declaring failure (0 for infinite wait).
  this.renderMode = null;          // Rendering mode for the player movie: null, transparent, opaque (latter two allow HTML layering).
  this.fullScreenAllowed = true;   // Permit full-screen mode (via double-click) for Player 9+ video.

  this.baseSettings = {
    'automaticLoad': false,            // Controls whether clips load automatically. If false, .load() is called on demand by .play(), saving bandwidth.
    'streamContent': true,             // Enables playback before the entire file has downloaded (recommended for responsiveness).
    'immediatePlay': false,            // Starts playback as soon as feasible (much faster if 'streamContent' is true).
    'onID3Data': null,                 // Callback when ID3 tag data becomes available.
    'onClipReady': null,               // Callback when the clip has finished loading.
    'duringDownload': null,            // Callback for download progress updates (e.g., X of Y bytes received).
    'onPlaybackStart': null,           // Callback at the beginning of playback.
    'onPlaybackPause': null,           // Callback when playback is paused.
    'onPlaybackResume': null,          // Callback when playback resumes from a pause.
    'duringPlayback': null,            // Callback during active playback (provides position updates).
    'onPlaybackStop': null,            // Callback when playback is explicitly stopped by the user.
    'onPlaybackComplete': null,        // Callback when the sound finishes playing naturally.
    'onPreFinish': null,               // Callback triggered before the sound completes (at a specified time).
    'preFinishOffset': 5000,           // Time in milliseconds before the end of the sound to trigger 'onPreFinish' (e.g., 1000ms = 1 second).
    'onPreFinishComplete': null,       // Function to execute when the pre-finished sound actually ends.
    'onNearEnd': null,                 // Callback for a short duration before the current sound's end.
    'nearEndOffset': 200,              // Duration in milliseconds for 'onNearEnd'. Set to 0 (or null handler) to disable.
    'allowMultiplePlays': true,        // If true, multiple calls to play() will layer sounds; if false, a sound will restart.
    'startOffset': null,               // Position in milliseconds to begin playback within the loaded audio.
    'stereoBalance': 0,                // Stereo panning setting: -100 (left) to 100 (right).
    'audioLevel': 100                  // Volume level: 0-100, where 100 is maximum.
  };

  this.playerNineSettings = {      // Options specific to Player v9, merged into baseSettings if v9 is in use.
    'isMediaStream': null,         // "MovieStar" MPEG4 mode. Null (default) auto-detects MP4/AAC based on URL. True forces it, ignoring URL.
    'enablePeakData': false,       // Activate left/right channel peak level data.
    'enableWaveformData': false,   // Activate raw waveform data (sound spectrum) - CAUTION: CPU-intensive.
    'enableEQData': false,         // Activate frequency spectrum data (EQ data) - CAUTION: Also CPU-intensive.
    'onBufferStatusChange': null,  // Callback for changes in the "isBuffering" property.
    'onDataRetrieveError': null    // Callback for waveform/EQ data access errors (e.g., player in another tab).
  };

  this.mediaStreamSettings = {     // Player 9.0r115+ MPEG4 audio/video options, merged if v9 and media stream mode are active.
    'onMediaMetadata': null,       // Callback when video dimensions or other metadata are received.
    'enableVideoDisplay': false,   // If loading media stream content, indicates whether to show video.
    'mediaBufferDuration': null    // Seconds of data to buffer before playback. Null uses player default (0.1s); up to 3s can help with AAC gaps.
  };

  // jslint global declarations
  /*global AUDIO_MASTER_DELAY, coreLogger, alert, console, document, navigator, setTimeout, window */

  var AudioClip = null; // Defined later in the full library.

  var _selfRef = this;
  this.libraryVersion = null;
  this.semanticVersion = 'V1.0.0.20231026';
  this.playerSWFPath = null;
  this.resourcePath = null;
  this.alternateResourcePath = null;
  this.playerLoaded = false;
  this.isActive = false;
  this.playerObject = null;
  this.instanceID = (masterID || 'audioPlayer');
  this.movieClipRef = null;
  this.audioClips = {};
  this.clipIdentifiers = [];
  this.isGloballyMuted = false;
  this.inFullScreenMode = false; // Updated by Player 9+.
  this.isBrowserIE = (navigator.userAgent.match(/MSIE/i));
  this.isBrowserSafari = (navigator.userAgent.match(/safari/i));
  this.isBrowserGecko = (navigator.userAgent.match(/gecko/i));
  this.logOutputDivID = 'audio-master-log';
  this.specialRenderModeIssue = false;
  this._logPanelOpen = true;
  this._elementAppended = false;
  this._appendSuccessful = false;
  this._initialized = false;
  this._shutDown = false;
  this._windowReady = false;
  this._consoleAvailable = (typeof console != 'undefined' && typeof console.log != 'undefined');
  this._logSeverities = ['log', 'info', 'warn', 'error'];
  this._defaultPlayerVersion = 8;
  this._removedObject = null;
  this._removedObjectHTML = null;

  var _getElemByID = function(elementID) {
    return document.getElementById(elementID);
  };

  this.resourceMatchers = {
    playerEight: /\.mp3(\?.*)?$/i,
    playerNine: /\.mp3(\?.*)?$/i
  };

  this.streamMediaTypes = ['aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'mp4v', '3gp', '3g2']; // Player v9.0r115+ "moviestar" formats.
  this.streamMediaTypePattern = new RegExp('\\.(' + this.streamMediaTypes.join('|') + ')(\\?.*)?$', 'i');

  this.currentResourcePattern = null;
  this.capabilitySet = {
    hasBuffering: false,
    hasPeakData: false,
    hasWaveformData: false,
    hasEQData: false,
    hasMediaStream: false
  };

  this.securityContext = {
    'contextType': null,
    'contextTypes': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local + internet access)'
    },
    'contextDescription': null,
    'noRemoteAccess': null,
    'noLocalAccess': null
  };

  this._configurePlayerInfo = function() {
    if (_selfRef.playerVersion != 8 && _selfRef.playerVersion != 9) {
      alert('audioMaster.playerVersion must be 8 or 9. "' + _selfRef.playerVersion + '" is invalid. Reverting to ' + _selfRef._defaultPlayerVersion + '.');
      _selfRef.playerVersion = _selfRef._defaultPlayerVersion;
    }
    _selfRef.libraryVersion = _selfRef.semanticVersion + (_selfRef.playerVersion == 9 ? ' (AS3/Player 9)' : ' (AS2/Player 8)');
    // Establish base settings.
    if (_selfRef.playerVersion > 8) {
      _selfRef.baseSettings = _selfRef._combineObjects(_selfRef.baseSettings, _selfRef.playerNineSettings);
      _selfRef.capabilitySet.hasBuffering = true;
    }
    if (_selfRef.playerVersion > 8 && _selfRef.enableMediaStream) {
      // Player 9+ support for media stream formats alongside MP3.
      _selfRef.baseSettings = _selfRef._combineObjects(_selfRef.baseSettings, _selfRef.mediaStreamSettings);
      _selfRef.resourceMatchers.playerNine = new RegExp('\\.(mp3|' + _selfRef.streamMediaTypes.join('|') + ')(\\?.*)?$', 'i');
      _selfRef.capabilitySet.hasMediaStream = true;
    } else {
      _selfRef.enableMediaStream = false;
      _selfRef.capabilitySet.hasMediaStream = false;
    }
    _selfRef.currentResourcePattern = _selfRef.resourceMatchers[(_selfRef.playerVersion != 8 ? 'playerNine' : 'playerEight')];
    _selfRef.playerSWFPath = (_selfRef.playerVersion == 8 ? 'audio_player.swf' : 'audio_player_v9.swf');
    _selfRef.capabilitySet.hasPeakData = _selfRef.capabilitySet.hasWaveformData = _selfRef.capabilitySet.hasEQData = (_selfRef.playerVersion > 8);
  };

  this._viaHTTP = (document.location ? document.location.protocol.match(/http/i) : null);
  this._awaitingEventInit = false;
  this._initiationPending = false;
  this._attemptInitOnFocus = (this.isBrowserSafari && typeof document.hasFocus == 'undefined');
  this._windowFocused = (typeof document.hasFocus != 'undefined' ? document.hasFocus() : null);
  this._safeToDisable = !this._attemptInitOnFocus;

  this.employAlternateURL = !this._viaHTTP; // Use alternate URL if not accessed via HTTP.

  var playerControlPanelLink = 'http://www.adobe.com/support/documentation/en/flashplayer/help/settings_manager04.html';

  this.messageStrings = {
    notInitialized: 'Audio system not yet loaded - please wait for audioMaster.onMasterLoad() before using audio methods',
    xhtmlAppendError: 'audioMaster._createMovie(): appendChild/innerHTML operation failed. Possibly an app/xhtml+xml DOM issue.'
  };

  // --- public methods ---

  this.isSupported = function() {
    return (_selfRef._initialized && !_selfRef._shutDown);
  };

  this.retrievePlayer = function(playerID) {
    return _selfRef.isBrowserIE ? window[playerID] : (_selfRef.isBrowserSafari ? _getElemByID(playerID) || document[playerID] : _getElemByID(playerID));
  };

  this.importFromXML = function(xmlResourceURL) {
    try {
      _selfRef.playerObject._loadFromXML(xmlResourceURL);
    } catch (e) {
      _selfRef._failSafely();
      return true;
    }
  };

  this.generateClip = function(clipOptions) {
    if (!_selfRef._initialized) {
      throw _selfRef._raiseError('audioMaster.generateClip(): ' + _selfRef.messageStrings.notInitialized, arguments.callee.caller);
    }
    if (arguments.length == 2) {
      // Overloaded function: simple generateClip(id, url) usage.
      clipOptions = {
        'id': arguments[0],
        'url': arguments[1]
      };
    }
    var currentClipSettings = _selfRef._combineObjects(clipOptions); // Inherit core defaults.
    var _currentOptions = currentClipSettings; // Alias for brevity.
    _selfRef._writeDebug('audioMaster.generateClip(): ' + _currentOptions.id + ' (' + _currentOptions.url + ')', 1);
    if (_selfRef._checkClipID(_currentOptions.id, true)) {
      _selfRef._writeDebug('audioMaster.generateClip(): ' + _currentOptions.id + ' already exists', 1);
      return _selfRef.audioClips[_currentOptions.id];
    }
    if (_selfRef.playerVersion > 8 && _selfRef.enableMediaStream) {
      if (_currentOptions.isMediaStream === null) {
        _currentOptions.isMediaStream = (_currentOptions.url.match(_selfRef.streamMediaTypePattern) ? true : false);
      }
      if (_currentOptions.isMediaStream) {
        _selfRef._writeDebug('audioMaster.generateClip(): utilizing MediaStream handling');
      }
      if (_currentOptions.isMediaStream && (_currentOptions.enablePeakData || _currentOptions.enableWaveformData || _currentOptions.enableEQData)) {
        _selfRef._writeDebug('Warning: peak/waveform/EQ data not supported for non-MP3 formats', 1);
        _currentOptions.enablePeakData = false;
        _currentOptions.enableWaveformData = false;
        _currentOptions.enableEQData = false;
      }
    }
    _selfRef.audioClips[_currentOptions.id] = new AudioClip(_currentOptions);
    _selfRef.clipIdentifiers[_selfRef.clipIdentifiers.length] = _currentOptions.id;
    // For Player AS2:
    if (_selfRef.playerVersion == 8) {
      _selfRef.playerObject._createPlayerClip(_currentOptions.id, _currentOptions.nearEndOffset);
    } else {
      _selfRef.playerObject._createPlayerClip(_currentOptions.id, _currentOptions.url, _currentOptions.nearEndOffset, _currentOptions.enablePeakData, _currentOptions.enableWaveformData, _currentOptions.enableEQData, _currentOptions.isMediaStream, (_currentOptions.isMediaStream ? _currentOptions.enableVideoDisplay : false), (_currentOptions.isMediaStream ? _currentOptions.mediaBufferDuration : false));
    }
    if (_currentOptions.automaticLoad || _currentOptions.immediatePlay) {
      // Consider if removing timeout here causes issues.
      if (_selfRef.audioClips[_currentOptions.id]) {
        _selfRef.audioClips[_currentOptions.id].loadClip(_currentOptions);
      }
    }
    if (_currentOptions.immediatePlay) {
      _selfRef.audioClips[_currentOptions.id].startPlayback();
    }
    return _selfRef.audioClips[_currentOptions.id];
  };

  this.generateVideoClip = function(clipOptions) {
    if (arguments.length == 2) {
      clipOptions = {
        'id': arguments[0],
        'url': arguments[1]
      };
    }
    if (_selfRef.playerVersion >= 9) {
      clipOptions.isMediaStream = true;
      clipOptions.enableVideoDisplay = true;
    } else {
      _selfRef._writeDebug('audioMaster.generateVideoClip(): Player 9 required for video. Aborting.', 2);
      return false;
    }
    if (!_selfRef.enableMediaStream) {
      _selfRef._writeDebug('audioMaster.generateVideoClip(): MediaStream mode not enabled. Aborting.', 2);
    }
    return _selfRef.generateClip(clipOptions);
  };

  this.eliminateClip = function(clipID, fromClipInstance) {
    // Explicitly remove an audio clip before page unload, etc.
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    for (var i = 0; i < _selfRef.clipIdentifiers.length; i++) {
      if (_selfRef.clipIdentifiers[i] == clipID) {
        _selfRef.clipIdentifiers.splice(i, 1);
        continue;
      }
    }
    // Conservative approach: avoid crashes with Player 8.
    // Calling eliminateClip() within a clip's onClipReady() might crash Firefox, specific WinXP + Player 8 setups.
    // if (_selfRef.playerVersion != 8) {
    _selfRef.audioClips[clipID].unloadClip();
    // }
    if (!fromClipInstance) {
      // Ignore if invoked from the AudioClip instance itself.
      _selfRef.audioClips[clipID].dispose();
    }
    delete _selfRef.audioClips[clipID];
  };

  this.eliminateVideoClip = this.eliminateClip;

  this.loadClip = function(clipID, clipOptions) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].loadClip(clipOptions);
  };

  this.unloadClip = function(clipID) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].unloadClip();
  };

  this.startPlayback = function(clipID, clipOptions) {
    if (!_selfRef._initialized) {
      throw _selfRef._raiseError('audioMaster.startPlayback(): ' + _selfRef.messageStrings.notInitialized, arguments.callee.caller);
    }
    if (!_selfRef._checkClipID(clipID)) {
      if (typeof clipOptions != 'object') {
        clipOptions = {
          url: clipOptions
        }; // Overloaded usage: play('myClip', '/path/to/audio.mp3');
      }
      if (clipOptions && clipOptions.url) {
        // Overloaded usage: create and play clip: .play('someID', {url:'/path/to.mp3'});
        _selfRef._writeDebug('audioController.startPlayback(): attempting to create "' + clipID + '"', 1);
        clipOptions.id = clipID;
        _selfRef.generateClip(clipOptions);
      } else {
        return false;
      }
    }
    _selfRef.audioClips[clipID].startPlayback(clipOptions);
  };

  this.initiatePlayback = this.startPlayback; // Alias for convenience.

  this.setPlaybackPosition = function(clipID, timeOffsetMS) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].setPlaybackPosition(timeOffsetMS);
  };

  this.haltPlayback = function(clipID) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef._writeDebug('audioMaster.haltPlayback(' + clipID + ')', 1);
    _selfRef.audioClips[clipID].haltPlayback();
  };

  this.haltAllPlayback = function() {
    _selfRef._writeDebug('audioMaster.haltAllPlayback()', 1);
    for (var currentClip in _selfRef.audioClips) {
      if (_selfRef.audioClips[currentClip] instanceof AudioClip) {
        _selfRef.audioClips[currentClip].haltPlayback(); // Only apply to actual audio clip objects.
      }
    }
  };

  this.pausePlayback = function(clipID) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].pausePlayback();
  };

  this.pauseAllPlayback = function() {
    for (var i = _selfRef.clipIdentifiers.length; i--;) {
      _selfRef.audioClips[_selfRef.clipIdentifiers[i]].pausePlayback();
    }
  };

  this.resumePlayback = function(clipID) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].resumePlayback();
  };

  this.resumeAllPlayback = function() {
    for (var i = _selfRef.clipIdentifiers.length; i--;) {
      _selfRef.audioClips[_selfRef.clipIdentifiers[i]].resumePlayback();
    }
  };

  this.togglePlaybackPause = function(clipID) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].togglePlaybackPause();
  };

  this.setStereoBalance = function(clipID, balanceValue) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].setStereoBalance(balanceValue);
  };

  this.setAudioLevel = function(clipID, levelValue) {
    if (!_selfRef._checkClipID(clipID)) {
      return false;
    }
    _selfRef.audioClips[clipID].setAudioLevel(levelValue);
  };

  this.muteClip = function(clipID) {
    if (typeof clipID != 'string') {
      clipID = null;
    }
    if (!clipID) {
      _selfRef._writeDebug('audioMaster.muteClip(): Muting all active clips');
      for (var i = _selfRef.clipIdentifiers.length; i--;) {
        _selfRef.audioClips[_selfRef.clipIdentifiers[i]].muteClip();
      }
      _selfRef.isGloballyMuted = true;
    } else {
      if (!_selfRef._checkClipID(clipID)) {
        return false;
      }
      _selfRef._writeDebug('audioMaster.muteClip(): Muting "' + clipID + '"');
      _selfRef.audioClips[clipID].muteClip();
    }
  };

  this.muteAllClips = function() {
    _selfRef.muteClip();
  };

  this.unmuteClip = function(clipID) {
    if (typeof clipID != 'string') {
      clipID = null;
    }
    if (!clipID) {
      _selfRef._writeDebug('audioMaster.unmuteClip(): Unmuting all active clips');
      for (var i = _selfRef.clipIdentifiers.length; i--;) {
        _selfRef.audioClips[_selfRef.clipIdentifiers[i]].unmuteClip();
      }
      _selfRef.isGloballyMuted = false;
    } else {
      if (!_selfRef._checkClipID(clipID)) {
        return false;
      }
      _selfRef._writeDebug('audioMaster.unmuteClip(): Unmuting "' + clipID + '"');
      _selfRef.audioClips[clipID].unmuteClip();
    }
  };

  this.unmuteAllClips = function() {
    _selfRef.unmuteClip();
  };

  this.retrieveMemoryUsage = function() {
    if (_selfRef.playerVersion == 8) {
      // This feature is not available in Player 8.
      return 0;
    }
    if (_selfRef.playerObject) {
      return parseInt(_selfRef.playerObject._getMemoryUse(), 10);
    }
  };

  this.configurePolling = function(enablePolling) {
    if (!_selfRef.playerObject || !_selfRef.enableStatusChecks) {
      return false;
    }
    _selfRef.playerObject._setPolling(enablePolling);
  };

  this.deactivate = function(preventDisable) {
    // Shuts down all functions.
    if (typeof preventDisable == 'undefined') {
      preventDisable = false;
    }
    if (_selfRef._shutDown) {
      return false;
    }
    _selfRef._shutDown = true;
    _selfRef._writeDebug('audioMaster.deactivate(): Initiating shutdown', 1);
    for (var i = _selfRef.clipIdentifiers.length; i--;) {
      _selfRef._deactivateObject(_selfRef.audioClips[_selfRef.clipIdentifiers[i]]);
    }
    _selfRef.initializationComplete(preventDisable); // Signal "complete" even if failed.
    // _selfRef._deactivateObject(_selfRef); // Removed to allow for reboot functionality.
  };

  this.canHandleResource = function(resourceURL) {
    return (resourceURL ? (resourceURL.match(_selfRef.currentResourcePattern) ? true : false) : null);
  };

  this.getClipByID = function(clipID, quietDebug) {
    if (!clipID) {
      throw new Error('AudioMaster.getClipByID(): clipID is null or undefined');
    }
    var foundClip = _selfRef.audioClips[clipID];
    if (!foundClip && !quietDebug) {
      _selfRef._writeDebug('"' + clipID + '" is not a valid clip identifier.', 2);
      // audioMaster._writeDebug('trace: ' + arguments.callee.caller);
    }
    return foundClip;
  };

  this.onMasterLoad = function() {
    // This is the window.onload() equivalent for the audio system, indicating readiness for creating clips etc.
    // This is a placeholder; you can override it in your external script, e.g., audioMaster.onMasterLoad = function() { /* your code */ };
    audioMaster._writeDebug('Warning: audioMaster.onMasterLoad() is not defined.', 2);
  };