( function (globalScope) {

// License information: proprietary code by Kulikala, 2011. All rights reserved.

/**
 * @constant {string} MOZ_AUDIO_AVAILABLE_EVENT
 * Name of the proprietary Mozilla audio data event.
 */
const MOZ_AUDIO_AVAILABLE_EVENT = 'MozAudioAvailable';

/**
 * @constant {string} METADATA_LOADED_EVENT
 * Name of the standard metadata loaded event.
 */
const METADATA_LOADED_EVENT = 'loadedmetadata';

/**
 * @constant {string} TIME_UPDATE_EVENT
 * Name of the standard time update event.
 */
const TIME_UPDATE_EVENT = 'timeupdate';

/**
 * Manages the streaming and playback of audio data using HTML5 Audio capabilities,
 * specifically targeting Mozilla's proprietary audio API extensions.
 *
 * This constructor creates an instance that encapsulates an HTMLAudioElement
 * and provides methods for managing its state, buffering, and data processing.
 */
const StreamProcessor = function () {
    // --- Internal State and Utility Functions ---

    /**
     * @private
     * The underlying HTMLAudioElement instance used for playback.
     * @type {HTMLAudioElement}
     */
    let mediaElement = new Audio();

    /**
     * @private
     * A queue for audio data frames (Float32Array) awaiting playback.
     * @type {Float32Array[]}
     */
    const dataQueue = [];

    /**
     * @private
     * Flag indicating if the audio system has been initialized with channel count and sample rate.
     * @type {boolean}
     */
    let setupComplete = false;

    /**
     * @private
     * Current read/write position within the head buffer in `dataQueue`.
     * @type {number}
     */
    let currentOffset = 0;

    /**
     * Transforms a Float32Array into a raw ArrayBuffer.
     * This is an internal step for serialization/deserialization.
     *
     * @private
     * @param {Float32Array} floatDataInput - The Float32Array to convert.
     * @returns {ArrayBuffer} An ArrayBuffer containing the binary representation of the input.
     */
    const convertFloatsToArrayBuffer = (floatDataInput) => {
        if (!(floatDataInput instanceof Float32Array)) {
            console.warn("Input to convertFloatsToArrayBuffer is not a Float32Array.");
            return new ArrayBuffer(0);
        }
        const byteLength = floatDataInput.length * Float32Array.BYTES_PER_ELEMENT;
        const targetBuffer = new ArrayBuffer(byteLength);
        new Float32Array(targetBuffer).set(floatDataInput); // Copy data
        return targetBuffer;
    };

    /**
     * Serializes a Float32Array audio frame into a JSON string
     * for potential network transmission. Includes channel count and sample rate.
     *
     * @private
     * @param {Float32Array} inputFloatData - The audio frame data.
     * @returns {string} A JSON string representing the marshaled data.
     */
    const serializeAudioFrame = (inputFloatData) => {
        if (!inputFloatData || !(inputFloatData instanceof Float32Array)) {
            console.error("Invalid input for serializeAudioFrame: expected Float32Array.");
            return JSON.stringify({ error: "Invalid data type" });
        }
        const hexPayload = convertBufferToHex(inputFloatData);
        return JSON.stringify({
            channelCount: mediaElement.mozChannels,
            sampleRate: mediaElement.mozSampleRate,
            payload: hexPayload
        });
    };

    /**
     * Deserializes a hexadecimal string back into a Float32Array.
     * This reverses the `convertBufferToHex` operation.
     *
     * @private
     * @param {string} encodedHexData - The hex string to parse.
     * @returns {Float32Array} The reconstituted Float32Array.
     */
    const deserializeHexToFloats = (encodedHexData) => {
        if (typeof encodedHexData !== 'string' || encodedHexData.length % 2 !== 0) {
            console.error("Invalid hex string for deserializeHexToFloats.");
            return new Float32Array(0);
        }

        const bufferByteLength = encodedHexData.length / 2;
        const byteBuffer = new ArrayBuffer(bufferByteLength);
        const byteView = new Uint8Array(byteBuffer);

        for (let idx = 0; idx < bufferByteLength; ++idx) {
            byteView[idx] = parseInt(encodedHexData.substring(idx * 2, idx * 2 + 2), 16);
        }

        return new Float32Array(byteBuffer);
    };

    /**
     * Converts a Float32Array into its hexadecimal string representation.
     * Each byte of the underlying ArrayBuffer is represented by two hex characters.
     *
     * @private
     * @param {Float32Array} floatData - The Float32Array to convert.
     * @returns {string} A string of hexadecimal characters.
     */
    const convertBufferToHex = (floatData) => {
        const rawBuffer = convertFloatsToArrayBuffer(floatData);
        const byteView = new Uint8Array(rawBuffer);
        const hexParts = new Array(byteView.length);

        for (let idx = 0; idx < byteView.length; ++idx) {
            hexParts[idx] = byteView[idx].toString(16).padStart(2, '0');
        }

        return hexParts.join('');
    };

    /**
     * Processes audio data from the internal queue and writes it to the
     * HTMLAudioElement using `mozWriteAudio`. This function is typically
     * called asynchronously.
     *
     * @private
     */
    const processQueuedAudio = () => {
        // Ensure mozWriteAudio is available before attempting to use it.
        if (typeof mediaElement.mozWriteAudio !== 'function') {
            console.warn("mozWriteAudio is not supported by this browser.");
            dataQueue.length = 0; // Clear queue if not supported to prevent infinite loops
            return;
        }

        // Loop while there are buffers in the queue.
        while (dataQueue.length > 0) {
            const currentBuffer = dataQueue[0]; // Peek at the head of the queue.

            // Attempt to write the remaining portion of the current buffer.
            const bytesWritten = mediaElement.mozWriteAudio(currentBuffer.subarray(currentOffset));

            // Check if the entire buffer was written.
            if (currentOffset + bytesWritten < currentBuffer.length) {
                // Not all data was written; update offset and wait for next call.
                currentOffset += bytesWritten;
                break; // Exit loop, will resume from this point later.
            } else {
                // Entire buffer successfully written; remove it from the queue.
                dataQueue.shift();
                currentOffset = 0; // Reset offset for the next buffer.
            }
        }
    };


    // --- Public API ---

    /**
     * The public interface returned by the StreamProcessor constructor.
     * Provides methods for interacting with the audio stream.
     */
    return {
        /**
         * Retrieves the number of audio channels configured for the media element.
         *
         * @returns {number} The channel count. Returns 0 if not available.
         */
        getChannelCount: function () {
            return mediaElement.mozChannels || 0;
        },

        /**
         * Initiates the loading process for an audio resource specified by a URL.
         * This sets the `src` attribute and calls `load()`.
         *
         * @param {string} resourceUri - The URL of the audio file to load.
         * @returns {boolean} True if the load was initiated, false otherwise.
         */
        initiatePlayback: function (resourceUri) {
            if (typeof resourceUri !== 'string' || resourceUri.trim() === '') {
                console.error("Invalid resource URI provided to initiatePlayback.");
                return false;
            }
            mediaElement.src = resourceUri;
            mediaElement.load();
            setupComplete = true; // Mark as initialized after setting src
            return true;
        },

        /**
         * Pauses the current audio playback.
         */
        haltPlayback: function () {
            mediaElement.pause();
        },

        /**
         * Begins or resumes audio playback.
         */
        startPlayback: function () {
            mediaElement.play();
        },

        /**
         * Retrieves the sample rate per second configured for the media element.
         *
         * @returns {number} The sample rate. Returns 0 if not available.
         */
        getSampleRate: function () {
            return mediaElement.mozSampleRate || 0;
        },

        /**
         * Registers a callback function to be invoked when new audio data
         * is made available by the browser (e.g., via `MozAudioAvailable`).
         * The event object passed to the callback will have a `marshaledData` property.
         *
         * @param {Function} dataReadyCallback - The function to call with the audio data event.
         * @returns {boolean} True if handler was registered, false if callback is invalid.
         */
        registerAudioDataHandler: function (dataReadyCallback) {
            if (typeof dataReadyCallback !== 'function') {
                console.error("Invalid callback provided for registerAudioDataHandler.");
                return false;
            }
            mediaElement.addEventListener(MOZ_AUDIO_AVAILABLE_EVENT, (event) => {
                // Prepare the marshaled data from the frame buffer
                event.marshaledData = serializeAudioFrame(event.frameBuffer);
                dataReadyCallback(event);
            }, false);
            return true;
        },

        /**
         * Registers a callback function for when media metadata becomes available.
         *
         * @param {Function} metaInfoCallback - The function to call when metadata is loaded.
         * @returns {boolean} True if handler was registered, false if callback is invalid.
         */
        registerMetadataHandler: function (metaInfoCallback) {
            if (typeof metaInfoCallback !== 'function') {
                console.error("Invalid callback provided for registerMetadataHandler.");
                return false;
            }
            mediaElement.addEventListener(METADATA_LOADED_EVENT, metaInfoCallback, false);
            return true;
        },

        /**
         * Registers a callback function to be invoked periodically as the
         * current playback position changes.
         *
         * @param {Function} timeUpdateCallback - The function to call on time updates.
         * @returns {boolean} True if handler was registered, false if callback is invalid.
         */
        registerTimeUpdateHandler: function (timeUpdateCallback) {
            if (typeof timeUpdateCallback !== 'function') {
                console.error("Invalid callback provided for registerTimeUpdateHandler.");
                return false;
            }
            mediaElement.addEventListener(TIME_UPDATE_EVENT, timeUpdateCallback, false);
            return true;
        },

        /**
         * Sets or retrieves the current audio volume level.
         * Volume is a value between 0.0 (silent) and 1.0 (maximum).
         *
         * @param {number} [newVolumeLevel] - The desired volume level. If omitted, returns current volume.
         * @returns {number} The current (or newly set) volume level.
         */
        adjustVolume: function (newVolumeLevel) {
            if (Number.isFinite(newVolumeLevel)) {
                // Ensure the volume is within the valid range [0.0, 1.0]
                mediaElement.volume = Math.max(0.0, Math.min(1.0, newVolumeLevel));
            }
            return mediaElement.volume;
        },

        /**
         * Ingests a serialized audio frame (JSON string), parses it,
         * and adds it to the internal buffer for asynchronous playback.
         *
         * @param {string} serializedFrameData - A JSON string containing audio frame data.
         * @returns {boolean} True if data was successfully queued, false otherwise.
         */
        ingestAudioFrame: function (serializedFrameData) {
            if (typeof serializedFrameData !== 'string') {
                console.error("Invalid input for ingestAudioFrame: expected a string.");
                return false;
            }

            let frameInfo;
            try {
                frameInfo = JSON.parse(serializedFrameData);
            } catch (e) {
                console.error("Failed to parse audio frame JSON:", e);
                return false;
            }

            // Perform initial setup if not already done.
            if (!setupComplete) {
                if (typeof mediaElement.mozSetup === 'function') {
                    mediaElement.mozSetup(frameInfo.channelCount, frameInfo.sampleRate);
                    setupComplete = true;
                } else {
                    console.error("mozSetup is not available. Cannot initialize audio context.");
                    return false;
                }
            }

            // Convert the hex payload back to a Float32Array and enqueue it.
            const decodedBuffer = deserializeHexToFloats(frameInfo.payload);
            if (decodedBuffer.length > 0) {
                dataQueue.push(decodedBuffer);
                // Schedule the processing of the queue for the next available microtask.
                setTimeout(processQueuedAudio, 0);
                return true;
            } else {
                console.warn("Received empty or invalid audio payload, not queuing.");
                return false;
            }
        }
    };
};


/**
 * @namespace StreamProcessor
 * Static methods attached to the StreamProcessor constructor.
 */
Object.assign(StreamProcessor, {
    /**
     * A factory method to create and initialize a StreamProcessor instance
     * for playing an audio file from a given URL.
     *
     * @param {string} uriToLoad - The URL of the audio file.
     * @returns {StreamProcessor} A new StreamProcessor instance.
     */
    createPlayerInstance: function (uriToLoad) {
        const playerInst = new StreamProcessor();
        playerInst.initiatePlayback(uriToLoad);
        return playerInst;
    }
});


// Export the StreamProcessor to the global scope (e.g., window in browsers).
globalScope.StreamProcessor = StreamProcessor;

} )( window );