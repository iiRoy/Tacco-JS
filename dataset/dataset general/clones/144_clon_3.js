(function (globalWindow, navAgent, $, undef) {
    "use strict";

    // Plugin metadata and license information have been intentionally omitted or modified
    // as per Type III cloning requirements, focusing on functional transformation.

    // A flag to enable or disable verbose console output
    const CONSOLE_DEBUG_ENABLED = true;

    // Custom logger for warnings and informational messages
    const logIssue = function (messageText) {
        if (!messageText) {
            messageText = "An unspecified issue occurred.";
        }

        if (globalWindow.console && CONSOLE_DEBUG_ENABLED) {
            if (console.warn && typeof console.warn === "function") {
                console.warn(`[AppAudioCore] ${messageText}`);
            } else if (console.log && typeof console.log === "function") {
                console.log(`[AppAudioCore] ${messageText}`);
            }

            // Attempt to log to a debug div if jQuery is available and element exists
            const debugElement = $ && $("#audioDebugLog");
            if (debugElement && debugElement.length) {
                const currentContent = debugElement.html();
                debugElement.html(`${currentContent}${messageText}<br/>`);
            }
        }
    };

    // Utility function to merge properties from source objects into a target object
    // Similar to Object.assign, but with a custom name to fit the clone requirement
    const mergeProperties = function (targetObj, ...sourceObjs) {
        if (targetObj === null || typeof targetObj !== 'object') {
            logIssue("Invalid target object provided for property merge.");
            return targetObj;
        }
        sourceObjs.forEach(source => {
            if (source !== null && typeof source === 'object') {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        targetObj[key] = source[key];
                    }
                }
            }
        });
        return targetObj;
    };

    // Ensure our global namespace exists
    globalWindow.AppAudioCore = globalWindow.AppAudioCore || {};

    // --- Browser Compatibility Check ---
    // This section checks for HTML5 Audio API support. If not supported,
    // it provides stub functions to prevent errors.
    const isAudioAPICompatible = (typeof Audio === "function" || typeof Audio === "object");

    if (!isAudioAPICompatible) {
        const compatibilityFailureHandler = (msg = "HTML5 Audio is not supported in this browser.") => {
            logIssue(msg);
        };
        globalWindow.AppAudioCore.player = compatibilityFailureHandler;
        globalWindow.AppAudioCore.player.start = compatibilityFailureHandler;
        globalWindow.AppAudioCore.player.terminate = compatibilityFailureHandler;
        globalWindow.AppAudioCore.player.pause = compatibilityFailureHandler;
        globalWindow.AppAudioCore.player.preFetch = compatibilityFailureHandler;
        globalWindow.AppAudioCore.player.release = compatibilityFailureHandler;
        compatibilityFailureHandler(); // Log the initial warning
        return; // Exit the IIFE if not compatible
    }

    // --- Core Audio Engine Setup ---
    // Global variables for managing audio assets and player configuration.
    let isAppleMobileDevice = /iPad|iPhone|iPod/.test(navAgent.appVersion);
    let assetCount = 0;
    let globalPlayerConfig = {};
    let loadedAudioAssets = {}; // Stores instances of AudioAsset
    let iteratorIndex; // Re-using for various loops

    // Default supported audio formats based on device.
    // iOS typically prefers MP3/MP4/AAC. Other browsers support more.
    if (!globalPlayerConfig.supportedFormats && isAppleMobileDevice) {
        globalPlayerConfig.supportedFormats = ["mp3", "mp4", "aac"];
    } else if (!globalPlayerConfig.supportedFormats) {
        globalPlayerConfig.supportedFormats = ["mp3", "ogg", "mp4", "aac", "wav"];
    }

    // Factory function to create and register an AudioAsset
    const registerAudioAsset = (assetOptions) => {
        const assetKey = assetOptions.alias || assetOptions.name;

        if (!loadedAudioAssets[assetKey]) {
            const newAsset = new AudioAsset(assetOptions);
            loadedAudioAssets[assetKey] = newAsset;
            newAsset.initializeAsset();
            if (CONSOLE_DEBUG_ENABLED) {
                console.log(`[AppAudioCore] Registered new asset: ${assetKey}`);
            }
        } else if (CONSOLE_DEBUG_ENABLED) {
            console.log(`[AppAudioCore] Asset "${assetKey}" already registered. Skipping.`);
        }
    };

    // Main initialization function for the audio player.
    globalWindow.AppAudioCore.player = function (playerOptions) {
        // Merge user-provided options with global configuration.
        // User options take precedence.
        mergeProperties(globalPlayerConfig, {
            basePath: "",
            masterVolume: 1,
            preLoadAssets: false,
            allowSimultaneousPlay: false,
            loopDefault: false,
            spriteMap: null,
            contextObject: null,
            onAssetReady: null,
            onPlaybackFinished: null
        });
        mergeProperties(globalPlayerConfig, playerOptions);

        if (!globalPlayerConfig.audioAssets || !Array.isArray(globalPlayerConfig.audioAssets)) {
            logIssue("No audio assets array provided in configuration!");
            return;
        }

        assetCount = globalPlayerConfig.audioAssets.length;

        if (!assetCount) {
            logIssue("No audio assets defined for the player!");
            return;
        }

        // Register each audio asset
        globalPlayerConfig.audioAssets.forEach(assetDefinition => {
            registerAudioAsset(assetDefinition);
        });
    };

    globalWindow.AppAudioCore.player.VERSION = "3.1.0-alpha"; // Updated version number

    // Internal method dispatcher for common actions across assets.
    const dispatchAssetMethod = (methodName, assetIdentifier, methodArgs) => {
        if (assetIdentifier) {
            const targetAsset = loadedAudioAssets[assetIdentifier];
            if (targetAsset && typeof targetAsset[methodName] === "function") {
                targetAsset[methodName](methodArgs);
            } else {
                logIssue(`Asset "${assetIdentifier}" not found or method "${methodName}" not available.`);
            }
        } else {
            // Apply method to all registered assets
            Object.keys(loadedAudioAssets).forEach(assetKey => {
                const currentAsset = loadedAudioAssets[assetKey];
                if (currentAsset && typeof currentAsset[methodName] === "function") {
                    currentAsset[methodName](methodArgs);
                }
            });
        }
    };

    globalWindow.AppAudioCore.player.preFetch = function (assetName, options = {}) {
        mergeProperties(options, { preLoadAssets: true });
        dispatchAssetMethod("initializeAsset", assetName, options);
    };

    globalWindow.AppAudioCore.player.release = function (assetName) {
        dispatchAssetMethod("disposeAsset", assetName);

        if (assetName) {
            if (loadedAudioAssets[assetName]) {
                delete loadedAudioAssets[assetName];
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Released asset: ${assetName}`);
            }
        } else {
            // Release all assets
            Object.keys(loadedAudioAssets).forEach(key => {
                if (loadedAudioAssets[key]) {
                    delete loadedAudioAssets[key];
                }
            });
            loadedAudioAssets = {}; // Clear the object
            if (CONSOLE_DEBUG_ENABLED) console.log("[AppAudioCore] Released all assets.");
        }
    };

    globalWindow.AppAudioCore.player.start = function (assetName, options) {
        dispatchAssetMethod("startPlayback", assetName, options);
    };

    globalWindow.AppAudioCore.player.terminate = function (assetName, options) {
        dispatchAssetMethod("haltPlayback", assetName, options);
    };

    globalWindow.AppAudioCore.player.pause = function (assetName, options) {
        dispatchAssetMethod("pausePlayback", assetName, options);
    };

    // jQuery integration (if jQuery is present)
    if ($ && typeof $.fn === 'object') {
        $.fn.extend({
            audioPlayer: function (config) {
                globalWindow.AppAudioCore.player(config);
                return this; // Allow chaining
            }
        });
        $.audioPlayer = globalWindow.AppAudioCore.player; // Direct access
    }

    // --- Web Audio API Context ---
    const AudioProcessorContext = globalWindow.AudioContext || globalWindow.webkitAudioContext;
    let mainAudioContext;

    if (AudioProcessorContext) {
        mainAudioContext = new AudioProcessorContext();
        if (CONSOLE_DEBUG_ENABLED) console.log("[AppAudioCore] Web Audio API context created.");
    } else {
        logIssue("Web Audio API not available. Falling back to basic HTML5 Audio (if supported).");
    }

    // --- AudioAsset Class (formerly Sound) ---
    // Represents a single audio file and its loading/decoding state.
    const AudioAsset = function (assetDefinition) {
        // Clone global config and then merge specific asset definition
        this.trackOptions = mergeProperties({}, globalPlayerConfig);
        delete this.trackOptions.audioAssets; // Remove array of other assets
        mergeProperties(this.trackOptions, assetDefinition);

        this.fetchRequest = null;
        this.activeStreams = {}; // Stores instances of SoundPlaybackInstance
        this.fetchResult = null;
        this.currentExtIndex = 0; // Index for current file extension attempt
        this.resourceURL = "";

        this.isLoaded = false;
        this.isDecoded = false;
        this.hasNoSource = false;
        this.autoPlayPending = false;
    };

    AudioAsset.prototype = {
        initializeAsset: function (options) {
            if (options) {
                mergeProperties(this.trackOptions, options);
            }

            if (this.trackOptions.preLoadAssets) {
                this.loadAsset();
            }
        },

        disposeAsset: function () {
            // Stop and clean up all active playback streams for this asset
            Object.keys(this.activeStreams).forEach(streamKey => {
                const stream = this.activeStreams[streamKey];
                if (stream) {
                    stream.cleanupStream();
                    this.activeStreams[streamKey] = null;
                }
            });
            this.activeStreams = {}; // Clear references

            // Clean up buffer and options
            this.trackOptions.audioBuffer = null;
            this.trackOptions = null;
            this.fetchResult = null;

            // Abort and clean up any pending XMLHttpRequest
            if (this.fetchRequest) {
                this.fetchRequest.removeEventListener("load", this.handleLoadComplete.bind(this), false);
                this.fetchRequest.removeEventListener("error", this.handleLoadError.bind(this), false);
                this.fetchRequest.abort();
                this.fetchRequest = null;
            }
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Disposed asset: ${this.trackOptions.name}`);
        },

        generateSourceURL: function () {
            const cacheBuster = new Date().valueOf();
            const currentFormat = this.trackOptions.supportedFormats[this.currentExtIndex];
            this.resourceURL = `${this.trackOptions.basePath}${this.trackOptions.name}.${currentFormat}?_cb=${cacheBuster}`;
        },

        loadAsset: function () {
            if (this.hasNoSource) {
                logIssue(`No viable sources found for asset "${this.trackOptions.name}".`);
                return;
            }

            // Prevent re-loading if already loaded and decoded
            if (this.isLoaded && this.isDecoded) {
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Asset "${this.trackOptions.name}" already loaded and decoded.`);
                return;
            }

            this.generateSourceURL();

            this.fetchRequest = new XMLHttpRequest();
            this.fetchRequest.open("GET", this.resourceURL, true);
            this.fetchRequest.responseType = "arraybuffer"; // Important for audio data

            // Use arrow functions to maintain 'this' context without explicit bind
            this.fetchRequest.addEventListener("load", (event) => this.handleLoadComplete(event), false);
            this.fetchRequest.addEventListener("error", () => this.handleLoadError(), false);

            this.fetchRequest.send();
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Attempting to load: ${this.resourceURL}`);
        },

        tryNextSource: function () {
            this.currentExtIndex++;

            if (this.trackOptions.supportedFormats[this.currentExtIndex]) {
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Retrying load for "${this.trackOptions.name}" with next format.`);
                this.loadAsset();
            } else {
                this.hasNoSource = true;
                logIssue(`All specified sources failed or exhausted for asset "${this.trackOptions.name}".`);
            }
        },

        handleLoadComplete: function (event) {
            this.fetchResult = event.target;

            // Check HTTP status code for success
            if (this.fetchResult.status !== 200) {
                logIssue(`Resource "${this.resourceURL}" not found (HTTP ${this.fetchResult.status}).`);
                this.tryNextSource();
                return;
            }

            // Clean up request listeners
            this.fetchRequest.removeEventListener("load", this.handleLoadComplete.bind(this), false);
            this.fetchRequest.removeEventListener("error", this.handleLoadError.bind(this), false);
            this.fetchRequest = null; // Clear reference

            this.isLoaded = true;
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Loaded: ${this.trackOptions.name} (${this.trackOptions.supportedFormats[this.currentExtIndex]})`);

            this.decodeAudioData();
        },

        decodeAudioData: function () {
            if (!mainAudioContext) {
                logIssue("Cannot decode audio: Web Audio API context not available.");
                return;
            }

            // Decode the audio buffer asynchronously
            mainAudioContext.decodeAudioData(
                this.fetchResult.response,
                (buffer) => this.applyAudioBuffer(buffer), // Success callback
                () => this.handleLoadError("Decoding failed.") // Error callback
            );
        },

        applyAudioBuffer: function (buffer) {
            this.trackOptions.audioBuffer = buffer;
            this.isDecoded = true;
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Decoded: ${this.trackOptions.name} (${this.trackOptions.supportedFormats[this.currentExtIndex]})`);

            const assetInfo = {
                assetName: this.trackOptions.name,
                assetAlias: this.trackOptions.alias,
                format: this.trackOptions.supportedFormats[this.currentExtIndex],
                duration: this.trackOptions.audioBuffer.duration
            };

            // Trigger ready callback if defined
            if (this.trackOptions.onAssetReady && typeof this.trackOptions.onAssetReady === "function") {
                this.trackOptions.onAssetReady.call(this.trackOptions.contextObject, assetInfo);
            }

            // Create playback instances based on sprite map or single track
            if (this.trackOptions.spriteMap) {
                for (const partKey in this.trackOptions.spriteMap) {
                    if (Object.prototype.hasOwnProperty.call(this.trackOptions.spriteMap, partKey)) {
                        const [start, end] = this.trackOptions.spriteMap[partKey];
                        const partOptions = mergeProperties({}, this.trackOptions, {
                            clipStart: start,
                            clipEnd: end
                        });
                        this.activeStreams[partKey] = new SoundPlaybackInstance(partOptions, partKey);
                    }
                }
            } else {
                // If no sprite, create a single instance for the whole track
                this.activeStreams[0] = new SoundPlaybackInstance(this.trackOptions, 0);
            }

            // If playback was pending during loading, start it now
            if (this.autoPlayPending) {
                this.autoPlayPending = false;
                this.startPlayback();
            }
        },

        handleLoadError: function (errorMessage = "Network or unknown error during load/decode.") {
            logIssue(`Error for asset "${this.trackOptions.name}": ${errorMessage}`);
            this.tryNextSource(); // Attempt to load the next supported format
        },

        startPlayback: function (playbackOptions) {
            // Clear any specific part from previous calls if not explicitly provided
            delete this.trackOptions.targetClip;

            if (playbackOptions) {
                mergeProperties(this.trackOptions, playbackOptions);
            }

            // If asset not loaded, initiate loading and mark for autoplay
            if (!this.isLoaded || !this.isDecoded) {
                if (!this.trackOptions.preLoadAssets) {
                    this.autoPlayPending = true;
                    this.loadAsset();
                } else {
                    logIssue(`Cannot play "${this.trackOptions.name}" - not loaded or decoded yet.`);
                }
                return;
            }

            if (this.hasNoSource) {
                logIssue(`Cannot play "${this.trackOptions.name}" - no valid source files found.`);
                return;
            }

            // Play specific sprite part or all parts/single track
            if (this.trackOptions.spriteMap) {
                if (this.trackOptions.targetClip && this.activeStreams[this.trackOptions.targetClip]) {
                    this.activeStreams[this.trackOptions.targetClip].initiatePlay(this.trackOptions);
                } else {
                    // If no specific clip, play all clips (or the first one if multiplay is false?)
                    // Original behavior was to play all, so we'll replicate that.
                    Object.keys(this.activeStreams).forEach(clipKey => {
                        this.activeStreams[clipKey].initiatePlay(this.trackOptions);
                    });
                }
            } else if (this.activeStreams[0]) {
                this.activeStreams[0].initiatePlay(this.trackOptions);
            } else {
                logIssue(`No playback instance available for "${this.trackOptions.name}".`);
            }
        },

        haltPlayback: function (options) {
            if (this.trackOptions.spriteMap) {
                if (options && options.targetClip && this.activeStreams[options.targetClip]) {
                    this.activeStreams[options.targetClip].stopPlayback();
                } else {
                    // Stop all clips if no specific clip is provided
                    Object.keys(this.activeStreams).forEach(clipKey => {
                        this.activeStreams[clipKey].stopPlayback();
                    });
                }
            } else if (this.activeStreams[0]) {
                this.activeStreams[0].stopPlayback();
            }
        },

        pausePlayback: function (options) {
            if (this.trackOptions.spriteMap) {
                if (options && options.targetClip && this.activeStreams[options.targetClip]) {
                    this.activeStreams[options.targetClip].pausePlayback();
                } else {
                    // Pause all clips if no specific clip is provided
                    Object.keys(this.activeStreams).forEach(clipKey => {
                        this.activeStreams[clipKey].pausePlayback();
                    });
                }
            } else if (this.activeStreams[0]) {
                this.activeStreams[0].pausePlayback();
            }
        }
    };

    // --- SoundPlaybackInstance Class (formerly Stream) ---
    // Represents an individual instance of a playing sound or a sound sprite part.
    const SoundPlaybackInstance = function (options, clipIdentifier) {
        this.streamAlias = options.alias;
        this.streamName = options.name;
        this.clipIdentifier = clipIdentifier; // Can be a sprite name or 0 for full track

        this.audioBuffer = options.audioBuffer;
        this.clipStart = options.clipStart || 0;
        this.clipEnd = options.clipEnd || this.audioBuffer.duration; // Ensure default end is buffer duration
        this.allowMultiplePlays = options.allowSimultaneousPlay || false;
        this.streamVolume = options.masterVolume || 1;
        this.callbackScope = options.contextObject;
        this.onPlaybackEnd = options.onPlaybackFinished;

        this.configureLooping(options);

        this.audioSourceNode = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.isPaused = false;

        this.playbackStartTime = 0;
        this.playbackEndTime = 0;
        this.accumulatedPlayedTime = 0;
        this.currentPlaybackOffset = 0; // For resuming paused playback
    };

    SoundPlaybackInstance.prototype = {
        cleanupStream: function () {
            this.stopPlayback(); // Ensure it's stopped before cleaning up

            this.audioBuffer = null;
            this.audioSourceNode = null;

            if (this.gainNode) {
                this.gainNode.disconnect();
                this.gainNode = null;
            }
            if (this.audioSourceNode) {
                this.audioSourceNode.disconnect();
                this.audioSourceNode = null;
            }
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Cleaned up playback instance for ${this.streamName}:${this.clipIdentifier}`);
        },

        configureLooping: function (options) {
            if (options.loopDefault === true) {
                this.loopCount = 9999999; // Effectively infinite loop
            } else if (typeof options.loopDefault === "number" && options.loopDefault > 0) {
                this.loopCount = options.loopDefault - 1; // Number of additional loops after first play
            } else {
                this.loopCount = 0; // No looping
            }
        },

        updateStreamOptions: function (options) {
            this.configureLooping(options);
            if ("masterVolume" in options) {
                this.streamVolume = options.masterVolume;
                if (this.gainNode) {
                    this.gainNode.gain.value = this.streamVolume;
                }
            }
            // Add other updatable options here if needed
        },

        initiatePlay: function (options) {
            if (options) {
                this.updateStreamOptions(options);
            }

            // If not allowed to multiplay and already playing, return
            if (!this.allowMultiplePlays && this.isPlaying) {
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] "${this.streamName}:${this.clipIdentifier}" is already playing and multiplay is disabled.`);
                return;
            }

            // Create new nodes for playback
            this.gainNode = mainAudioContext.createGain();
            this.audioSourceNode = mainAudioContext.createBufferSource();
            this.audioSourceNode.buffer = this.audioBuffer;

            // Connect nodes: Source -> Gain -> Destination
            this.audioSourceNode.connect(this.gainNode);
            this.gainNode.connect(mainAudioContext.destination);
            this.gainNode.gain.value = this.streamVolume;

            // Set up onended event handler
            this.audioSourceNode.onended = () => this.handlePlaybackEnd();

            this._startSource();
        },

        _startSource: function () {
            const duration = this.clipEnd - this.clipStart;
            let startOffset = this.clipStart + this.currentPlaybackOffset;

            // Ensure offset doesn't exceed clip duration
            if (startOffset >= this.clipEnd) {
                startOffset = this.clipStart; // Reset to start if offset is too large
                this.currentPlaybackOffset = 0;
            }

            this.audioSourceNode.start(0, startOffset, duration - this.currentPlaybackOffset);
            this.playbackStartTime = mainAudioContext.currentTime;
            this.isPlaying = true;
            this.isPaused = false;
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Playing "${this.streamName}:${this.clipIdentifier}" from ${startOffset.toFixed(2)}s for ${duration.toFixed(2)}s.`);
        },

        stopPlayback: function () {
            if (this.isPlaying || this.isPaused) {
                if (this.audioSourceNode) {
                    try {
                        this.audioSourceNode.stop(0); // Stop immediately
                    } catch (e) {
                        logIssue(`Error stopping audio source for "${this.streamName}:${this.clipIdentifier}": ${e.message}`);
                    }
                }
                this._resetPlaybackState();
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Stopped playback for "${this.streamName}:${this.clipIdentifier}".`);
            }
        },

        pausePlayback: function () {
            if (this.isPlaying) {
                if (this.audioSourceNode) {
                    try {
                        this.audioSourceNode.stop(0); // Stop to pause
                    } catch (e) {
                        logIssue(`Error pausing audio source for "${this.streamName}:${this.clipIdentifier}": ${e.message}`);
                        return; // Prevent state change if stop fails
                    }
                }
                this.accumulatedPlayedTime += (mainAudioContext.currentTime - this.playbackStartTime);
                this.currentPlaybackOffset = this.accumulatedPlayedTime % (this.clipEnd - this.clipStart); // Calculate offset for resume
                this.isPlaying = false;
                this.isPaused = true;
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Paused "${this.streamName}:${this.clipIdentifier}" at ${this.currentPlaybackOffset.toFixed(2)}s.`);
            } else if (this.isPaused) {
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] "${this.streamName}:${this.clipIdentifier}" is already paused.`);
            }
        },

        handlePlaybackEnd: function () {
            this.isPlaying = false;
            this.isPaused = false;

            if (this.loopCount > 0) {
                this.loopCount--;
                this.currentPlaybackOffset = 0; // Reset offset for looping
                this.accumulatedPlayedTime = 0;
                this.initiatePlay(this.trackOptions); // Restart playback
                if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Looping "${this.streamName}:${this.clipIdentifier}", ${this.loopCount + 1} loops remaining.`);
                return;
            }

            this._resetPlaybackState(); // Final cleanup after all loops

            // Trigger the playback ended callback
            if (this.onPlaybackEnd && typeof this.onPlaybackEnd === "function") {
                const endedInfo = {
                    assetName: this.streamName,
                    clipIdentifier: this.clipIdentifier,
                    durationPlayed: this.clipEnd - this.clipStart // Or actual played duration
                };
                try {
                    this.onPlaybackEnd.call(this.callbackScope, endedInfo);
                } catch (e) {
                    logIssue(`Error in onPlaybackEnd callback for "${this.streamName}:${this.clipIdentifier}": ${e.message}`);
                }
            }
            if (CONSOLE_DEBUG_ENABLED) console.log(`[AppAudioCore] Playback finished for "${this.streamName}:${this.clipIdentifier}".`);
        },

        _resetPlaybackState: function () {
            this.isPlaying = false;
            this.isPaused = false;
            this.playbackStartTime = 0;
            this.playbackEndTime = 0;
            this.accumulatedPlayedTime = 0;
            this.currentPlaybackOffset = 0;

            // Disconnect and nullify nodes to free resources
            if (this.gainNode) {
                this.gainNode.disconnect();
                this.gainNode = null;
            }
            if (this.audioSourceNode) {
                this.audioSourceNode.disconnect();
                this.audioSourceNode = null;
            }
        }
    };

})(window, navigator, typeof jQuery !== 'undefined' ? jQuery : null);