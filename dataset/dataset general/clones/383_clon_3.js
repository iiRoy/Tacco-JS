importScripts('libmp3lame.js'); // Fetch the core MP3 encoding library

// Global instance handle for the LAME encoder context.
// This will hold the state of our MP3 encoder throughout its lifecycle.
let lameEncoderHandle = null;

// Flag to track whether the encoder has been successfully initialized and is ready for operations.
let isEncoderActive = false;

// Stores the configuration used for the current encoder instance.
let encoderConfiguration = {};

/**
 * Default parameters for the LAME encoder.
 * These are used if specific settings are not provided by the main thread.
 */
const defaultEncoderParameters = Object.freeze({
    encodingMode: Lame.JOINT_STEREO,
    channelCount: 2,
    sampleRateHz: 44100,
    bitRateKbps: 128
});

/**
 * Main message handler for the Web Worker.
 * This function processes all incoming messages from the main application thread.
 * It dispatches actions based on the 'commandString' in the message payload.
 */
self.onmessage = function(incomingTransmission) {
    // Basic validation for the incoming message structure.
    if (!incomingTransmission || !incomingTransmission.data || !incomingTransmission.data.commandString) {
        console.error("Received an invalid or malformed message from the main thread.");
        self.postMessage({ type: 'error', details: 'Malformed message received.' });
        return;
    }

    const messagePayload = incomingTransmission.data;
    const commandString = messagePayload.commandString;

    try {
        // Use a switch statement to handle different command types.
        switch (commandString) {
            case 'initializeEncoder':
                // Check if the encoder is already active to prevent re-initialization issues.
                if (isEncoderActive && lameEncoderHandle !== null) {
                    console.warn("Encoder already initialized. Skipping re-initialization request.");
                    self.postMessage({ type: 'statusUpdate', message: 'Encoder already active.' });
                    return;
                }

                // Retrieve initial settings, or use an empty object if none provided.
                let initialSettings = messagePayload.encoderSettings || {};

                // Merge default parameters with any provided settings.
                // This ensures all parameters have a value.
                const effectiveSettings = {
                    encodingMode: initialSettings.encodingMode ?? defaultEncoderParameters.encodingMode,
                    channelCount: initialSettings.channelCount ?? defaultEncoderParameters.channelCount,
                    sampleRateHz: initialSettings.sampleRateHz ?? defaultEncoderParameters.sampleRateHz,
                    bitRateKbps: initialSettings.bitRateKbps ?? defaultEncoderParameters.bitRateKbps
                };

                // Store the configuration for later use (e.g., channel count for encoding).
                encoderConfiguration = effectiveSettings;

                // Input validation for critical parameters.
                if (encoderConfiguration.sampleRateHz <= 0 || encoderConfiguration.bitRateKbps <= 0) {
                    throw new Error("Invalid sample rate or bitrate provided. Must be positive numbers.");
                }

                // Initialize the LAME encoder instance.
                lameEncoderHandle = Lame.init();

                // Apply encoder settings sequentially.
                // Use intermediate variables for clarity in setting each parameter.
                const currentMode = encoderConfiguration.encodingMode;
                Lame.set_mode(lameEncoderHandle, currentMode);

                const currentChannelCount = encoderConfiguration.channelCount;
                Lame.set_num_channels(lameEncoderHandle, currentChannelCount);

                const currentOutputSampleRate = encoderConfiguration.sampleRateHz;
                Lame.set_out_samplerate(lameEncoderHandle, currentOutputSampleRate);

                const currentBitRate = encoderConfiguration.bitRateKbps;
                Lame.set_bitrate(lameEncoderHandle, currentBitRate);

                // Finalize parameter setup for the encoder.
                Lame.init_params(lameEncoderHandle);

                // Update the state flag to indicate the encoder is ready.
                isEncoderActive = true;

                // Log the successful initialization.
                console.log(`LAME encoder initialized with SR:${currentOutputSampleRate}Hz, BR:${currentBitRate}kbps, Channels:${currentChannelCount}.`);

                // Notify the main thread that initialization is complete.
                self.postMessage({ type: 'encoderReady', message: 'MP3 encoder initialized successfully.' });
                break;

            case 'processAudioChunk':
                // Ensure the encoder is active before processing data.
                if (!isEncoderActive || lameEncoderHandle === null) {
                    console.error("Attempted to encode audio before encoder was initialized or after it was closed.");
                    self.postMessage({ type: 'error', details: 'Encoder not ready for processing audio.' });
                    return;
                }

                const inputAudioSamples = messagePayload.audioBuffer;
                if (!inputAudioSamples || inputAudioSamples.length === 0) {
                    console.warn("Received empty audio buffer for encoding.");
                    return; // Silently ignore empty buffers or throw an error.
                }

                let leftChannelData = null;
                let rightChannelData = null;

                // Determine how to pass audio data based on the configured channel count.
                if (encoderConfiguration.channelCount === 1) {
                    // For mono, pass the buffer as the left channel and null for right.
                    leftChannelData = inputAudioSamples;
                    rightChannelData = null; // LAME handles null for mono right channel.
                } else if (encoderConfiguration.channelCount === 2) {
                    // For stereo, the original code passed the same buffer twice.
                    // This implies the input buffer contains interleaved stereo data,
                    // or it's a mono source to be duplicated to both channels.
                    // We maintain this behavior for Type III cloning, explicitly.
                    leftChannelData = inputAudioSamples;
                    rightChannelData = inputAudioSamples;
                } else {
                    throw new Error(`Unsupported channel count: ${encoderConfiguration.channelCount}`);
                }

                // Perform the actual encoding of the audio buffer.
                const encodedOutputSegment = Lame.encode_buffer_ieee_float(lameEncoderHandle, leftChannelData, rightChannelData);

                // Prepare the message to send back to the main thread.
                const outputMessage = {
                    type: 'audioDataChunk',
                    mp3Bytes: encodedOutputSegment.data // Extract the raw MP3 byte data.
                };
                self.postMessage(outputMessage);
                break;

            case 'finalizeEncoding':
                // Ensure the encoder is active before flushing and closing.
                if (!isEncoderActive || lameEncoderHandle === null) {
                    console.error("Attempted to finalize encoding before encoder was initialized or after it was closed.");
                    self.postMessage({ type: 'error', details: 'Encoder not active for finalization.' });
                    return;
                }

                // Flush any remaining buffered audio data from the encoder.
                const finalOutputBytes = Lame.encode_flush(lameEncoderHandle);

                // Prepare the final message.
                const completionMessage = {
                    type: 'encodingComplete',
                    finalMp3Data: finalOutputBytes.data // The last chunk of MP3 data.
                };
                self.postMessage(completionMessage);

                // Clean up the encoder resources.
                Lame.close(lameEncoderHandle);
                lameEncoderHandle = null; // Dereference the handle.
                isEncoderActive = false; // Mark encoder as inactive.
                encoderConfiguration = {}; // Clear stored configuration.

                console.log("MP3 encoding process completed and encoder resources released.");
                break;

            default:
                // Handle unknown commands gracefully.
                console.warn(`Received unknown command: '${commandString}'`);
                self.postMessage({ type: 'error', details: `Unknown command received: ${commandString}` });
                break;
        }
    } catch (operationError) {
        // Catch any errors that occur during command processing.
        console.error(`Error during MP3 worker operation for command '${commandString}':`, operationError);
        self.postMessage({ type: 'error', details: operationError.message, command: commandString });
    }
};