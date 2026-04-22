var pilotControl = (function() {

  var internalState = {
    audioEngineVersion: 9,
    isVerbose: true,
    useConsoleOutput: true,
    consoleOnlyOutput: false,
    delayActivationUntilWindowLoad: false,
    emptyAudioPath: 'void.mp3',
    enablePolling: true,
    useAdvancedCodecs: false,
    backgroundColor: '#ffffff',
    optimalPerformance: false,
    engineLoadTimeout: 750,
    displayMode: null,
    allowFullscreenView: true,

    standardSettings: {
      autoLoadSource: false,
      streamContent: true,
      autoPlaySource: false,
      onMetadataAvailable: null,
      onSourceLoaded: null,
      onDownloadProgress: null,
      onPlaybackStart: null,
      onPlaybackPause: null,
      onPlaybackResume: null,
      onPlaybackProgress: null,
      onPlaybackStop: null,
      onPlaybackComplete: null,
      beforePlaybackComplete: null,
      beforePlaybackCompleteTime: 5000,
      beforePlaybackCompleteAction: null,
      justBeforePlaybackComplete: null,
      justBeforePlaybackCompleteTime: 200,
      multiShotPlayback: true,
      startOffset: null,
      stereoBalance: 0,
      outputVolume: 100
    },

    advancedEngineSettings: {
      isAdvancedCodec: null,
      usePeakData: false,
      useWaveformData: false,
      useEQData: false,
      onBufferStatusChange: null,
      onDataReadError: null
    },

    advancedCodecSettings: {
      onMediaInfo: null,
      showVideoContent: false,
      bufferDuration: null
    },

    engineObject: null,
    engineIdentifier: null,
    engineControlModule: null,
    managedAudioSources: new Map(),
    globalMuteStatus: false,
    currentFullscreenStatus: false,
    isInternetExplorer: (navigator.userAgent.match(/MSIE/i)),
    isSafariBrowser: (navigator.userAgent.match(/safari/i)),
    isGeckoBrowser: (navigator.userAgent.match(/gecko/i)),
    debugOutputIdentifier: 'audio-pilot-console',
    specialDisplayModeScenario: false,
    debugPanelOpen: true,
    engineAppended: false,
    appendSuccessful: false,
    engineInitialized: false,
    engineDisabled: false,
    windowLoadCompleted: false,
    hasConsoleSupport: (typeof console !== 'undefined' && typeof console.log !== 'undefined'),
    consoleLevels: ['log', 'info', 'warn', 'error'],
    defaultEngineVersion: 8,
    removedObject: null,
    removedObjectHTML: null,
    networkProtocolHttp: (document.location ? document.location.protocol.match(/http/i) : null),
    awaitingEngineInterface: false,
    awaitingActivation: false,
    tryActivateOnFocus: (navigator.userAgent.match(/safari/i) && typeof document.hasFocus === 'undefined'),
    isCurrentlyFocused: (typeof document.hasFocus !== 'undefined' ? document.hasFocus() : null),
    safeToDisable: true,
    useAlternateResourcePath: false,

    resourcePath: null,
    alternateResourcePath: null,
    engineLoaded: false,
    engineEnabled: false,

    audioFilePatterns: {
      version8: /\.mp3(\?.*)?$/i,
      version9: /\.mp3(\?.*)?$/i
    },

    supportedCodecTypes: ['aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'mp4v', '3gp', '3g2'],
    codecDetectionPattern: null,

    activeFilePattern: null,
    featureSupport: {
      buffering: false,
      peakData: false,
      waveformData: false,
      eqData: false,
      advancedCodecs: false
    },

    sandboxInfo: {
      type: null,
      types: {
        remote: 'remote (domain-based) rules',
        localWithFile: 'local with file access (no internet access)',
        localWithNetwork: 'local with network (internet access only, no local access)',
        localTrusted: 'local, trusted (local + internet access)'
      },
      description: null,
      noRemote: null,
      noLocal: null
    },

    messages: {
      notReady: 'Audio pilot not activated yet - invoke onEngineReady() before using audio methods',
      engineAppendFailed: 'audioPilot.deployAudioEngine(): element addition failed. May be app/xhtml+xml DOM-related.'
    }
  };

  var retrieveElement = function(elementID) {
    return document.getElementById(elementID);
  };

  var combineOptions = function(target, source) {
    var output = Object.assign({}, target);
    if (target && source && typeof source === 'object') {
      Object.keys(source).forEach(function(key) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = combineOptions(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  };

  var reportMessage = function(msg, level) {
    if (!internalState.isVerbose) {
      return;
    }
    level = level || 0;
    var consoleMethod = internalState.consoleLevels[level];
    if (internalState.hasConsoleSupport && internalState.useConsoleOutput && typeof console[consoleMethod] === 'function') {
      console[consoleMethod]('[AudioPilot] ' + msg);
    }
  };

  var raiseIssue = function(msg, caller) {
    reportMessage(msg, 3);
    return new Error(msg + (caller ? ' (from ' + caller.name + ')' : ''));
  };

  var configureEngineVersion = function() {
    if (internalState.audioEngineVersion !== 8 && internalState.audioEngineVersion !== 9) {
      reportMessage('audioPilot.audioEngineVersion must be 8 or 9. "' + internalState.audioEngineVersion + '" is invalid. Reverting to ' + internalState.defaultEngineVersion + '.', 2);
      internalState.audioEngineVersion = internalState.defaultEngineVersion;
    }
    internalState.versionInfo = 'V2.95a.20090501' + (internalState.audioEngineVersion === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)');

    if (internalState.audioEngineVersion > 8) {
      internalState.standardSettings = combineOptions(internalState.standardSettings, internalState.advancedEngineSettings);
      internalState.featureSupport.buffering = true;
    }

    if (internalState.audioEngineVersion > 8 && internalState.useAdvancedCodecs) {
      internalState.standardSettings = combineOptions(internalState.standardSettings, internalState.advancedCodecSettings);
      internalState.audioFilePatterns.version9 = new RegExp('\\.(mp3|' + internalState.supportedCodecTypes.join('|') + ')(\\?.*)?$', 'i');
      internalState.featureSupport.advancedCodecs = true;
    } else {
      internalState.useAdvancedCodecs = false;
      internalState.featureSupport.advancedCodecs = false;
    }

    internalState.activeFilePattern = internalState.audioFilePatterns[(internalState.audioEngineVersion !== 8 ? 'version9' : 'version8')];
    internalState.resourcePath = (internalState.audioEngineVersion === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf');
    internalState.featureSupport.peakData = internalState.featureSupport.waveformData = internalState.featureSupport.eqData = (internalState.audioEngineVersion > 8);
  };

  configureEngineVersion();
  internalState.codecDetectionPattern = new RegExp('\\.(' + internalState.supportedCodecTypes.join('|') + ')(\\?.*)?$', 'i');
  internalState.useAlternateResourcePath = !internalState.networkProtocolHttp;

  var mockFlashInterface = {
    _createSound: function(id, url, time, peak, waveform, eq, isMovieStar, useVideo, bufferTime) {
      reportMessage('Mock Flash: _createSound called for ' + id, 0);
    },
    _loadFromXML: function(url) {
      reportMessage('Mock Flash: _loadFromXML called for ' + url, 0);
    },
    _unloadSound: function(id) {
      reportMessage('Mock Flash: _unloadSound called for ' + id, 0);
    },
    _startSound: function(id, options) {
      reportMessage('Mock Flash: _startSound called for ' + id, 0);
    },
    _stopSound: function(id) {
      reportMessage('Mock Flash: _stopSound called for ' + id, 0);
    },
    _pauseSound: function(id) {
      reportMessage('Mock Flash: _pauseSound called for ' + id, 0);
    },
    _resumeSound: function(id) {
      reportMessage('Mock Flash: _resumeSound called for ' + id, 0);
    },
    _setPan: function(id, pan) {
      reportMessage('Mock Flash: _setPan called for ' + id, 0);
    },
    _setVolume: function(id, volume) {
      reportMessage('Mock Flash: _setVolume called for ' + id, 0);
    },
    _muteSound: function(id) {
      reportMessage('Mock Flash: _muteSound called for ' + id, 0);
    },
    _unmuteSound: function(id) {
      reportMessage('Mock Flash: _unmuteSound called for ' + id, 0);
    },
    _setPosition: function(id, offset) {
      reportMessage('Mock Flash: _setPosition called for ' + id, 0);
    },
    _getMemoryUse: function() {
      reportMessage('Mock Flash: _getMemoryUse called', 0);
      return 1024;
    },
    _setPolling: function(b) {
      reportMessage('Mock Flash: _setPolling called with ' + b, 0);
    },
  };
  internalState.engineObject = mockFlashInterface;

  var createAudioSource = function(config) {
    var audioSource = Object.assign({}, internalState.standardSettings, config, {
      sourceIdentifier: config.id,
      sourceURL: config.url || null,
      isLoaded: false,
      isPlaying: false,
      isPaused: false,
      isMuted: false,
      currentPosition: 0,
      currentVolume: config.volume || internalState.standardSettings.outputVolume,
      currentPan: config.pan || internalState.standardSettings.stereoBalance
    });

    audioSource.loadContent = function(options) {
      options = combineOptions(audioSource, options);
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Loading content from ' + audioSource.sourceURL, 0);
      internalState.engineObject._createSound(audioSource.sourceIdentifier, audioSource.sourceURL, audioSource.justBeforePlaybackCompleteTime, audioSource.usePeakData, audioSource.useWaveformData, audioSource.useEQData, audioSource.isAdvancedCodec, audioSource.showVideoContent, audioSource.bufferDuration);
      setTimeout(function() {
        audioSource.isLoaded = true;
        if (typeof audioSource.onSourceLoaded === 'function') {
          audioSource.onSourceLoaded(audioSource.sourceIdentifier);
        }
        reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Content loaded.', 0);
      }, 50);
    };

    audioSource.startPlayback = function(options) {
      options = combineOptions(audioSource, options);
      if (!audioSource.isLoaded && !options.autoLoadSource) {
        reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Not loaded, attempting auto-load before playback.', 1);
        audioSource.loadContent(options);
      }
      if (audioSource.isPlaying && !audioSource.multiShotPlayback) {
        reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Already playing (multiShotPlayback is false).', 1);
        return;
      }
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Starting playback.', 0);
      internalState.engineObject._startSound(audioSource.sourceIdentifier, options);
      audioSource.isPlaying = true;
      audioSource.isPaused = false;
      if (typeof audioSource.onPlaybackStart === 'function') {
        audioSource.onPlaybackStart(audioSource.sourceIdentifier);
      }
    };

    audioSource.haltPlayback = function() {
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Halting playback.', 0);
      internalState.engineObject._stopSound(audioSource.sourceIdentifier);
      audioSource.isPlaying = false;
      audioSource.isPaused = false;
      audioSource.currentPosition = 0;
      if (typeof audioSource.onPlaybackStop === 'function') {
        audioSource.onPlaybackStop(audioSource.sourceIdentifier);
      }
    };

    audioSource.pausePlayback = function() {
      if (!audioSource.isPlaying) return;
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Pausing playback.', 0);
      internalState.engineObject._pauseSound(audioSource.sourceIdentifier);
      audioSource.isPlaying = false;
      audioSource.isPaused = true;
      if (typeof audioSource.onPlaybackPause === 'function') {
        audioSource.onPlaybackPause(audioSource.sourceIdentifier);
      }
    };

    audioSource.resumePlayback = function() {
      if (audioSource.isPlaying || !audioSource.isPaused) return;
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Resuming playback.', 0);
      internalState.engineObject._resumeSound(audioSource.sourceIdentifier);
      audioSource.isPlaying = true;
      audioSource.isPaused = false;
      if (typeof audioSource.onPlaybackResume === 'function') {
        audioSource.onPlaybackResume(audioSource.sourceIdentifier);
      }
    };

    audioSource.togglePlaybackPause = function() {
      if (audioSource.isPlaying) {
        audioSource.pausePlayback();
      } else if (audioSource.isPaused) {
        audioSource.resumePlayback();
      } else {
        audioSource.startPlayback();
      }
    };

    audioSource.setAudioBalance = function(newPan) {
      audioSource.currentPan = newPan;
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Setting pan to ' + newPan + '.', 0);
      internalState.engineObject._setPan(audioSource.sourceIdentifier, newPan);
    };

    audioSource.setAudioVolume = function(newVolume) {
      audioSource.currentVolume = newVolume;
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Setting volume to ' + newVolume + '.', 0);
      internalState.engineObject._setVolume(audioSource.sourceIdentifier, newVolume);
    };

    audioSource.muteAudio = function() {
      if (audioSource.isMuted) return;
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Muting.', 0);
      internalState.engineObject._muteSound(audioSource.sourceIdentifier);
      audioSource.isMuted = true;
    };

    audioSource.unmuteAudio = function() {
      if (!audioSource.isMuted) return;
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Unmuting.', 0);
      internalState.engineObject._unmuteSound(audioSource.sourceIdentifier);
      audioSource.isMuted = false;
    };

    audioSource.setPlaybackPosition = function(offsetMsec) {
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Setting position to ' + offsetMsec + 'ms.', 0);
      audioSource.currentPosition = offsetMsec;
      internalState.engineObject._setPosition(audioSource.sourceIdentifier, offsetMsec);
    };

    audioSource.releaseSource = function() {
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Releasing source.', 0);
      internalState.engineObject._unloadSound(audioSource.sourceIdentifier);
      audioSource.isLoaded = false;
      audioSource.isPlaying = false;
      audioSource.isPaused = false;
      audioSource.currentPosition = 0;
    };

    audioSource.disposeSource = function() {
      reportMessage('AudioSource "' + audioSource.sourceIdentifier + '": Disposing source.', 0);
      audioSource.releaseSource();
      for (var prop in audioSource) {
        if (audioSource.hasOwnProperty(prop)) {
          delete audioSource[prop];
        }
      }
    };

    return audioSource;
  };

  var audioPilotAPI = {
    engineVersion: internalState.audioEngineVersion,
    verboseMode: internalState.isVerbose,
    useConsole: internalState.useConsoleOutput,
    consoleOnly: internalState.consoleOnlyOutput,
    deferWindowLoad: internalState.delayActivationUntilWindowLoad,
    nullAudioPath: internalState.emptyAudioPath,
    allowStatusPolling: internalState.enablePolling,
    useAdvancedCodecs: internalState.useAdvancedCodecs,
    backgroundColor: internalState.backgroundColor,
    highPerformanceMode: internalState.optimalPerformance,
    engineLoadTimeout: internalState.engineLoadTimeout,
    windowMode: internalState.displayMode,
    allowFullscreen: internalState.allowFullscreenView,
    defaultAudioSettings: internalState.standardSettings,

    isEngineActive: function() {
      return (internalState.engineInitialized && !internalState.engineDisabled);
    },

    retrieveEngineObject: function(engineIdentifier) {
      return internalState.isInternetExplorer ? window[engineIdentifier] : (internalState.isSafariBrowser ? retrieveElement(engineIdentifier) || document[engineIdentifier] : retrieveElement(engineIdentifier));
    },

    loadConfigurationFromXML: function(xmlURL) {
      try {
        internalState.engineObject._loadFromXML(xmlURL);
      } catch (e) {
        audioPilotAPI.disableEngine(false);
        return true;
      }
    },

    createAudio: function(options) {
      if (!internalState.engineInitialized) {
        throw raiseIssue('audioPilot.createAudio(): ' + internalState.messages.notReady, arguments.callee.caller);
      }
      if (arguments.length === 2) {
        options = {
          id: arguments[0],
          url: arguments[1]
        };
      }

      var currentOptions = combineOptions(internalState.standardSettings, options);
      reportMessage('audioPilot.createAudio(): ' + currentOptions.id + ' (' + currentOptions.url + ')', 1);

      if (internalState.managedAudioSources.has(currentOptions.id)) {
        reportMessage('audioPilot.createAudio(): ' + currentOptions.id + ' already exists', 1);
        return internalState.managedAudioSources.get(currentOptions.id);
      }

      if (internalState.audioEngineVersion > 8 && internalState.useAdvancedCodecs) {
        if (currentOptions.isAdvancedCodec === null) {
          currentOptions.isAdvancedCodec = (currentOptions.url && currentOptions.url.match(internalState.codecDetectionPattern) ? true : false);
        }
        if (currentOptions.isAdvancedCodec) {
          reportMessage('audioPilot.createAudio(): using advanced codec handling', 0);
        }
        if (currentOptions.isAdvancedCodec && (currentOptions.usePeakData || currentOptions.useWaveformData || currentOptions.useEQData)) {
          reportMessage('Warning: peak/waveform/eqData features unsupported for non-MP3 formats with advanced codecs', 2);
          currentOptions.usePeakData = false;
          currentOptions.useWaveformData = false;
          currentOptions.useEQData = false;
        }
      }

      var newAudioSource = createAudioSource(currentOptions);
      internalState.managedAudioSources.set(currentOptions.id, newAudioSource);

      if (currentOptions.autoLoadSource || currentOptions.autoPlaySource) {
        if (internalState.managedAudioSources.has(currentOptions.id)) {
          internalState.managedAudioSources.get(currentOptions.id).loadContent(currentOptions);
        }
      }
      if (currentOptions.autoPlaySource) {
        internalState.managedAudioSources.get(currentOptions.id).startPlayback(currentOptions);
      }

      return newAudioSource;
    },

    createVideoSource: function(options) {
      if (arguments.length === 2) {
        options = {
          id: arguments[0],
          url: arguments[1]
        };
      }
      if (internalState.audioEngineVersion >= 9) {
        options.isAdvancedCodec = true;
        options.showVideoContent = true;
      } else {
        reportMessage('audioPilot.createVideoSource(): engine version 9+ required for video. Exiting.', 2);
        return false;
      }
      if (!internalState.useAdvancedCodecs) {
        reportMessage('audioPilot.createVideoSource(): Advanced codec mode not enabled. Exiting.', 2);
      }
      return audioPilotAPI.createAudio(options);
    },

    removeAudio: function(sourceID, fromAudioObject) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      var audio = internalState.managedAudioSources.get(sourceID);
      audio.releaseSource();
      if (!fromAudioObject) {
        audio.disposeSource();
      }
      internalState.managedAudioSources.delete(sourceID);
      return true;
    },

    removeVideoSource: function(sourceID, fromVideoObject) {
      return audioPilotAPI.removeAudio(sourceID, fromVideoObject);
    },

    loadAudio: function(sourceID, options) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).loadContent(options);
      return true;
    },

    unloadAudio: function(sourceID) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).releaseSource();
      return true;
    },

    playAudio: function(sourceID, options) {
      if (!internalState.engineInitialized) {
        throw raiseIssue('audioPilot.playAudio(): ' + internalState.messages.notReady, arguments.callee.caller);
      }
      if (!internalState.managedAudioSources.has(sourceID)) {
        if (typeof options !== 'object' && options) {
          options = {
            url: options
          };
        }
        if (options && options.url) {
          reportMessage('audioPilot.playAudio(): attempting to create "' + sourceID + '"', 1);
          options.id = sourceID;
          audioPilotAPI.createAudio(options);
        } else {
          return false;
        }
      }
      internalState.managedAudioSources.get(sourceID).startPlayback(options);
      return true;
    },

    beginAudio: function(sourceID, options) {
      return audioPilotAPI.playAudio(sourceID, options);
    },

    setAudioPosition: function(sourceID, offsetMsec) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).setPlaybackPosition(offsetMsec);
      return true;
    },

    stopAudio: function(sourceID) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      reportMessage('audioPilot.stopAudio(' + sourceID + ')', 1);
      internalState.managedAudioSources.get(sourceID).haltPlayback();
      return true;
    },

    stopAllAudio: function() {
      reportMessage('audioPilot.stopAllAudio()', 1);
      internalState.managedAudioSources.forEach(function(audio) {
        audio.haltPlayback();
      });
    },

    pauseAudio: function(sourceID) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).pausePlayback();
      return true;
    },

    pauseAllAudio: function() {
      internalState.managedAudioSources.forEach(function(audio) {
        audio.pausePlayback();
      });
    },

    resumeAudio: function(sourceID) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).resumePlayback();
      return true;
    },

    resumeAllAudio: function() {
      internalState.managedAudioSources.forEach(function(audio) {
        audio.resumePlayback();
      });
    },

    toggleAudioPause: function(sourceID) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).togglePlaybackPause();
      return true;
    },

    setAudioBalance: function(sourceID, panValue) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).setAudioBalance(panValue);
      return true;
    },

    setAudioVolume: function(sourceID, volumeValue) {
      if (!internalState.managedAudioSources.has(sourceID)) {
        return false;
      }
      internalState.managedAudioSources.get(sourceID).setAudioVolume(volumeValue);
      return true;
    },

    muteAudio: function(sourceID) {
      if (typeof sourceID !== 'string') {
        sourceID = null;
      }
      if (!sourceID) {
        reportMessage('audioPilot.muteAudio(): Muting all audio sources');
        internalState.managedAudioSources.forEach(function(audio) {
          audio.muteAudio();
        });
        internalState.globalMuteStatus = true;
      } else {
        if (!internalState.managedAudioSources.has(sourceID)) {
          return false;
        }
        reportMessage('audioPilot.muteAudio(): Muting "' + sourceID + '"');
        internalState.managedAudioSources.get(sourceID).muteAudio();
      }
      return true;
    },

    muteAllAudio: function() {
      audioPilotAPI.muteAudio();
    },

    unmuteAudio: function(sourceID) {
      if (typeof sourceID !== 'string') {
        sourceID = null;
      }
      if (!sourceID) {
        reportMessage('audioPilot.unmuteAudio(): Unmuting all audio sources');
        internalState.managedAudioSources.forEach(function(audio) {
          audio.unmuteAudio();
        });
        internalState.globalMuteStatus = false;
      } else {
        if (!internalState.managedAudioSources.has(sourceID)) {
          return false;
        }
        reportMessage('audioPilot.unmuteAudio(): Unmuting "' + sourceID + '"');
        internalState.managedAudioSources.get(sourceID).unmuteAudio();
      }
      return true;
    },

    unmuteAllAudio: function() {
      audioPilotAPI.unmuteAudio();
    },

    getEngineMemoryUsage: function() {
      if (internalState.audioEngineVersion === 8) {
        return 0;
      }
      if (internalState.engineObject) {
        return parseInt(internalState.engineObject._getMemoryUse(), 10);
      }
      return 0;
    },

    setEnginePolling: function(enablePolling) {
      if (!internalState.engineObject || !internalState.allowStatusPolling) {
        return false;
      }
      internalState.engineObject._setPolling(enablePolling);
      return true;
    },

    disableEngine: function(doNotDisable) {
      if (typeof doNotDisable === 'undefined') {
        doNotDisable = false;
      }
      if (internalState.engineDisabled) {
        return false;
      }
      internalState.engineDisabled = true;
      reportMessage('audioPilot.disableEngine(): Shutting down', 1);
      internalState.managedAudioSources.forEach(function(audio) {
        audio.disposeSource();
      });
      audioPilotAPI.initComplete(!doNotDisable);
      return true;
    },

    canHandleURL: function(url) {
      return (url ? (url.match(internalState.activeFilePattern) ? true : false) : null);
    },

    getAudioById: function(sourceID, suppressReporting) {
      if (!sourceID) {
        throw new Error('audioPilot.getAudioById(): sourceID is null/undefined');
      }
      var result = internalState.managedAudioSources.get(sourceID);
      if (!result && !suppressReporting) {
        reportMessage('"' + sourceID + '" is an invalid audio source ID.', 2);
      }
      return result;
    },

    onEngineReady: function() {
      reportMessage('Warning: audioPilot.onEngineReady() is undefined.', 2);
    },

    initComplete: function(success) {
      internalState.engineInitialized = true;
      internalState.engineEnabled = success;
      if (success) {
        reportMessage('AudioPilot engine initialized successfully.', 0);
        if (typeof audioPilotAPI.onEngineReady === 'function') {
          audioPilotAPI.onEngineReady();
        }
      } else {
        reportMessage('AudioPilot engine failed to initialize.', 3);
      }
    },

    activateEngine: function() {
      if (internalState.engineInitialized) {
        reportMessage('Engine already activated.', 1);
        return;
      }
      reportMessage('Activating AudioPilot engine...', 0);
      setTimeout(function() {
        audioPilotAPI.initComplete(true);
      }, 10);
    }
  };

  if (!window.deferPilotActivation) {
    audioPilotAPI.activateEngine();
  } else {
    reportMessage('AudioPilot activation deferred. Call audioPilot.activateEngine() manually.', 1);
  }

  return audioPilotAPI;

})();

var deferPilotActivation = true;