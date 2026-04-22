// This module encapsulates functionality for capturing audio from the user's microphone
// and transmitting it as binary data over a WebSocket connection.
(function(runtimeEnv) {
  'use strict'; // Enforce strict JavaScript parsing and error handling for better code quality.

  // Define the WebSocket server endpoint for binary data transmission.
  const BINARY_WEBSOCKET_ENDPOINT = 'ws://localhost:9001';
  // A boolean flag to track the operational status of the WebSocket connection.
  let isChannelOpen = false;

  // Declare a variable for the BinaryClient instance. Using 'let' allows potential re-initialization.
  let binaryDataTransmitter;
  try {
    // Attempt to establish a connection to the binary WebSocket server.
    binaryDataTransmitter = new BinaryClient(BINARY_WEBSOCKET_ENDPOINT);
  } catch (initializationError) {
    // Log an error if the BinaryClient constructor fails, e.g., if the library is not loaded.
    console.error('Fatal: Could not initialize BinaryClient. Is the library loaded?', initializationError);
    // Prevent further execution if the core component is missing.
    runtimeEnv.alert('Critical error: Audio transmission library not available.');
    return;
  }

  // Set up an event listener for when the WebSocket connection successfully opens.
  binaryDataTransmitter.on('open', function() {
    isChannelOpen = true; // Update connection status.
    console.info(`Binary transmission channel established with ${BINARY_WEBSOCKET_ENDPOINT}.`);

    // Create a new output stream for sending audio data and expose it globally.
    runtimeEnv.audioOutputDataStream = binaryDataTransmitter.createStream();

    // Identify the appropriate API for accessing user media (microphone).
    // This includes common browser prefixes for broader compatibility.
    const userMediaAccessAPI = runtimeEnv.navigator.getUserMedia ||
                               runtimeEnv.navigator.webkitGetUserMedia ||
                               runtimeEnv.navigator.mozGetUserMedia ||
                               runtimeEnv.navigator.msGetUserMedia;

    if (userMediaAccessAPI) {
      // Request access to the user's audio input device.
      // Providing specific audio constraints can improve quality or reduce issues.
      userMediaAccessAPI.call(runtimeEnv.navigator, {
        audio: {
          echoCancellation: true,    // Attempt to reduce echo.
          noiseSuppression: true,    // Attempt to reduce background noise.
          autoGainControl: true      // Automatically adjust microphone volume.
        }
      }, onMediaStreamReady, function(accessError) {
        // Handle cases where microphone access is denied or fails for other reasons.
        const userFriendlyMessage = 'Failed to acquire audio input: ' + accessError.name + '. Please grant microphone permissions.';
        console.error(userFriendlyMessage, accessError);
        runtimeEnv.alert(userFriendlyMessage); // Inform the user via an alert.
      });
    } else {
      // Alert the user if their browser lacks the necessary media access API.
      console.warn('The getUserMedia API is not supported in this browser. Audio capture functionality is unavailable.');
      runtimeEnv.alert('Your browser does not support microphone input. Please consider upgrading or using a different browser.');
      // Optionally, disable any UI elements related to audio capture here.
    }

    // Internal flag to control the active state of audio recording.
    let isAudioCaptureActive = false;
    // A simple counter to track the number of audio frames processed and sent.
    let processedFrameCounter = 0;

    /**
     * Initiates the audio capture process.
     * This function is exposed globally for external control.
     */
    runtimeEnv.startAudioRecording = function() {
      // Pre-checks to ensure recording can begin.
      if (!isChannelOpen) {
        console.warn('Cannot commence audio recording: WebSocket channel is not active.');
        return;
      }
      if (isAudioCaptureActive) {
        console.log('Audio recording is already in progress. No action taken.');
        return;
      }

      isAudioCaptureActive = true; // Set the recording state to active.
      processedFrameCounter = 0;   // Reset frame counter for a new recording session.
      console.log('Audio recording has been successfully initiated.');
    };

    /**
     * Halts the ongoing audio capture process and signals the end of the data stream.
     * This function is exposed globally.
     */
    runtimeEnv.stopAudioRecording = function() {
      // Ensure there's an active recording to stop.
      if (!isAudioCaptureActive) {
        console.log('No active audio recording to terminate.');
        return;
      }

      isAudioCaptureActive = false; // Set the recording state to inactive.
      if (runtimeEnv.audioOutputDataStream) {
        // Introduce a small delay to allow any pending audio data to be written
        // before the stream is officially ended, preventing data loss.
        setTimeout(() => {
          runtimeEnv.audioOutputDataStream.end();
          console.log(`Audio recording concluded. Total frames transmitted: ${processedFrameCounter}.`);
          // Optionally, nullify the stream reference if it's no longer valid after ending.
          // runtimeEnv.audioOutputDataStream = null;
        }, 50); // 50ms delay
      }
    };

    /**
     * Callback function invoked when the browser successfully provides a media stream
     * (e.g., from the microphone). This sets up the audio processing pipeline.
     * @param {MediaStream} mediaStream - The acquired audio MediaStream object.
     */
    function onMediaStreamReady(mediaStream) {
      // Select the correct AudioContext constructor based on browser support.
      const SupportedAudioContext = runtimeEnv.AudioContext || runtimeEnv.webkitAudioContext;
      if (!SupportedAudioContext) {
        console.error('Web Audio API is not available in this browser. Cannot process audio.');
        runtimeEnv.alert('Your browser does not support advanced audio processing.');
        return;
      }

      // Create an instance of the AudioContext to manage audio nodes.
      const audioProcessingGraph = new SupportedAudioContext();

      // Create a MediaStreamSource node from the captured audio stream.
      const streamInputNode = audioProcessingGraph.createMediaStreamSource(mediaStream);

      // Define the buffer size for the ScriptProcessorNode.
      // Note: ScriptProcessorNode is deprecated. For new projects, consider AudioWorklet.
      const audioBufferFrameSize = 4096; // A power of 2, e.g., 2048, 4096, 8192.
      // Create a ScriptProcessorNode to access and process raw audio samples.
      // It takes 1 input channel and produces 1 output channel.
      const audioDataProcessorNode = audioProcessingGraph.createScriptProcessor(audioBufferFrameSize, 1, 1);

      // Assign an event handler for when the processor node has new audio data.
      audioDataProcessorNode.onaudioprocess = function(processingEvent) {
        // Only process and send audio if recording is actively enabled.
        if (!isAudioCaptureActive) {
          return;
        }

        // Ensure the output stream is ready before attempting to write.
        if (!runtimeEnv.audioOutputDataStream) {
          console.warn('Audio output stream is not initialized. Cannot write data.');
          // Optionally, stop recording if stream is unexpectedly missing.
          runtimeEnv.stopAudioRecording();
          return;
        }

        // Extract the audio data from the first (left) channel of the input buffer.
        const monoChannelData = processingEvent.inputBuffer.getChannelData(0);
        processedFrameCounter++; // Increment the frame counter.

        try {
          // Convert the Float32Array audio data to 16-bit PCM (Int16Array) and write to the stream.
          runtimeEnv.audioOutputDataStream.write(transformFloat32ToPCM16(monoChannelData));
          // console.debug(`Successfully processed and transmitted audio frame #${processedFrameCounter}.`);
        } catch (streamWriteError) {
          console.error('Error encountered while writing audio data to the stream:', streamWriteError);
          // If a write error occurs, it's safer to stop the recording.
          runtimeEnv.stopAudioRecording();
        }
      };

      // Connect the audio nodes to form the processing graph:
      // MediaStreamSource -> ScriptProcessorNode -> AudioContext's destination (for monitoring/playback).
      streamInputNode.connect(audioDataProcessorNode);
      audioDataProcessorNode.connect(audioProcessingGraph.destination); // Connect to speakers for monitoring.

      console.log('Audio processing pipeline successfully configured.');
    }

    /**
     * Converts an audio buffer from Float32Array format (normalized, -1.0 to 1.0)
     * to a 16-bit signed integer PCM (Pulse-Code Modulation) format (Int16Array, -32768 to 32767).
     * @param {Float32Array} floatBuffer - The input audio buffer containing Float32 samples.
     * @returns {ArrayBuffer} An ArrayBuffer containing the converted 16-bit PCM audio data.
     */
    function transformFloat32ToPCM16(floatBuffer) {
      // Validate the input to ensure it's a Float32Array.
      if (!(floatBuffer instanceof Float32Array)) {
        console.error('Type mismatch: Expected a Float32Array for audio conversion, received:', floatBuffer);
        return new ArrayBuffer(0); // Return an empty buffer or throw an error to signal failure.
      }

      const numberOfSamples = floatBuffer.length;
      // The maximum value for a signed 16-bit integer.
      const pcm16BitMax = 32767;
      // Create a new Int16Array to store the converted samples.
      const pcm16Buffer = new Int16Array(numberOfSamples);

      // Iterate through each sample in the float buffer.
      for (let i = 0; i < numberOfSamples; i++) {
        // Clamp the float sample to the valid range of -1.0 to 1.0
        // to prevent overflow when scaling to Int16.
        let sampleValue = Math.max(-1, Math.min(1, floatBuffer[i]));
        // Scale the float sample to the 16-bit integer range and round to the nearest integer.
        pcm16Buffer[i] = Math.round(sampleValue * pcm16BitMax);
      }

      // Return the underlying ArrayBuffer, which is suitable for binary transmission.
      return pcm16Buffer.buffer;
    }
  });

  // Attach an error handler for the BinaryClient connection.
  binaryDataTransmitter.on('error', function(errorDetails) {
    isChannelOpen = false; // Mark the connection as inactive on error.
    console.error('BinaryClient experienced a connection error:', errorDetails);
    // Potentially trigger a reconnect attempt or inform the user about the disruption.
  });

  // Attach a close handler for the BinaryClient connection.
  binaryDataTransmitter.on('close', function() {
    isChannelOpen = false; // Mark the connection as inactive when closed.
    console.warn('BinaryClient connection has been closed gracefully.');
    // Perform any necessary cleanup or state resets here.
  });

})(window); // Pass the global 'window' object as the runtime environment.