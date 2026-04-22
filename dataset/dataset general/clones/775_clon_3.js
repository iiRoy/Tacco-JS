// Core modules for testing setup and dependencies
const { exec: runExternalCmd } = require("child_process"); // Renamed and destructured for clarity
const fileSystemAccess = require("fs"); // Renamed 'fs' to 'fileSystemAccess'
const assertionFramework = require("tape"); // Renamed 'tape' to 'assertionFramework'
const testHelpers = require("./utils"); // Renamed 'utils' to 'testHelpers'
const styleTransformer = require(".."); // Renamed 'cssnext' to 'styleTransformer'

// Initial data and configuration for CLI tests
const sourceDataContent = testHelpers.readFixture("cli"); // Renamed 'input' to 'sourceDataContent'
const anticipatedResult = testHelpers.readFixture("cli.expected"); // Renamed 'output' to 'anticipatedResult'
const cliToolPath = "node bin/cssnext"; // Renamed 'cssnextBin' to 'cliToolPath', common for cross-platform Node.js execution

/**
 * Comprehensive test suite for the command-line interface of the style processing tool.
 * This suite covers various aspects including file operations, standard I/O,
 * error handling, configuration loading, feature toggling, and watch mode.
 */
assertionFramework("command-line-interface functionality validation", (check) => {
  let totalExpectedChecks = 0; // Renamed 'planned' to 'totalExpectedChecks'

  /**
   * Standardized helper to execute CLI commands and manage their callbacks.
   * Provides consistent error logging and allows for optional execution options.
   * @param {string} commandString The full command string to execute.
   * @param {object} [options={}] Options object to pass to child_process.exec.
   * @param {function} callback The callback function (error, stdout, stderr).
   * @returns {ChildProcess} The child process instance.
   */
  const executeCliCommand = (commandString, options = {}, callback) => {
    // Adding an intermediate step for logging the command for better debuggability
    // console.log(`Executing: ${commandString}`);
    const processHandle = runExternalCmd(commandString, options, (errorValue, standardOutput, standardError) => {
      if (errorValue) {
        // Enhanced error logging for debugging failed commands
        console.error(`\n--- CLI Command Error ---`);
        console.error(`Command: ${commandString}`);
        console.error(`Message: ${errorValue.message}`);
        console.error(`Code: ${errorValue.code || 'N/A'}`);
        console.error(`Signal: ${errorValue.signal || 'N/A'}`);
        console.error(`STDOUT: ${standardOutput.trim().substring(0, 200)}`); // Limit output for brevity
        console.error(`STDERR: ${standardError.trim().substring(0, 200)}`);
        console.error(`-------------------------\n`);
      }
      callback(errorValue, standardOutput, standardError);
    });
    return processHandle;
  };

  // Test Case 1: Verifies processing from an input file and writing to a specified output file.
  const fileToFileOutputPath = "cli.output--io";
  executeCliCommand(`${cliToolPath} test/fixtures/cli.css test/fixtures/${fileToFileOutputPath}.css`, {}, (commandError) => {
    check.notOk(commandError, "No execution errors expected for file-to-file processing.");
    if (commandError) return; // Guard clause to prevent subsequent checks if command failed

    try {
      const processedContent = testHelpers.readFixture(fileToFileOutputPath);
      check.strictEqual(processedContent, anticipatedResult, "Content from file-to-file processing should match the anticipated result.");
    } finally {
      // Ensure cleanup happens even if assertions fail
      testHelpers.cleanUpFile(fileToFileOutputPath);
    }
  });
  totalExpectedChecks++;

  // Test Case 2: Checks processing from an input file and directing the output to standard output.
  executeCliCommand(`${cliToolPath} test/fixtures/cli.css`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "Expected no errors when processing from file to standard output.");
    if (commandError) return;
    check.strictEqual(standardOutput, anticipatedResult, "Standard output content should accurately reflect processing from a file.");
  });
  totalExpectedChecks++;

  // Test Case 3: Confirms the CLI tool can receive input via standard input and write to standard output.
  const stdinToStdoutProcess = executeCliCommand(cliToolPath, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "Processing data piped via standard input should not result in errors.");
    if (commandError) return;
    check.strictEqual(standardOutput, anticipatedResult, "Output from standard input processing should match the expected content.");
  });
  stdinToStdoutProcess.stdin.write(Buffer.from(sourceDataContent)); // Modern way to create a Buffer
  stdinToStdoutProcess.stdin.end();
  totalExpectedChecks++;

  // Test Case 4: Ensures proper error handling when the specified input file does not exist.
  executeCliCommand(`${cliToolPath} test/fixtures/cli.dont-exist.css`, {}, (commandError, standardOutput, standardError) => {
    check.ok(commandError && commandError.code === 1, "An exit code of 1 is expected when the input file is missing or unreadable.");
    check.ok(testHelpers.contains(standardError, "Unable to read file"), "The error message should clearly indicate an inability to read the file.");
  });
  totalExpectedChecks += 2;

  // Test Case 5: Verifies that internal processing errors are caught and reported correctly.
  executeCliCommand(`${cliToolPath} test/fixtures/cli.error.css`, {}, (commandError, standardOutput, standardError) => {
    check.ok(commandError && commandError.code === 2, "An exit code of 2 should be returned for internal processing failures.");
    check.ok(testHelpers.contains(standardError, "encounters an error"), "The standard error stream should contain a general error notification.");
    check.ok(testHelpers.contains(standardError, "If this error looks like a bug, please report it here"), "Error output should guide users on reporting potential bugs.");
  });
  totalExpectedChecks += 3;

  // Test Case 6: Validates the `--config` option for loading custom configuration settings.
  executeCliCommand(`${cliToolPath} --config test/fixtures/config.json test/fixtures/config.css`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "Loading configuration from a JSON file should proceed without errors.");
    if (commandError) return;
    check.strictEqual(standardOutput, testHelpers.readFixture("config.expected"), "Output should reflect the styles transformed according to the loaded configuration.");
  });
  totalExpectedChecks++;

  // Test Case 7: Tests the `--browsers` option for applying browser-specific transformations.
  const customPropertyTestSnippet = ":root{--foo:bar}baz{qux:var(--foo)}"; // Renamed 'noCustomPropInput'
  const browserSpecificTransformation = executeCliCommand(`${cliToolPath} --browsers "Firefox >= 31"`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "The --browsers option should not introduce execution errors.");
    if (commandError) return;
    check.strictEqual(standardOutput, customPropertyTestSnippet, "Output should remain unchanged when browser compatibility settings prevent custom property transformation.");
  });
  browserSpecificTransformation.stdin.write(Buffer.from(customPropertyTestSnippet));
  browserSpecificTransformation.stdin.end();
  totalExpectedChecks++;

  // Test Case 8: Checks the `--verbose` option for displaying detailed processing logs.
  const verboseOutputTarget = "cli.output--verbose";
  executeCliCommand(`${cliToolPath} --verbose test/fixtures/cli.css test/fixtures/${verboseOutputTarget}.css`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "Verbose logging mode should not cause command failures.");
    if (commandError) return;
    check.ok(testHelpers.contains(standardOutput, "Output written"), "Verbose output should confirm the successful writing of the processed file.");
    testHelpers.cleanUpFile(verboseOutputTarget);
  });
  totalExpectedChecks++;

  // Test Case 9: Ensures `--no-import` prevents the processing of CSS `@import` rules.
  executeCliCommand(`${cliToolPath} --no-import test/fixtures/import.css`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "Disabling import processing should not lead to errors.");
    if (commandError) return;
    check.strictEqual(standardOutput, testHelpers.readFixture("import"), "Output should not include content from imported files when --no-import is active.");
  });
  totalExpectedChecks++;

  // Test Case 10: Validates `--no-url` prevents adjustment of relative URLs in the output.
  executeCliCommand(`${cliToolPath} --no-url test/fixtures/url.css`, { cwd: process.cwd() }, (commandError, standardOutput) => {
    check.notOk(commandError, "The --no-url option should function without errors.");
    if (commandError) return;
    check.strictEqual(standardOutput, testHelpers.readFixture("url/dep"), "URLs in the output should remain in their original form when --no-url is specified.");
  });
  totalExpectedChecks++;

  // Test Case 11: Confirms the `--compress` option effectively minifies the CSS output.
  executeCliCommand(`${cliToolPath} --compress test/fixtures/compress.css`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "CSS compression should execute without errors.");
    if (commandError) return;
    check.strictEqual(standardOutput, testHelpers.readFixture("compress.default.expected").trim(), "The output CSS should be compressed as expected by the --compress option.");
  });
  totalExpectedChecks++;

  // Test Case 12: Asserts that `--sourcemap` correctly embeds or generates source map information.
  executeCliCommand(`${cliToolPath} --sourcemap test/fixtures/sourcemap.css`, {}, (commandError, standardOutput) => {
    check.notOk(commandError, "Sourcemap generation should be an error-free process.");
    if (commandError) return;
    check.strictEqual(standardOutput, testHelpers.readFixture("sourcemap.expected").trim(), "Output should contain the expected sourcemap data when --sourcemap is enabled.");
  });
  totalExpectedChecks++;

  // Test Case 13: Iterates through all features to ensure they can be individually disabled.
  const convertToLowerSpace = require("to-space-case"); // Renamed 'toSpace'
  const convertToKebabCase = require("to-slug-case"); // Renamed 'toSlug'

  const supportedFeatures = Object.keys(styleTransformer.features); // Renamed 'features'
  // Construct a single flag string to disable every known feature
  const disableAllFeaturesFlag = "--no-" + supportedFeatures.map((currentFeature) => convertToKebabCase(currentFeature)).join(" --no-"); // Renamed 'no', 'feature', 'slug'

  for (const currentFeature of supportedFeatures) { // Changed forEach to for...of loop
    const featureSlugIdentifier = convertToKebabCase(currentFeature); // Renamed 'slug'
    const expectedFeatureResult = testHelpers.readFixture(`features/${featureSlugIdentifier}`);
    executeCliCommand(`${cliToolPath} ${disableAllFeaturesFlag} test/fixtures/features/${featureSlugIdentifier}.css`, {}, (commandError, standardOutput) => {
      check.notOk(commandError, `Disabling all features, including '${convertToLowerSpace(currentFeature)}', should not generate errors.`);
      if (commandError) return;
      check.strictEqual(standardOutput, expectedFeatureResult, `The input for the '${convertToLowerSpace(currentFeature)}' fixture should be identical to its output when all features are disabled.`);
    });
    totalExpectedChecks++;
  }

  // Test Case 14: Verifies that the `--watch` option mandates both input and output paths.
  executeCliCommand(`${cliToolPath} --watch`, {}, (commandError, standardOutput, standardError) => {
    check.ok(commandError && commandError.code === 3, "Using --watch without input/output paths should result in an exit code 3.");
    check.ok(testHelpers.contains(standardError, "--watch option need"), "Error message should clearly state the necessity of input and output for --watch.");
  });
  totalExpectedChecks += 2;

  // Test Case 15: Ensures `--watch` requires an output path even if an input path is provided.
  executeCliCommand(`${cliToolPath} --watch test/fixtures/cli.css`, {}, (commandError, standardOutput, standardError) => {
    check.ok(commandError && commandError.code === 3, "Providing only an input path with --watch should also yield an exit code 3.");
    check.ok(testHelpers.contains(standardError, "--watch option need"), "Error message should reiterate the requirement for an output path with --watch.");
  });
  totalExpectedChecks += 2;

  // Test Case 16: Advanced `--watch` functionality tests, including import tracking.
  // This section is conditionally executed, often skipped in CI environments due to
  // complexities with process management and timing-sensitive file system operations.
  const inContinuousIntegration = process.env.TRAVIS || process.env.APPVEYOR;
  if (!inContinuousIntegration) {
    const watchErrorSourceFile = "test/fixtures/cli.error.css";
    const watchErrorDestinationFile = "test/fixtures/cli.output--watch.css";
    const continuousWatcherProcess = executeCliCommand(`${cliToolPath} --watch ${watchErrorSourceFile} ${watchErrorDestinationFile}`, {}, (watchingError) => {
      check.ok(watchingError && watchingError.signal === "SIGTERM", "The continuous watcher process should be terminated by a SIGTERM signal.");
      if (watchingError && !watchingError.killed) {
        // Only rethrow if the process was not killed by our test, indicating an unexpected termination
        throw watchingError;
      }
    });

    const watchErrorMonitoringMessage = "The watcher should continuously report error messages during file monitoring.";
    const watchTimeoutHandle = setTimeout(() => {
      check.fail(watchErrorMonitoringMessage); // Fail if the expected error output is not observed in time
      continuousWatcherProcess.kill(); // Ensure process is terminated
    }, 5000); // Increased timeout for robustness

    continuousWatcherProcess.stderr.on("data", (dataBuffer) => {
      const receivedData = dataBuffer.toString(); // Convert Buffer to string for comparison
      if (testHelpers.contains(receivedData, "encounters an error")) {
        check.pass(watchErrorMonitoringMessage); // Pass if the specific error message is detected
        clearTimeout(watchTimeoutHandle);
        continuousWatcherProcess.kill(); // Terminate the watcher process
      }
    });
    totalExpectedChecks += 2;

    // Sub-tests focusing on watch mode with `@import` rules and dynamic file changes
    const importWatcherOutputTarget = "test/fixtures/cli.output--watch-import.css";
    const primaryWatchImportFile = "test/fixtures/cli.watch-import.css";
    const dynamicallyImportedFile = "test/fixtures/cli.watch-import-import.css";

    const importMonitoringProcess = executeCliCommand(`${cliToolPath} --watch ${primaryWatchImportFile} ${importWatcherOutputTarget}`, {}, (importWatchProcessError) => {
      if (importWatchProcessError && !importWatchProcessError.killed) {
        throw importWatchProcessError;
      }
    });

    // Step 1: Initial file write to trigger the watcher and include an import
    try {
      fileSystemAccess.writeFileSync(primaryWatchImportFile, "/* initial base content */ @import 'cli.watch-import-import.css';");
    } catch (writeErr) {
      check.fail(`Failed to write initial primary watch import file: ${writeErr.message}`);
      importMonitoringProcess.kill();
      return;
    }

    // Delay to allow the watcher to process the initial file change
    setTimeout(() => {
      try {
        const currentOutputContent = fileSystemAccess.readFileSync(importWatcherOutputTarget, { encoding: "utf8" });
        check.strictEqual(currentOutputContent, "/* initial base content */ watch{}", "Watcher should update output file after the first modification.");

        // Step 2: Modify the primary file to remove the import statement
        fileSystemAccess.writeFileSync(primaryWatchImportFile, "/* updated base content */");

        // Delay for the watcher to process the second change (import removal)
        setTimeout(() => {
          const updatedOutputContent = fileSystemAccess.readFileSync(importWatcherOutputTarget, { encoding: "utf8" });
          check.strictEqual(updatedOutputContent, "/* updated base content */", "Watcher should update output file again after import statement removal.");

          // Step 3: Record the modification time of the output file
          const initialOutputStats = fileSystemAccess.statSync(importWatcherOutputTarget);
          setTimeout(() => {
            // Step 4: Touch the previously imported file (which should no longer be watched)
            const currentTime = new Date();
            fileSystemAccess.utimesSync(dynamicallyImportedFile, currentTime, currentTime);

            // Delay to ensure the watcher has ample time to *not* react
            setTimeout(() => {
              const finalOutputStats = fileSystemAccess.statSync(importWatcherOutputTarget);
              check.strictEqual(initialOutputStats.mtime.getTime(), finalOutputStats.mtime.getTime(), "Output file's modification time should not change if a no-longer-imported file is modified.");

              // Final cleanup
              testHelpers.cleanUpFile(importWatcherOutputTarget);
              testHelpers.cleanUpFile(primaryWatchImportFile); // Clean up the temporary source file
              importMonitoringProcess.kill();
            }, 2000); // Sufficient delay for non-reaction check
          }, 2000); // Delay before touching the no-longer-watched file
        }, 2000); // Delay for second watch update
      } catch (fileOpError) {
        check.fail(`Error encountered during watch/import sequence: ${fileOpError.message}`);
        importMonitoringProcess.kill();
        testHelpers.cleanUpFile(importWatcherOutputTarget);
        testHelpers.cleanUpFile(primaryWatchImportFile);
      }
    }, 4000); // Initial delay for watcher to become active and process first change

    totalExpectedChecks += 3; // Three specific checks for the watch/import scenario
  } else {
    // Informative message for skipped tests in CI environments
    console.log("Skipping complex and timing-sensitive --watch tests on detected CI environment.");
  }

  // Final assertion to ensure all planned checks were executed
  check.plan(totalExpectedChecks);
});