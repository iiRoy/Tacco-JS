const CAST_APPLICATION_ID = "CC1AD845";
const MEDIA_CONTENT_TYPE = "video/mp4";

class MediaTransmissionHub {
    #chromecastSession = null;
    #activePlaybackElement = null;
    #mediaSourceIdentifier = "";
    #currentAudioLevel = 0.5;
    #isPositionMonitoringEnabled = true;
    #isVolumeMonitoringEnabled = true;
    #lastRecordedPlaytime = 0;

    #interfaceElements = {};

    constructor(domMapping) {
        this.#interfaceElements = {
            messageOutput: document.getElementById(domMapping.messageOutputId),
            progressControl: document.getElementById(domMapping.progressControlId),
            volumeControl: document.getElementById(domMapping.volumeControlId),
            muteToggle: document.getElementById(domMapping.muteToggleId),
            muteFeedback: document.getElementById(domMapping.muteFeedbackId),
            actionButton: document.getElementById(domMapping.actionButtonId),
            mediaTitle: document.getElementById(domMapping.mediaTitleId),
            totalDuration: document.getElementById(domMapping.totalDurationId),
            elapsedTime: document.getElementById(domMapping.elapsedTimeId),
            playbackStatus: document.getElementById(domMapping.playbackStatusId)
        };

