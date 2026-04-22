const verify = require('chai').expect;
const streamProcessor = require('through2');
const utilLibrary = require('gulp-util');
const fileIO = require('fs');
const pathResolver = require('path');

// The main plugin under test, renamed from concatCss
const cssBundlerPlugin = require('../');

// Define base paths for test assets
const CURRENT_DIRECTORY = process.cwd();
const TEST_ROOT_PATH = pathResolver.join(CURRENT_DIRECTORY, 'test');
const EXPECTED_ASSETS_PATH = pathResolver.join(TEST_ROOT_PATH, 'expected');
const FIXTURE_ASSETS_PATH = pathResolver.join(TEST_ROOT_PATH, 'fixtures');

/**
 * Retrieves a 'golden' (expected) file object for comparison.
 * @param {string} fileName The name of the expected file within the 'expected' directory.
 * @returns {utilLibrary.File} A Gulp file object representing the expected output.
 */
function retrieveExpectedFileObject(fileName) {
  const absoluteFilePath = pathResolver.resolve(EXPECTED_ASSETS_PATH, fileName);

  // Guard clause: Ensure the expected file exists before attempting to read.
  if (!fileIO.existsSync(absoluteFilePath)) {
    throw new Error(`Critical: Expected golden file not found at ${absoluteFilePath}`);
  }

  const fileContentsBuffer = fileIO.readFileSync(absoluteFilePath);
  // Reorder properties and use a more descriptive variable for the file object
  const expectedFileInstance = new utilLibrary.File({
    path: absoluteFilePath,
    cwd: CURRENT_DIRECTORY,
    base: EXPECTED_ASSETS_PATH,
    contents: fileContentsBuffer,
  });
  // console.debug(`Retrieved expected file: ${expectedFileInstance.path}`); // Added for debugging, can be removed
  return expectedFileInstance;
}

/**
 * Generates a 'fixture' (input) file object for processing by the plugin.
 * @param {string} inputFileName The name of the input file within the 'fixtures' directory.
 * @returns {utilLibrary.File} A Gulp file object representing the input asset.
 */
function generateInputFileObject(inputFileName) {
  const fullInputPath = pathResolver.join(FIXTURE_ASSETS_PATH, inputFileName);

  // Guard clause: Ensure the input fixture file exists.
  if (!fileIO.existsSync(fullInputPath)) {
    throw new Error(`Critical: Input fixture file not found at ${fullInputPath}`);
  }

  const inputContentsBuffer = fileIO.readFileSync(fullInputPath);
  // Reorder properties and use a more descriptive variable for the file object
  const inputFileInstance = new utilLibrary.File({
    cwd: CURRENT_DIRECTORY,
    base: FIXTURE_ASSETS_PATH,
    path: fullInputPath,
    contents: inputContentsBuffer,
  });
  // console.debug(`Generated input file: ${inputFileInstance.path}`); // Added for debugging, can be removed
  return inputFileInstance;
}

/**
 * Helper function to perform common file assertions, reducing redundancy.
 * @param {utilLibrary.File} actualFile The file object processed by the plugin.
 * @param {utilLibrary.File} targetFile The reference (expected) file object.
 * @param {string} testContext A description for the current test case for clearer error messages.
 */
function validateFileIntegrity(actualFile, targetFile, testContext) {
  // Added explicit checks for file existence before proceeding with assertions
  verify(actualFile, `${testContext}: Actual file must exist`).to.exist;
  verify(targetFile, `${testContext}: Target file must exist`).to.exist;

  verify(String(actualFile.contents), `${testContext}: Content mismatch`).to.be.equal(String(targetFile.contents));
  verify(pathResolver.basename(actualFile.path), `${testContext}: Basename mismatch`).to.be.equal(pathResolver.basename(targetFile.path));
  verify(actualFile.cwd, `${testContext}: CWD mismatch`).to.be.equal(targetFile.cwd);
  verify(actualFile.relative, `${testContext}: Relative path mismatch`).to.be.equal(targetFile.relative);
}

