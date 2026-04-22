(function (applicationWindow, browserNavigator, $, undefinedAlias) {
    "use strict";

    applicationWindow.Audioscape = applicationWindow.Audioscape || {};

    if (applicationWindow.Audioscape.active) {
        return;
    }

    const logIssue = function (messageText) {
        if (!messageText) messageText = "unspecified issue";

        if (applicationWindow.console) {
            if (console.error && typeof console.error === "function") {
                console.error(messageText);
            } else if (console.warn && typeof console.warn === "function") {
                console.warn(messageText);
            } else if (console.log && typeof console.log === "function") {
                console.log(messageText);
            }

            const debugOutput = $ && $("#debugOutput");
            if (debugOutput && debugOutput.length) {
                const existingContent = debugOutput.html();
                debugOutput.html(existingContent + messageText + '<br/>');
            }
        }
    };

    const isAudioSupported = typeof Audio === "function" || typeof Audio === "object";

    if (!isAudioSupported) {
        const dummyAction = function () {
            logIssue("HTML5 Audio capability is not present in this browser environment");
        };
        applicationWindow.Audioscape = {
            initialize: dummyAction,
            playTrack: dummyAction,
            ceaseTrack: dummyAction,
            suspendTrack: dummyAction,
            precacheTrack: dummyAction,
            eradicateTrack: dummyAction,
            active: true
        };
        dummyAction();
        return;
    }

    const SoundContext = applicationWindow.AudioContext || applicationWindow.webkitAudioContext;
    let mainAudioContext = null;

    if (SoundContext) {
        mainAudioContext = new SoundContext();
    } else {
        logIssue("Web Audio API is not available; advanced audio features will be unavailable.");
    }

    const globalConfig = {
        assetPath: "",
        gainLevel: 1,
        preFetch: false,
        concurrentPlay: false,
        repeatCount: 0,
        segmentMap: null,
        contextObject: null,
        onLoaded: null,
        onFinished: null,
        soundAssets: [],
        supportedFormats: ["mp3", "ogg", "mp4", "aac", "wav"]
    };

    const isAppleDevice = /iPad|iPhone|iPod/.test(browserNavigator.appVersion);
    if (isAppleDevice) {
        globalConfig.supportedFormats = ["mp3", "mp4", "aac"];
    }

    const audioRegistry = new Map();

    class AudioPlayback {
        constructor(trackConfiguration, segmentKey, audioBuffer, mainContext, trackIdentifier, altIdentifier) {
            this.altIdentifier = altIdentifier;
            this.trackIdentifier = trackIdentifier;
            this.segmentKey = segmentKey;
            this.audioBuffer = audioBuffer;
            this.mainContext = mainContext;

            this.bufferSource = null;
            this.volumeNode = null;
            this.isPlaying = false;
            this.isPaused = false;

            this.playbackStartTime = 0;
            this.currentOffset = 0;

            this.gainLevel = trackConfiguration.gainLevel || 1;
            this.repeatCount = trackConfiguration.repeatCount === true ? Infinity : (trackConfiguration.repeatCount || 0);
            this.segmentStart = trackConfiguration.segmentStart || 0;
            this.segmentEnd = trackConfiguration.segmentEnd || audioBuffer.duration;
            this.concurrentPlay = trackConfiguration.concurrentPlay || false;
            this.contextObject = trackConfiguration.contextObject;
            this.onFinished = trackConfiguration.onFinished;

            this.playbackCompletionTimeout = null;
        }

        terminate() {
            this.stopPlaying();
            this.audioBuffer = null;
            this.bufferSource = null;
            this.volumeNode = null;
            clearTimeout(this.playbackCompletionTimeout);
        }

        configure(options) {
            if ('gainLevel' in options) {
                this.gainLevel = options.gainLevel;
                if (this.volumeNode) {
                    this.volumeNode.gain.setValueAtTime(this.gainLevel, this.mainContext.currentTime);
                }
            }
            if ('repeatCount' in options) {
                this.repeatCount = options.repeatCount === true ? Infinity : (options.repeatCount || 0);
            }
        }

        _initiateSource() {
            if (!this.mainContext || !this.audioBuffer) {
                logIssue("AudioContext or AudioBuffer missing for playback.");
                return null;
            }

            const source = this.mainContext.createBufferSource();
            const gain = this.mainContext.createGain();

            source.buffer = this.audioBuffer;
            source.connect(gain);
            gain.connect(this.mainContext.destination);
            gain.gain.setValueAtTime(this.gainLevel, this.mainContext.currentTime);

            this.bufferSource = source;
            this.volumeNode = gain;

            this.bufferSource.onended = () => this._handlePlaybackEnd();

            return source;
        }

        startPlaying(options = {}) {
            this.configure(options);

            if (!this.concurrentPlay && this.isPlaying && !this.isPaused) {
                return;
            }

            if (this.isPaused) {
                this.isPaused = false;
                this.isPlaying = true;
                this.playbackStartTime = this.mainContext.currentTime - this.currentOffset;
                this._initiateSource().start(0, this.currentOffset + this.segmentStart, this.segmentEnd - this.segmentStart);
                this._scheduleEnd();
                return;
            }

            this.stopPlaying();
            this.currentOffset = 0;
            this.playbackStartTime = this.mainContext.currentTime;
            this.isPlaying = true;
            this._initiateSource().start(0, this.segmentStart, this.segmentEnd - this.segmentStart);
            this._scheduleEnd();
        }

        stopPlaying() {
            if (this.bufferSource) {
                try {
                    this.bufferSource.stop(0);
                    this.bufferSource.disconnect();
                } catch (e) {
                    // Source might have already stopped or been garbage collected
                }
            }
            if (this.volumeNode) {
                this.volumeNode.disconnect();
            }
            this.bufferSource = null;
            this.volumeNode = null;
            this.isPlaying = false;
            this.isPaused = false;
            this.currentOffset = 0;
            clearTimeout(this.playbackCompletionTimeout);
        }

        pausePlaying() {
            if (!this.isPlaying) return;

            this.currentOffset = (this.mainContext.currentTime - this.playbackStartTime) % (this.segmentEnd - this.segmentStart);
            this.stopPlaying();
            this.isPaused = true;
            this.isPlaying = false;
        }

        _scheduleEnd() {
            clearTimeout(this.playbackCompletionTimeout);
            const duration = this.segmentEnd - this.segmentStart;
            this.playbackCompletionTimeout = setTimeout(() => {
                if (this.isPlaying) {
                    this._handlePlaybackEnd();
                }
            }, duration * 1000);
        }

        _handlePlaybackEnd() {
            clearTimeout(this.playbackCompletionTimeout);
            if (!this.isPlaying && !this.isPaused) {
                return;
            }

            this.stopPlaying();

            let remainingRepeats = this.repeatCount;
            if (remainingRepeats === Infinity) {
                remainingRepeats = 1;
            } else if (remainingRepeats > 0) {
                remainingRepeats--;
            }

            if (remainingRepeats > 0 || this.repeatCount === Infinity) {
                this.repeatCount = remainingRepeats;
                this.startPlaying();
            } else {
                if (typeof this.onFinished === "function") {
                    try {
                        this.onFinished.call(this.contextObject, {
                            track: this.trackIdentifier,
                            segment: this.segmentKey,
                            alias: this.altIdentifier
                        });
                    } catch (e) {
                        logIssue(`Error in onFinished callback for ${this.trackIdentifier}: ${e.message}`);
                    }
                }
            }
        }
    }

    class AudioTrack {
        constructor(trackConfiguration, managerGlobalConfig) {
            this.config = Object.assign({}, managerGlobalConfig, trackConfiguration);
            this.trackIdentifier = trackConfiguration.name;
            this.altIdentifier = trackConfiguration.alias;

            this.xhrRequest = null;
            this.playbackInstances = new Map();
            this.fetchResult = null;
            this.formatIndex = 0;
            this.resourceURL = "";

            this.isFetched = false;
            this.isDecoded = false;
            this.noSourceFound = false;
            this.autoCommence = false;
            this.audioBuffer = null;

            this.mainAudioContext = mainAudioContext;
        }

        _prime() {
            if (this.noSourceFound) {
                logIssue(`No compatible sources for "${this.trackIdentifier}" track.`);
                return Promise.reject("No source found.");
            }
            if (this.isDecoded) {
                this._ensurePlaybackInstances();
                return Promise.resolve();
            }
            if (this.xhrRequest) {
                return Promise.resolve();
            }

            return this._fetchSource();
        }

        _createResourceURL() {
            const noCacheValue = new Date().valueOf();
            const format = this.config.supportedFormats[this.formatIndex];
            if (!format) {
                this.noSourceFound = true;
                logIssue(`No more supported formats for "${this.trackIdentifier}".`);
                return null;
            }
            this.resourceURL = `${this.config.assetPath}${this.trackIdentifier}.${format}?cachebust=${noCacheValue}`;
            return this.resourceURL;
        }

        _fetchSource() {
            const url = this._createResourceURL();
            if (!url) {
                return Promise.reject("No valid URL for fetching.");
            }

            return new Promise((resolve, reject) => {
                this.xhrRequest = new XMLHttpRequest();
                this.xhrRequest.open("GET", url, true);
                this.xhrRequest.responseType = "arraybuffer";

                this.xhrRequest.onload = () => {
                    if (this.xhrRequest.status === 200) {
                        this.fetchResult = this.xhrRequest.response;
                        this.isFetched = true;
                        this.xhrRequest = null;
                        this._decodeData().then(resolve).catch(reject);
                    } else {
                        logIssue(`${this.resourceURL} could not be loaded (Status: ${this.xhrRequest.status})`);
                        this._cycleSource().then(resolve).catch(reject);
                    }
                };

                this.xhrRequest.onerror = () => {
                    logIssue(`Network error or CORS issue fetching ${this.resourceURL}.`);
                    this._cycleSource().then(resolve).catch(reject);
                };

                this.xhrRequest.onabort = () => {
                    logIssue(`Fetch aborted for ${this.resourceURL}.`);
                    reject(new Error("Fetch aborted"));
                };

                this.xhrRequest.send();
            });
        }

        _cycleSource() {
            this.formatIndex++;
            if (this.config.supportedFormats[this.formatIndex]) {
                return this._fetchSource();
            } else {
                this.noSourceFound = true;
                logIssue(`No sources found for "${this.trackIdentifier}" after trying all formats.`);
                return Promise.reject("No compatible audio source found.");
            }
        }

        _decodeData() {
            if (!this.mainAudioContext || !this.fetchResult) {
                logIssue("Cannot decode: AudioContext or fetched data missing.");
                return Promise.reject("Decoding prerequisites missing.");
            }

            return new Promise((resolve, reject) => {
                this.mainAudioContext.decodeAudioData(
                    this.fetchResult,
                    (buffer) => {
                        this.audioBuffer = buffer;
                        this.isDecoded = true;
                        this.fetchResult = null;
                        this._bufferReady();
                        resolve();
                    },
                    (error) => {
                        logIssue(`Error decoding audio data for "${this.trackIdentifier}": ${error.message}`);
                        this._cycleSource().then(resolve).catch(reject);
                    }
                );
            });
        }

        _ensurePlaybackInstances() {
            if (!this.isDecoded || !this.audioBuffer) return;

            if (this.config.segmentMap && Object.keys(this.config.segmentMap).length > 0) {
                for (const segmentKey in this.config.segmentMap) {
                    if (this.config.segmentMap.hasOwnProperty(segmentKey) && !this.playbackInstances.has(segmentKey)) {
                        const segmentTimes = this.config.segmentMap[segmentKey];
                        const segmentConfig = Object.assign({}, this.config, {
                            segmentStart: segmentTimes[0],
                            segmentEnd: segmentTimes[1]
                        });
                        this.playbackInstances.set(segmentKey, new AudioPlayback(segmentConfig, segmentKey, this.audioBuffer, this.mainAudioContext, this.trackIdentifier, this.altIdentifier));
                    }
                }
            } else {
                if (!this.playbackInstances.has("single")) {
                    this.playbackInstances.set("single", new AudioPlayback(this.config, "single", this.audioBuffer, this.mainAudioContext, this.trackIdentifier, this.altIdentifier));
                }
            }
        }

        _bufferReady() {
            this._ensurePlaybackInstances();

            if (typeof this.config.onLoaded === "function") {
                try {
                    this.config.onLoaded.call(this.config.contextObject, {
                        track: this.trackIdentifier,
                        alias: this.altIdentifier,
                        format: this.config.supportedFormats[this.formatIndex],
                        duration: this.audioBuffer.duration
                    });
                } catch (e) {
                    logIssue(`Error in onLoaded callback for ${this.trackIdentifier}: ${e.message}`);
                }
            }

            if (this.autoCommence) {
                this.autoCommence = false;
                this.commencePlayback();
            }
        }

        commencePlayback(options) {
            if (options) {
                Object.assign(this.config, options);
            }

            if (!this.isDecoded) {
                if (!this.config.preFetch) {
                    this.autoCommence = true;
                    this._prime().catch(e => logIssue(`Failed to commence playback for ${this.trackIdentifier}: ${e.message}`));
                }
                return;
            }

            if (this.noSourceFound) {
                return;
            }

            if (this.config.segmentMap && Object.keys(this.config.segmentMap).length > 0) {
                const targetSegment = options && options.segment;
                if (targetSegment && this.playbackInstances.has(targetSegment)) {
                    this.playbackInstances.get(targetSegment).startPlaying(options);
                } else {
                    this.playbackInstances.forEach(playback => playback.startPlaying(options));
                }
            } else {
                if (this.playbackInstances.has("single")) {
                    this.playbackInstances.get("single").startPlaying(options);
                }
            }
        }

        haltPlayback(options) {
            if (this.config.segmentMap && Object.keys(this.config.segmentMap).length > 0) {
                const targetSegment = options && options.segment;
                if (targetSegment && this.playbackInstances.has(targetSegment)) {
                    this.playbackInstances.get(targetSegment).stopPlaying();
                } else {
                    this.playbackInstances.forEach(playback => playback.stopPlaying());
                }
            } else {
                if (this.playbackInstances.has("single")) {
                    this.playbackInstances.get("single").stopPlaying();
                }
            }
        }

        holdPlayback(options) {
            if (this.config.segmentMap && Object.keys(this.config.segmentMap).length > 0) {
                const targetSegment = options && options.segment;
                if (targetSegment && this.playbackInstances.has(targetSegment)) {
                    this.playbackInstances.get(targetSegment).pausePlaying();
                } else {
                    this.playbackInstances.forEach(playback => playback.pausePlaying());
                }
            } else {
                if (this.playbackInstances.has("single")) {
                    this.playbackInstances.get("single").pausePlaying();
                }
            }
        }

        dispose() {
            if (this.xhrRequest) {
                this.xhrRequest.abort();
                this.xhrRequest = null;
            }
            this.playbackInstances.forEach(playback => playback.terminate());
            this.playbackInstances.clear();
            this.audioBuffer = null;
            this.fetchResult = null;
            this.isFetched = false;
            this.isDecoded = false;
            this.noSourceFound = false;
            this.autoCommence = false;
            this.formatIndex = 0;
            this.resourceURL = "";
        }
    }

    applicationWindow.Audioscape.VERSION_INFO = "1.0.0";

    applicationWindow.Audioscape.initialize = function (options) {
        Object.assign(globalConfig, options);

        if (!globalConfig.soundAssets || globalConfig.soundAssets.length === 0) {
            logIssue("No audio assets specified for Audioscape initialization!");
            return;
        }

        if (!mainAudioContext && SoundContext) {
            mainAudioContext = new SoundContext();
        }

        globalConfig.soundAssets.forEach(assetConfig => {
            const identifier = assetConfig.alias || assetConfig.name;
            if (!audioRegistry.has(identifier)) {
                const track = new AudioTrack(assetConfig, globalConfig);
                audioRegistry.set(identifier, track);
                if (track.config.preFetch) {
                    track._prime().catch(e => logIssue(`Failed to precache ${identifier}: ${e.message}`));
                }
            }
        });
        applicationWindow.Audioscape.active = true;
    };

    applicationWindow.Audioscape._delegateAction = function (actionMethod, trackIdentifier, options) {
        if (trackIdentifier) {
            const track = audioRegistry.get(trackIdentifier);
            if (track) {
                track[actionMethod](options);
            } else {
                logIssue(`Audio track "${trackIdentifier}" not found.`);
            }
        } else {
            audioRegistry.forEach(track => track[actionMethod](options));
        }
    };

    applicationWindow.Audioscape.precacheTrack = function (trackIdentifier, options) {
        options = options || {};
        options.preFetch = true;
        applicationWindow.Audioscape._delegateAction('_prime', trackIdentifier, options);
    };

    applicationWindow.Audioscape.eradicateTrack = function (trackIdentifier) {
        if (trackIdentifier) {
            const track = audioRegistry.get(trackIdentifier);
            if (track) {
                track.dispose();
                audioRegistry.delete(trackIdentifier);
            } else {
                logIssue(`Audio track "${trackIdentifier}" not found for eradication.`);
            }
        } else {
            audioRegistry.forEach(track => track.dispose());
            audioRegistry.clear();
        }
    };

    applicationWindow.Audioscape.playTrack = function (trackIdentifier, options) {
        applicationWindow.Audioscape._delegateAction('commencePlayback', trackIdentifier, options);
    };

    applicationWindow.Audioscape.ceaseTrack = function (trackIdentifier, options) {
        applicationWindow.Audioscape._delegateAction('haltPlayback', trackIdentifier, options);
    };

    applicationWindow.Audioscape.suspendTrack = function (trackIdentifier, options) {
        applicationWindow.Audioscape._delegateAction('holdPlayback', trackIdentifier, options);
    };

    if ($) {
        $.audioscape = applicationWindow.Audioscape;
    }

})(window, navigator, window.jQuery);