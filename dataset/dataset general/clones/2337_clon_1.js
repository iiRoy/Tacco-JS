/******************************************************************************************************************
 *
 *   SoundManager 2: Javascript Sound for the Web
 *   --------------------------------------------
 *   http://schillmania.com/projects/soundmanager2/
 *
 *   Copyright (c) 2008, Scott Schiller. All rights reserved.
 *   Code licensed under the BSD License:
 *   http://schillmania.com/projects/soundmanager2/license.txt
 *
 *   Version: V2.95a.20090501
 *   This file contains the core SoundManager2 library.
 *
 ******************************************************************************************************************/

var soundManager = null; // Global SoundManager instance, initially null.
var SM2_DEFER    = true; // Flag to defer SoundManager2 initialization.

function SoundManager( smURL, smID ) {

   // Configuration properties for SoundManager2
   this.flashVersion        = 8;             // Required Flash player version (8 or 9). Flash 9 enables more features.
   this.debugMode           = true;          // Enable debugging output. Writes to #soundmanager-debug or console.
   this.useConsole          = true;          // Use browser's console.log() for debug output if available.
   this.consoleOnly         = false;         // If useConsole is true, prevent writing to the #soundmanager-debug DIV.
   this.waitForWindowLoad   = false;         // Wait for window.onload before calling soundManager.onload().
   this.nullURL             = 'null.mp3';    // Path to a small, silent MP3 file for unloading sounds (Flash 8 only).
   this.allowPolling        = true;          // Allow Flash to poll for sound status updates (e.g., 'whileplaying').
   this.useMovieStar        = false;         // Enable Flash 9.0r115+ (MovieStar) support for MPEG4 audio/video.
   this.bgColor             = '#ffffff';     // Background color of the Flash movie. Useful for custom UIs.
   this.useHighPerformance  = false;         // Use position:fixed for the Flash movie to improve JS/Flash performance.
   this.flashLoadTimeout    = 750;           // Milliseconds to wait for the Flash movie to load before failing. (0 = infinite).
   this.wmode               = null;          // WMODE for the Flash movie: null, 'transparent', or 'opaque'.
   this.allowFullScreen     = true;          // Allow full-screen mode for Flash 9+ video (via double-click).

   // Default options for sounds created via createSound().
   this.defaultOptions = {
      'autoLoad': false,          // Automatically load the sound when created.
      'stream': true,             // Allow playing before the entire file has loaded (recommended for responsiveness).
      'autoPlay': false,          // Start playing as soon as possible (works best with 'stream': true).
      'onid3': null,              // Callback when ID3 data is available.
      'onload': null,             // Callback when the sound has finished loading.
      'whileloading': null,       // Callback during download progress.
      'onplay': null,             // Callback when sound starts playing.
      'onpause': null,            // Callback when sound is paused.
      'onresume': null,           // Callback when sound resumes from a pause.
      'whileplaying': null,       // Callback repeatedly while the sound is playing (for position updates).
      'onstop': null,             // Callback when sound is stopped by user or via API.
      'onfinish': null,           // Callback when sound finishes playing naturally.
      'onbeforefinish': null,     // Callback before sound finishes (at onbeforefinishtime).
      'onbeforefinishtime': 5000, // Time in ms before end of sound to trigger onbeforefinish.
      'onbeforefinishcomplete': null, // Callback when the sound actually completes after onbeforefinish.
      'onjustbeforefinish': null, // Callback just before the very end of the sound.
      'onjustbeforefinishtime': 200, // Time in ms before end to trigger onjustbeforefinish (set to 0 to disable).
      'multiShot': true,          // Allow multiple instances of a sound to play simultaneously.
      'position': null,           // Initial playback position (in milliseconds).
      'pan': 0,                   // Stereo pan setting (-100 = left, 0 = center, 100 = right).
      'volume': 100               // Volume level (0-100).
   };

   // Options specific to Flash 9, merged into defaultOptions if Flash 9 is used.
   this.flash9Options = {
      'isMovieStar': null,        // Auto-detect MovieStar format based on URL, or force true/false.
      'usePeakData': false,       // Enable left/right channel peak (level) data.
      'useWaveformData': false,   // Enable raw waveform data (CPU intensive).
      'useEQData': false,         // Enable frequency spectrum data (CPU intensive).
      'onbufferchange': null,     // Callback when buffering state changes.
      'ondataerror': null         // Callback for waveform/EQ data access errors.
   };

   // Options specific to Flash 9.0r115+ MovieStar mode.
   this.movieStarOptions = {
      'onmetadata': null,         // Callback when video metadata (width/height) is received.
      'useVideo': false,          // Whether to display video for MovieStar content.
      'bufferTime': null          // Seconds of data to buffer before playback (null = Flash default).
   };

   // JSLint global declarations to prevent warnings.
   /*global SM2_DEFER, sm2Debugger, alert, console, document, navigator, setTimeout, window */

   var SMSound = null; // SMSound class, defined later in the script.

   var _s = this; // Self-reference for scope.

   // Internal properties and flags.
   this.version           = null;
   this.versionNumber     = 'V2.95a.20090501';
   this.movieURL          = null;             // Path to the SWF movie.
   this.url               = null;             // Base URL for the Flash movie.
   this.altURL            = null;             // Alternative URL, used if not over HTTP.
   this.swfLoaded         = false;            // Flag: Has the SWF loaded successfully?
   this.enabled           = false;            // Flag: Is SoundManager2 fully enabled?
   this.o                 = null;             // Reference to the Flash movie object.
   this.id                = (smID || 'sm2movie'); // ID of the Flash movie container.
   this.oMC               = null;             // Movie container (DIV element).
   this.sounds            = {};               // Object to store SMSound instances, indexed by ID.
   this.soundIDs          = [];               // Array of sound IDs.
   this.muted             = false;            // Global mute state.
   this.isFullScreen      = false;            // Flash 9+ video full-screen state.
   this.isIE              = (navigator.userAgent.match(/MSIE/i)); // Browser detection: Internet Explorer.
   this.isSafari          = (navigator.userAgent.match(/safari/i)); // Browser detection: Safari.
   this.isGecko           = (navigator.userAgent.match(/gecko/i)); // Browser detection: Gecko (Firefox).
   this.debugID           = 'soundmanager-debug'; // ID of the debug output DIV.
   this.specialWmodeCase  = false;            // Flag for specific wmode handling.
   this._debugOpen         = true;             // Is the debug window/console open?
   this._didAppend         = false;            // Has the Flash movie been appended to the DOM?
   this._appendSuccess     = false;            // Was the Flash movie successfully appended?
   this._didInit           = false;            // Has SoundManager2 completed its initialization?
   this._disabled          = false;            // Has SoundManager2 been disabled?
   this._windowLoaded      = false;            // Has window.onload fired?
   this._hasConsole        = (typeof console != 'undefined' && typeof console.log != 'undefined'); // Does console exist?
   this._debugLevels       = ['log','info','warn','error']; // Available console debug levels.
   this._defaultFlashVersion = 8;            // Default Flash version if an invalid one is specified.
   this._oRemoved          = null;             // Reference to removed Flash movie object.
   this._oRemovedHTML      = null;             // HTML content of removed Flash movie.

   // Helper function to get an element by ID.
   var _$ = function( sID ) {
      return document.getElementById(sID);
   };

   // Regular expressions for file pattern matching.
   this.filePatterns = {
      flash8: /\.mp3(\?.*)?$/i, // Flash 8 only supports MP3.
      flash9: /\.mp3(\?.*)?$/i  // Flash 9 initially MP3, extended for MovieStar.
   };

   // List of "MovieStar" (MPEG4) supported netstream types for Flash 9.0r115+.
   this.netStreamTypes   = ['aac','flv','mov','mp4','m4v','f4v','m4a','mp4v','3gp','3g2'];
   // Pattern to match MovieStar file types.
   this.netStreamPattern = new RegExp('\\.(' + this.netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

   this.filePattern = null; // The active file pattern based on Flash version.

   // Feature flags indicating what the current Flash movie supports.
   this.features = {
      buffering: false,     // Flash 9+ supports buffering events.
      peakData: false,      // Flash 9+ supports peak data.
      waveformData: false,  // Flash 9+ supports waveform data.
      eqData: false,        // Flash 9+ supports EQ data.
      movieStar: false      // Flash 9+ with MovieStar support.
   };

   // Sandbox security related information.
   this.sandbox = {
      'type': null,
      'types': {
         'remote': 'remote (domain-based) rules',
         'localWithFile': 'local with file access (no internet access)',
         'localWithNetwork': 'local with network (internet access only, no local access)',
         'localTrusted': 'local, trusted (local + internet access)'
      },
      'description': null,
      'noRemote': null,
      'noLocal': null
   };

   // Sets the version information and updates default options based on Flash version.
   this._setVersionInfo = function() {

      // Validate flashVersion setting.
      if ( _s.flashVersion != 8 && _s.flashVersion != 9 ) {
         alert('soundManager.flashVersion must be 8 or 9. "' + _s.flashVersion + '" is invalid. Reverting to ' + _s._defaultFlashVersion + '.' );
         _s.flashVersion = _s._defaultFlashVersion;
      }

      // Construct the full version string.
      _s.version = _s.versionNumber + ( _s.flashVersion == 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)' );

      // Apply Flash 9 specific options if applicable.
      if ( _s.flashVersion > 8 ) {
         _s.defaultOptions = _s._mergeObjects( _s.defaultOptions, _s.flash9Options );
         _s.features.buffering = true;
      }

      // Apply MovieStar options if Flash 9 and useMovieStar is enabled.
      if ( _s.flashVersion > 8 && _s.useMovieStar ) {
         _s.defaultOptions = _s._mergeObjects( _s.defaultOptions, _s.movieStarOptions );
         // Update file pattern to include MovieStar formats.
         _s.filePatterns.flash9 = new RegExp( '\\.(mp3|' + _s.netStreamTypes.join('|') + ')(\\?.*)?$', 'i' );
         _s.features.movieStar = true;
      } else {
         _s.useMovieStar = false; // Ensure MovieStar is off if conditions aren't met.
         _s.features.movieStar = false;
      }

      // Set the active file pattern.
      _s.filePattern = _s.filePatterns[ ( _s.flashVersion != 8 ? 'flash9' : 'flash8' ) ];
      // Determine the correct SWF file based on Flash version.
      _s.movieURL = ( _s.flashVersion == 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf' );

      // Enable Flash 9+ specific features.
      _s.features.peakData = _s.features.waveformData = _s.features.eqData = ( _s.flashVersion > 8 );

   }; // End of _setVersionInfo function.

   this._overHTTP      = (document.location ? document.location.protocol.match(/http/i) : null); // Is the page served over HTTP?
   this._waitingforEI  = false; // Flag for waiting for ExternalInterface.
   this._initPending   = false; // Flag for pending initialization.
   this._tryInitOnFocus= (this.isSafari && typeof document.hasFocus == 'undefined'); // Safari specific focus handling.
   this._isFocused     = (typeof document.hasFocus != 'undefined' ? document.hasFocus() : null); // Document focus state.
   this._okToDisable   = !this._tryInitOnFocus; // Can SM2 be disabled?

   this.useAltURL = !this._overHTTP; // Use alternate URL if not on a web server.

   var flashCPLink = 'http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html'; // Flash control panel link.

   // Standard error/warning strings.
   this.strings = {
      notReady: 'Not loaded yet - wait for soundManager.onload() before calling sound-related methods',
      appXHTML: 'soundManager._createMovie(): appendChild/innerHTML set failed. May be app/xhtml+xml DOM-related.'
   };

   // --- public methods ---

   // Checks if SoundManager2 is fully initialized and enabled.
   this.supported = function() {
      return ( _s._didInit && !_s._disabled );
   };

   // Retrieves the Flash movie object from the DOM.
   this.getMovie = function( smID ) {
      return _s.isIE ? window[smID] : ( _s.isSafari ? _$(smID) || document[smID] : _$(smID) );
   };

   // Loads sounds from an XML URL (Flash 8 only).
   this.loadFromXML = function( sXmlUrl ) {
      try {
         _s.o._loadFromXML( sXmlUrl );
      } catch(e) {
         _s._failSafely(); // Fallback if Flash call fails.
         return true;
      }
   };

   // Creates a new sound object.
   this.createSound = function( oOptions ) {
      // Ensure SM2 is ready.
      if ( !_s._didInit ) {
         throw _s._complain( 'soundManager.createSound(): ' + _s.strings.notReady, arguments.callee.caller );
      }

      // Handle overloaded function signature: createSound(id, url).
      if ( arguments.length == 2 ) {
         oOptions = { 'id': arguments[0], 'url': arguments[1] };
      }

      // Merge provided options with SM2 defaults.
      var thisOptions = _s._mergeObjects( oOptions );
      var _tO = thisOptions; // Alias for convenience.

      _s._wD( 'soundManager.createSound(): ' + _tO.id + ' (' + _tO.url + ')', 1 );

      // Check if a sound with this ID already exists.
      if ( _s._idCheck(_tO.id, true) ) {
         _s._wD( 'soundManager.createSound(): ' + _tO.id + ' exists', 1 );
         return _s.sounds[_tO.id];
      }

      // Handle MovieStar specific logic for Flash 9.
      if ( _s.flashVersion > 8 && _s.useMovieStar ) {
         if ( _tO.isMovieStar === null ) {
            _tO.isMovieStar = ( _tO.url.match(_s.netStreamPattern) ? true : false );
         }
         if ( _tO.isMovieStar ) {
            _s._wD( 'soundManager.createSound(): using MovieStar handling' );
         }
         // Warn if unsupported features are requested for MovieStar formats.
         if ( _tO.isMovieStar && (_tO.usePeakData || _tO.useWaveformData || _tO.useEQData) ) {
            _s._wD( 'Warning: peak/waveform/eqData features unsupported for non-MP3 formats' );
            _tO.usePeakData     = false;
            _tO.useWaveformData = false;
            _tO.useEQData       = false;
         }
      }

      // Create a new SMSound instance and store it.
      _s.sounds[_tO.id] = new SMSound(_tO);
      _s.soundIDs[_s.soundIDs.length] = _tO.id;

      // Call the appropriate Flash method to create the sound.
      if ( _s.flashVersion == 8 ) {
         _s.o._createSound( _tO.id, _tO.onjustbeforefinishtime );
      } else {
         _s.o._createSound( _tO.id, _tO.url, _tO.onjustbeforefinishtime, _tO.usePeakData, _tO.useWaveformData, _tO.useEQData, _tO.isMovieStar, (_tO.isMovieStar ? _tO.useVideo : false), (_tO.isMovieStar ? _tO.bufferTime : false) );
      }

      // Automatically load or play if configured.
      if ( _tO.autoLoad || _tO.autoPlay ) {
         if ( _s.sounds[_tO.id] ) {
            _s.sounds[_tO.id].load(_tO);
         }
      }
      if ( _tO.autoPlay ) {
         _s.sounds[_tO.id].play();
      }

      return _s.sounds[_tO.id]; // Return the newly created sound object.
   };

   // Creates a video sound object (requires Flash 9+ and MovieStar).
   this.createVideo = function( oOptions ) {
      // Handle overloaded function signature.
      if ( arguments.length == 2 ) {
         oOptions = { 'id': arguments[0], 'url': arguments[1] };
      }

      if ( _s.flashVersion >= 9 ) {
         oOptions.isMovieStar = true;
         oOptions.useVideo    = true;
      } else {
         _s._wD( 'soundManager.createVideo(): flash 9 required for video. Exiting.', 2 );
         return false;
      }

      if ( !_s.useMovieStar ) {
         _s._wD( 'soundManager.createVideo(): MovieStar mode not enabled. Exiting.', 2 );
         // return false; // This line was commented out in original - maintaining.
      }

      return _s.createSound(oOptions); // Delegate to createSound with video options.
   };

   // Destroys a sound object, freeing up resources.
   this.destroySound = function( sID, bFromSound ) {
      // Check if sound exists.
      if ( !_s._idCheck(sID) ) {
         return false;
      }

      // Remove ID from the soundIDs array.
      for ( var i = 0; i < _s.soundIDs.length; i++ ) {
         if ( _s.soundIDs[i] == sID ) {
            _s.soundIDs.splice(i, 1);
            continue; // Continue loop to check for other instances (though IDs should be unique).
         }
      }

      // Unload the sound.
      // The original code had a commented-out Flash 8 check; maintaining the current behavior.
      _s.sounds[sID].unload();

      // Destruct the JS object if not called from the SMSound instance itself.
      if ( !bFromSound ) {
         _s.sounds[sID].destruct();
      }

      delete _s.sounds[sID]; // Remove reference to the sound object.
   };

   this.destroyVideo = this.destroySound; // Alias destroySound for video objects.

   // Loads a sound.
   this.load = function( sID, oOptions ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].load(oOptions);
   };

   // Unloads a sound.
   this.unload = function( sID ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].unload();
   };

   // Plays a sound. Can also create and play if sound doesn't exist.
   this.play = function( sID, oOptions ) {
      // Ensure SM2 is ready.
      if ( !_s._didInit ) {
         throw _s._complain( 'soundManager.play(): ' + _s.strings.notReady, arguments.callee.caller );
      }

      // Check if sound exists. If not, try to create it.
      if ( !_s._idCheck(sID) ) {
         if ( typeof oOptions != 'object' ) {
            // Handle play('mySound', '/path/to/some.mp3') shorthand.
            oOptions = { url: oOptions };
         }
         if ( oOptions && oOptions.url ) {
            _s._wD( 'soundController.play(): attempting to create "' + sID + '"', 1 );
            oOptions.id = sID;
            _s.createSound(oOptions); // Create the sound.
         } else {
            return false; // Cannot play if sound doesn't exist and no URL provided.
         }
      }

      _s.sounds[sID].play(oOptions); // Play the sound.
   };

   this.start = this.play; // Alias 'start' for 'play' for convenience.

   // Sets the playback position of a sound.
   this.setPosition = function( sID, nMsecOffset ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].setPosition(nMsecOffset);
   };

   // Stops a sound.
   this.stop = function( sID ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s._wD( 'soundManager.stop(' + sID + ')', 1 );
      _s.sounds[sID].stop();
   };

   // Stops all currently playing sounds.
   this.stopAll = function() {
      _s._wD( 'soundManager.stopAll()', 1 );
      for ( var oSound in _s.sounds ) {
         // Only stop actual SMSound objects, not inherited properties.
         if ( _s.sounds[oSound] instanceof SMSound ) {
            _s.sounds[oSound].stop();
         }
      }
   };

   // Pauses a sound.
   this.pause = function( sID ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].pause();
   };

   // Pauses all sounds.
   this.pauseAll = function() {
      for ( var i = _s.soundIDs.length; i--; ) {
         _s.sounds[_s.soundIDs[i]].pause();
      }
   };

   // Resumes a paused sound.
   this.resume = function( sID ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].resume();
   };

   // Resumes all paused sounds.
   this.resumeAll = function() {
      for ( var i = _s.soundIDs.length; i--; ) {
         _s.sounds[_s.soundIDs[i]].resume();
      }
   };

   // Toggles the pause state of a sound.
   this.togglePause = function( sID ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].togglePause();
   };

   // Sets the pan (left/right stereo balance) for a sound.
   this.setPan = function( sID, nPan ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].setPan(nPan);
   };

   // Sets the volume for a sound.
   this.setVolume = function( sID, nVol ) {
      if ( !_s._idCheck(sID) ) {
         return false;
      }
      _s.sounds[sID].setVolume(nVol);
   };

   // Mutes a specific sound, or all sounds if no ID is provided.
   this.mute = function( sID ) {
      // If sID is not a string, assume global mute.
      if ( typeof sID != 'string' ) {
         sID = null;
      }

      if ( !sID ) {
         _s._wD( 'soundManager.mute(): Muting all sounds' );
         for ( var i = _s.soundIDs.length; i--; ) {
            _s.sounds[_s.soundIDs[i]].mute();
         }
         _s.muted = true; // Update global mute state.
      } else {
         if ( !_s._idCheck(sID) ) {
            return false;
         }
         _s._wD( 'soundManager.mute(): Muting "' + sID + '"' );
         _s.sounds[sID].mute();
      }
   };

   this.muteAll = function() {
      _s.mute(); // Call mute with no ID to mute all.
   };

   // Unmutes a specific sound, or all sounds if no ID is provided.
   this.unmute = function( sID ) {
      // If sID is not a string, assume global unmute.
      if ( typeof sID != 'string' ) {
         sID = null;
      }

      if ( !sID ) {
         _s._wD( 'soundManager.unmute(): Unmuting all sounds' );
         for ( var i = _s.soundIDs.length; i--; ) {
            _s.sounds[_s.soundIDs[i]].unmute();
         }
         _s.muted = false; // Update global mute state.
      } else {
         if ( !_s._idCheck(sID) ) {
            return false;
         }
         _s._wD( 'soundManager.unmute(): Unmuting "' + sID + '"' );
         _s.sounds[sID].unmute();
      }
   };

   this.unmuteAll = function() {
      _s.unmute(); // Call unmute with no ID to unmute all.
   };

   // Returns the memory usage of the Flash movie (Flash 9+ only).
   this.getMemoryUse = function() {
      if ( _s.flashVersion == 8 ) {
         return 0; // Not supported in Flash 8.
      }
      if ( _s.o ) {
         return parseInt(_s.o._getMemoryUse(), 10);
      }
      return 0; // Default if movie not available.
   };

   // Enables or disables Flash polling for sound status updates.
   this.setPolling = function( bPolling ) {
      if ( !_s.o || !_s.allowPolling ) {
         return false;
      }
      _s.o._setPolling(bPolling);
   };

   // Disables SoundManager2, destroying all functions and sounds.
   this.disable = function( bNoDisable ) {
      if ( typeof bNoDisable == 'undefined' ) {
         bNoDisable = false; // Default to false if not provided.
      }
      if ( _s._disabled ) {
         return false; // Already disabled.
      }
      _s._disabled = true;
      _s._wD( 'soundManager.disable(): Shutting down', 1 );

      // Disable all sound objects.
      for ( var i = _s.soundIDs.length; i--; ) {
         _s._disableObject( _s.sounds[_s.soundIDs[i]] );
      }

      _s.initComplete(bNoDisable); // Fire "complete" event, even on failure.
      // _s._disableObject(_s); // Original comment: "taken out to allow reboot()".
   };

   // Checks if a given URL can be played by the current Flash setup.
   this.canPlayURL = function( sURL ) {
      return ( sURL ? ( sURL.match(_s.filePattern) ? true : false ) : null );
   };

   // Retrieves a sound object by its ID.
   this.getSoundById = function( sID, suppressDebug ) {
      if ( !sID ) {
         throw new Error( 'SoundManager.getSoundById(): sID is null/undefined' );
      }
      var result = _s.sounds[sID];
      if ( !result && !suppressDebug ) {
         _s._wD( '"' + sID + '" is an invalid sound ID.', 2 );
         // soundManager._wD('trace: '+arguments.callee.caller); // Original comment.
      }
      return result;
   };

   // Placeholder for the user-defined onload function.
   // This function is intended to be overridden by the user to execute code
   // once SoundManager2 has successfully initialized and is ready to use.
   this.onload = function() {
      // window.onload() equivalent for SM2, ready to create sounds etc.
      // This is a stub - you can override this in your own external script, eg. soundManager.onload = function() {}
      soundManager._wD( 'Warning: soundManager.onload() is undefined.', 2 );
   };

} // End of SoundManager constructor.