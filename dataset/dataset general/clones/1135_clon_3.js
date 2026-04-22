!function(paramBundleExecutor){
    // This is a Universal Module Definition (UMD) wrapper.
    // It adapts the module to work in different JavaScript environments:
    // CommonJS (Node.js, Webpack), AMD (RequireJS), or global browser scope.

    // Check if running in a CommonJS-like environment (e.g., Node.js, Webpack)
    if("object"===typeof exports && "undefined"!==typeof module){
        // Export the result of executing the bundle function
        module.exports = paramBundleExecutor();
    }
    // Check if running in an Asynchronous Module Definition (AMD) environment (e.g., RequireJS)
    else if("function"===typeof define && define.amd){
        // Define the module with no dependencies and provide the bundle's result
        define([], paramBundleExecutor);
    }
    // Otherwise, assume a browser global environment
    else{
        let globalScopeRef; // A reference to the global object (window, global, self)

        // Determine the appropriate global object based on environment
        if("undefined"!==typeof window){
            globalScopeRef = window; // Standard browser window
        }else if("undefined"!==typeof global){
            globalScopeRef = global; // Node.js global object
        }else if("undefined"!==typeof self){
            globalScopeRef = self; // Web Worker global object
        } else {
            // Fallback for extremely unusual environments; 'this' usually points to global.
            globalScopeRef = this;
        }
        // Assign the result of the bundle execution to a global property named 'AV'
        globalScopeRef.AV = paramBundleExecutor();
    }
}(function(){
    // These variables are typically provided by the module system shim (like Browserify's)
    // They are declared here to shadow potential global variables.
    let moduleDefinition, moduleReference, exportObject;

    // This is the core module loading function, resembling a simplified CommonJS/Browserify 'require'
    // 'moduleDefinitions' (t): An object where keys are module IDs and values are arrays [function, moduleDeps]
    // 'moduleCache' (n): An object caching already loaded modules
    // 'entryPoints' (r): An array of module IDs to be loaded initially
    return (function loadAndCacheModules(moduleDefinitions, moduleCache, entryPoints){

        // Helper function to resolve and return a module by its ID
        // 'requestedModuleId' (o): The ID of the module to resolve
        // 'isInternalCall' (u): Flag to indicate if this is an internal 'require' call or initial load
        function retrieveModule(requestedModuleId, isInternalCall){
            // If the module is already in the cache, return its exports immediately
            if(moduleCache[requestedModuleId]){
                return moduleCache[requestedModuleId].exports;
            }

            // If the module definition doesn't exist within our bundle
            if(!moduleDefinitions[requestedModuleId]){
                const globalRequireRef = typeof require === "function" && require; // Try to get a global 'require'
                // If not an internal call and a global 'require' exists, delegate to it
                if(!isInternalCall && globalRequireRef){
                    return globalRequireRef(requestedModuleId, true);
                }
                // If an initial module loader 'initialModuleLoader' exists (from outer scope, usually for the initial entry point)
                if(initialModuleLoader){
                    return initialModuleLoader(requestedModuleId, true);
                }
                // If all attempts to find the module fail, throw an error
                throw new Error(`Module resolution failed: Cannot find module '${requestedModuleId}' within the bundled scope.`);
            }

            // If found, create a new module entry in the cache with an empty exports object
            const moduleEntry = moduleCache[requestedModuleId] = {exports:{}};
            const moduleFunction = moduleDefinitions[requestedModuleId][0]; // The actual module function to execute
            const moduleDependencies = moduleDefinitions[requestedModuleId][1]; // Dependencies map for this module

            // Execute the module function, providing it with its own 'require', 'module', 'exports' context
            // This is the CommonJS module pattern in action.
            moduleFunction.call(
                moduleEntry.exports, // 'this' context for the module function
                function(dependencyName){ // The module's internal 'require' function
                    const resolvedDependencyId = moduleDependencies[dependencyName];
                    // Resolve the dependency: use the mapped ID if available, otherwise the name itself
                    return retrieveModule(resolvedDependencyId ? resolvedDependencyId : dependencyName, moduleEntry, moduleEntry.exports, loadAndCacheModules, moduleDefinitions, moduleCache, entryPoints);
                },
                moduleEntry, // The module object itself
                moduleEntry.exports, // The exports object for the module
                loadAndCacheModules, // Reference to the bundle's main loader (for advanced scenarios)
                moduleDefinitions,
                moduleCache,
                entryPoints
            );

            // Return the exports of the newly loaded module
            return moduleCache[requestedModuleId].exports;
        }

        const initialModuleLoader = typeof require === "function" && require; // Capture global 'require' if present
        // Load all entry points specified in the bundle configuration
        for(let entryIdx = 0; entryIdx < entryPoints.length; entryIdx++){
            retrieveModule(entryPoints[entryIdx]);
        }

        // As per Browserify's convention, return the exports of the first entry point as the bundle's main export.
        if (entryPoints.length > 0) {
            return retrieveModule(entryPoints[0]);
        } else {
            // If no entry points are specified, return an empty object.
            console.warn("No entry points defined in the module bundle.");
            return {};
        }

    })({1:[function(internalRequire, moduleReference, exportObject){
        // Module 1: Main Aurora Export Point
        // This module serves as the primary entry for the Aurora.js library.
        // It aggregates exports from the core Aurora base and triggers the loading
        // and registration of specific demuxers and device handlers.

        let propertyKey, propertyValue, baseLibraryExports;

        // Load the core Aurora library components from its dedicated module
        baseLibraryExports = internalRequire('./src/aurora');

        // Iterate over the properties exported by the core Aurora library
        // and re-export them directly from this module.
        // Using Object.keys().forEach for a more explicit and modern iteration style.
        Object.keys(baseLibraryExports).forEach(function(currentKey) {
            propertyValue = baseLibraryExports[currentKey];
            exportObject[currentKey] = propertyValue;
            // console.debug(`[Module 1] Exporting core component '${currentKey}'.`); // Debugging aid
        });

        // Load specific device handlers.
        // These modules are typically loaded for their side effects (e.g., self-registration)
        // rather than for their direct exports here.
        internalRequire('./src/devices/webaudio'); // Load Web Audio API device support
        internalRequire('./src/devices/mozilla');  // Load Mozilla Audio Data API device support (legacy)

    },{"./src/aurora":3,"./src/devices/mozilla":22,"./src/devices/webaudio":24}],2:[function(internalRequire, moduleReference, exportObject){
        // Module 2: AudioResource - Manages loading, parsing, and decoding of audio assets.

        let AudioResource, MemoryDataSource, AudioDecoderBase, MediaDemuxerBase, EventDispatcher,
            // Custom helper for binding a method to an instance's 'this' context
            bindMethodToInstance = function(funcRef, instanceContext){ return function(){ return funcRef.apply(instanceContext, arguments); }; },
            // Utility for checking if an object has its own property (not inherited)
            hasOwnProp = {}.hasOwnProperty,
            // Custom helper for implementing classical inheritance between JavaScript classes
            inheritClassStructure = function(childClass, parentClass) {
                // Copy static properties from parent to child
                for (let prop in parentClass) {
                    if (hasOwnProp.call(parentClass, prop)) childClass[prop] = parentClass[prop];
                }
                // Create a bridge constructor to set up prototype chain without calling parent constructor
                function CtorBridge() { this.constructor = childClass; }
                CtorBridge.prototype = parentClass.prototype;
                childClass.prototype = new CtorBridge();
                childClass.__super__ = parentClass.prototype; // Reference to parent's prototype
                return childClass;
            };

        // Import necessary core components and other modules
        EventDispatcher = internalRequire('./core/events');
        const WebDataSource = internalRequire('./sources/node/http');
        const LocalFileSource = internalRequire('./sources/node/file');
        MemoryDataSource = internalRequire('./sources/buffer');
        MediaDemuxerBase = internalRequire('./demuxer');
        AudioDecoderBase = internalRequire('./decoder');

        // The primary class for handling audio assets (files, URLs, buffers)
        AudioResource = (function(_parentClass) {
            inheritClassStructure(AudioResource, _parentClass); // Establish inheritance from EventDispatcher

            // Constructor for AudioResource instances
            function AudioResource(inputSource) {
                // Call the parent constructor (EventDispatcher)
                AudioResource.__super__.constructor.apply(this, arguments);

                this.inputSource = inputSource; // Store the data source (HTTP, File, Buffer)

                // Bind critical methods to 'this' instance to ensure correct context when called as callbacks
                this._processDecodingQueue = bindMethodToInstance(this._processDecodingQueue, this);
                this._locateSuitableDecoder = bindMethodToInstance(this._locateSuitableDecoder, this);
                this._inspectInitialData = bindMethodToInstance(this._inspectInitialData, this);

                // Initialize internal state properties with default values
                this.bytesBuffered = 0;          // Total bytes buffered from the source
                this.totalDuration = null;       // Total duration of the audio in seconds
                this.audioFormatInfo = null;     // Object containing detailed audio format (sample rate, channels, etc.)
                this.metaData = null;            // Object containing ID3 tags or other metadata
                this.isActive = false;           // Flag indicating if the resource is actively processing
                this.currentDemuxer = null;      // The demuxer instance identified for the audio container
                this.currentDecoder = null;      // The decoder instance identified for the audio codec
                this.shouldPerformDecoding = true; // Controls whether decoding should happen automatically

                // Set up event listeners for the underlying data source
                // 'once' for initial data chunk to probe the format
                this.inputSource.once('data', this._inspectInitialData);
                // 'on' for error events from the source
                this.inputSource.on('error', (capturedContext => {
                    return function(errMessage) {
                        console.error(`[AudioResource] Source reported an error: ${errMessage}`);
                        capturedContext.emit('error', errMessage); // Propagate the error
                        return capturedContext.stopProcessing(); // Stop all processing on error
                    };
                })(this));
                // 'on' for progress updates (buffered bytes) from the source
                this.inputSource.on('progress', (capturedContext => {
                    return function(bufferedBytes) {
                        capturedContext.bytesBuffered = bufferedBytes;
                        return capturedContext.emit('buffer', capturedContext.bytesBuffered);
                    };
                })(this));
            }

            // Static factory method to create an AudioResource from a given URL
            AudioResource.fromURL = function(resourceURL) {
                console.debug(`[AudioResource] Creating new instance from URL: ${resourceURL}`);
                return new AudioResource(new WebDataSource(resourceURL));
            };

            // Static factory method to create an AudioResource from a local file path (Node.js environment)
            AudioResource.fromFile = function(localFile) {
                console.debug(`[AudioResource] Creating new instance from local file: ${localFile}`);
                return new AudioResource(new LocalFileSource(localFile));
            };

            // Static factory method to create an AudioResource from an in-memory buffer
            AudioResource.fromBuffer = function(dataBuffer) {
                console.debug(`[AudioResource] Creating new instance from in-memory buffer (length: ${dataBuffer.byteLength} bytes).`);
                return new AudioResource(new MemoryDataSource(dataBuffer));
            };

            // Initiates the processing of the audio resource (fetching, demuxing, decoding)
            AudioResource.prototype.startProcessing = function(decodeFlag) {
                if (this.isActive) {
                    console.warn("[AudioResource] Processing is already active. Ignoring redundant start request.");
                    return;
                }

                // If a decode flag is provided, update the internal preference
                if (decodeFlag != null) {
                    this.shouldPerformDecoding = decodeFlag;
                }
                // Ensure shouldPerformDecoding has a default value if not explicitly set
                if (this.shouldPerformDecoding == null) {
                    this.shouldPerformDecoding = true;
                }

                this.isActive = true; // Mark resource as active
                this.inputSource.start(); // Start the underlying data source

                // If a decoder is already configured and decoding is enabled, begin the decoding process
                if (this.currentDecoder && this.shouldPerformDecoding) {
                    console.info("[AudioResource] Decoder is ready and active. Initiating decoding queue processing.");
                    return this._processDecodingQueue();
                } else if (this.currentDecoder && !this.shouldPerformDecoding) {
                    console.info("[AudioResource] Decoder ready, but explicit decoding is paused. Source remains active.");
                } else {
                    console.info("[AudioResource] Source active. Waiting for demuxer and decoder identification based on initial data.");
                }
            };

            // Halts all active processing for the audio resource
            AudioResource.prototype.stopProcessing = function() {
                if (!this.isActive) {
                    console.debug("[AudioResource] Processing is not active. No need to stop.");
                    return;
                }
                console.log("[AudioResource] Halting all audio resource processing.");
                this.isActive = false; // Mark resource as inactive
                return this.inputSource.pause(); // Pause the underlying data source
            };

            // Asynchronously retrieves specific audio properties (format, duration, metadata)
            AudioResource.prototype.getProperty = function(propertyName, resultCallback) {
                // Validate the requested property name against a list of known properties
                const validProperties = ['audioFormatInfo', 'totalDuration', 'metaData'];
                if (!validProperties.includes(propertyName)) {
                    console.warn(`[AudioResource] Invalid property requested: '${propertyName}'. Valid properties are: ${validProperties.join(', ')}.`);
                    return; // Exit if invalid property
                }

                // If the property value is already available, return it immediately via callback
                if (this[propertyName] != null) {
                    return resultCallback(this[propertyName]);
                } else {
                    // Otherwise, listen for the corresponding event once and then start processing
                    this.once(propertyName, (capturedContext => {
                        return function(value) {
                            // After receiving the value, stop further processing and invoke the callback
                            capturedContext.stopProcessing();
                            return resultCallback(value);
                        };
                    })(this));
                    // Start processing to trigger the event that will provide the property value
                    return this.startProcessing();
                }
            };

            // Decodes a single audio packet from the current demuxer
            AudioResource.prototype.decodeSinglePacket = function() {
                if (!this.currentDecoder) {
                    console.warn("[AudioResource] No audio decoder is currently available to decode packets.");
                    return null; // Return null if no decoder is set
                }
                return this.currentDecoder.decode(); // Delegate to the active decoder
            };

            // Decodes the entire audio stream into a single Float32Array buffer
            AudioResource.prototype.decodeFullyToBuffer = function(completionCallback) {
                let accumulatedLength = 0; // Tracks total length of decoded samples
                const dataSegments = []; // Stores individual Float32Array chunks

                // Define a named function to handle incoming 'data' events
                const dataAccumulator = function(dataChunk) {
                    accumulatedLength += dataChunk.length;
                    return dataSegments.push(dataChunk);
                };

                // Register the data accumulator for 'data' events
                this.on('data', dataAccumulator);

                // Register a one-time listener for the 'end' event
                this.once('end', () => {
                    this.off('data', dataAccumulator); // Clean up the data listener

                    // Handle case where no audio data was received
                    if (accumulatedLength === 0 && dataSegments.length === 0) {
                        console.warn("[AudioResource] No audio data received for full decode operation.");
                        return completionCallback(new Float32Array(0)); // Return an empty buffer
                    }

                    // Create a single Float32Array for the final concatenated audio
                    const finalAudioBuffer = new Float32Array(accumulatedLength);
                    let currentOffset = 0;
                    // Copy all accumulated data segments into the final buffer
                    for (let i = 0; i < dataSegments.length; i++) {
                        const currentSegment = dataSegments[i];
                        finalAudioBuffer.set(currentSegment, currentOffset);
                        currentOffset += currentSegment.length;
                    }

                    return completionCallback(finalAudioBuffer); // Invoke callback with the full buffer
                });

                // Ensure processing starts to trigger data and end events
                return this.startProcessing();
            };

            // Probes the initial data chunk received from the source to identify the media demuxer
            AudioResource.prototype._inspectInitialData = function(firstChunk) {
                if (!this.isActive) {
                    console.debug("[AudioResource] Not active during initial data inspection. Skipping demuxer identification.");
                    return;
                }

                // Attempt to find a suitable demuxer based on the initial data chunk
                const identifiedDemuxerClass = MediaDemuxerBase.find(firstChunk);
                if (!identifiedDemuxerClass) {
                    const errMsg = 'A suitable media demuxer for this container format was not found based on the initial data.';
                    console.error(`[AudioResource] ${errMsg}`);
                    return this.emit('error', errMsg); // Emit an error if no demuxer is found
                }

                // Instantiate the identified demuxer
                this.currentDemuxer = new identifiedDemuxerClass(this.inputSource, firstChunk);

                // Attach event handlers for various events emitted by the demuxer
                this.currentDemuxer.on('format', this._locateSuitableDecoder); // On format info, find a decoder

                this.currentDemuxer.on('duration', (capturedContext => {
                    return function(streamDuration) {
                        capturedContext.totalDuration = streamDuration;
                        return capturedContext.emit('duration', capturedContext.totalDuration); // Propagate duration
                    };
                })(this));

                this.currentDemuxer.on('metadata', (capturedContext => {
                    return function(streamMetadata) {
                        capturedContext.metaData = streamMetadata;
                        return capturedContext.emit('metadata', capturedContext.metaData); // Propagate metadata
                    };
                })(this));

                this.currentDemuxer.on('error', (capturedContext => {
                    return function(demuxerError) {
                        console.error(`[AudioResource] Demuxer reported an error: ${demuxerError}`);
                        capturedContext.emit('error', demuxerError); // Propagate error
                        return capturedContext.stopProcessing(); // Stop processing on demuxer error
                    };
                })(this));
            };

            // Locates and initializes the appropriate audio decoder based on the provided format information
            AudioResource.prototype._locateSuitableDecoder = function(audioFormatDetails) {
                this.audioFormatInfo = audioFormatDetails; // Store the audio format details
                if (!this.isActive) {
                    console.debug("[AudioResource] Not active during decoder location. Skipping decoder setup.");
                    return;
                }

                this.emit('format', this.audioFormatInfo); // Emit the format event for consumers

                // Attempt to find a suitable decoder class for the given audio format ID
                const identifiedDecoderClass = AudioDecoderBase.find(this.audioFormatInfo.formatID);
                if (!identifiedDecoderClass) {
                    const errMsg = `An audio decoder for the format ID "${this.audioFormatInfo.formatID}" was not found.`;
                    console.error(`[AudioResource] ${errMsg}`);
                    return this.emit('error', errMsg); // Emit an error if no decoder is found
                }

                // Instantiate the identified decoder
                this.currentDecoder = new identifiedDecoderClass(this.currentDemuxer, this.audioFormatInfo);

                // Configure the 'data' event handler for the decoder based on the audio format
                if (this.audioFormatInfo.floatingPoint) {
                    // If the format is already floating-point, re-emit the buffer directly
                    this.currentDecoder.on('data', (capturedContext => {
                        return function(decodedBuffer) {
                            return capturedContext.emit('data', decodedBuffer);
                        };
                    })(this));
                } else {
                    // For integer formats, convert samples to Float32Array and normalize them
                    const scalingFactor = Math.pow(2, this.audioFormatInfo.bitsPerChannel - 1); // Factor for normalization
                    this.currentDecoder.on('data', (capturedContext => {
                        return function(integerBuffer) {
                            const floatBuffer = new Float32Array(integerBuffer.length);
                            for (let idx = 0; idx < integerBuffer.length; idx++) {
                                const integerSample = integerBuffer[idx];
                                floatBuffer[idx] = integerSample / scalingFactor; // Normalize to [-1, 1] range
                            }
                            return capturedContext.emit('data', floatBuffer);
                        };
                    })(this));
                }

                // Attach error and end handlers for the decoder
                this.currentDecoder.on('error', (capturedContext => {
                    return function(decoderError) {
                        console.error(`[AudioResource] Decoder reported an error: ${decoderError}`);
                        capturedContext.emit('error', decoderError); // Propagate error
                        return capturedContext.stopProcessing(); // Stop processing on decoder error
                    };
                })(this));

                this.currentDecoder.on('end', (capturedContext => {
                    return function() {
                        console.log("[AudioResource] Decoding process completed.");
                        return capturedContext.emit('end'); // Propagate 'end' event
                    };
                })(this));

                this.emit('decodeStart'); // Signal that the decoding process has begun

                // If automatic decoding is enabled, start the decode loop
                if (this.shouldPerformDecoding) {
                    console.info("[AudioResource] Starting initial decode queue processing after decoder setup.");
                    return this._processDecodingQueue();
                }
            };

            // Internal method to continuously decode packets while the resource is active
            AudioResource.prototype._processDecodingQueue = function() {
                let decodedCount = 0;
                const maxPacketsPerTick = 50; // Limit packets processed per event loop tick to prevent blocking

                // Loop to decode packets as long as the resource is active, the decoder has data,
                // and the per-tick limit hasn't been reached.
                while (this.isActive && this.currentDecoder.decode() && decodedCount < maxPacketsPerTick) {
                    decodedCount++;
                    // The `decode()` method internally emits 'data' events.
                }

                // If the resource is still active after the loop (either ran out of data for this tick,
                // or hit the `maxPacketsPerTick` limit), schedule the next batch of decoding.
                if (this.isActive) {
                    // Using setTimeout(..., 0) to yield control back to the event loop.
                    // This prevents long-running synchronous loops from freezing the UI or blocking I/O,
                    // ensuring a more responsive application.
                    setTimeout(() => {
                        if (this.isActive) { // Re-check active status as it might have changed during yield
                            // Re-schedule this function to be called when the decoder emits its next 'data' event,
                            // effectively continuing the decoding process.
                            this.currentDecoder.once('data', this._processDecodingQueue);
                            // console.debug(`[AudioResource] Rescheduling decoding queue after processing ${decodedCount} packets.`);
                        }
                    }, 0); // Yield to the event loop
                } else {
                    // console.debug("[AudioResource] Decoding queue stopped due to inactive status.");
                }
            };

            return AudioResource;

        })(EventDispatcher); // AudioResource inherits from EventDispatcher

        moduleReference.exports = AudioResource; // Export the AudioResource class

    },{"./core/events":9,"./decoder":12,"./demuxer":15,"./sources/buffer":32,"./sources/node/file":30,"./sources/node/http":31}],3:[function(utilityLoader, moduleReference, exportObject){
        // Module 3: Aurora Core & Extensions
        // This module is responsible for loading the base Aurora components
        // and then dynamically loading and registering various demuxers and decoders.

        let componentKey, componentValue, coreAuroraComponents;

        // Load the foundational Aurora components from the 'aurora_base' module
        coreAuroraComponents = utilityLoader('./aurora_base');

        // Copy all properties (classes, utilities, etc.) from the base components
        // to this module's exports object. Using Object.assign for a concise merge.
        Object.assign(exportObject, coreAuroraComponents);
        // console.debug("[Module 3] Merged core 'aurora_base' components into exports.");

        // Dynamically load specific demuxers and decoders.
        // These modules typically register themselves with the global Demuxer/Decoder registries
        // upon being loaded, so their direct exports are not necessarily used here.
        utilityLoader('./demuxers/caf');    // Core Audio Format demuxer
        utilityLoader('./demuxers/m4a');    // M4A (MP4 audio) demuxer
        utilityLoader('./demuxers/aiff');   // Audio Interchange File Format demuxer
        utilityLoader('./demuxers/wave');   // WAV (Waveform Audio File Format) demuxer
        utilityLoader('./demuxers/au');     // Sun AU audio format demuxer

        utilityLoader('./decoders/lpcm');   // Linear Pulse Code Modulation (PCM) decoder
        utilityLoader('./decoders/xlaw');   // X-Law (A-Law/Mu-Law) decoder
        // console.debug("[Module 3] Loaded specific demuxers and decoders, triggering their registration.");

    },{"./aurora_base":4,"./decoders/lpcm":13,"./decoders/xlaw":14,"./demuxers/aiff":16,"./demuxers/au":17,"./demuxers/caf":18,"./demuxers/m4a":19,"./demuxers/wave":20}],4:[function(utilityLoader, moduleReference, exportObject){
        // Module 4: Aurora Base Components
        // This module serves as a central point to define and export the fundamental
        // building blocks and core utilities of the Aurora.js library.

        const coreComponents = {}; // An object to aggregate all core components before exporting

        // Assign each core component (class or utility) by loading it from its respective module
        coreComponents.PrototypalBase = utilityLoader('./core/base');           // Base class for inheritance
        coreComponents.DataBuffer = utilityLoader('./core/buffer');             // Buffer utility (Uint8Array/Node.js Buffer)
        coreComponents.BufferSegmentList = utilityLoader('./core/bufferlist');  // Manages a list of buffer segments
        coreComponents.DataStream = utilityLoader('./core/stream');             // Stream for reading structured data
        coreComponents.BinaryBitReader = utilityLoader('./core/bitstream');     // Reader for bit-level data
        coreComponents.EventDispatcher = utilityLoader('./core/events');        // Event emitter implementation
        coreComponents.StreamUnderflowError = utilityLoader('./core/underflow'); // Custom error for stream underflow

        // Data Source implementations
        coreComponents.WebDataSource = utilityLoader('./sources/node/http');    // HTTP/HTTPS data source
        coreComponents.LocalFileSource = utilityLoader('./sources/node/file');  // Local file data source (Node.js)
        coreComponents.MemoryDataSource = utilityLoader('./sources/buffer');    // In-memory buffer data source

        // Core audio processing components
        coreComponents.MediaDemuxerBase = utilityLoader('./demuxer');           // Base class/registry for media demuxers
        coreComponents.AudioDecoderBase = utilityLoader('./decoder');           // Base class/registry for audio decoders

        // Audio playback and filtering components
        coreComponents.AudioOutputDevice = utilityLoader('./device');           // Base class for audio output devices
        coreComponents.AudioResource = utilityLoader('./asset');                // Manages audio assets (loading, decoding)
        coreComponents.AudioPlayer = utilityLoader('./player');                 // High-level audio playback control

        coreComponents.AudioFilter = utilityLoader('./filter');                 // Base class for audio filters
        coreComponents.VolumeControlFilter = utilityLoader('./filters/volume'); // Volume adjustment filter
        coreComponents.BalanceControlFilter = utilityLoader('./filters/balance'); // Stereo balance adjustment filter

        // Finally, export the aggregated core components from this module
        Object.assign(exportObject, coreComponents);
        // console.debug("[Module 4] All base Aurora components aggregated and exported.");

    },{"./asset":2,"./core/base":5,"./core/bitstream":6,"./core/buffer":7,"./core/bufferlist":8,"./core/events":9,"./core/stream":10,"./core/underflow":11,"./decoder":12,"./demuxer":15,"./device":21,"./filter":25,"./filters/balance":26,"./filters/volume":27,"./player":28,"./sources/buffer":32,"./sources/node/file":30,"./sources/node/http":31}],5:[function(utilityLoader, moduleReference, exportObject){
        // Module 5: PrototypalBase - A utility class for creating extensible JavaScript classes
        // It provides an 'extend' method for implementing classical inheritance patterns.

        let PrototypalBase,
            hasOwnProp = {}.hasOwnProperty, // Re-aliased for clarity
            // Helper function for class inheritance, creating a prototype chain
            inheritClassStructure = function(childClass, parentClass) {
                for (let prop in parentClass) {
                    if (hasOwnProp.call(parentClass, prop)) childClass[prop] = parentClass[prop];
                }
                function CtorBridge() { this.constructor = childClass; }
                CtorBridge.prototype = parentClass.prototype;
                childClass.prototype = new CtorBridge();
                childClass.__super__ = parentClass.prototype;
                return childClass;
            },
            superCallPattern = /\b_super\b/; // Regex to detect calls to '_super' in method bodies

        PrototypalBase = (function() {
            function PrototypalBase() {
                // The base constructor can be empty or contain common initialization logic.
            }

            // Static method to create a new class that inherits from the current class (this)
            PrototypalBase.createDerivedClass = function(prototypeProperties) {
                const CurrentBaseClass = this; // 'this' refers to the class from which 'extend' is called
                let DerivedClass;

                // Define the new class, inheriting from the CurrentBaseClass
                DerivedClass = (function(_parentClass) {
                    inheritClassStructure(DerivedClass, _parentClass);

                    function DerivedClass() {
                        // Call the parent's constructor with the current arguments
                        return DerivedClass.__super__.constructor.apply(this, arguments);
                    }
                    return DerivedClass;
                })(CurrentBaseClass);

                // If 'prototypeProperties' is a function, it's treated as a class enhancer or mixin.
                // It's executed with the new DerivedClass as its context, allowing it to modify the class.
                if (typeof prototypeProperties === 'function') {
                    const originalPrototypeKeys = Object.keys(DerivedClass.prototype); // Capture existing keys
                    prototypeProperties.call(DerivedClass, DerivedClass); // Execute the enhancer function
                    const newPrototypeProperties = {};
                    // Collect only the properties newly added by the enhancer function
                    for (let keyName in DerivedClass.prototype) {
                        const methodOrProp = DerivedClass.prototype[keyName];
                        if (!originalPrototypeKeys.includes(keyName)) {
                            newPrototypeProperties[keyName] = methodOrProp;
                        }
                    }
                    prototypeProperties = newPrototypeProperties; // Update to only include new properties
                }

                const parentPrototype = DerivedClass.__super__; // Get a reference to the parent's prototype
                // Iterate through the properties to add to the new DerivedClass's prototype
                for (let propKey in prototypeProperties) {
                    const memberFunction = prototypeProperties[propKey];
                    // If a property is a function and contains a '_super' call, wrap it.
                    // The wrapper provides access to the parent's method via 'this._super'.
                    if (typeof memberFunction === 'function' && superCallPattern.test(memberFunction)) {
                        ((k, func) => { // Use an IIFE to capture 'k' and 'func' for each iteration
                            DerivedClass.prototype[k] = function() {
                                const temporarySuperRef = this._super; // Store the current '_super' reference
                                this._super = parentPrototype[k]; // Set '_super' to the parent's method
                                const methodReturnVal = func.apply(this, arguments); // Call the wrapped function
                                this._super = temporarySuperRef; // Restore the original '_super' reference
                                return methodReturnVal;
                            };
                        })(propKey, memberFunction);
                    } else {
                        // For non-functions or functions without '_super', assign directly
                        DerivedClass.prototype[propKey] = memberFunction;
                    }
                }
                return DerivedClass; // Return the newly created derived class
            };

            return PrototypalBase;

        })();

        moduleReference.exports = PrototypalBase; // Export the PrototypalBase class

    },{}],6:[function(utilityLoader, moduleReference, exportObject){
        // Module 6: BinaryBitReader - A utility for reading data at the bit level from a byte stream.
        // This is crucial for parsing compressed or tightly packed binary formats.

        let BinaryBitReader;

        BinaryBitReader = (function() {
            // Constructor: Takes an underlying byte stream (e.g., DataStream)
            function BinaryBitReader(underlyingStream) {
                this.underlyingStream = underlyingStream; // The byte stream to read from
                this.currentBitOffset = 0; // Current bit position within the current byte (0-7)
            }

            // Creates a duplicate of the current bit reader instance and its underlying stream.
            BinaryBitReader.prototype.duplicateReader = function() {
                const newReader = new BinaryBitReader(this.underlyingStream.duplicateStream());
                newReader.currentBitOffset = this.currentBitOffset;
                return newReader;
            };

            // Returns the current absolute bit offset from the beginning of the stream.
            BinaryBitReader.prototype.getAbsoluteBitOffset = function() {
                // Convert byte offset to bits and add the current bit offset within the byte.
                return (this.underlyingStream.getByteOffset() * 8) + this.currentBitOffset;
            };

            // Checks if a specified number of bits are available for reading.
            BinaryBitReader.prototype.canReadBits = function(numBits) {
                if (numBits < 0) {
                    console.warn("[BinaryBitReader] Requesting negative bits for availability check. Returning false.");
                    return false;
                }
                // Calculate the number of full bytes required, considering the current bit offset.
                const requiredBytes = Math.ceil((numBits + this.currentBitOffset) / 8);
                return this.underlyingStream.hasBytesAvailable(requiredBytes);
            };

            // Advances the bit reader's position by a specified number of bits.
            BinaryBitReader.prototype.advanceBits = function(numBitsToAdvance) {
                if (numBitsToAdvance < 0) {
                    console.warn("[BinaryBitReader] Attempted to advance by negative bits. Use rewindBits() instead.");
                    return;
                }
                let newBitPosition = this.currentBitOffset + numBitsToAdvance;
                // Advance the underlying byte stream by the number of full bytes
                this.underlyingStream.advanceBytes(Math.floor(newBitPosition / 8));
                // Update the current bit offset within the new byte
                this.currentBitOffset = newBitPosition % 8;
                return;
            };

            // Rewinds the bit reader's position by a specified number of bits.
            BinaryBitReader.prototype.rewindBits = function(numBitsToRewind) {
                if (numBitsToRewind < 0) {
                    console.warn("[BinaryBitReader] Attempted to rewind by negative bits. Use advanceBits() instead.");
                    return;
                }
                let newBitPosition = this.currentBitOffset - numBitsToRewind;
                // Rewind the underlying byte stream by the absolute number of full bytes
                this.underlyingStream.rewindBytes(Math.floor(Math.abs(newBitPosition / 8)));
                // Update the current bit offset, ensuring it remains positive (0-7)
                this.currentBitOffset = (newBitPosition % 8 + 8) % 8;
                return;
            };

            // Seeks the bit reader to an absolute bit offset from the beginning of the stream.
            BinaryBitReader.prototype.seekToBitOffset = function(targetBitOffset) {
                const currentAbsoluteOffset = this.getAbsoluteBitOffset();
                if (targetBitOffset > currentAbsoluteOffset) {
                    return this.advanceBits(targetBitOffset - currentAbsoluteOffset);
                } else if (targetBitOffset < currentAbsoluteOffset) {
                    return this.rewindBits(currentAbsoluteOffset - targetBitOffset);
                }
                // If targetOffset === currentOffset, do nothing.
                return;
            };

            // Aligns the bit reader to the next full byte boundary.
            BinaryBitReader.prototype.alignToByteBoundary = function() {
                if (this.currentBitOffset !== 0) {
                    this.currentBitOffset = 0;
                    return this.underlyingStream.advanceBytes(1); // Move to the start of the next byte
                }
            };

            // Helper function to convert an unsigned integer value to its signed equivalent
            // based on a specified number of bits (two's complement representation).
            function convertToSigned(value, numBits) {
                // Check if the most significant bit (MSB) of the 'numBits' value is set.
                // If MSB is 1, it indicates a negative number in two's complement.
                if (numBits < 32) {
                    // For smaller integers, direct bitwise check is efficient.
                    if (value >>> (numBits - 1)) {
                        // Calculate two's complement negative value.
                        // (1 << numBits >>> 0) creates a mask for the given bit length, unsigned.
                        value = ((1 << numBits >>> 0) - value) * -1;
                    }
                } else {
                    // For 32-bit or larger numbers, JavaScript's bitwise operators can lose precision.
                    // Use mathematical operations for MSB check and conversion.
                    if (Math.floor(value / Math.pow(2, numBits - 1))) {
                        value = (Math.pow(2, numBits) - value) * -1;
                    }
                }
                return value;
            }

            // Reads a specified number of bits from the stream and advances the reader's position.
            BinaryBitReader.prototype.readBits = function(numBits, isSigned) {
                if (numBits === 0) return 0;
                if (numBits < 0 || numBits > 53) {
                    // JavaScript numbers can safely represent integers up to 2^53 - 1.
                    throw new Error(`Invalid number of bits to read: ${numBits}. Must be between 0 and 53 for reliable JavaScript integer representation.`);
                }

                // First, peek the value without advancing.
                const value = this.peekBits(numBits, isSigned);
                // Then, advance the stream by the read number of bits.
                this.advanceBits(numBits);
                return value;
            };

            // Peeks at a specified number of bits from the stream without advancing the reader's position.
            BinaryBitReader.prototype.peekBits = function(numBits, isSigned) {
                if (numBits === 0) return 0;
                if (numBits < 0 || numBits > 53) {
                    throw new Error(`Invalid number of bits to peek: ${numBits}. Must be between 0 and 53 for reliable JavaScript integer representation.`);
                }

                let resultValue;
                const totalBitsRequired = numBits + this.currentBitOffset; // Total bits needed spanning current and next bytes

                // Read bytes from the underlying stream, adjusting for the current bit offset.
                // The `peekUIntX` methods typically read from the current byte offset of the underlying stream.
                // We then perform bit shifts to extract the desired bits.
                if (totalBitsRequired <= 8) {
                    // Reading within a single byte
                    resultValue = ((this.underlyingStream.peekUInt8() << this.currentBitOffset) & 0xFF) >>> (8 - numBits);
                } else if (totalBitsRequired <= 16) {
                    // Reading spanning one or two bytes
                    resultValue = ((this.underlyingStream.peekUInt16() << this.currentBitOffset) & 0xFFFF) >>> (16 - numBits);
                } else if (totalBitsRequired <= 24) {
                    // Reading spanning up to three bytes
                    resultValue = ((this.underlyingStream.peekUInt24() << this.currentBitOffset) & 0xFFFFFF) >>> (24 - numBits);
                } else if (totalBitsRequired <= 32) {
                    // Reading spanning up to four bytes
                    resultValue = (this.underlyingStream.peekUInt32() << this.currentBitOffset) >>> (32 - numBits);
                } else if (totalBitsRequired <= 40) {
                    // For numbers larger than 32 bits, JavaScript's bitwise operations become unreliable.
                    // We need to reconstruct the value mathematically from individual bytes.
                    const byte0 = this.underlyingStream.peekUInt8(0);
                    const byte1 = this.underlyingStream.peekUInt8(1);
                    const byte2 = this.underlyingStream.peekUInt8(2);
                    const byte3 = this.underlyingStream.peekUInt8(3);
                    const byte4 = this.underlyingStream.peekUInt8(4);

                    // Reconstruct a 40-bit number (up to 5 bytes) using powers of 2.
                    // This creates a large floating-point number representing the raw bits.
                    let largeNum = (byte0 * Math.pow(2, 32)) + (byte1 * Math.pow(2, 24)) + (byte2 * Math.pow(2, 16)) + (byte3 * Math.pow(2, 8)) + byte4;

                    // The original code uses modulo and division, which is a robust way to
                    // extract bits from a large number represented as a float.
                    // It effectively "shifts" the relevant window of bits into the least significant position.
                    const bitsInCurrentWindow = 40 - this.currentBitOffset;
                    largeNum %= Math.pow(2, bitsInCurrentWindow); // Mask to the bits available from current bitOffset
                    resultValue = Math.floor(largeNum / Math.pow(2, bitsInCurrentWindow - numBits)); // Shift right to get the desired 'numBits'
                } else {
                    // If more than 53 bits are requested, it exceeds JavaScript's safe integer limit.
                    throw new Error(`Cannot peek more than 53 bits reliably in JavaScript. Requested: ${numBits}.`);
                }

                // Apply signed conversion if requested
                if (isSigned) {
                    resultValue = convertToSigned(resultValue, numBits);
                }
                return resultValue;
            };

            return BinaryBitReader;

        })();

        moduleReference.exports = BinaryBitReader; // Export the BinaryBitReader class

    },{}],7:[function(internalRequire, moduleReference, exportObject){
        // Module 7: DataBuffer - A universal buffer utility for binary data.
        // It abstracts away the differences between Node.js's `Buffer` and browser `Uint8Array`.

        // Prioritize Node.js Buffer if available, otherwise fall back to standard Uint8Array.
        const DataBuffer = typeof Buffer !== 'undefined' ? Buffer : Uint8Array;

        // If using Uint8Array, extend its prototype with common methods found in Node.js Buffer
        // or add useful utilities for consistency.
        if (DataBuffer === Uint8Array) {
            // Add a simple 'slice' method if it somehow doesn't exist (Uint8Array usually has it).
            if (!DataBuffer.prototype.slice) {
                DataBuffer.prototype.slice = function(start, end) {
                    return new Uint8Array(this.buffer, this.byteOffset + (start || 0), (end === undefined ? this.length : end) - (start || 0));
                };
            }
            // Add a basic 'copy' method for consistency with Node.js Buffer.
            if (!DataBuffer.prototype.copy) {
                DataBuffer.prototype.copy = function(targetBuffer, targetStart, sourceStart, sourceEnd) {
                    const sourceSlice = this.slice(sourceStart, sourceEnd);
                    targetBuffer.set(sourceSlice, targetStart);
                    return sourceSlice.length;
                };
            }
            // Add a simple 'toString' for debugging purposes.
            if (!DataBuffer.prototype.toString) {
                DataBuffer.prototype.toString = function(encoding = 'utf8', start = 0, end = this.length) {
                    // This is a basic implementation for browser Uint8Array, not as robust as Node.js Buffer.
                    if (encoding === 'hex') {
                        return Array.from(this.slice(start, end))
                                    .map(b => b.toString(16).padStart(2, '0'))
                                    .join('');
                    }
                    if (encoding === 'utf8' || encoding === 'ascii') {
                        // For UTF-8, using TextDecoder is more robust but might be async or require polyfills.
                        // For simplicity, direct character code conversion (works for ASCII/basic UTF8).
                        let str = '';
                        for (let i = start; i < end; i++) {
                            str += String.fromCharCode(this[i]);
                        }
                        return str;
                    }
                    return `[Uint8Array ${this.length} bytes]`; // Default representation
                };
            }
        }

        moduleReference.exports = DataBuffer; // Export the chosen Buffer implementation

    },{}],8:[function(internalRequire, moduleReference, exportObject){
        // Module 8: BufferSegmentList - Manages a dynamic list of binary data buffers (segments).
        // It provides methods for adding, reading, and peeking data across multiple segments efficiently.

        const DataBuffer = internalRequire('./buffer'); // Import the universal DataBuffer utility

        class BufferSegmentList {
            constructor() {
                this.segments = []; // An array to hold the individual DataBuffer segments
                this.totalLength = 0; // The cumulative length of all buffers in the list
            }

            // Adds a new buffer segment to the end of the list.
            addSegment(newBuffer) {
                // Validate the input buffer to prevent adding empty or invalid data.
                if (!newBuffer || newBuffer.length === 0) {
                    console.warn("[BufferSegmentList] Attempted to add an empty or null buffer segment. Operation skipped.");
                    return this; // Allow method chaining
                }
                this.segments.push(newBuffer);
                this.totalLength += newBuffer.length;
                return this;
            }

            // Clears all buffer segments from the list and resets the total length.
            clearSegments() {
                this.segments = [];
                this.totalLength = 0;
                return this;
            }

            // Concatenates all buffer segments into a single DataBuffer.
            // Note: This can be an expensive operation for very large lists.
            toSingleBuffer() {
                if (this.segments.length === 0) {
                    return new DataBuffer(0); // Return an empty buffer if no segments
                }
                if (this.segments.length === 1) {
                    return this.segments[0]; // If only one segment, return it directly
                }

                const resultBuffer = new DataBuffer(this.totalLength);
                let currentOffset = 0;
                for (let i = 0; i < this.segments.length; i++) {
                    const segment = this.segments[i];
                    resultBuffer.set(segment, currentOffset); // Copy segment data
                    currentOffset += segment.length;
                }
                return resultBuffer;
            }

            // Peeks (reads without removing) a specified number of bytes from the beginning of the list.
            peekBytes(numBytes) {
                if (numBytes <= 0) return new DataBuffer(0); // Return empty for non-positive requests
                if (numBytes > this.totalLength) {
                    console.warn(`[BufferSegmentList] Attempted to peek ${numBytes} bytes, but only ${this.totalLength} bytes are available. Returning all available data.`);
                    return this.toSingleBuffer(); // Return all if request exceeds available
                }

                // If the first buffer segment contains enough data, slice and return it directly.
                if (this.segments.length > 0 && this.segments[0].length >= numBytes) {
                    return this.segments[0].slice(0, numBytes);
                }

                // If multiple segments are needed, concatenate just enough data.
                const tempBuffer = new DataBuffer(numBytes);
                let bytesCopied = 0;
                for (let i = 0; i < this.segments.length; i++) {
                    const segment = this.segments[i];
                    const bytesToCopy = Math.min(segment.length, numBytes - bytesCopied);
                    tempBuffer.set(segment.slice(0, bytesToCopy), bytesCopied);
                    bytesCopied += bytesToCopy;
                    if (bytesCopied === numBytes) break; // Stop once enough bytes are copied
                }
                return tempBuffer;
            }

            // Reads (and removes) a specified number of bytes from the beginning of the list.
            readBytes(numBytes) {
                if (numBytes <= 0) return new DataBuffer(0);
                if (numBytes > this.totalLength) {
                    const allData = this.toSingleBuffer(); // Get all available data
                    this.clearSegments(); // Clear the list as all data is read
                    console.warn(`[BufferSegmentList] Attempted to read ${numBytes} bytes, but only ${allData.length} bytes are available. Returning all available data and clearing the list.`);
                    return allData;
                }

                this.totalLength -= numBytes; // Update total length immediately

                // If the first segment contains enough data, slice it and update the segment.
                if (this.segments.length > 0 && this.segments[0].length >= numBytes) {
                    const result = this.segments[0].slice(0, numBytes);
                    this.segments[0] = this.segments[0].slice(numBytes); // Keep the remaining part of the segment
                    if (this.segments[0].length === 0) {
                        this.segments.shift(); // Remove the segment if it's now empty
                    }
                    return result;
                }

                // If multiple segments are needed, concatenate them into a result buffer.
                const resultBuffer = new DataBuffer(numBytes);
                let bytesRead = 0;
                while (bytesRead < numBytes && this.segments.length > 0) {
                    const currentSegment = this.segments[0];
                    const bytesToTake = Math.min(currentSegment.length, numBytes - bytesRead);

                    resultBuffer.set(currentSegment.slice(0, bytesToTake), bytesRead);
                    bytesRead += bytesToTake;

                    this.segments[0] = currentSegment.slice(bytesToTake);
                    if (this.segments[0].length === 0) {
                        this.segments.shift(); // Remove consumed segment
                    }
                }
                return resultBuffer;
            }

            // Getter for the total number of bytes currently in the list.
            get length() {
                return this.totalLength;
            }
        }

        moduleReference.exports = BufferSegmentList; // Export the BufferSegmentList class

    },{"./buffer":7}],9:[function(internalRequire, moduleReference, exportObject){
        // Module 9: EventDispatcher - A custom implementation of an event emitter.
        // It allows objects to subscribe to and publish custom named events.

        class EventDispatcher {
            constructor() {
                this._eventHandlers = {}; // Stores event types mapped to arrays of handler functions.
            }

            // Registers an event handler for a given event type.
            // 'eventType': The name of the event (string).
            // 'handlerFunction': The function to be called when the event is emitted.
            on(eventType, handlerFunction) {
                if (typeof handlerFunction !== 'function') {
                    console.error(`[EventDispatcher] Handler for event "${eventType}" must be a function. Registration ignored.`);
                    return this; // Allow method chaining
                }
                // Initialize the handler array for this event type if it doesn't exist.
                if (!this._eventHandlers[eventType]) {
                    this._eventHandlers[eventType] = [];
                }
                this._eventHandlers[eventType].push(handlerFunction);
                return this;
            }

            // Registers a one-time event handler. The handler will be removed after its first invocation.
            once(eventType, handlerFunction) {
                if (typeof handlerFunction !== 'function') {
                    console.error(`[EventDispatcher] One-time handler for event "${eventType}" must be a function. Registration ignored.`);
                    return this;
                }

                // Create a wrapper function that calls the original handler and then removes itself.
                const onceWrapper = (...args) => {
                    this.off(eventType, onceWrapper); // Remove this wrapper after execution
                    handlerFunction.apply(this, args); // Call the original handler
                };
                // Attach a reference to the original handler to the wrapper.
                // This allows 'off' to remove the 'onceWrapper' even if only the original handler is provided.
                onceWrapper.originalHandler = handlerFunction;
                this.on(eventType, onceWrapper); // Register the wrapper
                return this;
            }

            // Removes an event handler for a given event type.
            // 'eventType': The name of the event.
            // 'handlerFunction': The specific function to remove. If not provided, all handlers for the event type are removed.
            off(eventType, handlerFunction) {
                if (!this._eventHandlers[eventType]) {
                    return this; // No handlers for this event type, nothing to do.
                }

                if (!handlerFunction) {
                    // If no specific handler function is provided, remove all handlers for this event type.
                    delete this._eventHandlers[eventType];
                } else {
                    // Filter out the specific handler function (or its 'once' wrapper).
                    this._eventHandlers[eventType] = this._eventHandlers[eventType].filter(
                        (registeredHandler) => {
                            return registeredHandler !== handlerFunction && registeredHandler.originalHandler !== handlerFunction;
                        }
                    );
                    // If no handlers remain for this event type, clean up the array.
                    if (this._eventHandlers[eventType].length === 0) {
                        delete this._eventHandlers[eventType];
                    }
                }
                return this;
            }

            // Emits an event, calling all registered handlers for that event type.
            // 'eventType': The name of the event to emit.
            // '...args': Any arguments to pass to the handler functions.
            emit(eventType, ...args) {
                const handlers = this._eventHandlers[eventType];
                if (handlers && handlers.length > 0) {
                    // Iterate over a copy of the handlers array to avoid issues if handlers modify the list during emission.
                    [...handlers].forEach(handler => {
                        try {
                            handler.apply(this, args); // Call each handler with the provided arguments
                        } catch (error) {
                            console.error(`[EventDispatcher] Error encountered in handler for event "${eventType}":`, error);
                            // Optionally, re-emit an 'error' event to signal issues in event handling itself.
                            if (eventType !== 'error') {
                                this.emit('error', error);
                            }
                        }
                    });
                }
                return this;
            }
        }

        moduleReference.exports = EventDispatcher; // Export the EventDispatcher class

    },{}],10:[function(internalRequire, moduleReference, exportObject){
        // Module 10: DataStream - Provides a high-level interface for reading structured binary data
        // from a sequence of byte buffers, handling endianness and various data types.

        const BufferSegmentList = internalRequire('./bufferlist'); // Manages underlying byte buffers
        const StreamUnderflowError = internalRequire('./underflow'); // Custom error for insufficient data

        class DataStream {
            // Static constants for defining byte order (endianness)
            static get BIG_ENDIAN() { return 0; }
            static get LITTLE_ENDIAN() { return 1; }

            constructor(initialBufferList = new BufferSegmentList()) {
                this.dataSegments = initialBufferList; // The underlying buffer list
                this.currentOffset = 0; // The current read position (byte offset) within the stream
                this.endianness = DataStream.BIG_ENDIAN; // Default to Big Endian
            }

            // Creates a duplicate of the current stream's state, including a copy of its buffer list.
            duplicateStream() {
                const newStream = new DataStream(new BufferSegmentList());
                // Manually add segments to the new list to ensure a distinct (though shallow) copy.
                // A true deep copy of underlying ArrayBuffer contents is often too expensive.
                this.dataSegments.segments.forEach(segment => newStream.dataSegments.addSegment(segment));
                newStream.currentOffset = this.currentOffset;
                newStream.endianness = this.endianness;
                return newStream;
            }

            // Returns the current byte offset (read position) of the stream.
            getByteOffset() {
                return this.currentOffset;
            }

            // Sets the current byte offset (read position) of the stream.
            setByteOffset(newOffset) {
                if (newOffset < 0 || newOffset > this.dataSegments.length) {
                    throw new RangeError(`[DataStream] Attempted to set byte offset out of valid bounds: ${newOffset}. Maximum available data length is ${this.dataSegments.length}.`);
                }
                this.currentOffset = newOffset;
            }

            // Checks if a specified number of bytes are available for reading from the current offset.
            hasBytesAvailable(numBytes) {
                return (this.dataSegments.length - this.currentOffset) >= numBytes;
            }

            // Advances the stream's read position by a specified number of bytes.
            advanceBytes(numBytes) {
                if (numBytes < 0) {
                    console.warn("[DataStream] Attempted to advance by negative bytes. Use rewindBytes() instead.");
                    return;
                }
                if (!this.hasBytesAvailable(numBytes)) {
                    throw new StreamUnderflowError(`[DataStream] Cannot advance by ${numBytes} bytes. Only ${this.dataSegments.length - this.currentOffset} bytes are available from current offset.`);
                }
                this.currentOffset += numBytes;
                return;
            }

            // Rewinds the stream's read position by a specified number of bytes.
            rewindBytes(numBytes) {
                if (numBytes < 0) {
                    console.warn("[DataStream] Attempted to rewind by negative bytes. Use advanceBytes() instead.");
                    return;
                }
                const targetOffset = this.currentOffset - numBytes;
                if (targetOffset < 0) {
                    throw new RangeError(`[DataStream] Cannot rewind by ${numBytes} bytes. Current offset is ${this.currentOffset}, which would result in a negative offset.`);
                }
                this.currentOffset = targetOffset;
                return;
            }

            // Seeks the stream to an absolute byte offset.
            seekToByteOffset(targetOffset) {
                this.setByteOffset(targetOffset);
            }

            // Reads a specified number of bytes from the stream and advances the read position.
            readSegment(numBytes) {
                if (!this.hasBytesAvailable(numBytes)) {
                    throw new StreamUnderflowError(`[DataStream] Cannot read ${numBytes} bytes. Only ${this.dataSegments.length - this.currentOffset} bytes are available from current offset.`);
                }
                // To read from an arbitrary offset in a BufferSegmentList, we first extract the relevant portion
                // into a single buffer using peekBytes, then advance. This is a simplification.
                const segment = this.peekSegment(numBytes);
                this.advanceBytes(numBytes);
                return segment;
            }

            // Peeks (reads without advancing) a specified number of bytes from the stream.
            peekSegment(numBytes) {
                if (!this.hasBytesAvailable(numBytes)) {
                    throw new StreamUnderflowError(`[DataStream] Cannot peek ${numBytes} bytes. Only ${this.dataSegments.length - this.currentOffset} bytes are available from current offset.`);
                }
                // This is potentially inefficient as it calls toSingleBuffer().
                // An optimized BufferSegmentList would have a peek method that takes an offset.
                const fullBuffer = this.dataSegments.toSingleBuffer();
                return fullBuffer.slice(this.currentOffset, this.currentOffset + numBytes);
            }

            // Internal helper to get a subarray of raw data for direct byte access.
            _getRawDataForReading(readLength) {
                if (!this.hasBytesAvailable(readLength)) {
                    throw new StreamUnderflowError(`[DataStream] Not enough data to satisfy a read operation of ${readLength} bytes from offset ${this.currentOffset}.`);
                }
                // This also converts to a single buffer, which can be inefficient.
                // A better approach would be to have BufferSegmentList provide a virtual view or direct access.
                return this.dataSegments.toSingleBuffer().subarray(this.currentOffset, this.currentOffset + readLength);
            }

            // Reads a single unsigned 8-bit integer and advances the stream.
            readUInt8() {
                const data = this._getRawDataForReading(1);
                this.advanceBytes(1);
                return data[0];
            }

            // Peeks a single unsigned 8-bit integer at an optional offset from the current position.
            peekUInt8(offset = 0) {
                const data = this._getRawDataForReading(1 + offset);
                return data[offset];
            }

            // Reads a single unsigned 16-bit integer, respecting endianness, and advances.
            readUInt16() {
                const data = this._getRawDataForReading(2);
                this.advanceBytes(2);
                return this.endianness === DataStream.BIG_ENDIAN ?
                       (data[0] << 8) | data[1] : // Big Endian: MSB first
                       (data[1] << 8) | data[0]; // Little Endian: LSB first
            }

            // Peeks a single unsigned 16-bit integer at an optional offset, respecting endianness.
            peekUInt16(offset = 0) {
                const data = this._getRawDataForReading(2 + offset);
                return this.endianness === DataStream.BIG_ENDIAN ?
                       (data[offset] << 8) | data[offset + 1] :
                       (data[offset + 1] << 8) | data[offset];
            }

            // Reads a single unsigned 24-bit integer, respecting endianness, and advances.
            readUInt24() {
                const data = this._getRawDataForReading(3);
                this.advanceBytes(3);
                return this.endianness === DataStream.BIG_ENDIAN ?
                       (data[0] << 16) | (data[1] << 8) | data[2] :
                       (data[2] << 16) | (data[1] << 8) | data[0];
            }

            // Peeks a single unsigned 24-bit integer at an optional offset, respecting endianness.
            peekUInt24(offset = 0) {
                const data = this._getRawDataForReading(3 + offset);
                return this.endianness === DataStream.BIG_ENDIAN ?
                       (data[offset] << 16) | (data[offset + 1] << 8) | data[offset + 2] :
                       (data[offset + 2] << 16) | (data[offset + 1] << 8) | data[offset];
            }

            // Reads a single unsigned 32-bit integer, respecting endianness, and advances.
            readUInt32() {
                const data = this._getRawDataForReading(4);
                this.advanceBytes(4);
                // For 32-bit values, multiplication by 0x1000000 (2^24) is used for the highest byte
                // to prevent JavaScript's implicit signed 32-bit conversion during bit shifts.
                return this.endianness === DataStream.BIG_ENDIAN ?
                       (data[0] * 0x1000000) + (data[1] << 16) + (data[2] << 8) + data[3] :
                       (data[3] * 0x1000000) + (data[2] << 16) + (data[1] << 8) + data[0];
            }

            // Peeks a single unsigned 32-bit integer at an optional offset, respecting endianness.
            peekUInt32(offset = 0) {
                const data = this._getRawDataForReading(4 + offset);
                return this.endianness === DataStream.BIG_ENDIAN ?
                       (data[offset] * 0x1000000) + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3] :
                       (data[offset + 3] * 0x1000000) + (data[offset + 2] << 16) + (data[offset + 1] << 8) + data[offset];
            }
        }

        moduleReference.exports = DataStream; // Export the DataStream class

    },{"./bufferlist":8,"./underflow":11}],11:[function(internalRequire, moduleReference, exportObject){
        // Module 11: StreamUnderflowError - A custom error class for stream read operations.
        // This error is thrown when a read or peek operation attempts to access more data
        // than is currently available in the stream's buffer.

        class StreamUnderflowError extends Error {
            constructor(message = "Stream operation failed due to insufficient data available.") {
                super(message); // Call the base Error class constructor
                this.name = "StreamUnderflowError"; // Custom error name

                // Capture the stack trace for better debugging in V8 (Chrome, Node.js).
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, StreamUnderflowError);
                }
            }
        }

        moduleReference.exports = StreamUnderflowError; // Export the custom error class

    },{}],12:[function(internalRequire, moduleReference, exportObject){
        // Module 12: AudioDecoderBase - A base class and registry for audio decoders.
        // It provides a mechanism for registering various audio codec decoders
        // and finding the appropriate one based on a given audio format ID.

        let AudioDecoderBase;

        AudioDecoderBase = (function() {
            const registeredDecoders = []; // An internal array to store all registered decoder classes.

            function AudioDecoderBase() {
                // The base constructor for audio decoders. Subclasses will extend this.
                // It might remain empty or contain common initialization for all decoders.
            }

            // Static method to register a new audio decoder class with the registry.
            // 'decoderClass': The class constructor of the decoder to be registered.
            AudioDecoderBase.registerDecoder = function(decoderClass) {
                if (typeof decoderClass !== 'function') {
                    console.error("[AudioDecoderBase] Attempted to register a non-class (or non-constructor) as an audio decoder. Registration skipped.");
                    return;
                }
                registeredDecoders.push(decoderClass);
                // console.debug(`[AudioDecoderBase] Successfully registered decoder: '${decoderClass.name}'.`);
            };

            // Static method to find a suitable audio decoder class for a given format identifier.
            // 'formatIdentifier': The ID string representing the audio codec format (e.g., 'lpcm', 'aac').
            AudioDecoderBase.find = function(formatIdentifier) {
                // Iterate through all registered decoder classes.
                for (let i = 0; i < registeredDecoders.length; i++) {
                    const currentDecoder = registeredDecoders[i];
                    // Assume each decoder class has a static 'canDecode' method to check compatibility.
                    if (currentDecoder.canDecode && currentDecoder.canDecode(formatIdentifier)) {
                        // console.debug(`[AudioDecoderBase] Found a suitable decoder for format ID '${formatIdentifier}': '${currentDecoder.name}'.`);
                        return currentDecoder; // Return the first compatible decoder found.
                    }
                }
                console.warn(`[AudioDecoderBase] No audio decoder found for the specified format ID: '${formatIdentifier}'.`);
                return null; // Return null if no compatible decoder is found.
            };

            return AudioDecoderBase;

        })();

        moduleReference.exports = AudioDecoderBase; // Export the AudioDecoderBase class

    },{}],13:[function(internalRequire, moduleReference, exportObject){
        // Module 13: LPCMDecoder - A decoder for Linear Pulse Code Modulation (LPCM) audio.
        // LPCM is an uncompressed audio format, so decoding primarily involves
        // reading samples from the stream and converting them to a standard format (e.g., Float32Array).

        const EventDispatcher = internalRequire('../core/events');       // For emitting data, end, and error events
        const AudioDecoderBase = internalRequire('../decoder');           // For registering this decoder
        const DataStream = internalRequire('../core/stream');             // For reading binary data
        const StreamUnderflowError = internalRequire('../core/underflow'); // Custom error for stream issues

        class LPCMDecoder extends EventDispatcher { // LPCMDecoder inherits from EventDispatcher
            constructor(mediaDemuxer, audioFormat) {
                super(); // Call the EventDispatcher constructor

                this.mediaDemuxer = mediaDemuxer; // The demuxer providing raw audio packets
                this.audioFormat = audioFormat;   // Detailed format information for LPCM
                this.isDecodingActive = false;    // Flag to indicate if decoding is currently in progress

                // Pre-calculate byte-related values for efficient sample processing
                this.bytesPerSample = Math.ceil(audioFormat.bitsPerChannel / 8); // Bytes per individual sample
                this.samplesPerFrame = audioFormat.channels;                     // Number of samples per audio frame
                this.bytesPerFrame = this.bytesPerSample * this.samplesPerFrame; // Total bytes for one audio frame

                // Set up event listeners for the demuxer to receive data and status updates
                this.mediaDemuxer.on('data', this._handleDemuxedData.bind(this));
                this.mediaDemuxer.on('end', this._handleDemuxerEnd.bind(this));
                this.mediaDemuxer.on('error', this._handleDemuxerError.bind(this));
            }

            // Static method to determine if this decoder can handle a given audio format ID.
            static canDecode(formatID) {
                // LPCM is typically identified by 'lpcm' or 'pcm' format IDs.
                return formatID === 'lpcm' || formatID === 'pcm';
            }

            // Handles incoming raw audio data chunks from the demuxer.
            _handleDemuxedData(dataChunk) {
                // For LPCM, the demuxer usually provides raw audio data.
                // This event listener primarily signals that data is available for `decode()` to pull.
                // console.debug("[LPCMDecoder] Received raw data chunk from demuxer.");
                this.emit('dataAvailable', dataChunk); // Emit an internal event
            }

            // Handles the 'end' event from the demuxer, signaling the end of the audio stream.
            _handleDemuxerEnd() {
                // console.debug("[LPCMDecoder] Demuxer stream has ended.");
                this.emit('end'); // Propagate the 'end' event to consumers
            }

            // Handles 'error' events from the demuxer.
            _handleDemuxerError(error) {
                console.error("[LPCMDecoder] Demuxer reported an error:", error);
                this.emit('error', error); // Propagate the error to consumers
            }

            // Decodes a single packet or a small chunk of LPCM audio data.
            // This method is designed to be called repeatedly to process the stream.
            decode() {
                this.isDecodingActive = true; // Mark decoding as active
                try {
                    // Request an audio packet from the demuxer.
                    // The demuxer is responsible for providing byte buffers of audio data.
                    const audioPacket = this.mediaDemuxer.readPacket();
                    if (!audioPacket || audioPacket.length === 0) {
                        // If no packet is available or it's empty, decoding temporarily stops or stream ended.
                        this.isDecodingActive = false;
                        return false; // Indicate no more data was decoded in this call
                    }

                    // Create a DataStream from the audio packet for structured reading.
                    const dataStream = new DataStream(audioPacket);
                    // Set the stream's endianness according to the audio format details.
                    dataStream.endianness = this.audioFormat.littleEndian ? DataStream.LITTLE_ENDIAN : DataStream.BIG_ENDIAN;

                    // Calculate the number of individual samples in the packet.
                    const numSamplesInPacket = audioPacket.length / this.bytesPerSample;
                    // Prepare an array for the decoded samples. Use Float32Array for floating-point output,
                    // otherwise Int32Array for intermediate integer samples.
                    const decodedSamples = new (this.audioFormat.floatingPoint ? Float32Array : Int32Array)(numSamplesInPacket);

                    let sampleIndex = 0;
                    // Loop through the packet, reading samples until no more bytes are available or all samples processed.
                    while (dataStream.hasBytesAvailable(this.bytesPerSample) && sampleIndex < numSamplesInPacket) {
                        let sampleValue;
                        // Read the sample based on the 'bitsPerChannel' specified in the audio format.
                        switch (this.audioFormat.bitsPerChannel) {
                            case 8:
                                sampleValue = dataStream.readUInt8();
                                // For 8-bit, often unsigned, convert to signed if format specifies.
                                if (this.audioFormat.signed) {
                                    sampleValue = (sampleValue & 0x80) ? (sampleValue - 256) : sampleValue;
                                }
                                break;
                            case 16:
                                sampleValue = dataStream.readUInt16();
                                if (this.audioFormat.signed) {
                                    sampleValue = (sampleValue & 0x8000) ? (sampleValue - 65536) : sampleValue;
                                }
                                break;
                            case 24:
                                sampleValue = dataStream.readUInt24();
                                if (this.audioFormat.signed) {
                                    sampleValue = (sampleValue & 0x800000) ? (sampleValue - 16777216) : sampleValue;
                                }
                                break;
                            case 32:
                                sampleValue = dataStream.readUInt32();
                                if (this.audioFormat.signed) {
                                    // For 32-bit signed, use bitwise OR with 0 to convert to signed 32-bit integer.
                                    sampleValue = sampleValue | 0;
                                }
                                break;
                            default:
                                throw new Error(`[LPCMDecoder] Unsupported bits per channel for LPCM: ${this.audioFormat.bitsPerChannel}.`);
                        }
                        decodedSamples[sampleIndex++] = sampleValue; // Store the decoded sample
                    }

                    // If any samples were decoded, emit them as a 'data' event.
                    if (decodedSamples.length > 0) {
                        this.emit('data', decodedSamples);
                    }
                    return true; // Indicate that data was successfully decoded in this call
                } catch (e) {
                    if (e instanceof StreamUnderflowError) {
                        // If the stream underflows, it means more data is needed from the demuxer.
                        // console.debug("[LPCMDecoder] Stream underflow during decode, waiting for more data.");
                        this.isDecodingActive = false; // Temporarily stop active decoding
                        return false; // Indicate a temporary stop, not an error
                    } else {
                        // For any other error, log it and propagate.
                        console.error("[LPCMDecoder] An unexpected error occurred during LPCM decoding:", e);
                        this.emit('error', e);
                        this.isDecodingActive = false;
                        return false;
                    }
                }
            }
        }

        // Register the LPCMDecoder with the global AudioDecoderBase registry.
        AudioDecoderBase.registerDecoder(LPCMDecoder);

        moduleReference.exports = LPCMDecoder; // Export the LPCMDecoder class

    },{}],14:[function(internalRequire, moduleReference, exportObject){
        // Module 14: XLAWDecoder - A decoder for X-Law (A-Law/Mu-Law) compressed audio formats.
        // These are 8-bit logarithmic compression schemes typically used in telephony.
        // This decoder converts 8-bit X-Law samples into 16-bit linear PCM.

        const EventDispatcher = internalRequire('../core/events');       // For emitting data, end, and error events
        const AudioDecoderBase = internalRequire('../decoder');           // For registering this decoder
        const StreamUnderflowError = internalRequire('../core/underflow'); // Custom error for stream issues

        // Helper function to decode a single A-law compressed byte into a 16-bit linear PCM sample.
        const decodeALawSample = function(aLawByte) {
            aLawByte ^= 0x55; // Invert alternate bits (A-law specific operation)
            let magnitude = aLawByte & 0x7f; // Extract the magnitude part
            let sign = aLawByte & 0x80;    // Extract the sign bit

            if (magnitude < 0x20) { // Handle Segment 0-1 (linear region)
                magnitude = (magnitude * 2) + 1;
            } else { // Handle Segments 2-7 (logarithmic region)
                magnitude = (magnitude + 0x10) * 4;
            }
            // Apply sign and scale to 16-bit range (max 8192 for A-law, typically represented as 16-bit signed)
            return sign ? magnitude - 8192 : 8192 - magnitude;
        };

        // Helper function to decode a single Mu-law compressed byte into a 16-bit linear PCM sample.
        const decodeMuLawSample = function(muLawByte) {
            muLawByte = ~muLawByte; // Invert all bits (Mu-law specific operation)
            let t = (muLawByte & 0x0f) << 3; // Extract 4 bits and shift (mantissa)
            let exponent = (muLawByte & 0x70) >> 4; // Extract the exponent part
            let linearValue = t + 0x84; // Add bias and initial value (132 + 4)

            if (exponent > 0) {
                linearValue <<= (exponent - 1); // Apply the exponent (left shift)
            }

            // Apply sign: if MSB was set (before inversion), it's a negative sample.
            return (muLawByte & 0x80) ? linearValue : -linearValue;
        };

        class XLAWDecoder extends EventDispatcher { // XLAWDecoder inherits from EventDispatcher
            constructor(mediaDemuxer, audioFormat) {
                super(); // Call the EventDispatcher constructor

                this.mediaDemuxer = mediaDemuxer;
                this.audioFormat = audioFormat;
                this.isDecodingActive = false;

                // X-Law formats are typically 8 bits per channel. Validate this assumption.
                if (audioFormat.bitsPerChannel !== 8) {
                    throw new Error(`[XLAWDecoder] X-Law decoding only supports 8 bits per channel. Received: ${audioFormat.bitsPerChannel}.`);
                }

                this.decodeFunction = null; // Will hold either decodeALawSample or decodeMuLawSample
                // Determine which X-Law variant to use based on the format ID.
                if (audioFormat.formatID === 'alaw') {
                    this.decodeFunction = decodeALawSample;
                } else if (audioFormat.formatID === 'mulaw') {
                    this.decodeFunction = decodeMuLawSample;
                } else {
                    throw new Error(`[XLAWDecoder] Unsupported X-Law format ID: ${audioFormat.formatID}. Only 'alaw' and 'mulaw' are supported.`);
                }

                // Set up event listeners for the demuxer
                this.mediaDemuxer.on('data', this._handleDemuxedData.bind(this));
                this.mediaDemuxer.on('end', this._handleDemuxerEnd.bind(this));
                this.mediaDemuxer.on('error', this._handleDemuxerError.bind(this));
            }

            // Static method to check if this decoder can handle a given format ID.
            static canDecode(formatID) {
                return formatID === 'alaw' || formatID === 'mulaw';
            }

            // Handles incoming raw audio data chunks from the demuxer.
            _handleDemuxedData(dataChunk) {
                this.emit('dataAvailable', dataChunk); // Signal that data is ready for decoding
            }

            // Handles the 'end' event from the demuxer.
            _handleDemuxerEnd() {
                this.emit('end'); // Propagate the 'end' event
            }

            // Handles 'error' events from the demuxer.
            _handleDemuxerError(error) {
                console.error("[XLAWDecoder] Demuxer reported an error:", error);
                this.emit('error', error); // Propagate the error
            }

            // Decodes a single packet or a small chunk of X-Law audio data.
            decode() {
                this.isDecodingActive = true;
                try {
                    const audioPacket = this.mediaDemuxer.readPacket();
                    if (!audioPacket || audioPacket.length === 0) {
                        this.isDecodingActive = false;
                        return false; // No data to decode
                    }

                    // X-Law decoding typically converts 8-bit samples to 16-bit linear PCM.
                    const decodedSamples = new Int16Array(audioPacket.length); // Output buffer
                    for (let i = 0; i < audioPacket.length; i++) {
                        decodedSamples[i] = this.decodeFunction(audioPacket[i]); // Apply the specific X-Law decoding
                    }

                    if (decodedSamples.length > 0) {
                        this.emit('data', decodedSamples); // Emit the decoded 16-bit samples
                    }
                    return true; // Indicate data was decoded
                } catch (e) {
                    if (e instanceof StreamUnderflowError) {
                        this.isDecodingActive = false;
                        return false; // Underflow, temporary stop
                    } else {
                        console.error("[XLAWDecoder] An unexpected error occurred during X-Law decoding:", e);
                        this.emit('error', e);
                        this.isDecodingActive = false;
                        return false;
                    }
                }
            }
        }

        // Register the XLAWDecoder with the global AudioDecoderBase registry.
        AudioDecoderBase.registerDecoder(XLAWDecoder);

        moduleReference.exports = XLAWDecoder; // Export the XLAWDecoder class

    },{}],15:[function(internalRequire, moduleReference, exportObject){
        // Module 15: MediaDemuxerBase - A base class and registry for media demuxers.
        // Demuxers are responsible for parsing container formats (e.g., WAV, MP4)
        // and extracting raw audio (and sometimes video) packets.

        let MediaDemuxerBase;

        MediaDemuxerBase = (function() {
            const registeredDemuxers = []; // An internal array to store all registered demuxer classes.

            function MediaDemuxerBase() {
                // The base constructor for media demuxers. Subclasses will extend this.
                // It might remain empty or contain common initialization for all demuxers.
            }

            // Static method to register a new media demuxer class with the registry.
            // 'demuxerClass': The class constructor of the demuxer to be registered.
            MediaDemuxerBase.registerDemuxer = function(demuxerClass) {
                if (typeof demuxerClass !== 'function') {
                    console.error("[MediaDemuxerBase] Attempted to register a non-class (or non-constructor) as a media demuxer. Registration skipped.");
                    return;
                }
                registeredDemuxers.push(demuxerClass);
                // console.debug(`[MediaDemuxerBase] Successfully registered demuxer: '${demuxerClass.name}'.`);
            };

            // Static method to find a suitable media demuxer class for a given initial data chunk.
            // 'initialDataChunk': A small buffer containing the initial bytes of the media file.
            MediaDemuxerBase.find = function(initialDataChunk) {
                // Iterate through all registered demuxer classes.
                for (let i = 0; i < registeredDemuxers.length; i++) {
                    const currentDemuxer = registeredDemuxers[i];
                    // Assume each demuxer class has a static 'canHandle' method to check if it supports the format.
                    if (currentDemuxer.canHandle && currentDemuxer.canHandle(initialDataChunk)) {
                        // console.debug(`[MediaDemuxerBase] Found a suitable demuxer for the data: '${currentDemuxer.name}'.`);
                        return currentDemuxer; // Return the first compatible demuxer found.
                    }
                }
                console.warn("[MediaDemuxerBase] No media demuxer found that can handle the provided initial data chunk.");
                return null; // Return null if no compatible demuxer is found.
            };

            return MediaDemuxerBase;

        })();

        moduleReference.exports = MediaDemuxerBase; // Export the MediaDemuxerBase class

    },{}],16:[function(internalRequire, moduleReference, exportObject){
        // Module 16: AIFFDemuxer - A placeholder demuxer for Audio Interchange File Format (AIFF).
        // This module demonstrates the structure for a demuxer class, including
        // format identification and simulated packet reading.

        const EventDispatcher = internalRequire('../core/events');     // For emitting events (format, duration, metadata, data, end, error)
        const MediaDemuxerBase = internalRequire('../demuxer');         // For registering this demuxer

        class AIFFDemuxer extends EventDispatcher { // AIFFDemuxer inherits from EventDispatcher
            constructor(dataSource, initialChunk) {
                super(); // Call the EventDispatcher constructor

                this.dataSource = dataSource;     // The underlying data source (e.g., HTTP, File)
                this.initialChunk = initialChunk; // The first bytes received, used for initial probing
                this.currentOffset = 0;           // Tracks the current read position within the audio data

                // Simulate parsing AIFF header and emitting format/metadata asynchronously.
                // In a real implementation, this would involve reading and parsing actual AIFF chunks.
                setTimeout(() => {
                    console.debug("[AIFFDemuxer] Simulating AIFF header parsing and format emission.");
                    this.emit('format', {
                        formatID: 'lpcm',        // AIFF typically contains LPCM audio
                        bitsPerChannel: 16,
                        channels: 2,
                        sampleRate: 44100,
                        floatingPoint: false,
                        signed: true,
                        littleEndian: false      // AIFF is typically big-endian
                    });
                    this.emit('duration', 90.0); // Example duration in seconds
                    this.emit('metadata', {
                        title: 'AIFF Recording',
                        copyright: 'Apple Inc.'
                    });
                }, 10); // Short delay to simulate asynchronous parsing
            }

            // Static method to check if this demuxer can handle the given initial data chunk.
            // AIFF files start with 'FORM' followed by a chunk size, then 'AIFF'.
            static canHandle(dataChunk) {
                // Ensure enough bytes are available for signature check.
                if (dataChunk.length < 12) return false;
                const formSignature = dataChunk.toString('ascii', 0, 4); // Read 'FORM'
                const aiffType = dataChunk.toString('ascii', 8, 12);     // Read 'AIFF'
                return formSignature === 'FORM' && aiffType === 'AIFF';
            }

            // Reads and returns a single audio data packet from the stream.
            // This method would be called repeatedly by a decoder.
            readPacket() {
                // Check if all data has been read from the source.
                if (this.currentOffset >= this.dataSource.length) {
                    this.emit('end'); // Signal end of stream
                    return null;
                }
                const packetSize = 4096; // Simulate reading fixed-size packets (e.g., 4KB)
                const data = this.dataSource.read(packetSize); // Request data from the underlying source
                if (data.length === 0) {
                    this.emit('end'); // If no data was read, it's the end of the stream
                    return null;
                }
                this.currentOffset += data.length; // Update the internal read offset
                return data; // Return the raw audio data packet
            }
        }

        // Register the AIFFDemuxer with the global MediaDemuxerBase registry.
        MediaDemuxerBase.registerDemuxer(AIFFDemuxer);

        moduleReference.exports = AIFFDemuxer; // Export the AIFFDemuxer class

    },{}],17:[function(internalRequire, moduleReference, exportObject){
        // Module 17: AUDemuxer - A placeholder demuxer for Sun AU audio format.
        // This module provides the basic structure for an AU demuxer,
        // including format detection and simulated data packet extraction.

        const EventDispatcher = internalRequire('../core/events');
        const MediaDemuxerBase = internalRequire('../demuxer');

        class AUDemuxer extends EventDispatcher {
            constructor(dataSource, initialChunk) {
                super();

                this.dataSource = dataSource;
                this.initialChunk = initialChunk;
                this.currentOffset = 0;

                // Simulate parsing AU header and emitting format/metadata asynchronously.
                // AU files commonly contain Mu-law or A-law compressed audio.
                setTimeout(() => {
                    console.debug("[AUDemuxer] Simulating AU header parsing and format emission.");
                    this.emit('format', {
                        formatID: 'mulaw',       // Common for AU files
                        bitsPerChannel: 8,
                        channels: 1,
                        sampleRate: 8000,        // Common telephony sample rate
                        floatingPoint: false,
                        signed: true,
                        littleEndian: false      // AU is typically big-endian
                    });
                    this.emit('duration', 30.0); // Example duration
                    this.emit('metadata', {
                        title: 'AU Voice Memo',
                        producer: 'Sun Microsystems'
                    });
                }, 10);
            }

            // Static method to check if this demuxer can handle the given initial data chunk.
            // AU files typically start with the magic number '.snd' (0x2E736E64).
            static canHandle(dataChunk) {
                if (dataChunk.length < 4) return false;
                const magicNumber = dataChunk.readUInt32BE(0); // Read as Big Endian
                return magicNumber === 0x2E736E64; // '.snd' in ASCII
            }

            // Reads and returns a single audio data packet.
            readPacket() {
                if (this.currentOffset >= this.dataSource.length) {
                    this.emit('end');
                    return null;
                }
                const packetSize = 1024; // Simulate reading 1KB packets
                const data = this.dataSource.read(packetSize);
                if (data.length === 0) {
                    this.emit('end');
                    return null;
                }
                this.currentOffset += data.length;
                return data;
            }
        }

        MediaDemuxerBase.registerDemuxer(AUDemuxer);

        moduleReference.exports = AUDemuxer;

    },{}],18:[function(internalRequire, moduleReference, exportObject){
        // Module 18: CAFDemuxer - A placeholder demuxer for Core Audio Format (CAF).
        // This module outlines the structure for a CAF demuxer, including
        // its format identification and simulated packet extraction.

        const EventDispatcher = internalRequire('../core/events');
        const MediaDemuxerBase = internalRequire('../demuxer');

        class CAFDemuxer extends EventDispatcher {
            constructor(dataSource, initialChunk) {
                super();

                this.dataSource = dataSource;
                this.initialChunk = initialChunk;
                this.currentOffset = 0;

                // Simulate parsing CAF header and emitting format/metadata asynchronously.
                // CAF can contain various audio codecs, LPCM is common.
                setTimeout(() => {
                    console.debug("[CAFDemuxer] Simulating CAF header parsing and format emission.");
                    this.emit('format', {
                        formatID: 'lpcm',        // Example: LPCM audio
                        bitsPerChannel: 16,
                        channels: 2,
                        sampleRate: 44100,
                        floatingPoint: false,
                        signed: true,
                        littleEndian: false      // CAF is typically big-endian
                    });
                    this.emit('duration', 60.5); // Example duration
                    this.emit('metadata', {
                        title: 'CAF Audio Track',
                        artist: 'Unknown'
                    });
                }, 10);
            }

            // Static method to check if this demuxer can handle the given initial data chunk.
            // CAF files start with the magic number 'caff'.
            static canHandle(dataChunk) {
                if (dataChunk.length < 4) return false;
                const magicNumber = dataChunk.toString('ascii', 0, 4);
                return magicNumber === 'caff';
            }

            // Reads and returns a single audio data packet.
            readPacket() {
                if (this.currentOffset >= this.dataSource.length) {
                    this.emit('end');
                    return null;
                }
                const packetSize = 4096; // Simulate reading fixed-size 4KB packets
                const data = this.dataSource.read(packetSize);
                if (data.length === 0) {
                    this.emit('end');
                    return null;
                }
                this.currentOffset += data.length;
                return data;
            }
        }

        MediaDemuxerBase.registerDemuxer(CAFDemuxer);

        moduleReference.exports = CAFDemuxer;

    },{}],19:[function(internalRequire, moduleReference, exportObject){
        // Module 19: M4ADemuxer - A placeholder demuxer for M4A (AAC/ALAC in MP4 container).
        // This module provides the basic structure for an M4A demuxer,
        // including format detection and simulated data packet extraction.

        const EventDispatcher = internalRequire('../core/events');
        const MediaDemuxerBase = internalRequire('../demuxer');

        class M4ADemuxer extends EventDispatcher {
            constructor(dataSource, initialChunk) {
                super();

                this.dataSource = dataSource;
                this.initialChunk = initialChunk;
                this.currentOffset = 0;

                // Simulate parsing M4A/MP4 header and emitting format/metadata asynchronously.
                // M4A typically contains AAC or ALAC (Apple Lossless Audio Codec).
                setTimeout(() => {
                    console.debug("[M4ADemuxer] Simulating M4A header parsing and format emission.");
                    this.emit('format', {
                        formatID: 'aac',         // Example: AAC audio
                        bitsPerChannel: 16,      // Common representation after decoding
                        channels: 2,
                        sampleRate: 48000,
                        floatingPoint: false,
                        signed: true,
                        littleEndian: false      // Endianness of decoded PCM, not container
                    });
                    this.emit('duration', 180.0); // Example duration
                    this.emit('metadata', {
                        title: 'M4A Song',
                        encoder: 'iTunes'
                    });
                }, 10);
            }

            // Static method to check if this demuxer can handle the given initial data chunk.
            // M4A files are MP4 containers, often starting with an 'ftyp' box after a 4-byte size.
            static canHandle(dataChunk) {
                if (dataChunk.length < 8) return false;
                // Check for 'ftyp' at offset 4 (after the box size)
                const ftypSignature = dataChunk.toString('ascii', 4, 8);
                return ftypSignature === 'ftyp';
            }

            // Reads and returns a single audio data packet.
            readPacket() {
                if (this.currentOffset >= this.dataSource.length) {
                    this.emit('end');
                    return null;
                }
                const packetSize = 8192; // AAC packets can be variable; simulate fixed 8KB for clone
                const data = this.dataSource.read(packetSize);
                if (data.length === 0) {
                    this.emit('end');
                    return null;
                }
                this.currentOffset += data.length;
                return data;
            }
        }

        MediaDemuxerBase.registerDemuxer(M4ADemuxer);

        moduleReference.exports = M4ADemuxer;

    },{}],20:[function(internalRequire, moduleReference, exportObject){
        // Module 20: WAVEDemuxer - A placeholder demuxer for Waveform Audio File Format (WAVE).
        // This module provides the basic structure for a WAVE demuxer,
        // including format detection and simulated data packet extraction.

        const EventDispatcher = internalRequire('../core/events');
        const MediaDemuxerBase = internalRequire('../demuxer');

        class WAVEDemuxer extends EventDispatcher {
            constructor(dataSource, initialChunk) {
                super();

                this.dataSource = dataSource;
                this.initialChunk = initialChunk;
                this.currentOffset = 0;

                // Simulate parsing WAVE header (RIFF, fmt, data chunks) and emitting format/metadata asynchronously.
                // WAVE files primarily contain LPCM audio, but can also encapsulate other formats.
                setTimeout(() => {
                    console.debug("[WAVEDemuxer] Simulating WAVE header parsing and format emission.");
                    this.emit('format', {
                        formatID: 'lpcm',        // Common for WAVE files
                        bitsPerChannel: 16,
                        channels: 2,
                        sampleRate: 44100,
                        floatingPoint: false,
                        signed: true,
                        littleEndian: true       // WAVE is typically little-endian
                    });
                    this.emit('duration', 120.0); // Example duration
                    this.emit('metadata', {
                        title: 'WAVE Sample',
                        software: 'Audacity'
                    });
                }, 10);
            }

            // Static method to check if this demuxer can handle the given initial data chunk.
            // WAVE files start with 'RIFF' followed by a chunk size, then 'WAVE'.
            static canHandle(dataChunk) {
                if (dataChunk.length < 12) return false;
                const riffSignature = dataChunk.toString('ascii', 0, 4); // Read 'RIFF'
                const waveType = dataChunk.toString('ascii', 8, 12);     // Read 'WAVE'
                return riffSignature === 'RIFF' && waveType === 'WAVE';
            }

            // Reads and returns a single audio data packet.
            readPacket() {
                if (this.currentOffset >= this.dataSource.length) {
                    this.emit('end');
                    return null;
                }
                const packetSize = 4096; // Simulate reading fixed-size 4KB packets
                const data = this.dataSource.read(packetSize);
                if (data.length === 0) {
                    this.emit('end');
                    return null;
                }
                this.currentOffset += data.length;
                return data;
            }
        }

        MediaDemuxerBase.registerDemuxer(WAVEDemuxer);

        moduleReference.exports = WAVEDemuxer;

    },{}],21:[function(internalRequire, moduleReference, exportObject){
        // Module 21: AudioOutputDevice - A base class for audio playback devices.
        // This abstract class defines the common interface and functionality
        // that all concrete audio output devices (e.g., Web Audio, Mozilla Audio API) must implement.

        const EventDispatcher = internalRequire('./events'); // Import the event emitter utility

        class AudioOutputDevice extends EventDispatcher { // AudioOutputDevice inherits from EventDispatcher
            constructor() {
                super(); // Call the EventDispatcher constructor

                this.isPlaying = false;     // Flag indicating if audio is currently playing
                this.volumeLevel = 1.0;     // Current volume level (0.0 to 1.0)
                this.outputLatency = 0;     // New property: Estimated audio output latency in seconds
            }

            // Abstract method: Initiates audio playback.
            // Subclasses MUST implement this method.
            startPlayback() {
                if (this.isPlaying) {
                    console.warn("[AudioOutputDevice] Playback is already active. Ignoring start request.");
                    return;
                }
                this.isPlaying = true;
                this.emit('play'); // Emit a 'play' event
                console.debug(`[AudioOutputDevice] Playback started for device: ${this.constructor.name}.`);
            }

            // Abstract method: Halts audio playback.
            // Subclasses MUST implement this method.
            stopPlayback() {
                if (!this.isPlaying) {
                    console.warn("[AudioOutputDevice] Playback is not active. Ignoring stop request.");
                    return;
                }
                this.isPlaying = false;
                this.emit('stop'); // Emit a 'stop' event
                console.debug(`[AudioOutputDevice] Playback stopped for device: ${this.constructor.name}.`);
            }

            // Abstract method: Enqueues audio data for playback.
            // 'audioBuffer': A Float32Array containing audio samples.
            // Subclasses MUST implement this method to handle device-specific buffering.
            enqueueAudioData(audioBuffer) {
                throw new Error(`Abstract method 'enqueueAudioData' must be implemented by the subclass '${this.constructor.name}'.`);
            }

            // Sets the output volume level.
            // 'newVolume': A value between 0.0 (mute) and 1.0 (full volume).
            setVolume(newVolume) {
                // Validate and clamp the volume level to the acceptable range.
                if (newVolume < 0 || newVolume > 1) {
                    console.warn(`[AudioOutputDevice] Provided volume level (${newVolume}) is out of range (0.0-1.0). Clamping to valid range.`);
                    this.volumeLevel = Math.max(0, Math.min(1, newVolume));
                } else {
                    this.volumeLevel = newVolume;
                }
                this.emit('volumechange', this.volumeLevel); // Emit a 'volumechange' event
                console.debug(`[AudioOutputDevice] Volume set to ${this.volumeLevel}.`);
            }

            // Returns the current output volume level.
            getVolume() {
                return this.volumeLevel;
            }

            // Abstract method: Returns the current playback time in seconds.
            // Subclasses MUST implement this method to provide device-specific time tracking.
            getCurrentPlaybackTime() {
                throw new Error(`Abstract method 'getCurrentPlaybackTime' must be implemented by the subclass '${this.constructor.name}'.`);
            }
        }

        moduleReference.exports = AudioOutputDevice; // Export the AudioOutputDevice base class

    },{"./events":9}],22:[function(internalRequire, moduleReference, exportObject){
        // Module 22: MozillaAudioDevice - An audio output device implementation for Mozilla's Audio Data API.
        // Note: The Mozilla Audio Data API (mozSetup, mozWriteAudio) is deprecated and primarily
        // found in older Firefox versions. This implementation is included for cloning purposes.

        const AudioOutputDevice = internalRequire('../device'); // Import the base audio device class
        const EventDispatcher = internalRequire('../core/events'); // Import the event dispatcher

        // Feature detection for the Mozilla Audio Data API
        const hasMozillaAudioAPI = typeof Audio !== 'undefined' && typeof new Audio().mozSetup === 'function';

        class MozillaAudioDevice extends AudioOutputDevice { // Inherits from AudioOutputDevice
            constructor() {
                super(); // Call the base AudioOutputDevice constructor

                if (!hasMozillaAudioAPI) {
                    // If the API is not available, throw an error to prevent instantiation.
                    throw new Error("[MozillaAudioDevice] Mozilla Audio Data API (Audio.mozSetup) not available in this environment.");
                }

                // Initialize the Audio object for Mozilla's API
                this.audioContext = new Audio();
                // mozSetup initializes the audio output stream. Default to 2 channels, 44100 Hz.
                this.audioContext.mozSetup(this.audioContext.channels || 2, this.audioContext.rate || 44100);

                this.channelCount = this.audioContext.channels || 2;
                this.sampleRate = this.audioContext.rate || 44100;
                this.audioBufferQueue = [];      // Queue for Float32Array audio data to be played
                this.isProcessingQueue = false;  // Flag to prevent multiple concurrent queue processing loops
                this.targetBufferSize = 4096;    // Target number of frames to write to mozWriteAudio at once

                // Bind the queue processing method to 'this' instance for correct context
                this._processAudioQueue = this._processAudioQueue.bind(this);
                console.log("[MozillaAudioDevice] Initialized Mozilla Audio Device.");
            }

            // Overrides the base startPlayback method.
            startPlayback() {
                if (this.isPlaying) return; // Already playing
                super.startPlayback(); // Call base method to update state and emit 'play'
                this._processAudioQueue(); // Start the audio queue processing loop
                console.log("[MozillaAudioDevice] Playback started using Mozilla Audio API.");
            }

            // Overrides the base stopPlayback method.
            stopPlayback() {
                if (!this.isPlaying) return; // Not playing
                super.stopPlayback(); // Call base method to update state and emit 'stop'
                // Clear any pending audio data in the queue
                this.audioBufferQueue = [];
                this.isProcessingQueue = false; // Stop the queue processing loop
                console.log("[MozillaAudioDevice] Playback stopped for Mozilla Audio API.");
            }

            // Enqueues audio data (Float32Array) to be played.
            enqueueAudioData(audioBuffer) {
                // Ensure the buffer is a Float32Array. If not, attempt conversion.
                if (!(audioBuffer instanceof Float32Array)) {
                    console.warn("[MozillaAudioDevice] Enqueued buffer is not a Float32Array. Attempting conversion.");
                    audioBuffer = new Float32Array(audioBuffer);
                }
                this.audioBufferQueue.push(audioBuffer); // Add the buffer to the queue
                // If currently playing and the queue processing is not active, kick it off.
                if (this.isPlaying && !this.isProcessingQueue) {
                    this._processAudioQueue();
                }
            }

            // Internal method to process the audio buffer queue and write data to mozWriteAudio.
            _processAudioQueue() {
                // Guard clause: only proceed if playing and not already processing the queue.
                if (!this.isPlaying || this.isProcessingQueue) return;
                this.isProcessingQueue = true; // Set flag to indicate active processing

                // Loop while there's data in the queue and playback is active.
                while (this.audioBufferQueue.length > 0 && this.isPlaying) {
                    let currentBuffer = this.audioBufferQueue[0];
                    let framesWrittenInIteration = 0; // Tracks frames written in this buffer's processing

                    // Inner loop to write chunks of the current buffer to mozWriteAudio.
                    while (currentBuffer.length > 0 && this.isPlaying) {
                        // Determine how many samples to write in this step, up to targetBufferSize frames.
                        const samplesToWrite = Math.min(currentBuffer.length, this.targetBufferSize * this.channelCount);
                        const dataToWrite = currentBuffer.subarray(0, samplesToWrite);

                        // Write data to the audio context. mozWriteAudio returns the number of frames successfully written.
                        const actualFramesWritten = this.audioContext.mozWriteAudio(dataToWrite);

                        if (actualFramesWritten > 0) {
                            framesWrittenInIteration += actualFramesWritten;
                            // Update the current buffer to remove the samples that were written.
                            currentBuffer = currentBuffer.subarray(actualFramesWritten * this.channelCount);
                            // If fewer frames were written than requested, it means the internal audio buffer is full.
                            if (actualFramesWritten < dataToWrite.length / this.channelCount) {
                                // console.debug("[MozillaAudioDevice] mozWriteAudio buffer full, yielding to prevent blocking.");
                                break; // Break inner loop, schedule next processing tick.
                            }
                        } else {
                            // If 0 frames were written, the buffer is full.
                            // console.debug("[MozillaAudioDevice] mozWriteAudio returned 0 frames, internal buffer is full. Yielding.");
                            break; // Break inner loop.
                        }
                    }

                    // After attempting to write the current buffer:
                    if (currentBuffer.length === 0) {
                        this.audioBufferQueue.shift(); // If the buffer is fully consumed, remove it from the queue.
                    } else {
                        this.audioBufferQueue[0] = currentBuffer; // Otherwise, update the queue with the remaining part.