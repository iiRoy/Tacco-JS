"use strict";

const currentDirectory = __dirname; // Reference to the current script's directory.

// Import necessary modules for testing, file operations, and path handling.
const caseHandler = require('nodeunit').testCase;
const fileUtil    = require('path');
const diskIO      = require('fs');

let videoProcessorTool; // Global variable to hold the video processing utility.
let MediaStreamObject;  // Global variable to hold the custom media stream class.

/**
 * Observes a given data stream for various events and collects its output.
 * @param {object} dataFlowSource - The stream instance to be monitored.
 * @param {function} completionAction - A callback invoked when the stream terminates.
 */
function observeStreamEvents(dataFlowSource, completionAction) {
  const gatheredOutput = []; // Array to store all data received from the stream.
  const recordedErrors = []; // Array to store all error messages from the stream.

  // Event listener for general messages from the stream.
  dataFlowSource.on('message', (inputDataChunk) => {
    gatheredOutput.push(inputDataChunk);
  });

  // Event listener for any error events emitted by the stream.
  dataFlowSource.on('error', (faultDataChunk) => {
    recordedErrors.push(faultDataChunk);
  });

  // Event listener for the stream's termination, executed only once.
  dataFlowSource.once('exit', (terminationCode, exitSignal) => {
    completionAction(terminationCode, exitSignal, gatheredOutput, recordedErrors);
  });
}