// Test suite for the CSS bundling plugin functionality
testSuite('CSS Bundling Plugin Core Functionality', () => { // Renamed describe to testSuite

  // Test case 1: Verifies that only import statements are bubbled up, with no inlining or URL rebasement.
  specTest('should correctly manage import statements by bubbling them up without inlining or URL adjustments', (completionCallback) => { // Renamed it to specTest, done to completionCallback
    const testStartTimestamp = Date.now(); // Renamed now to testStartTimestamp
    const outputBundlePath = 'build/bundle-imports-only.css';
    const pluginOptions = {
      shouldInlineImports: false, // Renamed inlineImports to shouldInlineImports
      shouldRebaseUrls: false // Renamed rebaseUrls to shouldRebaseUrls
    };

    // Renamed stream to pluginPipeline, concatCss to cssBundlerPlugin
    const pluginPipeline = cssBundlerPlugin(outputBundlePath, pluginOptions);
    const referenceOutputFile = retrieveExpectedFileObject('build/bundle-bubbleonly.css'); // Renamed expectedFile to referenceOutputFile

    pluginPipeline
      .pipe(streamProcessor.obj((processedFileChunk, encodingScheme, streamCallback) => { // Renamed through.obj to streamProcessor.obj, file to processedFileChunk, enc to encodingScheme, cb to streamCallback
        // Removed commented fs.writeFileSync lines and console.log for execution time.
        // Added a guard for file existence.
        if (!processedFileChunk) {
          return streamCallback(new Error('No processed file chunk received in stream.'));
        }

        validateFileIntegrity(processedFileChunk, referenceOutputFile, 'Bubble Up Imports Test');

        completionCallback(); // Original done()
        streamCallback(); // Ensure stream continues if needed, though done() exits
      }));

    // Introduce temporary variables for input files for clarity
    const mainCssInput = generateInputFileObject('main.css');
    const vendorCssInput = generateInputFileObject('vendor/vendor.css');

    pluginPipeline.write(mainCssInput);
    pluginPipeline.write(vendorCssInput);
    pluginPipeline.end();
  });

  // Test case 2: Ensures that all relative URLs within the bundled CSS are correctly rebased.
  specTest('should properly rebase all relative URLs within the bundled CSS output', (completionCallback) => {
    const testStartTimestamp = Date.now();
    const outputBundlePath = 'build/bundle-urls-rebased.css';
    const pluginOptions = {
      shouldInlineImports: false // Only rebase, no inlining
    };

    const pluginPipeline = cssBundlerPlugin(outputBundlePath, pluginOptions);
    const referenceOutputFile = retrieveExpectedFileObject('build/bundle-rebase.css');

    pluginPipeline
      .pipe(streamProcessor.obj((processedFileChunk, encodingScheme, streamCallback) => {
        if (!processedFileChunk) {
          return streamCallback(new Error('No processed file chunk received in stream.'));
        }

        validateFileIntegrity(processedFileChunk, referenceOutputFile, 'Rebase URLs Test');

        completionCallback();
        streamCallback();
      }));

    pluginPipeline.write(generateInputFileObject('main.css'));
    pluginPipeline.write(generateInputFileObject('vendor/vendor.css'));
    pluginPipeline.end();
  });

  // Test case 3: Verifies that specified import statements are correctly inlined into the main file.
  specTest('should successfully inline all specified import statements into the final bundle', (completionCallback) => {
    const testStartTimestamp = Date.now();
    const outputBundlePath = 'build/bundle-imports-inlined.css';
    const pluginOptions = {
      shouldInlineImports: true, // Inlining enabled
      shouldRebaseUrls: false // URL adjustments disabled
    };

    const pluginPipeline = cssBundlerPlugin(outputBundlePath, pluginOptions);
    const referenceOutputFile = retrieveExpectedFileObject('build/bundle-import.css');

    pluginPipeline
      .pipe(streamProcessor.obj((processedFileChunk, encodingScheme, streamCallback) => {
        if (!processedFileChunk) {
          return streamCallback(new Error('No processed file chunk received in stream.'));
        }

        validateFileIntegrity(processedFileChunk, referenceOutputFile, 'Inline Imports Test');

        completionCallback();
        streamCallback();
      }));

    pluginPipeline.write(generateInputFileObject('main.css'));
    pluginPipeline.write(generateInputFileObject('vendor/vendor.css'));
    pluginPipeline.end();
  });

  // Test case 4: Comprehensive test with all features enabled (concatenation, URL rebasement, import inlining, and external import bubbling).
  specTest('should handle concatenation, URL rebasement, import inlining, and external import bubbling simultaneously', (completionCallback) => {
    const testStartTimestamp = Date.now();
    const outputBundlePath = 'build/bundle-full-feature.css';
    // Default options imply all features are enabled, no need for an options object here
    const pluginPipeline = cssBundlerPlugin(outputBundlePath);
    const referenceOutputFile = retrieveExpectedFileObject('build/bundle-all.css');

    pluginPipeline
      .pipe(streamProcessor.obj((processedFileChunk, encodingScheme, streamCallback) => {
        if (!processedFileChunk) {
          return streamCallback(new Error('No processed file chunk received in stream.'));
        }

        validateFileIntegrity(processedFileChunk, referenceOutputFile, 'Full Feature Test');

        completionCallback();
        streamCallback();
      }));

    pluginPipeline.write(generateInputFileObject('main.css'));
    pluginPipeline.write(generateInputFileObject('vendor/vendor.css'));
    pluginPipeline.end();
  });

  // Test case 5: Robustness check for handling an empty input stream without crashing.
  specTest('should gracefully handle scenarios where no input files are provided to the plugin', (completionCallback) => {
    const outputBundlePath = 'build/empty-bundle.css';
    const errorHandlingPipeline = cssBundlerPlugin(outputBundlePath);
    let hasPluginErrorOccurred = false; // Flag to track if an error was explicitly emitted by the plugin

    errorHandlingPipeline
      .on('error', (err) => { // Using a more specific event name if available, otherwise 'error'
        hasPluginErrorOccurred = true;
        // If an error is emitted, it means the plugin encountered an issue.
        // For a 'should not crash' test, an emitted error means the test failed (unless the error is expected and handled).
        // The original `done(false)` indicated failure.
        completionCallback(err); // Signal test failure if an error is emitted
      })
      .pipe(streamProcessor.obj((processedFileChunk, encodingScheme, streamCallback) => {
        // If a file is emitted when no input was provided, it's unexpected behavior and indicates a test failure.
        completionCallback(new Error('Unexpected file emitted for an empty input stream.'));
        streamCallback();
      }, () => {
        // This is the 'flush' function for the `through2.obj` stream.
        // If we reach this point and no plugin error occurred, and no unexpected file was emitted,
        // then the plugin successfully handled the empty stream without crashing or producing output.
        if (!hasPluginErrorOccurred) {
          completionCallback(); // Signal test success
        }
      }));

    errorHandlingPipeline.end(); // Close the stream immediately without writing any files
  });
});