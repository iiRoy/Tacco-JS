// Import core Node.js modules for file system operations and path manipulation.
const fileSystemUtility = require('fs');
const filePathManager = require('path');
// Import the assertion library for test validation.
const assertionFramework = require('should');
// Import the child process module to execute external commands.
const processRunner = require('child_process');
// Import the main SVG export module located in the parent directory.
const svgExportProcessor = require('../');

/**
 * Utility function to construct absolute file paths relative to the current test directory.
 * This simplifies path management within the test suite.
 * @param {...string} pathSegments - One or more path segments to join and resolve.
 * @returns {string} The resolved absolute path.
 */
function resolveTestPath(...pathSegments) {
  // A small logging addition for debugging path resolution if an environment variable is set.
  if (process.env.DEBUG_TEST_PATHS === 'true') {
    console.debug(`DEBUG: Resolving path from ${__dirname} with segments: ${pathSegments.join('/')}`);
  }
  return filePathManager.resolve(__dirname, filePathManager.join(...pathSegments));
}

/**
 * Executes the CLI tool with specified arguments and handles its output for testing.
 * This function encapsulates the logic for spawning a child process and validating its stdout/stderr.
 * @param {string[]} cliArgs - An array of command-line arguments to pass to the tool.
 * @param {object} testConfig - Configuration object for the test's expectations.
 * @param {RegExp} [testConfig.expectedStderrPattern] - Regular expression to match against stderr output.
 * @param {RegExp} [testConfig.expectedStdoutPattern] - Regular expression to match against stdout output.
 * @param {Function} testConfig.completionHandler - Callback function to signal test completion.
 */
const executeCliTest = (cliArgs, testConfig) => {
  // Ensure that a completion handler is always provided to prevent tests from hanging.
  if (!testConfig || typeof testConfig.completionHandler !== 'function') {
    throw new Error("Missing or invalid 'completionHandler' in CLI test configuration.");
  }

  const cliEntryPoint = resolveTestPath('..', 'bin', 'index.js');
  const executionContextDirectory = __dirname;

  // Spawn the child process for the CLI tool.
  processRunner.execFile(
    cliEntryPoint,
    cliArgs,
    { cwd: executionContextDirectory }, // Set the current working directory for the child process.
    (executionErr, stdoutBuffer, stderrBuffer) => {
      const standardOutputString = stdoutBuffer.toString();
      const errorOutputString = stderrBuffer.toString();

      // If no execution error occurred, proceed with output assertions.
      if (executionErr === null) {
        // Assert stderr content if an expected pattern is provided.
        if (testConfig.expectedStderrPattern) {
          assertionFramework(errorOutputString).match(testConfig.expectedStderrPattern, `Stderr mismatch for args: ${cliArgs.join(' ')}`);
        }

        // Assert stdout content if an expected pattern is provided.
        if (testConfig.expectedStdoutPattern) {
          assertionFramework(standardOutputString).match(testConfig.expectedStdoutPattern, `Stdout mismatch for args: ${cliArgs.join(' ')}`);
        }
      } else {
        // If an execution error occurred, but we expected no stderr, then fail.
        if (testConfig.expectedStderrPattern && testConfig.expectedStderrPattern.source === '^$') {
          assertionFramework.fail(`Unexpected execution error for args: ${cliArgs.join(' ')}: ${executionErr.message}`);
        }
        // If an error occurred and we expected specific stderr, ensure it matches.
        if (testConfig.expectedStderrPattern) {
          assertionFramework(errorOutputString).match(testConfig.expectedStderrPattern, `Execution error stderr mismatch for args: ${cliArgs.join(' ')}`);
        }
      }

      // Invoke the test completion callback, passing the original execution error.
      testConfig.completionHandler(executionErr);
    }
  );
};