        if (typeof window.chrome !== 'undefined' && window.chrome.cast && window.chrome.cast.isAvailable) {
            this._configureCastConnection();
        } else {
            setTimeout(() => this._configureCastConnection(), 1000);
        }
    }

    _configureCastConnection() {
        const appRequest = new chrome.cast.SessionRequest(CAST_APPLICATION_ID);
        const configOptions = new chrome.cast.ApiConfig(
            appRequest,
            this._onSessionEstablished.bind(this),
            this._onDeviceAvailabilityChange.bind(this)
        );
        chrome.cast.initialize(configOptions, this._onConnectionReady.bind(this), this._onConnectionError.bind(this));
    }

    _onConnectionReady() {
        this._writeLogMessage("System ready for casting");
    }

    _onConnectionError(err) {
        console.error("Cast connection failure:", err);
        this._writeLogMessage("System connection failed");
    }

    _onSessionEstablished(sessionInstance) {
        this._writeLogMessage(`New session ID: ${sessionInstance.sessionId}`);
        this.#chromecastSession = sessionInstance;
        if (sessionInstance.media.length > 0) {
            this._writeLogMessage(`Found ${sessionInstance.media.length} existing media streams.`);
            this._handleMediaStreamArrival('Pre-existing', sessionInstance.media[0]);
        }
        sessionInstance.addMediaListener(this._handleMediaStreamArrival.bind(this, 'New discovery'));
        sessionInstance.addUpdateListener(this._handleSessionUpdate.bind(this));
    }

    _handleSessionUpdate(isSessionLive) {
        const statusReport = isSessionLive ? 'Session data updated' : 'Session terminated';
        this._writeLogMessage(`${statusReport}: ${this.#chromecastSession.sessionId}`);
        if (!isSessionLive) {
            this.#chromecastSession = null;
            this.#activePlaybackElement = null;
            this._resetUserInterface();
        }
    }

    _onDeviceAvailabilityChange(status) {
        const availabilityMessage = (status === 'available') ? "Casting device found" : "No casting device available";
        this._writeLogMessage(availabilityMessage);
    }

    _handleOperationSuccess(context) {
        this._writeLogMessage(context);
    }

    _handleOperationFailure(errorData) {
        console.error("Operation error:", errorData);
        this._writeLogMessage(`Operation failed: ${errorData.code || errorData}`);
    }

    _writeLogMessage(content) {
        if (this.#interfaceElements.messageOutput) {
            this.#interfaceElements.messageOutput.innerHTML += `\n${JSON.stringify(content)}`;
        }
    }

    setMediaContent(uri) {
        this.#mediaSourceIdentifier = uri;
        this._writeLogMessage(`Content selected: ${uri}`);
    }

    async initiateContentFlow() {
        if (!this.#mediaSourceIdentifier) {
            this._writeLogMessage("No content source specified.");
            return;
        }

        if (this.#chromecastSession === null) {
            this._writeLogMessage("Requesting new casting session...");
            try {
                const newSession = await new Promise((resolve, reject) => {
                    chrome.cast.requestSession(resolve, reject);
                });
                this._onSessionEstablished(newSession);
                this._beginContentLoading();
            } catch (error) {
                this._handleOperationFailure(`Session request failed: ${error}`);
            }
        } else {
            this._beginContentLoading();
        }
    }

    _beginContentLoading() {
        if (!this.#chromecastSession) {
            this._writeLogMessage("No active session to load content.");
            return;
        }
        this._writeLogMessage(`Loading content from ${this.#mediaSourceIdentifier}`);

        const mediaDescriptor = new chrome.cast.media.MediaInfo(this.#mediaSourceIdentifier);
        mediaDescriptor.contentType = MEDIA_CONTENT_TYPE;

        const loadCommand = new chrome.cast.media.LoadRequest(mediaDescriptor);
        loadCommand.autoplay = true;
        loadCommand.currentTime = 0;

        this.#chromecastSession.loadMedia(
            loadCommand,
            this._handleMediaStreamArrival.bind(this, 'Load command executed'),
            this._handleMediaLoadFailure.bind(this)
        );
    }

    _handleMediaStreamArrival(origin, mediaStreamObject) {
        this._writeLogMessage(`Active media stream ID: ${mediaStreamObject.mediaSessionId} (${origin})`);
        this.#activePlaybackElement = mediaStreamObject;
        this.#activePlaybackElement.addUpdateListener(this._handleMediaStateUpdate.bind(this));
        this.#lastRecordedPlaytime = this.#activePlaybackElement.currentTime;
        this._handleMediaStateUpdate(true); // Initial UI update
    }

    _handleMediaLoadFailure(error) {
        this._writeLogMessage(`Content load error: ${error.code} - ${error.description}`);
    }

    _formatSecondsToDuration(totalSeconds) {
        if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
            return "0s";
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        let output = '';
        if (hours > 0) output += `${hours}h`;
        if (minutes > 0) output += `${minutes}m`;
        output += `${seconds}s`;
        return output;
    }

    _handleMediaStateUpdate(isStreamActive) {
        if (!this.#activePlaybackElement) return;

        this._writeLogMessage('Media stream state update');

        if (this.#isPositionMonitoringEnabled && this.#interfaceElements.progressControl) {
            this.#interfaceElements.progressControl.value = parseInt(100 * this.#activePlaybackElement.currentTime / this.#activePlaybackElement.media.duration);
        }
        if (this.#isVolumeMonitoringEnabled && this.#interfaceElements.volumeControl) {
            this.#interfaceElements.volumeControl.value = (1 - this.#activePlaybackElement.volume.level) * 100;
        }

        if (this.#interfaceElements.muteToggle) {
            this.#interfaceElements.muteToggle.checked = this.#activePlaybackElement.volume.muted;
        }
        if (this.#interfaceElements.muteFeedback) {
            this.#interfaceElements.muteFeedback.innerHTML = this.#activePlaybackElement.volume.muted ? 'Unmute media' : 'Mute media';
        }

        if (this.#interfaceElements.actionButton) {
            const playerStateActions = {
                "BUFFERING": 'Hold',
                "PLAYING": 'Hold',
                "PAUSED": 'Continue',
                "IDLE": 'Start'
            };
            this.#interfaceElements.actionButton.innerHTML = playerStateActions[this.#activePlaybackElement.playerState] || 'Start';
        }

        if (this.#interfaceElements.mediaTitle) {
            this.#interfaceElements.mediaTitle.innerHTML = this.#activePlaybackElement.media.contentId;
        }
        if (this.#interfaceElements.totalDuration) {
            this.#interfaceElements.totalDuration.innerHTML = this._formatSecondsToDuration(this.#activePlaybackElement.media.duration);
        }
        if (this.#interfaceElements.elapsedTime) {
            this.#interfaceElements.elapsedTime.innerHTML = this._formatSecondsToDuration(this.#activePlaybackElement.currentTime);
        }
        if (this.#interfaceElements.playbackStatus) {
            this.#interfaceElements.playbackStatus.innerHTML = this.#activePlaybackElement.playerState;
        }
    }

    togglePlaybackAction() {
        if (!this.#activePlaybackElement) return;

        const currentActionText = this.#interfaceElements.actionButton?.innerHTML;

        const actionMap = {
            'Start': () => {
                this.#activePlaybackElement.play(null,
                    this._handleOperationSuccess.bind(this, `Playback started for ${this.#activePlaybackElement.sessionId}`),
                    this._handleOperationFailure);
                this._writeLogMessage("Playback initiated");
            },
            'Hold': () => {
                this.#activePlaybackElement.pause(null,
                    this._handleOperationSuccess.bind(this, `Playback paused for ${this.#activePlaybackElement.sessionId}`),
                    this._handleOperationFailure);
                this._writeLogMessage("Playback paused");
            },
            'Continue': () => {
                this.#activePlaybackElement.play(null,
                    this._handleOperationSuccess.bind(this, `Playback resumed for ${this.#activePlaybackElement.sessionId}`),
                    this._handleOperationFailure);
                this._writeLogMessage("Playback resumed");
            }
        };

        const executeAction = actionMap[currentActionText];
        if (executeAction) {
            executeAction();
        }
    }

    stopCurrentPlayback() {
        if (!this.#activePlaybackElement) return;

        this.#activePlaybackElement.stop(null,
            this._handleOperationSuccess.bind(this, `Content stopped for ${this.#activePlaybackElement.sessionId}`),
            this._handleOperationFailure);
        this._writeLogMessage("Content playback ended");
        if (this.#interfaceElements.actionButton) {
            this.#interfaceElements.actionButton.innerHTML = 'Start';
        }
    }

    adjustAudioSettings(newLevel, shouldBeMuted) {
        if (!this.#activePlaybackElement) return;

        this.#isVolumeMonitoringEnabled = false;
        const volumeSettings = new chrome.cast.Volume();
        volumeSettings.level = newLevel;
        this.#currentAudioLevel = newLevel;
        volumeSettings.muted = shouldBeMuted;

        const volumeRequest = new chrome.cast.media.VolumeRequest();
        volumeRequest.volume = volumeSettings;

        this.#activePlaybackElement.setVolume(volumeRequest,
            this._handleAudioChangeSuccess.bind(this, 'Audio adjustment complete'),
            this._handleOperationFailure);
    }

    _handleAudioChangeSuccess(message) {
        this._writeLogMessage(message);
        setTimeout(() => { this.#isVolumeMonitoringEnabled = true; }, 1500);
    }

    toggleMuteState(isNowMuted) {
        if (!this.#activePlaybackElement) return;

        const volumeSettings = new chrome.cast.Volume();
        volumeSettings.level = this.#currentAudioLevel;
        volumeSettings.muted = isNowMuted;

        const volumeRequest = new chrome.cast.media.VolumeRequest();
        volumeRequest.volume = volumeSettings;

        this.#activePlaybackElement.setVolume(volumeRequest,
            this._handleMuteToggleSuccess.bind(this, `Media ${isNowMuted ? 'muted' : 'unmuted'}`),
            this._handleOperationFailure);
    }

    _handleMuteToggleSuccess(message) {
        this._writeLogMessage(message);
    }

    repositionPlaybackTime(percentage) {
        if (!this.#activePlaybackElement || !this.#activePlaybackElement.media) return;

        this._writeLogMessage(`Seeking ${this.#activePlaybackElement.sessionId} to ${percentage}%`);
        this.#isPositionMonitoringEnabled = false;
        const seekCommand = new chrome.cast.media.SeekRequest();
        seekCommand.currentTime = percentage * this.#activePlaybackElement.media.duration / 100;

        this.#activePlaybackElement.seek(seekCommand,
            this._handleSeekCompletion.bind(this, 'Playback repositioned'),
            this._handleOperationFailure);
    }

    _handleSeekCompletion(message) {
        this._writeLogMessage(message);
        setTimeout(() => { this.#isPositionMonitoringEnabled = true; }, 1500);
    }

    terminateCastApplication() {
        if (!this.#chromecastSession) {
            this._writeLogMessage("No active session to terminate.");
            return;
        }
        this.#chromecastSession.stop(this._onApplicationTerminationSuccess.bind(this), this._handleOperationFailure);
    }

    _onApplicationTerminationSuccess() {
        this._writeLogMessage('Application terminated');
        this.#chromecastSession = null;
        this.#activePlaybackElement = null;
        this._resetUserInterface();
    }

    _resetUserInterface() {
        if (this.#interfaceElements.actionButton) this.#interfaceElements.actionButton.innerHTML = 'Start';
        if (this.#interfaceElements.mediaTitle) this.#interfaceElements.mediaTitle.innerHTML = '';
        if (this.#interfaceElements.totalDuration) this.#interfaceElements.totalDuration.innerHTML = '0s';
        if (this.#interfaceElements.elapsedTime) this.#interfaceElements.elapsedTime.innerHTML = '0s';
        if (this.#interfaceElements.playbackStatus) this.#interfaceElements.playbackStatus.innerHTML = 'IDLE';
        if (this.#interfaceElements.progressControl) this.#interfaceElements.progressControl.value = 0;
        if (this.#interfaceElements.volumeControl) this.#interfaceElements.volumeControl.value = (1 - this.#currentAudioLevel) * 100;
        if (this.#interfaceElements.muteToggle) this.#interfaceElements.muteToggle.checked = false;
        if (this.#interfaceElements.muteFeedback) this.#interfaceElements.muteFeedback.innerHTML = 'Mute media';
    }
}

// Global entry point setup
// This part mimics the original's top-level function calls,
// but now delegates to methods of the instantiated class.

// Assuming these DOM elements exist in the HTML:
// <div id="debugmessage"></div>
// <input type="range" id="progress" min="0" max="100" value="0">
// <input type="range" id="volume" min="0" max="100" value="50">
// <input type="checkbox" id="mutebox">
// <label id="muteText">Mute media</label>
// <button id="playpauseresume">Play</button>
// <span id="currentmedianame"></span>
// <span id="currentmedia_duration"></span>
// <span id="currentmedia_progress"></span>
// <span id="playerstate"></span>

const castController = new MediaTransmissionHub({
    messageOutputId: "debugmessage",
    progressControlId: "progress",
    volumeControlId: "volume",
    muteToggleId: "mutebox",
    muteFeedbackId: "muteText",
    actionButtonId: "playpauseresume",
    mediaTitleId: "currentmedianame",
    totalDurationId: "currentmedia_duration",
    elapsedTimeId: "currentmedia_progress",
    playbackStatusId: "playerstate"
});

// Expose global functions that delegate to the castController instance
// This maintains the original API surface for external interaction if needed,
// but internally uses the new class-based implementation.

function loadAndPlayMedia() {
    castController.initiateContentFlow();
}

function selectMedia(url) {
    castController.setMediaContent(url);
}

function launchApp() {
    castController.initiateContentFlow(); // Re-using flow initiation for app launch
}

function stopApp() {
    castController.terminateCastApplication();
}

function loadMedia() {
    castController._beginContentLoading(); // Directly call internal load, assuming selectMedia was called
}

function playMedia() {
    castController.togglePlaybackAction();
}

function stopMedia() {
    castController.stopCurrentPlayback();
}

function setMediaVolume(level, mute) {
    castController.adjustAudioSettings(level, mute);
}

function muteMedia(cb) {
    castController.toggleMuteState(cb.checked);
}

function seekMedia(pos) {
    castController.repositionPlaybackTime(pos);
}

// The original also has `initializeCastApi`, `onInitSuccess`, `onError`, `onSuccess`,
// `onStopAppSuccess`, `sessionListener`, `sessionUpdateListener`, `receiverListener`,
// `onRequestSessionSuccess`, `onLaunchError`, `onMediaDiscovered`, `onMediaError`,
// `convertSeconds2hms`, `onMediaStatusUpdate`, `onVolumeSuccess`, `setMediaMute`,
// `onMuteSuccess`, `onSeekSuccess`, `mediaCommandSuccessCallback`, `appendMessage`.
// These are now encapsulated as private/public methods within the MediaTransmissionHub class
// and are not exposed globally in the same way, fulfilling the Type IV clone requirement.
// The top-level `if (!chrome.cast || !chrome.cast.isAvailable) { setTimeout(initializeCastApi, 1000); }`
// logic is handled within the `MediaTransmissionHub` constructor.