// Configure and export the primary collection of test cases.
module.exports = caseHandler({

  // First test block: focused on application stability and basic operations.
  'Test Suite Alpha: Application Stability Checks': caseHandler({

    // Validate the successful loading of core processing modules.
    'Module acquisition: video processor (require)': function(testContext) {
      testContext.expect(1);

      videoProcessorTool = require('../avconv.js');
      MediaStreamObject  = require('../lib/avstream.js');

      testContext.ok(videoProcessorTool, 'The video processing module is loaded.');
      testContext.done();
    },

    // Execute the processor without any input parameters (null).
    'Execution without parameters (null) Trial 1': function(testContext) {
      testContext.expect(4);

      const processingFlow = videoProcessorTool(null);

      observeStreamEvents(processingFlow, (terminationCode, exitSignal, gatheredOutput, recordedErrors) => {
        testContext.strictEqual(terminationCode, 1, 'Processor reported no action.');
        testContext.notEqual(gatheredOutput.length, 0, 'Output buffer is not empty.');
        testContext.strictEqual(recordedErrors.length, 0, 'Error buffer remains clear.');
        testContext.strictEqual(exitSignal, null, 'No termination signal was sent.');

        testContext.done();
      });
    },

    // Execute the processor with an empty array as parameters.
    'Execution with empty array ([])': function(testContext) {
      testContext.expect(3);

      const processingFlow = videoProcessorTool([]);

      observeStreamEvents(processingFlow, (terminationCode, exitSignal, gatheredOutput, recordedErrors) => {
        testContext.strictEqual(terminationCode, 1, 'Processor indicated no operation.');
        testContext.notEqual(gatheredOutput.length, 0, 'Output buffer contains some information.');
        testContext.strictEqual(recordedErrors.length, 0, 'Error buffer shows no issues.');

        testContext.done();
      });
    },

    // This section contains a previously problematic test case, currently deactivated.
    /*
        'run with invalid string parameter (fdsfdsfsdf)': function(t) {

            t.expect(1);

            t.throws(
                function() {
                    avconv('fdsfdsfsdf');
                },
                TypeError,
                'a type error must be thrown here'
            );

            t.done();
        },
    */

    // Execute the processor with an array containing an invalid parameter.
    'Execution with invalid array parameters ([malformed_string])': function(testContext) {
      testContext.expect(3);

      const processingFlow = videoProcessorTool(['malformed_string_param']);

      observeStreamEvents(processingFlow, (terminationCode, exitSignal, gatheredOutput, recordedErrors) => {
        testContext.strictEqual(terminationCode, 1, 'Processor still showed no activity.');
        testContext.notEqual(gatheredOutput.length, 0, 'Standard output contains a warning about the bad parameter.');
        testContext.strictEqual(recordedErrors.length, 0, 'Standard error stream remains empty.');
        testContext.done();
      });
    }
  }),

  // Second test block: focused on practical functional tests.
  'Test Suite Beta: Functional Validations': caseHandler({

    // Verify the processor's ability to display help information.
    'Loading help output (--help)': function(testContext) {
      testContext.expect(3);

      const processingFlow = videoProcessorTool(['--help']);

      observeStreamEvents(processingFlow, (terminationCode, exitSignal, gatheredOutput, recordedErrors) => {
        testContext.strictEqual(terminationCode, 0, 'Processor successfully returned help text.');
        testContext.notEqual(gatheredOutput.length, 0, 'Standard output contains the help document.');
        testContext.strictEqual(recordedErrors.length, 0, 'Standard error stream is still clean.');
        testContext.done();
      });
    },

    // Validate the functionality of the custom MediaStreamObject class.
    'Validate the MediaStreamObject class operation': function(testContext) {
      testContext.expect(1);

      const customMediaPipe = MediaStreamObject();
      let totalBytesProcessed = 0;

      // Check if all bytes are correctly re-emitted as an 'inputData' event.
      customMediaPipe.on('inputData', (segmentData) => {
        totalBytesProcessed += segmentData.length;
      });

      // Once the stream finishes, verify the total byte count.
      customMediaPipe.on('finish', () => {
        testContext.strictEqual(totalBytesProcessed, 1085887, 'All expected bytes have been re-emitted.');
        testContext.done();
      });

      // Read a sample file and pipe its contents through the custom media stream.
      diskIO.createReadStream(fileUtil.join(currentDirectory, 'example', 'pokemon_card.flv')).pipe(customMediaPipe);
    }
  }),

  // Third test block: focused on actual conversion processes.
  'Test Suite Gamma: Conversion Operations': caseHandler({

    // Setup function executed before each test in this suite.
    setUp: function(initializationCallback) {

      this.sampleContentLocation = fileUtil.join(currentDirectory, 'example');

      const targetOutputFilePath = fileUtil.join(this.sampleContentLocation, 'pokemon_card.webm');

      try {
        diskIO.unlinkSync(targetOutputFilePath); // Attempt to remove previous output file.
      } catch (fileError) {
        // Ignore if the file does not exist, it's not an issue.
      }

      initializationCallback(); // Signal that setup is complete.
    },

    // Convert an FLV video file to WebM format.
    'Transform pokemon_flv to webm format': function(testContext) {

      const conversionParameters = [
        '-i',           fileUtil.join(this.sampleContentLocation, 'pokemon_card.flv'),
        '-c:v',         'libvpx',
        '-deadline',    'realtime',
        '-y',           fileUtil.join(this.sampleContentLocation, 'pokemon_card.webm')
      ];

      let errorAccumulator = '';
      let dataAccumulator  = '';
      let lastRecordedProgress = 0;

      const conversionStream = videoProcessorTool(conversionParameters);

      // Collect general messages from the conversion process.
      conversionStream.on('message', (streamMessage) => {
        dataAccumulator += streamMessage;
      });

      // Monitor and validate the progress of the conversion.
      conversionStream.on('progress', (currentProgress) => {
        testContext.ok(currentProgress > lastRecordedProgress, 'Conversion progress has advanced.');
        testContext.ok(currentProgress <= 1, 'Progress value never exceeds the maximum (100%).');

        lastRecordedProgress = currentProgress;
      });

      // Extract and verify metadata about the video stream.
      conversionStream.on('meta', (videoMetadata) => {
        testContext.strictEqual(videoMetadata.video.track,  '0.0',         'Video track number is accurate.');
        testContext.strictEqual(videoMetadata.video.codec,  'h264 (Main)', 'Video codec is correctly identified.');
        testContext.strictEqual(videoMetadata.video.format, 'yuv420p',     'Video format matches expectations.');
        testContext.strictEqual(videoMetadata.video.width,  320,           'Video width is as expected.');
        testContext.strictEqual(videoMetadata.video.height, 240,           'Video height is as expected.');
      });

      // Collect any error messages during conversion.
      conversionStream.on('error', (errorMessage) => {
        errorAccumulator += errorMessage;
      });

      // Handle the final exit event of the conversion process.
      conversionStream.once('exit', (terminationCode, exitSignal) => {

        testContext.strictEqual(terminationCode, 0,    'Video conversion was completed successfully.');
        testContext.strictEqual(errorAccumulator,   '',   'No error messages were logged.');
        testContext.strictEqual(exitSignal, null,   'No termination signal was received.');

        testContext.ok(dataAccumulator.length > 0, 'Output data was generated during conversion.');

        testContext.done();
      });
    },

    // Test the ability to terminate a conversion process midway.
    'Convert and interrupt mid-operation': function(testContext) {

      const conversionParameters = [
        '-i',           fileUtil.join(this.sampleContentLocation, 'pokemon_card.flv'),
        '-c:v',         'libvpx',
        '-deadline',    'realtime',
        '-y',           fileUtil.join(this.sampleContentLocation, 'pokemon_card.webm')
      ];

      let errorAccumulator = '';

      const conversionStream = videoProcessorTool(conversionParameters);

      // Capture any errors that might occur.
      conversionStream.on('error', (errorMessage) => {
        errorAccumulator += errorMessage;
      });

      // Handle the exit event after interruption.
      conversionStream.once('exit', (terminationCode, exitSignal) => {

        testContext.strictEqual(terminationCode, null,       'No exit code is expected when forcibly interrupted.');
        testContext.strictEqual(errorAccumulator,   '',         'No errors should be present after a clean kill.');
        testContext.strictEqual(exitSignal,   'SIGTERM',  'Termination signal confirms process was killed.');

        testContext.done();
      });

      // After a short delay, send a kill signal to the conversion process.
      setTimeout(function() {
        conversionStream.kill();
      }, 10);
    },

    // Test streaming data directly into and out of the processor.
    'Stream input and output data': function(testContext) {

      const streamingParameters = [
        '-i',           'pipe:0',
        '-c:v',         'libvpx',
        '-f',           'webm',
        '-deadline',    'realtime',
        'pipe:1'
      ];

      const streamingProcessor = videoProcessorTool(streamingParameters);
      let errorAccumulator = '';
      let totalBytesProcessed = 0;

      // Pipe a source file directly into the streaming processor.
      diskIO.createReadStream(fileUtil.join(this.sampleContentLocation, 'pokemon_card.flv')).pipe(streamingProcessor);

      // Collect output data chunks from the processor.
      streamingProcessor.on('data', (outputChunk) => {
        totalBytesProcessed += outputChunk.length;
      });

      // Collect any error messages from the streaming process.
      streamingProcessor.on('error', (errorMessage) => {
        errorAccumulator += errorMessage;
      });

      // Handle the final exit event of the streaming process.
      streamingProcessor.once('exit', (terminationCode, exitSignal) => {

        testContext.strictEqual(terminationCode, 0,    'Processor exited without any reported errors.');
        testContext.strictEqual(errorAccumulator,   '',   'No error messages were recorded.');
        testContext.strictEqual(exitSignal, null,   'No termination signal was received.');

        testContext.ok(totalBytesProcessed > 0, 'The streaming conversion produced output data.');

        testContext.done();
      });
    }
  })
});