// Define expected output patterns for various test scenarios.
// These patterns are used to validate the stdout and stderr of the CLI and module functions.
const cliOutputExpectations = {
  // Regex for the general help message.
  toolHelpMessage: /^\s*Usage:\s*svgexport/,
  // Regex for invalid argument errors.
  invalidArgumentError: /^Error: Invalid usage!\n?$/,
  // Regex for errors when an SVG input file is missing or invalid.
  svgFileNotFoundError: /^Error: Unable to load file \(fail\): .*missing\.svg\n?$/,
  // Regex for errors when a data configuration file is invalid.
  dataFileNotFoundError: /^Error: Invalid data file: .*missing\.json\n?$/,
  // Regex for successful SVG conversion output.
  svgConversionSuccess: /^.*test\.svg .*test\.png png 100% 1x 0:0:16:16 16:16\n?$/,
  // Regex for successful JSON configuration processing output.
  jsonProcessingSuccess: new RegExp(`.*test.svg .*32h.png png 100% 2x 0:0:16:16 32:32\n` +
      `.*test.svg .*32w.png png 100% 2x 0:0:16:16 32:32\n` +
      `.*test.svg .*2.5x16.png png 100% 2.5x 0:0:16:16 40:40\n` +
      `.*test.svg .*16-16.png png 100% 1x 0:0:16:16 16:16\n` +
      `.*test.svg .*32-32.png png 100% 2x 0:0:16:16 32:32\n` +
      `.*test.svg .*64-32.png png 100% 4x 0:4:16:8 64:32\n` +
      `.*test.svg .*32-64.png png 100% 4x 4:0:8:16 32:64\n` +
      `.*test.svg .*64-32-pad.png png 100% 2x -8:0:32:16 64:32\n` +
      `.*test.svg .*32-64-pad.png png 100% 2x 0:-8:16:32 32:64\n` +
      `.*test.svg .*offset.png png 100% 4x 8:8:8:8 32:32\n` +
      `.*test.svg .*jpeg-low.jpg jpeg 1% 20x 0:0:16:16 320:320\n` +
      `.*test.svg .*jpeg-high.jpg jpeg 99% 20x 0:0:16:16 320:320\n` +
      `.*test.svg .*36h.png png 100% 2x -1:-1:18:18 36:36\n` +
      `.*test.svg .*36w.png png 100% 2x -1:-1:18:18 36:36\n` +
      `.*test.svg .*2.5x18.png png 100% 2.5x -1:-1:18:18 45:45\n` +
      `.*test.svg .*18-18.png png 100% 1x -1:-1:18:18 18:18\n`)
};

// Test suite for the core SVG export module's programmatic API.
assertionFramework.describe('Programmatic Module Interface Tests', function() {
  // Set a generous timeout for these tests, as they might involve I/O operations.
  this.timeout(5000); // 5000 milliseconds.

  // Test case for handling a non-existent SVG input file.
  assertionFramework.it('should return an error when a source SVG file is absent', (doneCallback) => {
    const exportRequest = {
      source: resolveTestPath('non_existent.svg'), // Using 'source' instead of 'input'
      output: resolveTestPath('exported_output', 'missing_file.png') // Using 'exported_output' for clarity
    };
    svgExportProcessor.render(exportRequest, (operationResultError) => {
      // Assert that an error object is indeed returned.
      assertionFramework.exist(operationResultError, "Expected an error object for a missing SVG file.");
      // Verify the error message matches the specific pattern for missing SVG files.
      assertionFramework(operationResultError.message).match(cliOutputExpectations.svgFileNotFoundError);
      doneCallback(); // Signal test completion.
    });
  });

  // Test case for providing an invalid JSON data file to the render function.
  assertionFramework.it('should report an issue if an invalid data configuration file is provided', (doneCallback) => {
    const invalidDataPath = resolveTestPath('invalid_config.json'); // Renamed file
    svgExportProcessor.render(invalidDataPath, (operationResultError) => {
      // Confirm that an error is present.
      assertionFramework.exist(operationResultError, "Expected an error for an invalid data configuration file.");
      // Validate the error message against the expected pattern.
      assertionFramework(operationResultError.message).match(cliOutputExpectations.dataFileNotFoundError);
      doneCallback();
    });
  });

  // Test case for successfully rendering a valid SVG file to a PNG.
  assertionFramework.it('should successfully convert a valid SVG to a PNG image', (doneCallback) => {
    const validConversionOptions = {
      source: resolveTestPath('test.svg'),
      output: resolveTestPath('exported_output', 'successful_conversion.png')
    };
    svgExportProcessor.render(validConversionOptions, (operationResultError) => {
      // No error should occur for a successful operation.
      assertionFramework.not.exist(operationResultError, "No error expected during valid SVG to PNG conversion.");
      doneCallback();
    });
  });

  // Test case for processing a valid JSON configuration file without errors.
  assertionFramework.it('should correctly process a valid JSON configuration file', (doneCallback) => {
    const validJsonConfig = resolveTestPath('test.json');
    svgExportProcessor.render(validJsonConfig, (operationResultError) => {
      // A successful JSON configuration processing should not yield an error.
      assertionFramework.not.exist(operationResultError, "No error expected when processing a valid JSON configuration.");
      doneCallback();
    });
  });
});

