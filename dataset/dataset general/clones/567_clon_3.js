"use strict"; // Enforcing strict mode for cleaner code execution.

// Core dependencies for testing and file system interactions.
const testRunner = require('nodeunit').testCase;
const pathUtility = require('path');
const fileSystemOps = require('fs');

// Global references for the media processing modules, initialized later.
let videoConverterInstance;
let streamProcessorUtility;

/**
 * Utility function to capture all events from a given stream and store them.
 * This helps in verifying outputs and errors in asynchronous test scenarios.
 * @param {object} dataPipe - The stream object to monitor.
 * @param {function} completionHandler - Callback function invoked upon stream exit.
 */
function processStreamEvents(dataPipe, completionHandler) {
  // Guard clause for invalid stream.
  if (!dataPipe || typeof dataPipe.on !== 'function') {
    console.warn('Attempted to process an invalid or non-stream-like object.');
    // Provide default empty arrays for output and error in case of invalid stream.
    return completionHandler(null, 'INVALID_STREAM_OBJECT', [], ['Invalid stream provided.']);
  }

  const collectedMessages = []; // Stores standard output data.
  const errorMessages = [];     // Stores standard error data.

  // Registering event listeners for various stream activities.

  // Event for regular data output from the process.
  dataPipe.on('message', (messageContent) => {
    if (messageContent) { // Ensure content exists before pushing.
      collectedMessages.push(messageContent);
    }
  });

  // Event for error messages from the process.
  dataPipe.on('error', (errorChunk) => {
    if (errorChunk) { // Ensure content exists before pushing.
      errorMessages.push(errorChunk);
    }
  });

  // Event triggered once the child process exits.
  dataPipe.once('exit', (processExitCode, terminationSignal) => {
    // Invoke the completion handler with all gathered information.
    completionHandler(processExitCode, terminationSignal, collectedMessages, errorMessages);
  });
}

