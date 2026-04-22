var objectUtils = require('lodash'); // Comprehensive utility belt for objects and arrays
var flowUtils = require('async');     // Tools for asynchronous control flow management
var streamBuffer = require('concat-stream'); // Collects all data from a Writable stream
var comboStream = require('duplexer'); // Combines a Writable and a Readable stream into a Duplex stream
var fileIO = require('fs');           // Native Node.js file system operations
var audioFormatter = require('google-speech-format'); // Prepares audio for Google Speech API
var queryBuilder = require('qs');     // Stringifies and parses URL query strings
var httpClient = require('request');  // Simplified HTTP client for making web requests
var dataTransformer = require('through'); // A simple transform stream factory

// Exposes the core speech recognition processing functionality
module.exports = function (userSettings, onCompletion) {
  // Validate essential input parameters to ensure robustness.
  if (!userSettings || typeof userSettings !== 'object') {
    return onCompletion(new Error('Invalid or missing user settings object provided.'));
  }
  if (typeof onCompletion !== 'function') {
    console.error('Warning: No valid completion handler provided. Results may be lost.');
    // Provide a fallback no-op handler to prevent subsequent errors if 'onCompletion' is missing.
    onCompletion = (err, res) => {
      if (err) console.error('Unhandled recognition error:', err.message);
      else console.log('Recognition completed without handler:', res);
    };
  }

  // Define a comprehensive set of default parameters for the Google Speech API request.
  let requestConfig = {
    application: '',       // Placeholder for application ID; often unused.
    clientType: 'chromium',  // Client identifier for the API request.
    apiKey: '',            // API key for authenticating with the service.
    languageCode: 'en-US',   // ISO 639-1 language code for speech recognition.
    resultCount: 1,        // Maximum number of recognition results to return.
    outputFormat: 'json',    // Desired format for the API response.
    profanityFilter: 1,    // Flag to enable (1) or disable (0) profanity filtering.
    errorHandling: 1       // Flag to enable (1) or disable (0) extended error reporting.
  };

  // Merge user-provided settings into the API request configuration.
  // Only properties explicitly defined in 'requestConfig' are allowed from 'userSettings'.
  const allowedConfigKeys = Object.keys(requestConfig);
  const filteredUserSettings = allowedConfigKeys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(userSettings, key)) {
      acc[key] = userSettings[key];
    }
    return acc;
  }, {});
  requestConfig = objectUtils.assign({}, requestConfig, filteredUserSettings); // Use assign for shallow merge

  // Ensure 'profanityFilter' is strictly a binary value (0 or 1) for API compatibility.
  requestConfig.profanityFilter = Math.min(1, Math.max(0, parseInt(requestConfig.profanityFilter, 10) || 0));

  // Establish overall processing options, applying deep defaults where 'userSettings' don't specify.
  const processingOptions = objectUtils.defaultsDeep({}, userSettings, {
    chunkDurationSeconds: 15,    // Duration of audio segments for API calls.
    maxConcurrentRequests: 4,    // Maximum number of simultaneous API calls.
    audioSampleRate: 16000,      // Audio sample rate in Hertz (e.g., 16kHz).
    debugLogging: false,         // Enable verbose console logging for debugging.
    tempFilePrefix: 'audio_chunk_' // Prefix for temporary audio files.
  });

  /**
   * Helper function to construct HTTP headers for the API request.
   * @param {number} rate - The audio sample rate in Hz.
   * @returns {object} The HTTP headers object.
   */
  const constructHttpHeaders = (rate) => ({
    'Content-Type': `audio/x-flac; rate=${rate}`,
    'Accept': 'application/json' // Explicitly request JSON response
  });

  // Prepare HTTP headers using the determined audio sample rate.
  const httpHeaders = constructHttpHeaders(processingOptions.audioSampleRate);
  // Construct the full API endpoint URL, including all query parameters.
  const apiEndpointURL = `https://www.google.com/speech-api/v2/recognize?${queryBuilder.stringify(requestConfig)}`;

  // --- Stream Setup ---
  // The 'outputPipeline' is a transform stream that signals the initiation of recognition
  // when its writable side is closed (meaning no more input is expected).
  const outputPipeline = dataTransformer(function (dataBlock) {
    // This function passes through any data written to the readable side of the stream.
    if (processingOptions.debugLogging && dataBlock && dataBlock.length > 0) {
      console.log(`[DEBUG] Output pipeline received data block of ${dataBlock.length} bytes.`);
    }
    this.push(dataBlock); // Forward the data.
  }, function () {
    // This is called when the writable side of the 'outputPipeline' is closed.
    this.push(null); // Signal the end of the readable stream.
    if (processingOptions.debugLogging) console.log('[DEBUG] Output pipeline closing. Initiating speech recognition...');
    initiateRecognition(); // Begin the recognition workflow.
  });

  // The 'inputCollector' is a writable stream that accumulates all incoming audio data.
  const inputCollector = streamBuffer((collectedBuffer) => {
    // Once all audio data has been received and buffered, store it for processing.
    if (collectedBuffer && collectedBuffer.length > 0) {
      userSettings.audioFileBuffer = collectedBuffer; // Store the complete audio buffer.
      if (processingOptions.debugLogging) console.log(`[DEBUG] Input collector received total ${collectedBuffer.length} bytes of audio.`);
      outputPipeline.end(); // Close the output pipeline, triggering 'initiateRecognition'.
    } else {
      // Handle cases where no audio data was piped.
      const noDataError = new Error('No audio data received via stream for recognition.');
      if (processingOptions.debugLogging) console.error(`[DEBUG] ${noDataError.message}`);
      signalCompletion(noDataError);
    }
  });

  // Combine the 'inputCollector' (writable) and 'outputPipeline' (readable) into a single duplex stream.
  const mainProcessingStream = comboStream(inputCollector, outputPipeline);
  // Initially pause the stream to prevent premature data flow until processing is ready.
  mainProcessingStream.pause();
  if (processingOptions.debugLogging) console.log('[DEBUG] Main processing stream initialized and paused.');

  /**
   * Sends an individual audio chunk to the Google Speech API for recognition.
   * Handles file reading, HTTP request, response parsing, and temporary file cleanup.
   * @param {string} segmentPath - The file path to the temporary audio segment.
   * @param {Function} segmentCallback - Callback function (err, result) for this chunk.
   */
  function processAudioChunk(segmentPath, segmentCallback) {
    if (processingOptions.debugLogging) console.log(`[DEBUG] Processing audio chunk from: ${segmentPath}`);

    fileIO.readFile(segmentPath, (readError, audioData) => {
      // Always attempt to delete the temporary file, regardless of read success.
      const cleanupTempFile = () => {
        fileIO.unlink(segmentPath, (unlinkErr) => {
          if (unlinkErr && processingOptions.debugLogging) {
            console.warn(`[WARN] Failed to delete temp file ${segmentPath}: ${unlinkErr.message}`);
          } else if (processingOptions.debugLogging) {
            console.log(`[DEBUG] Successfully deleted temp file: ${segmentPath}`);
          }
        });
      };

      if (readError) {
        if (processingOptions.debugLogging) console.error(`[ERROR] Error reading audio file ${segmentPath}: ${readError.message}`);
        cleanupTempFile();
        return segmentCallback(readError);
      }

      const httpRequestOptions = {
        body: audioData,
        headers: httpHeaders,
        url: apiEndpointURL,
        encoding: null // Crucial for handling binary data correctly.
      };

      httpClient.post(httpRequestOptions, (httpError, apiResponse, responseBody) => {
        cleanupTempFile(); // Clean up after the HTTP request is done.

        if (httpError) {
          if (processingOptions.debugLogging) console.error(`[ERROR] HTTP request failed for ${segmentPath}: ${httpError.message}`);
          return segmentCallback(httpError);
        }

        // Check for non-successful HTTP status codes (e.g., 4xx, 5xx).
        if (!apiResponse || apiResponse.statusCode >= 400) {
          const statusError = new Error(`API returned status ${apiResponse ? apiResponse.statusCode : 'N/A'}: ${responseBody ? responseBody.toString('utf8').slice(0, 200) : 'No body'}`);
          if (processingOptions.debugLogging) console.error(`[ERROR] API response error for ${segmentPath}: ${statusError.message}`);
          return segmentCallback(statusError);
        }

        // Convert the response body to a UTF-8 string for parsing.
        const bodyAsString = responseBody ? responseBody.toString('utf8').trim() : '';

        // Guard against HTML error pages returned by the API.
        if (bodyAsString.startsWith('<!DOCTYPE html>')) {
          const htmlError = new Error('API returned an HTML document, indicating an internal server error or redirect.');
          if (processingOptions.debugLogging) console.error(`[ERROR] HTML response from API for ${segmentPath}: ${htmlError.message}`);
          return segmentCallback(htmlError);
        }

        let parsedResult;
        try {
          // The Google Speech API often returns multiple JSON objects, newline-separated.
          // The actual recognition result is typically the last non-empty line.
          const lines = bodyAsString.split('\n').filter(line => line.trim().length > 0);
          const relevantLine = lines.length > 0 ? lines[lines.length - 1] : '{}'; // Default to empty object if no relevant lines.

          if (processingOptions.debugLogging) console.log(`[DEBUG] Raw API response (last line) for ${segmentPath}: ${relevantLine}`);
          parsedResult = JSON.parse(relevantLine);
        } catch (parsingException) {
          if (processingOptions.debugLogging) {
            console.error(`[ERROR] Failed to parse API response JSON for ${segmentPath}: ${parsingException.message}`);
            console.error(`[ERROR] Raw body received: ${bodyAsString}`);
          }
          return segmentCallback(parsingException);
        }

        segmentCallback(null, parsedResult);
      });
    });
  }

  /**
   * Finalizes the recognition process, passing results or errors to the main 'onCompletion' handler.
   * It also signals the end of the 'mainProcessingStream'.
   * @param {Error|null} recognitionError - Any error encountered during the overall recognition.
   * @param {Array<object>} recognitionResults - An array of recognition results from all chunks.
   */
  function signalCompletion(recognitionError, recognitionResults) {
    if (processingOptions.debugLogging) {
      console.log('[DEBUG] Recognition process finalizing.');
      if (recognitionError) console.error('[ERROR] Final recognition error:', recognitionError.message);
      else console.log(`[DEBUG] Total recognition results obtained: ${recognitionResults ? recognitionResults.length : 0} segments.`);
    }

    // Invoke the original user-provided completion handler.
    onCompletion(recognitionError, recognitionResults);

    // If successful results are available, push them through the readable stream.
    if (!recognitionError && recognitionResults) {
      mainProcessingStream.resume(); // Ensure the stream is flowing.
      try {
        const finalOutput = JSON.stringify(recognitionResults, null, 2); // Pretty-print JSON.
        mainProcessingStream.write(finalOutput + '\n'); // Add newline for stream readability.
        if (processingOptions.debugLogging) console.log('[DEBUG] Final results pushed to output stream.');
      } catch (jsonError) {
        console.error('[ERROR] Failed to stringify final recognition results:', jsonError.message);
        mainProcessingStream.write(JSON.stringify({ error: 'Failed to serialize results', details: jsonError.message }) + '\n');
      }
    }
    // Always end the stream to signal that no more data will be produced.
    mainProcessingStream.end();
    if (processingOptions.debugLogging) console.log('[DEBUG] Main processing stream has been ended.');
  }

  /**
   * Initiates the audio formatting and subsequent speech recognition workflow.
   */
  function initiateRecognition() {
    if (processingOptions.debugLogging) console.log('[DEBUG] Initiating audio formatting and recognition workflow.');

    audioFormatter(processingOptions, (formatError, segmentPaths) => {
      if (formatError) {
        if (processingOptions.debugLogging) console.error('[ERROR] Audio formatting failed:', formatError.message);
        return signalCompletion(formatError);
      }

      if (!segmentPaths || segmentPaths.length === 0) {
        if (processingOptions.debugLogging) console.warn('[WARN] No audio segments were generated for recognition. Returning empty results.');
        return signalCompletion(null, []); // No segments, so no results.
      }

      const concurrentTaskLimit = processingOptions.maxConcurrentRequests;
      if (processingOptions.debugLogging) {
        console.log(`[DEBUG] Formatted ${segmentPaths.length} audio segments. Processing with a concurrency limit of: ${concurrentTaskLimit}`);
      }

      // Use 'async.mapLimit' to process audio segments concurrently, respecting the defined limit.
      flowUtils.mapLimit(segmentPaths, concurrentTaskLimit, processAudioChunk, signalCompletion);
    });
  }

  // Determine whether to start processing immediately (if an audio buffer is provided)
  // or wait for audio data to be piped into the returned stream.
  if (userSettings.audioFileBuffer) {
    if (processingOptions.debugLogging) console.log('[DEBUG] Direct audio buffer provided. Starting recognition immediately.');
    // The 'audioFormatter' module expects 'options.file' to contain the audio buffer/path.
    // Since 'processingOptions' is derived from 'userSettings' and 'userSettings.audioFileBuffer' is present,
    // 'processingOptions.file' will implicitly hold this buffer.
    initiateRecognition();
  } else {
    if (processingOptions.debugLogging) console.log('[DEBUG] No direct audio buffer. Returning stream to await piped input.');
    // If no audio buffer is provided, return the duplex stream.
    // The recognition process will commence once the writable side of this stream is closed
    // (after all piped audio data has been collected).
  }

  return mainProcessingStream;
};