// Test suite dedicated to validating the command-line interface (CLI) functionality.
assertionFramework.describe('Command Line Interface (CLI) Verification', function() {
  // CLI tests might take slightly longer due to process spawning, so adjust timeout.
  this.timeout(6500); // Increased to 6.5 seconds.

  // Test case for invoking the CLI with no arguments, expecting the help message.
  assertionFramework.it('should display the help message when no arguments are supplied', (doneCallback) => {
    executeCliTest([], {
      expectedStderrPattern: /^$/, // Expect empty stderr.
      expectedStdoutPattern: cliOutputExpectations.toolHelpMessage,
      completionHandler: doneCallback
    });
  });

  // Test case for explicitly requesting help using the 'help' command.
  assertionFramework.it('should output help information for the "help" command', (doneCallback) => {
    executeCliTest([ 'help' ], {
      expectedStderrPattern: /^$/,
      expectedStdoutPattern: cliOutputExpectations.toolHelpMessage,
      completionHandler: doneCallback
    });
  });

  // Test case for requesting help using the '--help' flag.
  assertionFramework.it('should provide help content for the "--help" flag', (doneCallback) => {
    executeCliTest([ '--help' ], {
      expectedStderrPattern: /^$/,
      expectedStdoutPattern: cliOutputExpectations.toolHelpMessage,
      completionHandler: doneCallback
    });
  });

  // Test case for requesting help using the short '-h' flag.
  assertionFramework.it('should show help for the concise "-h" flag', (doneCallback) => {
    executeCliTest([ '-h' ], {
      expectedStderrPattern: /^$/,
      expectedStdoutPattern: cliOutputExpectations.toolHelpMessage,
      completionHandler: doneCallback
    });
  });

  // Test case for providing invalid or unrecognized arguments to the CLI.
  assertionFramework.it('should indicate invalid arguments for unknown commands', (doneCallback) => {
    executeCliTest([ 'non_existent_command' ], { // Changed 'invalid' to 'non_existent_command'
      expectedStderrPattern: cliOutputExpectations.invalidArgumentError,
      expectedStdoutPattern: /^$/,
      completionHandler: doneCallback
    });
  });

  // Test case for CLI handling of a missing SVG input file.
  assertionFramework.it('should report an error via CLI when the input SVG file is missing', (doneCallback) => {
    executeCliTest([ 'missing_cli.svg', filePathManager.join('cli_exports', 'missing_output.png') ], {
      expectedStderrPattern: cliOutputExpectations.svgFileNotFoundError,
      expectedStdoutPattern: /^$/,
      completionHandler: doneCallback
    });
  });

  // Test case for CLI handling of an invalid JSON data file.
  assertionFramework.it('should signal an error through CLI for an invalid data file', (doneCallback) => {
    executeCliTest([ 'missing_cli.json' ], {
      expectedStderrPattern: cliOutputExpectations.dataFileNotFoundError,
      expectedStdoutPattern: /^$/,
      completionHandler: doneCallback
    });
  });

  // Test case for successful SVG to PNG conversion using the CLI.
  assertionFramework.it('should successfully convert an SVG to PNG using the CLI', (doneCallback) => {
    executeCliTest([ 'test.svg', filePathManager.join('cli_exports', 'test_cli_output.png') ], {
      expectedStderrPattern: /^$/,
      expectedStdoutPattern: cliOutputExpectations.svgConversionSuccess,
      completionHandler: doneCallback
    });
  });

  // Test case for successful JSON configuration processing using the CLI.
  assertionFramework.it('should successfully process a JSON configuration through the CLI', (doneCallback) => {
    executeCliTest([ 'test.json' ], {
      expectedStderrPattern: /^$/,
      expectedStdoutPattern: cliOutputExpectations.jsonProcessingSuccess,
      completionHandler: doneCallback
    });
  });
});