// Exporting the main test suite configuration for Nodeunit.
module.exports = testRunner({

  // SECTION 1: Fundamental Module Stability and Basic Invocation Tests
  'Core Functionality Stability Checks': testRunner({

    // Test case: Verify that the main media processing modules load correctly.
    'Verify Media Processor Module Loading': (testContext) => {
      testContext.expect(2); // Expecting two assertions in this test.

      try {
        videoConverterInstance = require('../avconv.js');
        streamProcessorUtility = require('../lib/avstream.js');

        testContext.ok(videoConverterInstance !== undefined && videoConverterInstance !== null, 'The main video converter module should be successfully loaded.');
        testContext.ok(streamProcessorUtility, 'The auxiliary stream processing utility should also be available.');
      } catch (loadError) {
        testContext.fail(`Module loading failed unexpectedly: ${loadError.message}`);
      } finally {
        testContext.done(); // Mark test as complete regardless of outcome.
      }
    },

    // Test case: Running the converter with a null argument.
    'Execution with Null Parameters': (testContext) => {
      testContext.expect(5); // Five assertions expected, including the new one.

      const processStream = videoConverterInstance(null); // Invoke converter with null.
      testContext.ok(processStream, 'A stream object should be returned even with null arguments.');

      processStreamEvents(processStream, (exitStatus, terminationSig, stdOutData, stdErrData) => {
        testContext.strictEqual(exitStatus, 1, 'Process should exit with code 1 indicating no operation performed.');
        testContext.notStrictEqual(stdOutData.length, 0, 'Standard output should contain messages despite null input.');
        testContext.strictEqual(stdErrData.length, 0, 'Standard error output should remain empty.');
        testContext.strictEqual(terminationSig, null, 'No termination signal should be sent for this type of exit.');
        testContext.done();
      });
    },

    // Test case: Running the converter with an empty array of arguments.
    'Execution with Empty Argument Array': (testContext) => {
      testContext.expect(3); // Three assertions expected.

      const converterHandle = videoConverterInstance([]); // Invoke converter with an empty array.

      processStreamEvents(converterHandle, (exitStatus, terminationSig, stdOutData, stdErrData) => {
        testContext.strictEqual(exitStatus, 1, 'Process should indicate no action for an empty argument list.');
        testContext.notStrictEqual(stdOutData.length, 0, 'Standard output should have content even with empty arguments.');
        testContext.strictEqual(stdErrData.length, 0, 'Standard error stream should be clear.');
        testContext.done();
      });
    },

    // Test case: Running the converter with an array containing an invalid string argument.
    'Handling of Invalid Command Line Arguments': (testContext) => {
      testContext.expect(3); // Three assertions expected.

      const badArgumentList = ['nonexistent_command'];
      const converterProc = videoConverterInstance(badArgumentList);

      processStreamEvents(converterProc, (exitStatus, terminationSig, stdOutData, stdErrData) => {
        testContext.strictEqual(exitStatus, 1, 'An invalid argument should cause a non-zero exit code (failure).');
        testContext.ok(stdOutData.length > 0, 'Standard output should contain a warning or error message regarding the bad parameter.');
        testContext.strictEqual(stdErrData.length, 0, 'Standard error stream should ideally be empty for this specific type of invalid argument.');
        testContext.done();
      });
    }
  }),

  // SECTION 2: Validating Specific Functionalities
  'Practical Use Case Scenarios': testRunner({

    // Test case: Requesting and verifying the help output from the converter.
    'Retrieve Help Output': (testContext) => {
      testContext.expect(3); // Three assertions expected.

      const helpArguments = ['--help'];
      const converterProcess = videoConverterInstance(helpArguments);

      processStreamEvents(converterProcess, (exitStatus, terminationSig, stdOutData, stdErrData) => {
        testContext.strictEqual(exitStatus, 0, 'Help request should result in a successful (zero) exit code.');
        testContext.ok(stdOutData.length > 0, 'Standard output must contain the help information.');
        testContext.strictEqual(stdErrData.length, 0, 'No errors should be reported when requesting help.');
        testContext.done();
      });
    },

    // Test case: Thoroughly test the AvStream utility class for data handling.
    'Validate Media Stream Utility Class': (testContext) => {
      testContext.expect(1); // One assertion expected.

      const mediaStreamUtil = streamProcessorUtility();
      let totalBytesRead = 0; // Accumulator for bytes received.

      // Listener to sum up all data emitted as 'inputData'.
      mediaStreamUtil.on('inputData', (dataBuffer) => {
        totalBytesRead += dataBuffer.length;
      });

      // Once the stream finishes, verify the total byte count.
      mediaStreamUtil.on('finish', () => {
        const expectedByteCount = 1085887; // Known size of the example file.
        testContext.strictEqual(totalBytesRead, expectedByteCount, 'All bytes from the input file should be correctly processed and emitted.');
        testContext.done();
      });

      // Construct the full path to the example FLV file.
      const sampleAssetPath = pathUtility.join(__dirname, 'example', 'pokemon_card.flv');

      // Create a readable stream from the sample file and pipe it to the AvStream utility.
      fileSystemOps.createReadStream(sampleAssetPath).pipe(mediaStreamUtil);
    }
  }),

  // SECTION 3: Comprehensive Media Conversion Tests
  'Media File Conversion Operations': testRunner({

    // Setup function to prepare the test environment before each test in this suite.
    setUp: function(preparationCallback) {
      this.sampleAssetDirectory = pathUtility.join(__dirname, 'example');
      const webmOutputFile = pathUtility.join(this.sampleAssetDirectory, 'pokemon_card.webm');

      // Ensure a clean slate by attempting to delete any previous output file.
      if (fileSystemOps.existsSync(webmOutputFile)) {
        try {
          fileSystemOps.unlinkSync(webmOutputFile);
          console.log(`Cleaned up existing file: ${webmOutputFile}`);
        } catch (cleanupError) {
          console.error(`Failed to remove existing WebM file: ${cleanupError.message}`);
          // Continue even if cleanup fails, might be permissions or file in use.
        }
      }
      preparationCallback(); // Signal that setup is complete.
    },

    // Test case: Convert an FLV video file to WebM format.
    'Convert FLV to WebM Format': (testContext) => {
      const inputFlvPath = pathUtility.join(testContext.sampleAssetDirectory, 'pokemon_card.flv');
      const outputWebmPath = pathUtility.join(testContext.sampleAssetDirectory, 'pokemon_card.webm');

      const conversionArguments = [
        '-i', inputFlvPath,         // Input file.
        '-c:v', 'libvpx',           // Video codec.
        '-deadline', 'realtime',    // Encoding deadline.
        '-y', outputWebmPath        // Overwrite output file if it exists.
      ];

      let accumulatedErrors = '';
      let accumulatedOutput = '';
      let lastReportedProgress = 0; // Tracks progress for validation.
      let totalExpectedAssertions = 12; // Base count for assertions.

      // Optional: Add a simple validation for arguments.
      const isValidArgs = (args) => Array.isArray(args) && args.length > 0;
      if (!isValidArgs(conversionArguments)) {
        testContext.fail('Conversion arguments are invalid or empty. Test aborted.');
        return testContext.done();
      }

      const conversionProcess = videoConverterInstance(conversionArguments);
      testContext.ok(conversionProcess, 'Converter process object should be successfully created.');
      totalExpectedAssertions++; // Increment for this assertion.

      // Listener for general messages from the converter.
      conversionProcess.on('message', (dataChunk) => {
        accumulatedOutput += dataChunk;
      });

      // Listener for progress updates during conversion.
      conversionProcess.on('progress', (currentProgress) => {
        testContext.ok(currentProgress >= lastReportedProgress, 'Progress should be non-decreasing.');
        testContext.ok(currentProgress <= 1.0, 'Progress value must not exceed 1.0 (100%).');
        lastReportedProgress = currentProgress;
      });

      // Listener for metadata extraction during conversion.
      conversionProcess.on('meta', (mediaMetadata) => {
        testContext.strictEqual(mediaMetadata.video.track, '0.0', 'Video track number should match expected.');
        testContext.strictEqual(mediaMetadata.video.codec, 'h264 (Main)', 'Video codec should be correctly identified.');
        testContext.strictEqual(mediaMetadata.video.format, 'yuv420p', 'Video pixel format should be as expected.');
        testContext.strictEqual(mediaMetadata.video.width, 320, 'Video width must be 320 pixels.');
        testContext.strictEqual(mediaMetadata.video.height, 240, 'Video height must be 240 pixels.');
      });

      // Listener for any errors reported by the converter.
      conversionProcess.on('error', (errorContent) => {
        accumulatedErrors += errorContent;
      });

      // Final event when the conversion process completes or exits.
      conversionProcess.once('exit', (exitStatus, terminationSig) => {
        testContext.strictEqual(exitStatus, 0, 'Video conversion should complete with a successful exit code (0).');
        testContext.strictEqual(accumulatedErrors, '', 'No errors should have been accumulated during successful conversion.');
        testContext.strictEqual(terminationSig, null, 'No termination signal should be present for a clean exit.');
        testContext.ok(accumulatedOutput.length > 0, 'There should be some output messages from the converter.');
        testContext.ok(lastReportedProgress > 0 && lastReportedProgress <= 1.0, 'Progress should have been reported and finished.');

        // Verify the output file actually exists after conversion.
        testContext.ok(fileSystemOps.existsSync(outputWebmPath), 'Output WebM file should exist after successful conversion.');
        totalExpectedAssertions++; // Increment for file existence check.

        testContext.expect(totalExpectedAssertions); // Set the expected assertion count dynamically.
        testContext.done();
      });
    },

    // Test case: Initiate a conversion and then forcefully terminate it.
    'Interrupt Conversion Process': (testContext) => {
      const sourceFlv = pathUtility.join(testContext.sampleAssetDirectory, 'pokemon_card.flv');
      const targetWebm = pathUtility.join(testContext.sampleAssetDirectory, 'pokemon_card_killed.webm'); // Different output name to avoid conflict.

      const processTerminationArgs = [
        '-i', sourceFlv,
        '-c:v', 'libvpx',
        '-deadline', 'realtime',
        '-y', targetWebm
      ];

      let collectedErrors = '';
      const interruptibleProcess = videoConverterInstance(processTerminationArgs);

      interruptibleProcess.on('error', (errorFragment) => {
        collectedErrors += errorFragment;
      });

      interruptibleProcess.once('exit', (exitStatus, terminationSig) => {
        testContext.strictEqual(exitStatus, null, 'An interrupted process should not have a standard exit code.');
        testContext.strictEqual(collectedErrors, '', 'No errors should occur before the kill signal is sent.');
        testContext.strictEqual(terminationSig, 'SIGTERM', 'The process should terminate with a SIGTERM signal.');
        testContext.ok(!fileSystemOps.existsSync(targetWebm), 'The output file should not exist or be incomplete after termination.');

        testContext.done();
      });

      // Introduce a short delay before sending the kill signal.
      const killTimer = setTimeout(() => {
        if (interruptibleProcess && typeof interruptibleProcess.kill === 'function') {
          interruptibleProcess.kill();
        } else {
          console.warn('Attempted to kill a non-existent or invalid process stream object.');
        }
      }, 50); // Increased delay slightly to ensure process starts.
    },

    // Test case: Perform conversion using input and output streams directly.
    'Bidirectional Stream Processing': (testContext) => {
      const inputPipeAlias = 'pipe:0'; // Standard input stream alias.
      const outputPipeAlias = 'pipe:1'; // Standard output stream alias.

      const streamingConversionArgs = [
        '-i', inputPipeAlias,
        '-c:v', 'libvpx',
        '-f', 'webm', // Force output format to webm for pipe:1
        '-deadline', 'realtime',
        outputPipeAlias
      ];

      const streamingConverter = videoConverterInstance(streamingConversionArgs);
      let streamErrors = '';
      let receivedBytes = 0;

      // Pipe the source FLV file into the converter's standard input.
      const sourceStream = fileSystemOps.createReadStream(pathUtility.join(testContext.sampleAssetDirectory, 'pokemon_card.flv'));
      sourceStream.pipe(streamingConverter);

      // Listen for data coming out of the converter's standard output.
      streamingConverter.on('data', (outputBuffer) => {
        receivedBytes += outputBuffer.length;
      });

      // Listen for errors from the streaming converter.
      streamingConverter.on('error', (errorPayload) => {
        streamErrors += errorPayload;
      });

      // Handle process exit for the streaming conversion.
      streamingConverter.once('exit', (exitStatus, terminationSig) => {
        testContext.strictEqual(exitStatus, 0, 'Streaming conversion should exit successfully.');
        testContext.strictEqual(streamErrors, '', 'No errors should be reported during streaming conversion.');
        testContext.strictEqual(terminationSig, null, 'No termination signal expected for a successful stream completion.');
        testContext.ok(receivedBytes > 0, 'Converted data should be received via the output stream.');

        testContext.done();
      });

      // Add an optional timeout to ensure the test doesn't hang indefinitely if the stream fails to close.
      setTimeout(() => {
        // Nodeunit's `_doneCalled` is an internal property, use with caution.
        // A more robust check might involve a flag managed by the test itself.
        if (!testContext._doneCalled) {
          console.warn('Streaming test timed out, forcing done() to prevent hanging.');
          testContext.fail('Streaming conversion did not complete in time.');
          testContext.done();
        }
      }, 30000); // 30 second timeout.
    }
  })
});