// Audio Library by MyCompany
// Version 3.0.0, Build 75
// (C) 2024 MyCompany, Inc.
//
// Project URL:    http://example.com/audio-lib
// GitHub:         https://github.com/mycompany/audio-lib
//
// Licensed under MIT:
// http://example.com/licenses/mit

( function ( currentWindow, browserNavigator, jQueryAlias, undefinedValue ) {
    "use strict";

    currentWindow.audioLib = currentWindow.audioLib || {};

    // If the audio library is already initialized, exit early.
    if ( currentWindow.audioLib.effect ) {
        return;
    }

    // Helper function to log issues, either to console or a debug element.
    const logIssue = function ( messageText ) {
        if ( !messageText ) messageText = "unspecified";

        if ( currentWindow.console ) {
            if ( console.warn && typeof console.warn === "function" ) {
                console.warn( messageText );
            } else if ( console.log && typeof console.log === "function" ) {
                console.log( messageText );
            }

            const debugElement = jQueryAlias && jQueryAlias( "#debugOutput" );
            if ( debugElement.length ) {
                let currentContent = debugElement.html();
                debugElement.html( currentContent + messageText + '<br/>' );
            }
        }
    };

    // Utility to merge properties from a source object into a target object.
    const assignProps = function ( sourceObject, targetObject ) {
        targetObject = targetObject || {};

        for ( let propertyName in sourceObject ) {
            if ( sourceObject.hasOwnProperty( propertyName ) ) {
                targetObject[ propertyName ] = sourceObject[ propertyName ];
            }
        }

        return targetObject;
    };



    // Disable functionality for browsers that do not support HTML5 Audio.
    if ( typeof Audio !== "function" && typeof Audio !== "object" ) {
        const dummyFunc = function () {
            logIssue( "HTML5 Audio is not supported on this device" );
        };
        currentWindow.audioLib.effect = dummyFunc;
        currentWindow.audioLib.effect.startPlayback = dummyFunc;
        currentWindow.audioLib.effect.haltPlayback = dummyFunc;
        currentWindow.audioLib.effect.suspendPlayback = dummyFunc;
        currentWindow.audioLib.effect.prebuffer = dummyFunc;
        currentWindow.audioLib.effect.dispose = dummyFunc;
        dummyFunc(); // Call once to log the warning
        return;
    }



    // Main library logic: Manages the collection of audio effects and public methods.

    let isAppleMobile = /iPad|iPhone|iPod/.test( browserNavigator.appVersion ),
        totalEffectsCount = 0,
        libConfig = {},
        effectsCollection = {},
        idx; // Loop index

    // Default supported audio formats based on device.
    if ( !libConfig.supportedFormats && isAppleMobile ) {
        libConfig.supportedFormats = [ "mp3", "mp4", "aac" ];
    } else if ( !libConfig.supportedFormats ) {
        libConfig.supportedFormats = [ "mp3", "ogg", "mp4", "aac", "wav" ];
    }

    // Creates and initializes a new audio effect.
    const buildEffect = function ( effectObj ) {
        const effectId = effectObj.alias || effectObj.name;

        if ( !effectsCollection[ effectId ] ) {
            effectsCollection[ effectId ] = new AudioEffect( effectObj );
            effectsCollection[ effectId ].initializeEffect();
        }
    };

    // Primary initialization function for the audio library.
    currentWindow.audioLib.effect = function ( configOpts ) {
        assignProps( configOpts, libConfig );

        // Set default configuration options if not provided.
        libConfig.resourcePath = libConfig.resourcePath || "";
        libConfig.playbackVolume = libConfig.playbackVolume || 1;
        libConfig.prebuffer = libConfig.prebuffer || false;
        libConfig.allowMultiplePlays = libConfig.allowMultiplePlays || false;
        libConfig.looping = libConfig.looping || false;
        libConfig.audioSprite = libConfig.audioSprite || null;
        libConfig.callbackScope = libConfig.callbackScope || null;
        libConfig.onReady = libConfig.onReady || null;
        libConfig.onPlaybackEnd = libConfig.onPlaybackEnd || null;

        totalEffectsCount = libConfig.effectSources.length;

        if ( !totalEffectsCount ) {
            logIssue( "No audio source files were specified!" );
            return;
        }

        for ( idx = 0; idx < totalEffectsCount; idx++ ) {
            if ( !effectsCollection[ idx ] ) {
                buildEffect( libConfig.effectSources[ idx ] );
            }
        }
    };

    currentWindow.audioLib.effect.VERSION_NUMBER = "3.0.0";

    // Internal method to call a specific action on one or all effects.
    currentWindow.audioLib.effect.invokeEffectMethod = function ( actionName, effectId, configOpts ) {
        if ( effectId ) {
            effectsCollection[ effectId ] && effectsCollection[ effectId ][ actionName ]( configOpts );
        } else {
            for ( idx in effectsCollection ) {
                if ( !effectsCollection.hasOwnProperty( idx ) ) {
                    continue;
                }
                effectsCollection[ idx ][ actionName ]( configOpts );
            }
        }
    };

    // Public method to preload audio resources.
    currentWindow.audioLib.effect.prebuffer = function ( effectId, configOpts ) {
        configOpts = configOpts || {};
        assignProps( { prebuffer: true }, configOpts );

        currentWindow.audioLib.effect.invokeEffectMethod( "initializeEffect", effectId, configOpts );
    };

    // Public method to remove an audio effect.
    currentWindow.audioLib.effect.dispose = function ( effectId ) {
        currentWindow.audioLib.effect.invokeEffectMethod( "disposeEffect", effectId );

        if ( effectId ) {
            effectsCollection[ effectId ] = null;
        } else {
            for ( idx in effectsCollection ) {
                if ( !effectsCollection.hasOwnProperty( idx ) ) {
                    continue;
                }
                if ( effectsCollection[ idx ] ) {
                    effectsCollection[ idx ] = null;
                }
            }
        }
    };

    // Public method to start playback of an audio effect.
    currentWindow.audioLib.effect.startPlayback = function ( effectId, configOpts ) {
        currentWindow.audioLib.effect.invokeEffectMethod( "startPlayback", effectId, configOpts );
    };

    // Public method to stop playback of an audio effect.
    currentWindow.audioLib.effect.haltPlayback = function ( effectId, configOpts ) {
        currentWindow.audioLib.effect.invokeEffectMethod( "haltPlayback", effectId, configOpts );
    };

    // Public method to pause playback of an audio effect.
    currentWindow.audioLib.effect.suspendPlayback = function ( effectId, configOpts ) {
        currentWindow.audioLib.effect.invokeEffectMethod( "suspendPlayback", effectId, configOpts );
    };

    // Integrate with jQuery if available.
    if ( jQueryAlias ) {
        jQueryAlias.audioLibEffect = currentWindow.audioLib.effect;
    }



    // Web Audio API implementation for modern browsers.

    const SoundContext = currentWindow.AudioContext || currentWindow.webkitAudioContext,
        globalAudioContext;

    if ( SoundContext ) {
        globalAudioContext = new SoundContext();
    }


    // Constructor for an individual Audio Effect.
    const AudioEffect = function ( configOpts ) {
        this.effectSettings = assignProps( libConfig );
        delete this.effectSettings.effectSources; // Remove global sound list from individual effect settings
        assignProps( configOpts, this.effectSettings );

        this.xhrRequest = null;
        this.activeStreams = {};
        this.xhrResult = {};
        this.formatIndex = 0;
        this.resourcePath = "";

        this.isLoaded = false;
        this.isDecoded = false;
        this.noSourceFile = false;
        this.autoTrigger = false;
    };

    AudioEffect.prototype = {
        // Initializes the effect, optionally preloading.
        initializeEffect: function ( configOpts ) {
            if ( configOpts ) {
                assignProps( configOpts, this.effectSettings );
            }

            if ( this.effectSettings.prebuffer ) {
                this.fetchResource();
            }
        },

        // Cleans up all resources associated with this effect.
        disposeEffect: function () {
            let currentStream;

            for ( idx in this.activeStreams ) {
                currentStream = this.activeStreams[ idx ];

                if ( currentStream ) {
                    currentStream.destroyStream();
                    currentStream = null;
                }
            }
            this.activeStreams = {};
            this.xhrResult = null;
            this.effectSettings.audioBuffer = null;
            this.effectSettings = null;

            if ( this.xhrRequest ) {
                this.xhrRequest.removeEventListener( "load", this.handleRequestComplete.bind( this ), false );
                this.xhrRequest.removeEventListener( "error", this.handleRequestError.bind( this ), false );
                this.xhrRequest.abort();
                this.xhrRequest = null;
            }
        },

        // Generates the URL for the audio resource.
        generateSourceUrl: function () {
            const cacheBuster = new Date().valueOf();
            this.resourcePath = this.effectSettings.resourcePath + this.effectSettings.name + "." + this.effectSettings.supportedFormats[ this.formatIndex ] + "?" + cacheBuster;
        },

        // Initiates fetching the audio resource from the server.
        fetchResource: function () {
            if ( this.noSourceFile ) {
                logIssue( "No available sources for \"" + this.effectSettings.name + "\" audio effect :(" );
                return;
            }

            this.generateSourceUrl();

            this.xhrRequest = new XMLHttpRequest();
            this.xhrRequest.open( "GET", this.resourcePath, true );
            this.xhrRequest.responseType = "arraybuffer";
            this.xhrRequest.addEventListener( "load", this.handleRequestComplete.bind( this ), false );
            this.xhrRequest.addEventListener( "error", this.handleRequestError.bind( this ), false );

            this.xhrRequest.send();
        },

        // Attempts to load the next available audio format.
        tryNextFormat: function () {
            this.formatIndex++;

            if ( this.effectSettings.supportedFormats[ this.formatIndex ] ) {
                this.fetchResource();
            } else {
                this.noSourceFile = true;
                logIssue( "No compatible sources found for \"" + this.effectSettings.name + "\" audio effect :(" );
            }
        },

        // Callback for successful XHR request completion.
        handleRequestComplete: function ( requestEvent ) {
            this.xhrResult = requestEvent.target;

            if ( this.xhrResult.readyState !== 4 ) {
                this.tryNextFormat();
                return;
            }

            if ( this.xhrResult.status !== 200 ) {
                logIssue( this.resourcePath + " was not found on the server!" );
                this.tryNextFormat();
                return;
            }

            this.xhrRequest.removeEventListener( "load", this.handleRequestComplete.bind( this ), false );
            this.xhrRequest.removeEventListener( "error", this.handleRequestError.bind( this ), false );
            this.xhrRequest = null; // Clear the request object
            this.isLoaded = true;
            // logIssue("Resource Loaded: " + this.effectSettings.name + "." + libConfig.supportedFormats[this.formatIndex]);

            this.decodeAudioData();
        },

        // Decodes the fetched audio data into an AudioBuffer.
        decodeAudioData: function () {
            if ( !globalAudioContext ) {
                return;
            }

            globalAudioContext.decodeAudioData( this.xhrResult.response, this.applyAudioBuffer.bind( this ), this.handleRequestError.bind( this ) );
        },

        // Applies the decoded AudioBuffer to the effect.
        applyAudioBuffer: function ( audioBuffer ) {
            this.effectSettings.audioBuffer = audioBuffer;
            this.isDecoded = true;
            // logIssue("Audio Decoded: " + this.effectSettings.name + "." + libConfig.supportedFormats[this.formatIndex]);

            const effectInfo = {
                id: this.effectSettings.name,
                aliasId: this.effectSettings.alias,
                format: this.effectSettings.supportedFormats[ this.formatIndex ],
                durationSec: this.effectSettings.audioBuffer.duration
            };

            if ( this.effectSettings.onReady && typeof this.effectSettings.onReady === "function" ) {
                this.effectSettings.onReady.call( this.effectSettings.callbackScope, effectInfo );
            }

            if ( this.effectSettings.audioSprite ) {
                // If an audio sprite is defined, create a stream for each segment.
                for ( idx in this.effectSettings.audioSprite ) {
                    this.effectSettings.segmentStart = this.effectSettings.audioSprite[ idx ][ 0 ];
                    this.effectSettings.segmentEnd = this.effectSettings.audioSprite[ idx ][ 1 ];
                    this.activeStreams[ idx ] = new AudioStream( this.effectSettings, idx );
                }
            } else {
                // Otherwise, create a single stream for the entire audio.
                this.activeStreams[ 0 ] = new AudioStream( this.effectSettings );
            }

            if ( this.autoTrigger ) {
                this.autoTrigger = false;
                this.startPlayback();
            }
        },

        // Callback for XHR request or audio decoding errors.
        handleRequestError: function () {
            this.tryNextFormat();
        },

        // Starts playing the audio effect.
        startPlayback: function ( configOpts ) {
            delete this.effectSettings.playbackPart; // Ensure no stale part reference

            if ( configOpts ) {
                assignProps( configOpts, this.effectSettings );
            }

            if ( !this.isLoaded ) {
                if ( !this.effectSettings.prebuffer ) {
                    this.autoTrigger = true; // Mark for autoplay after loading
                    this.fetchResource();
                }
                return;
            }

            if ( this.noSourceFile || !this.isDecoded ) {
                return;
            }

            if ( this.effectSettings.audioSprite ) {
                if ( this.effectSettings.playbackPart ) {
                    this.activeStreams[ this.effectSettings.playbackPart ].startPlayback( this.effectSettings );
                } else {
                    for ( idx in this.effectSettings.audioSprite ) {
                        this.activeStreams[ idx ].startPlayback( this.effectSettings );
                    }
                }
            } else {
                this.activeStreams[ 0 ].startPlayback( this.effectSettings );
            }
        },

        // Stops all or a specific part of the audio effect.
        haltPlayback: function ( configOpts ) {
            if ( this.effectSettings.audioSprite ) {
                if ( configOpts && configOpts.playbackPart ) {
                    this.activeStreams[ configOpts.playbackPart ].haltPlayback();
                } else {
                    for ( idx in this.effectSettings.audioSprite ) {
                        this.activeStreams[ idx ].haltPlayback();
                    }
                }
            } else {
                this.activeStreams[ 0 ].haltPlayback();
            }
        },

        // Pauses all or a specific part of the audio effect.
        suspendPlayback: function ( configOpts ) {
            if ( this.effectSettings.audioSprite ) {
                if ( configOpts && configOpts.playbackPart ) {
                    this.activeStreams[ configOpts.playbackPart ].suspendPlayback();
                } else {
                    for ( idx in this.effectSettings.audioSprite ) {
                        this.activeStreams[ idx ].suspendPlayback();
                    }
                }
            } else {
                this.activeStreams[ 0 ].suspendPlayback();
            }
        }
    };



    // Represents a single playable audio stream (e.g., a sound or a sprite segment).
    const AudioStream = function ( configOpts, segmentName ) {
        this.effectAlias = configOpts.alias;
        this.effectName = configOpts.name;
        this.spriteSegmentName = segmentName;

        this.audioBuffer = configOpts.audioBuffer;
        this.segmentStart = configOpts.segmentStart || 0;
        this.segmentEnd = configOpts.segmentEnd || this.audioBuffer.duration;
        this.allowMultiplePlays = configOpts.allowMultiplePlays || false;
        this.playbackVolume = configOpts.playbackVolume || 1;
        this.callbackScope = configOpts.callbackScope;
        this.onPlaybackEnd = configOpts.onPlaybackEnd;

        this.configureLooping( configOpts );

        this.audioSourceNode = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.isPaused = false;

        this.startTime = 0;
        this.endTime = 0;
        this.totalPlayTime = 0;
        this.currentOffset = 0;
    };

    AudioStream.prototype = {
        // Disposes of the audio stream, stopping playback and releasing resources.
        destroyStream: function () {
            this.haltPlayback();

            this.audioBuffer = null;
            this.audioSourceNode = null;

            this.gainNode && this.gainNode.disconnect();
            this.audioSourceNode && this.audioSourceNode.disconnect();
            this.gainNode = null;
            this.audioSourceNode = null;
        },

        // Configures the looping behavior for the stream.
        configureLooping: function ( configOpts ) {
            if ( configOpts.looping === true ) {
                this.loopCount = 9999999; // Effectively infinite loop
            } else if ( typeof configOpts.looping === "number" ) {
                this.loopCount = +configOpts.looping - 1;
            }
        },

        // Updates stream properties like volume or looping.
        updateStreamProps: function ( configOpts ) {
            this.configureLooping( configOpts );
            if ( "playbackVolume" in configOpts ) {
                this.playbackVolume = configOpts.playbackVolume;
            }
        },

        // Initiates playback for this specific audio stream.
        startPlayback: function ( configOpts ) {
            if ( configOpts ) {
                this.updateStreamProps( configOpts );
            }

            if ( !this.allowMultiplePlays && this.isPlaying ) {
                return;
            }

            this.gainNode = globalAudioContext.createGain();
            this.audioSourceNode = globalAudioContext.createBufferSource();
            this.audioSourceNode.buffer = this.audioBuffer;
            this.audioSourceNode.connect( this.gainNode );
            this.gainNode.connect( globalAudioContext.destination );
            this.gainNode.gain.value = this.playbackVolume;

            this.audioSourceNode.onended = this.handleStreamEnded.bind( this );

            this._initiatePlay();
        },

        // Internal method to actually start the AudioBufferSourceNode.
        _initiatePlay: function () {
            let startPoint;