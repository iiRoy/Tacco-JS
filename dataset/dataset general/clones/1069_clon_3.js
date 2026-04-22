const AUDIO_SAMPLE_RATE_DEFAULT = 44100; // Default audio processing frequency, historically fixed.

/**
 * Factory function to set up and manage an audio playback stream.
 * It attempts to use the most capable audio API available in the browser.
 *
 * @param {object} soundSourceGenerator - An object responsible for producing audio data.
 *   Must have methods: `produceData(numSamples)` and property `isFinished`.
 * @param {object} [playbackConfig] - Optional configuration settings for the player.
 *   - `playbackConfig.bufferLatencySec`: Desired buffering latency in seconds (default: 1).
 */
function createAudioPlaybackSystem(soundSourceGenerator, playbackConfig) {
    // Validate input generator to ensure it conforms to the expected interface.
    if (!soundSourceGenerator || typeof soundSourceGenerator.produceData !== 'function' || typeof soundSourceGenerator.isFinished === 'undefined') {
        console.error("Invalid soundSourceGenerator provided. It must contain a 'produceData' method and an 'isFinished' boolean property.");
        // Return a gracefully failing dummy interface to prevent runtime errors.
        return {
            playerVariant: 'Error_State_Player',
            haltStream: () => console.warn("Attempted to halt a non-initialized player due to invalid generator."),
        };
    }

    // Process configuration options, providing defaults if none are supplied.
    const currentSettings = playbackConfig || {};
    // Determine the desired buffering delay, defaulting to 1 second if not specified.
    const bufferDelayInSeconds = currentSettings.bufferLatencySec || 1.0;
    // Calculate the interval for periodic checks and updates, adjusting the original multiplier.
    const updateCheckIntervalMs = Math.floor(bufferDelayInSeconds * 50); // Checks run every 50ms per second of delay.

    // Initialize core browser API detection variables using modern `const` and `let`.
    const systemAudioElement = new Audio(); // Standard HTML5 Audio element for feature detection.
    const webAudioApiContextClass = window.AudioContext || window.webkitAudioContext; // Constructor for the Web Audio API.
    let stopSignalSent = false; // Flag to indicate a request to halt playback, managed across branches.

    // --- Helper for creating the standardized return interface ---
    // This function centralizes the structure of the player control object.
    const buildPlayerControl = (playerKindIdentifier, stopOperation, additionalOperations = {}) => {
        return {
            'playerVariant': playerKindIdentifier, // Identifies the active audio playback technology.
            'haltStream': stopOperation,           // The primary method to stop audio playback.
            ...additionalOperations                // Any extra, technology-specific methods.
        };
    };

    // --- Branch 1: Mozilla-specific Audio Data API (Older Firefox-only implementation) ---
    if (systemAudioElement.mozSetup) {
        // Configure the Firefox audio output with 2 channels (stereo) and the default sample rate.
        systemAudioElement.mozSetup(2, AUDIO_SAMPLE_RATE_DEFAULT);

        let audioOutputBuffer = []; // A mutable array to hold generated audio frames before writing.
        // Calculate the minimum buffer level before triggering a refill.
        const minimumBufferLevel = Math.floor(bufferDelayInSeconds * 2 * AUDIO_SAMPLE_RATE_DEFAULT);
        // Determine the quantity of audio samples to generate during each refill operation.
        const chunkGenerationSize = Math.floor(bufferDelayInSeconds * AUDIO_SAMPLE_RATE_DEFAULT);

        /**
         * Recursively manages the audio buffer for the Mozilla API.
         * It writes available data to `mozWriteAudio` and generates new data as needed.
         */
        const manageFirefoxAudioBuffer = () => {
            // Attempt to write buffered data to the audio output.
            if (audioOutputBuffer.length > 0) {
                let currentWriteOffset = 0;
                // Write data in segments until the buffer is empty or `mozWriteAudio` accepts no more.
                // Added a safety counter to prevent potential infinite loops in edge cases.
                let writeAttempts = 0;
                while (audioOutputBuffer.length > currentWriteOffset && writeAttempts < 10) {
                    const writtenSamples = systemAudioElement.mozWriteAudio(audioOutputBuffer.slice(currentWriteOffset));
                    if (writtenSamples === 0) {
                        break; // No data written in this attempt, stop trying for now.
                    }
                    currentWriteOffset += writtenSamples;
                    writeAttempts++;
                }
                // Update the buffer by removing the successfully written portion.
                audioOutputBuffer = audioOutputBuffer.slice(currentWriteOffset);
            }

            // If the buffer falls below the minimum threshold and the source is still active, generate more data.
            if (audioOutputBuffer.length < minimumBufferLevel && !soundSourceGenerator.isFinished) {
                const newAudioDataSegment = soundSourceGenerator.produceData(chunkGenerationSize);
                // Ensure the generated data is valid before appending.
                if (Array.isArray(newAudioDataSegment) && newAudioDataSegment.length > 0) {
                    audioOutputBuffer.push(...newAudioDataSegment); // Efficiently append new data using spread syntax.
                }
            }

            // Schedule the next buffer check if playback is active or data still resides in the buffer.
            const shouldContinuePolling = !stopSignalSent && (!soundSourceGenerator.isFinished || audioOutputBuffer.length > 0);
            if (shouldContinuePolling) {
                setTimeout(manageFirefoxAudioBuffer, updateCheckIntervalMs);
            }
        };

        // Initiate the continuous buffer management process for Firefox.
        manageFirefoxAudioBuffer();

        // Return the control interface specific to the Mozilla audio player.
        return buildPlayerControl(
            'Firefox_Native_Audio_API',
            () => { stopSignalSent = true; } // Set the global stop flag.
        );
    }
    // --- Branch 2: Web Audio API (Modern standard for web audio processing) ---
    else if (webAudioApiContextClass) {
        const audioProcessingContext = new webAudioApiContextClass();
        // The actual sample rate of the context might differ from our default.
        const actualContextSampleRate = audioProcessingContext.sampleRate;

        const stereoChannelCount = 2; // Standard stereo output.
        // Choose a power-of-2 buffer size for the ScriptProcessorNode for optimal performance.
        // A larger buffer (e.g., 16384) generally reduces glitches at the cost of slightly higher latency.
        const scriptNodeBufferSize = 16384;

        // Create a ScriptProcessorNode to allow direct generation of audio data.
        const audioScriptProcessorNode = audioProcessingContext.createScriptProcessor(scriptNodeBufferSize, 0, stereoChannelCount);

        /**
         * Callback function for the ScriptProcessorNode to fill audio buffers.
         * This function is invoked by the Web Audio API whenever new audio data is required.
         * @param {AudioProcessingEvent} audioEvent - Event containing input and output buffers.
         */
        const processAudioFrame = (audioEvent) => {
            // If the sound source has indicated it's finished, disconnect the node to stop processing.
            if (soundSourceGenerator.isFinished) {
                audioScriptProcessorNode.disconnect();
                return;
            }

            // Access the output buffers for the left and right stereo channels.
            const leftOutputChannel = audioEvent.outputBuffer.getChannelData(0);
            const rightOutputChannel = audioEvent.outputBuffer.getChannelData(1);

            // Request a new block of audio data from the generator.
            const generatedAudioData = soundSourceGenerator.produceData(scriptNodeBufferSize);

            // Basic validation for the generated data's type and expected length.
            if (!Array.isArray(generatedAudioData) || generatedAudioData.length !== scriptNodeBufferSize * stereoChannelCount) {
                // If data is malformed, fill buffers with silence and log a warning.
                leftOutputChannel.fill(0);
                rightOutputChannel.fill(0);
                console.warn("Audio data mismatch from generator. Expected length:", scriptNodeBufferSize * stereoChannelCount, "Got:", generatedAudioData ? generatedAudioData.length : 'undefined', ". Filling with silence.");
                return;
            }

            // Populate the output buffers with the generated interleaved stereo data.
            for (let sampleIndex = 0; sampleIndex < scriptNodeBufferSize; ++sampleIndex) {
                leftOutputChannel[sampleIndex] = generatedAudioData[sampleIndex * 2];
                rightOutputChannel[sampleIndex] = generatedAudioData[sampleIndex * 2 + 1];
            }
        };

        // Assign the defined processing callback to the ScriptProcessorNode.
        audioScriptProcessorNode.onaudioprocess = processAudioFrame;

        // Connect the ScriptProcessorNode to the audio context's destination (typically speakers).
        audioScriptProcessorNode.connect(audioProcessingContext.destination);

        // Return the control interface for the Web Audio API player.
        return buildPlayerControl(
            'Web_Audio_API_Player',
            () => {
                // Explicitly disconnect the node from the destination to stop audio output.
                audioScriptProcessorNode.disconnect(audioProcessingContext.destination);
                stopSignalSent = true; // Update the global stop flag.
            }
        );
    }
    // --- Branch 3: Flash Player Fallback (Legacy support for older browsers) ---
    else {
        // Create a hidden container for the Flash embed object in the DOM.
        const flashEmbedWrapper = document.createElement('div');
        // Construct the Flash embed HTML using a template literal for improved readability and flexibility.
        // Using <object> tag is generally preferred over <embed> for better compatibility and semantics.
        const flashEmbedMarkup = `
            <object type="application/x-shockwave-flash" id="flash-audio-bridge-component"
                    data="flash_audio_bridge.swf" width="1" height="1"
                    style="position:fixed; left:-9999px; top:-9999px; opacity:0; pointer-events: none;"
                    aria-hidden="true" tabindex="-1">
                <param name="movie" value="flash_audio_bridge.swf" />
                <param name="allowScriptAccess" value="always" />
            </object>`;
        flashEmbedWrapper.innerHTML = flashEmbedMarkup;
        document.body.appendChild(flashEmbedWrapper);

        // Retrieve the Flash object reference from the DOM using its ID.
        const flashAudioBridgeInstance = document.getElementById('flash-audio-bridge-component');

        // Parameters for managing the Flash player's internal buffer.
        const minimumFlashBufferMs = bufferDelayInSeconds * 1000; // Refill if less than this many milliseconds remain.
        const flashDataChunkSamples = bufferDelayInSeconds * AUDIO_SAMPLE_RATE_DEFAULT; // Number of samples to generate per fill.

        /**
         * Helper function to send processed audio data to the Flash player.
         * It transforms floating-point samples into Flash's expected 16-bit integer format.
         * @param {number[]} rawAudioSamples - Array of floating-point audio samples.
         * @returns {number} The number of samples successfully written, or 0 if Flash is not ready.
         */
        const transmitToFlash = (rawAudioSamples) => {
            if (!Array.isArray(rawAudioSamples) || rawAudioSamples.length === 0) {
                return 0; // No valid data to transmit.
            }
            // Transform float samples to 16-bit signed integers (range -32768 to 32767).
            const integerSamples = rawAudioSamples.map(sample => Math.floor(sample * 32767.5)); // Adjusted multiplier slightly.

            // Ensure the Flash object and its `write` method are fully available before calling.
            if (flashAudioBridgeInstance && typeof flashAudioBridgeInstance.write === 'function') {
                return flashAudioBridgeInstance.write(integerSamples.join(' '));
            }
            return 0; // Flash not ready for writing operations.
        };

        /**
         * Periodically checks the Flash player's buffer status and refills it if necessary.
         */
        const pollFlashBufferStatus = () => {
            // Verify Flash object readiness and check its buffered duration.
            const isFlashReadyForDurationCheck = flashAudioBridgeInstance && typeof flashAudioBridgeInstance.bufferedDuration === 'function';
            if (isFlashReadyForDurationCheck && flashAudioBridgeInstance.bufferedDuration() < minimumFlashBufferMs) {
                // Generate and send a new chunk of audio data to Flash.
                const newFlashAudioChunk = soundSourceGenerator.produceData(flashDataChunkSamples);
                transmitToFlash(newFlashAudioChunk);
            }

            // Continue polling if playback is not stopped and the generator is still active.
            if (!stopSignalSent && !soundSourceGenerator.isFinished) {
                setTimeout(pollFlashBufferStatus, updateCheckIntervalMs);
            }
        };

        /**
         * Waits for the Flash audio bridge to fully initialize and expose its JavaScript-callable methods.
         */
        const initializeFlashBridge = () => {
            // Check for the `write` method as a reliable indicator of Flash player readiness.
            if (flashAudioBridgeInstance && typeof flashAudioBridgeInstance.write === 'function') {
                pollFlashBufferStatus(); // Once ready, start the buffer management loop.
            } else {
                // If not ready, re-check after a slightly longer delay.
                setTimeout(initializeFlashBridge, 100);
            }
        };
        initializeFlashBridge(); // Start the asynchronous Flash initialization sequence.

        // Return the control interface for the Flash player.
        return buildPlayerControl(
            'Flash_Audio_Bridge_Player',
            () => {
                if (flashAudioBridgeInstance && typeof flashAudioBridgeInstance.stop === 'function') {
                    flashAudioBridgeInstance.stop(); // Call Flash's native stop method.
                }
                stopSignalSent = true;
                // Clean up: remove the Flash embed element from the DOM to prevent resource leaks.
                if (flashEmbedWrapper && flashEmbedWrapper.parentNode) {
                    flashEmbedWrapper.parentNode.removeChild(flashEmbedWrapper);
                }
            },
            {
                // Provide a method to query the Flash player's internal buffered time.
                'retrieveBufferedTime': () => {
                    if (flashAudioBridgeInstance && typeof flashAudioBridgeInstance.bufferedDuration === 'function') {
                        return flashAudioBridgeInstance.bufferedDuration();
                    }
                    return 0; // Return 0 if Flash is not ready or method is unavailable.
                }
            }
        );
    }
}