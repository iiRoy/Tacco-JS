(function() {
  'use strict';

  const _MEDIA_STORAGE_BASE = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
  const _MEDIA_CATALOG_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/videos.json';
  const _DISPLAY_BAR_WIDTH_PIXELS = 600;

  const _SYSTEM_STATE_CODES = {
    'INACTIVE': 0,
    'OPERATIONAL': 1,
    'ATTENTION_NEEDED': 2,
    'CRITICAL_FAILURE': 3,
  };

  const _PLAYBACK_STAGE_CODES = {
    'INACTIVE': 'IDLE',
    'FETCHING': 'LOADING',
    'READY': 'LOADED',
    'STREAMING': 'PLAYING',
    'PAUSED': 'PAUSED',
    'HALTED': 'STOPPED',
    'NAVIGATING': 'SEEKING',
    'ISSUE': 'ERROR'
  };

  const _playerSystemState = {
    _currentSystemStatus: _SYSTEM_STATE_CODES.INACTIVE,
    _chromecastReceiversAvailable: false,

    _activeMediaSessionInstance: null,
    _currentAudioLevel: 0.5,
    _shouldAutoStart: true,
    _activeChromecastConnection: null,
    _chromecastPlaybackStage: _PLAYBACK_STAGE_CODES.INACTIVE,

    _localPlaybackStage: _PLAYBACK_STAGE_CODES.INACTIVE,
    _localVideoPlayerRef: null,
    _isFullScreenMode: false,

    _audioOutputEnabled: true,
    _selectedContentIndex: 0,
    _currentPlaybackTime: 0,
    _totalContentDuration: -1,
    _playbackProgressTimer: null,
    _isUpdatingProgressFromEvent: true,
    _progressUpdateIntervalMs: 1000,

    _loadedContentCatalog: null,

    _uiElements: {
      videoElement: null,
      progressBarIndicator: null,
      progressBarFill: null,
      mediaTitle: null,
      mediaSubtitle: null,
      mediaDescription: null,
      durationDisplay: null,
      videoImage: null,
      playPauseButton: null,
      stopButton: null,
      castButton: null,
      volumeMuteButton: null,
      mediaListContainer: null,
    },
  };

  const _refreshDisplayComponents = () => {
    const castBtn = _playerSystemState._uiElements.castButton;
    if (castBtn) {
      if (_playerSystemState._chromecastReceiversAvailable) {
        castBtn.style.display = 'block';
      } else {
        castBtn.style.display = 'none';
      }

      if (_playerSystemState._currentSystemStatus === _SYSTEM_STATE_CODES.OPERATIONAL) {
        castBtn.textContent = 'Disconnect';
      } else {
        castBtn.textContent = 'Cast';
      }
    }

    const playPauseBtn = _playerSystemState._uiElements.playPauseButton;
    const stopBtn = _playerSystemState._uiElements.stopButton;
    if (playPauseBtn && stopBtn) {
      if (_playerSystemState._chromecastPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING || _playerSystemState._localPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING) {
        playPauseBtn.textContent = 'Pause';
        stopBtn.style.display = 'block';
      } else if (_playerSystemState._chromecastPlaybackStage === _PLAYBACK_STAGE_CODES.PAUSED || _playerSystemState._localPlaybackStage === _PLAYBACK_STAGE_CODES.PAUSED) {
        playPauseBtn.textContent = 'Play';
        stopBtn.style.display = 'block';
      } else {
        playPauseBtn.textContent = 'Play';
        stopBtn.style.display = 'none';
      }
    }

    if (_playerSystemState._loadedContentCatalog && _playerSystemState._loadedContentCatalog[_playerSystemState._selectedContentIndex]) {
      const media = _playerSystemState._loadedContentCatalog[_playerSystemState._selectedContentIndex];
      _playerSystemState._uiElements.mediaTitle.textContent = media.title;
      _playerSystemState._uiElements.mediaSubtitle.textContent = media.subtitle;
      _playerSystemState._uiElements.mediaDescription.textContent = media.description;
    }

    if (_playerSystemState._uiElements.durationDisplay) {
        let duration = _playerSystemState._totalContentDuration;
        let formattedDuration = '';
        if (duration < 0) {
            formattedDuration = '--:--';
        } else {
            const hours = Math.floor(duration / 3600);
            duration %= 3600;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);

            const pad = (num) => String(num).padStart(2, '0');

            if (hours > 0) {
                formattedDuration = `${hours}:${pad(minutes)}:${pad(seconds)}`;
            } else {
                formattedDuration = `${minutes}:${pad(seconds)}`;
            }
        }
        _playerSystemState._uiElements.durationDisplay.textContent = formattedDuration;
    }

    const mediaList = _playerSystemState._uiElements.mediaListContainer;
    if (mediaList) {
        Array.from(mediaList.children).forEach((child, idx) => {
            if (idx === _playerSystemState._selectedContentIndex) {
                child.classList.add('selected');
            } else {
                child.classList.remove('selected');
            }
        });
    }
  };

  const _updateProgressBarDisplay = (fromEvent = false) => {
    if (!_playerSystemState._uiElements.progressBarFill || !_playerSystemState._uiElements.progressBarIndicator) return;

    if (_playerSystemState._totalContentDuration > 0) {
      const progressRatio = _playerSystemState._currentPlaybackTime / _playerSystemState._totalContentDuration;
      const filledWidth = progressRatio * _DISPLAY_BAR_WIDTH_PIXELS;
      _playerSystemState._uiElements.progressBarFill.style.width = filledWidth + 'px';
      _playerSystemState._uiElements.progressBarIndicator.style.marginLeft = (filledWidth - 21) + 'px';

      if (fromEvent) {
          _playerSystemState._isUpdatingProgressFromEvent = true;
      } else {
          _playerSystemState._isUpdatingProgressFromEvent = false;
      }
    } else {
      _playerSystemState._uiElements.progressBarFill.style.width = '0px';
      _playerSystemState._uiElements.progressBarIndicator.style.marginLeft = -21 - _DISPLAY_BAR_WIDTH_PIXELS + 'px';
    }
  };

  const _advancePlaybackTime = () => {
    const isPlaying = _playerSystemState._chromecastPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING ||
                      _playerSystemState._localPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING;

    if (isPlaying) {
      if (_playerSystemState._currentPlaybackTime < _playerSystemState._totalContentDuration) {
        _playerSystemState._currentPlaybackTime += 1;
        _updateProgressBarDisplay(false);
      } else {
        _playerSystemState._currentPlaybackTime = 0;
        clearInterval(_playerSystemState._playbackProgressTimer);
        _playerSystemState._playbackProgressTimer = null;
      }
    }
  };

  const _initiateProgressTracker = (advancer) => {
      if (_playerSystemState._playbackProgressTimer) {
          clearInterval(_playerSystemState._playbackProgressTimer);
      }
      _playerSystemState._playbackProgressTimer = setInterval(advancer, _playerSystemState._progressUpdateIntervalMs);
  };

  const _configureLocalPlayer = () => {
    _playerSystemState._uiElements.videoElement = document.getElementById('video_element');
    _playerSystemState._localVideoPlayerRef = _playerSystemState._uiElements.videoElement;

    if (_playerSystemState._localVideoPlayerRef) {
      _playerSystemState._localVideoPlayerRef.addEventListener('loadeddata', () => {
        _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.READY;
        _playerSystemState._totalContentDuration = _playerSystemState._localVideoPlayerRef.duration;
        if (_playerSystemState._shouldAutoStart) {
            _playerSystemState._localVideoPlayerRef.play();
            _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.STREAMING;
            _initiateProgressTracker(_advancePlaybackTime);
        }
        _refreshDisplayComponents();
      });

      _playerSystemState._localVideoPlayerRef.addEventListener('timeupdate', () => {
          if (!_playerSystemState._isUpdatingProgressFromEvent) {
              _playerSystemState._currentPlaybackTime = _playerSystemState._localVideoPlayerRef.currentTime;
              _updateProgressBarDisplay(true);
          }
      });
      _playerSystemState._localVideoPlayerRef.addEventListener('play', () => {
          _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.STREAMING;
          _initiateProgressTracker(_advancePlaybackTime);
          _refreshDisplayComponents();
      });
      _playerSystemState._localVideoPlayerRef.addEventListener('pause', () => {
          _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.PAUSED;
          clearInterval(_playerSystemState._playbackProgressTimer);
          _playerSystemState._playbackProgressTimer = null;
          _refreshDisplayComponents();
      });
      _playerSystemState._localVideoPlayerRef.addEventListener('ended', () => {
          _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.HALTED;
          _playerSystemState._currentPlaybackTime = 0;
          clearInterval(_playerSystemState._playbackProgressTimer);
          _playerSystemState._playbackProgressTimer = null;
          _updateProgressBarDisplay();
          _refreshDisplayComponents();
      });
    }
  };

  const _onChromecastApiReady = () => {
    console.log("Chromecast API initialized successfully.");
    _refreshDisplayComponents();
  };

  const _onChromecastApiError = (err) => {
    console.error("Chromecast API initialization error:", err);
  };

  const _onSessionChange = (sessionInstance) => {
    _playerSystemState._activeChromecastConnection = sessionInstance;
    if (_playerSystemState._activeChromecastConnection) {
      _playerSystemState._currentSystemStatus = _SYSTEM_STATE_CODES.OPERATIONAL;
      if (_playerSystemState._activeChromecastConnection.media[0]) {
        _onContentLoadCompletion('activeSession', _playerSystemState._activeChromecastConnection.media[0]);

        const currentContentURI = _playerSystemState._activeChromecastConnection.media[0].media.contentId;
        const matchedIndex = _playerSystemState._loadedContentCatalog.findIndex(item => item.sources[0] === currentContentURI);
        if (matchedIndex !== -1) {
            _playerSystemState._selectedContentIndex = matchedIndex;
        }

        _refreshDisplayComponents();
      } else {
        _projectMediaToReceiver(_playerSystemState._selectedContentIndex);
      }
      _playerSystemState._activeChromecastConnection.addUpdateListener(_onSessionUpdate);
    }
  };

  const _onReceiverStatusUpdate = (availability) => {
    if (availability === 'available') {
      _playerSystemState._chromecastReceiversAvailable = true;
      console.log("Chromecast receivers found.");
    } else {
      _playerSystemState._chromecastReceiversAvailable = false;
      console.log("No Chromecast receivers available.");
    }
    _refreshDisplayComponents();
  };

  const _onSessionUpdate = (isSessionAlive) => {
    if (!isSessionAlive) {
      _playerSystemState._activeChromecastConnection = null;
      _playerSystemState._currentSystemStatus = _SYSTEM_STATE_CODES.INACTIVE;
      _playerSystemState._chromecastPlaybackStage = _PLAYBACK_STAGE_CODES.INACTIVE;
      _playerSystemState._activeMediaSessionInstance = null;
      clearInterval(_playerSystemState._playbackProgressTimer);
      _playerSystemState._playbackProgressTimer = null;
      _refreshDisplayComponents();

      if (navigator.onLine) {
        console.log("Chromecast session terminated. Resuming local playback at:", _playerSystemState._currentPlaybackTime);
        _initiateLocalPlayback();
        _refreshDisplayComponents();
      }
    }
  };

  const _onReceiverLaunchFailure = (err) => {
    console.error("Failed to launch Chromecast receiver application:", err);
    _playerSystemState._currentSystemStatus = _SYSTEM_STATE_CODES.CRITICAL_FAILURE;
    _refreshDisplayComponents();
  };

  const _onReceiverStopSuccess = (message) => {
    console.log("Chromecast receiver stopped:", message);
    _playerSystemState._currentSystemStatus = _SYSTEM_STATE_CODES.INACTIVE;
    _playerSystemState._chromecastPlaybackStage = _PLAYBACK_STAGE_CODES.INACTIVE;
    _playerSystemState._activeMediaSessionInstance = null;
    clearInterval(_playerSystemState._playbackProgressTimer);
    _playerSystemState._playbackProgressTimer = null;
    _refreshDisplayComponents();

    console.log("Resuming local playback at:", _playerSystemState._currentPlaybackTime);
    _initiateLocalPlayback();
    _refreshDisplayComponents();
  };

  const _onContentLoadCompletion = (source, mediaSession) => {
    console.log("New media session ID:", mediaSession.mediaSessionId, `(${source})`);
    _playerSystemState._activeMediaSessionInstance = mediaSession;

    if (source === 'loadMedia') {
      _playerSystemState._chromecastPlaybackStage = _playerSystemState._shouldAutoStart ? _PLAYBACK_STAGE_CODES.STREAMING : _PLAYBACK_STAGE_CODES.READY;
    }
    if (source === 'activeSession') {
      _playerSystemState._chromecastPlaybackStage = mediaSession.playerState;
      _playerSystemState._currentPlaybackTime = mediaSession.currentTime;
    }

    if (_playerSystemState._chromecastPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING) {
      _initiateProgressTracker(_advancePlaybackTime);
    }

    _playerSystemState._activeMediaSessionInstance.addUpdateListener(_onContentStatusNotification);

    _playerSystemState._totalContentDuration = _playerSystemState._activeMediaSessionInstance.media.duration;

    if (_playerSystemState._localPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING) {
      _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.HALTED;
      _playerSystemState._uiElements.videoImage.style.display = 'block';
      _playerSystemState._localVideoPlayerRef.style.display = 'none';
      _playerSystemState._localVideoPlayerRef.pause();
    }
    _refreshDisplayComponents();
  };

  const _onContentLoadIssue = (err) => {
    console.error("Chromecast media load error:", err);
    _playerSystemState._chromecastPlaybackStage = _PLAYBACK_STAGE_CODES.ISSUE;
    _refreshDisplayComponents();
  };

  const _onContentStatusNotification = (isContentActive) => {
    if (!isContentActive) {
      _playerSystemState._currentPlaybackTime = 0;
      _playerSystemState._chromecastPlaybackStage = _PLAYBACK_STAGE_CODES.INACTIVE;
      clearInterval(_playerSystemState._playbackProgressTimer);
      _playerSystemState._playbackProgressTimer = null;
    }
    console.log("Chromecast media status update.");
    if (_playerSystemState._activeMediaSessionInstance) {
        _playerSystemState._currentPlaybackTime = _playerSystemState._activeMediaSessionInstance.currentTime;
        _updateProgressBarDisplay(true);
    } else {
        _updateProgressBarDisplay();
    }
    _refreshDisplayComponents();
  };

  const _beginChromecastIntegration = () => {
    if (!window.chrome || !window.chrome.cast || !window.chrome.cast.isAvailable) {
      setTimeout(_beginChromecastIntegration, 1000);
      return;
    }

    const receiverAppID = '4F8B3483';
    const autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;

    const sessionReq = new chrome.cast.SessionRequest(receiverAppID);
    const apiConfiguration = new chrome.cast.ApiConfig(
      sessionReq,
      _onSessionChange,
      _onReceiverStatusUpdate,
      autoJoinPolicy
    );

    window.chrome.cast.initialize(apiConfiguration, _onChromecastApiReady, _onChromecastApiError);

    _addMediaThumbnails();
    _prepareUserInterface();
  };

  const _pickContentItem = (contentIndex) => {
    console.log("Content item selected:", contentIndex);

    _playerSystemState._selectedContentIndex = contentIndex;

    _playerSystemState._uiElements.progressBarFill.style.width = '0px';
    _playerSystemState._uiElements.progressBarIndicator.style.marginLeft = -21 - _DISPLAY_BAR_WIDTH_PIXELS + 'px';

    _playerSystemState._currentPlaybackTime = 0;

    if (!_playerSystemState._activeMediaSessionInstance) {
      _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.INACTIVE;
      _initiateLocalPlayback();
    } else {
      _playerSystemState._chromecastPlaybackStage = _PLAYBACK_STAGE_CODES.INACTIVE;
      _projectMediaToReceiver(_playerSystemState._selectedContentIndex);
    }
    _refreshDisplayComponents();
  };

  const _startReceiverConnection = () => {
    console.log("Initiating receiver connection...");
    window.chrome.cast.requestSession(_onSessionChange, _onReceiverLaunchFailure);
    if (_playerSystemState._playbackProgressTimer) {
      clearInterval(_playerSystemState._playbackProgressTimer);
      _playerSystemState._playbackProgressTimer = null;
    }
  };

  const _terminateReceiverConnection = () => {
    if (_playerSystemState._activeChromecastConnection) {
      _playerSystemState._activeChromecastConnection.stop(
        (msg) => _onReceiverStopSuccess('Connection terminated'),
        _onChromecastApiError
      );
    }
  };

  const _projectMediaToReceiver = (contentIdx) => {
    if (!_playerSystemState._activeChromecastConnection) {
      console.log("No active Chromecast connection.");
      return;
    }
    console.log("Loading media:", _playerSystemState._loadedContentCatalog[contentIdx].title);

    const contentItem = _playerSystemState._loadedContentCatalog[contentIdx];
    const mediaDescriptor = new chrome.cast.media.MediaInfo(contentItem.sources[0]);

    mediaDescriptor.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaDescriptor.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
    mediaDescriptor.contentType = 'video/mp4';

    mediaDescriptor.metadata.title = contentItem.title;
    mediaDescriptor.metadata.images = [{'url': _MEDIA_STORAGE_BASE + contentItem.thumb}];

    const loadRequest = new chrome.cast.media.LoadRequest(mediaDescriptor);
    loadRequest.autoplay = _playerSystemState._shouldAutoStart;

    if (_playerSystemState._localPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING) {
      loadRequest.currentTime = _playerSystemState._localVideoPlayerRef.currentTime;
      _playerSystemState._localVideoPlayerRef.pause();
      _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.HALTED;
    } else {
      loadRequest.currentTime = 0;
    }

    _playerSystemState._chromecastPlaybackStage = _PLAYBACK_STAGE_CODES.FETCHING;
    _playerSystemState._activeChromecastConnection.loadMedia(
      loadRequest,
      (session) => _onContentLoadCompletion('loadMedia', session),
      _onContentLoadIssue
    );

    _refreshDisplayComponents();
  };

  const _initiateLocalPlayback = () => {
    _playerSystemState._uiElements.videoImage.style.display = 'none';
    _playerSystemState._localVideoPlayerRef.style.display = 'block';

    const currentMedia = _playerSystemState._loadedContentCatalog[_playerSystemState._selectedContentIndex];

    if (_playerSystemState._localPlaybackStage !== _PLAYBACK_STAGE_CODES.STREAMING &&
        _playerSystemState._localPlaybackStage !== _PLAYBACK_STAGE_CODES.PAUSED) {
      _playerSystemState._localVideoPlayerRef.src = currentMedia.sources[0];
      _playerSystemState._localVideoPlayerRef.load();
    } else {
      _playerSystemState._localVideoPlayerRef.play();
      _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.STREAMING;
      _initiateProgressTracker(_advancePlaybackTime);
    }
    _refreshDisplayComponents();
  };

  const _addMediaThumbnails = async () => {
    try {
      const response = await fetch(_MEDIA_CATALOG_URL);
      _playerSystemState._loadedContentCatalog = await response.json();
      console.log("Media catalog loaded:", _playerSystemState._loadedContentCatalog);

      const mediaList = document.getElementById('media_list');
      _playerSystemState._uiElements.mediaListContainer = mediaList;
      if (mediaList) {
          mediaList.innerHTML = '';
          _playerSystemState._loadedContentCatalog.forEach((media, index) => {
              const itemDiv = document.createElement('div');
              itemDiv.className = 'media-item';
              itemDiv.innerHTML = `
                  <img src="${_MEDIA_STORAGE_BASE}${media.thumb}" alt="${media.title}" style="width:100px; height:auto;">
                  <p>${media.title}</p>
              `;
              itemDiv.onclick = () => _pickContentItem(index);
              mediaList.appendChild(itemDiv);
          });
      }
      _refreshDisplayComponents();
    } catch (error) {
      console.error("Failed to load media catalog:", error);
    }
  };

  const _prepareUserInterface = () => {
    _playerSystemState._uiElements.progressBarIndicator = document.getElementById("progress_indicator");
    _playerSystemState._uiElements.progressBarFill = document.getElementById("progress");
    _playerSystemState._uiElements.mediaTitle = document.getElementById("media_title");
    _playerSystemState._uiElements.mediaSubtitle = document.getElementById("media_subtitle");
    _playerSystemState._uiElements.mediaDescription = document.getElementById("media_desc");
    _playerSystemState._uiElements.durationDisplay = document.getElementById("duration");
    _playerSystemState._uiElements.videoImage = document.getElementById('video_image');
    _playerSystemState._uiElements.playPauseButton = document.getElementById('play_pause_button');
    _playerSystemState._uiElements.stopButton = document.getElementById('stop_button');
    _playerSystemState._uiElements.castButton = document.getElementById('cast_button');
    _playerSystemState._uiElements.volumeMuteButton = document.getElementById('volume_mute_button');

    const castButton = _playerSystemState._uiElements.castButton;
    if (castButton) {
        castButton.onclick = () => {
            if (_playerSystemState._currentSystemStatus === _SYSTEM_STATE_CODES.OPERATIONAL) {
                _terminateReceiverConnection();
            } else {
                _startReceiverConnection();
            }
        };
    }
    const playPauseButton = _playerSystemState._uiElements.playPauseButton;
    if (playPauseButton) {
        playPauseButton.onclick = () => {
            if (_playerSystemState._activeMediaSessionInstance) {
                if (_playerSystemState._chromecastPlaybackStage === _PLAYBACK_STAGE_CODES.STREAMING) {
                    const mediaSession = _playerSystemState._activeMediaSessionInstance;
                    const pauseReq = new chrome.cast.media.PauseRequest();
                    mediaSession.pause(null, null);
                } else {
                    const mediaSession = _playerSystemState._activeMediaSessionInstance;
                    const playReq = new chrome.cast.media.PlayRequest();
                    mediaSession.play(null, null);
                }
            } else if (_playerSystemState._localVideoPlayerRef) {
                if (_playerSystemState._localVideoPlayerRef.paused) {
                    _initiateLocalPlayback();
                } else {
                    _playerSystemState._localVideoPlayerRef.pause();
                }
            }
        };
    }
    const stopButton = _playerSystemState._uiElements.stopButton;
    if (stopButton) {
        stopButton.onclick = () => {
            if (_playerSystemState._activeMediaSessionInstance) {
                _terminateReceiverConnection();
            } else if (_playerSystemState._localVideoPlayerRef) {
                _playerSystemState._localVideoPlayerRef.pause();
                _playerSystemState._localVideoPlayerRef.currentTime = 0;
                _playerSystemState._localPlaybackStage = _PLAYBACK_STAGE_CODES.HALTED;
                _playerSystemState._currentPlaybackTime = 0;
                clearInterval(_playerSystemState._playbackProgressTimer);
                _playerSystemState._playbackProgressTimer = null;
                _updateProgressBarDisplay();
                _refreshDisplayComponents();
            }
        };
    }
  };

  const _initializePlaybackModule = () => {
    _configureLocalPlayer();
    _beginChromecastIntegration();
  };

  document.addEventListener('DOMContentLoaded', _initializePlaybackModule);

})();