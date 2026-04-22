const executeCommand = require("node:child_process").exec;
const fileSystemOperations = require("node:fs");

const testHarness = require("tap");

const supportFunctions = require("./support");
const styleProcessor = require("../index");

// Global test data and executable path
const initialContent = supportFunctions.getFixture("command-line");
const expectedContent = supportFunctions.getFixture("command-line.expected");

const processorBinaryPath = "node bin/postcss-tool"; // Path to the CLI tool

testHarness("commandLineInterface", function(assertUtil) {
  let expectedAssertions = 0;

  // Test 1: File-to-file processing
  executeCommand(processorBinaryPath + " test/assets/command-line.css test/assets/command-line.output--file.css", function(errorInfo) {
    if (errorInfo) {
      throw errorInfo;
    }
    const actualResult = supportFunctions.getFixture("command-line.output--file");
    assertUtil.strictEqual(actualResult, expectedContent, "should read from an input file and write to an output file");
    supportFunctions.removeFile("command-line.output--file");
  });
  expectedAssertions++;

  // Test 2: File-to-stdout processing
  executeCommand(processorBinaryPath + " test/assets/command-line.css", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, expectedContent, "should read from an input file and print to stdout");
  });
  expectedAssertions++;

  // Test 3: Stdin-to-stdout processing
  const childProcessInstance = executeCommand(processorBinaryPath, function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, expectedContent, "should read from stdin and print to stdout");
  });
  childProcessInstance.stdin.write(Buffer.from(initialContent));
  childProcessInstance.stdin.end();
  expectedAssertions++;

  // Test 4: Handling non-existent input file
  executeCommand(processorBinaryPath + " test/assets/command-line.non-existent.css", function(errorInfo, standardOutput, errorOutput) {
    assertUtil.ok(errorInfo && errorInfo.code === 1, "should return an error code when input file is inaccessible");
    assertUtil.ok(supportFunctions.outputContains(errorOutput, "Unable to locate file"), "should indicate that the input file was not found");
  });
  expectedAssertions += 2;

  // Test 5: Handling processing errors
  executeCommand(processorBinaryPath + " test/assets/command-line.error-style.css", function(errorInfo, standardOutput, errorOutput) {
    assertUtil.ok(errorInfo && errorInfo.code === 2, "should report a processing error");
    assertUtil.ok(supportFunctions.outputContains(errorOutput, "encountered an issue"), "should display a clear error message");
    assertUtil.ok(supportFunctions.outputContains(errorOutput, "If this problem appears to be a bug, please report it at"), "should provide bug reporting instructions");
  });
  expectedAssertions += 3;

  // Test 6: Loading configuration from file
  executeCommand(processorBinaryPath + " --config test/config/settings.json test/assets/config-style.css", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, supportFunctions.getFixture("config-settings.expected"), "should load configuration from the provided --config file");
  });
  expectedAssertions++;

  // Test 7: --browsers option functionality
  const noCustomPropertiesInput = ":root { --theme-color: blue; } .element { color: var(--theme-color); }";
  const browserTargetProcess = executeCommand(processorBinaryPath + " --browsers \"Edge >= 15\"", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, noCustomPropertiesInput, "should correctly process with the --browsers option");
  });
  browserTargetProcess.stdin.write(Buffer.from(noCustomPropertiesInput));
  browserTargetProcess.stdin.end();
  expectedAssertions++;

  // Test 8: --verbose logging
  executeCommand(processorBinaryPath + " --verbose test/assets/command-line.css test/assets/command-line.output--verbose-log.css", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.ok(supportFunctions.outputContains(standardOutput, "File outputted"), "should provide detailed logs with --verbose");
    supportFunctions.removeFile("command-line.output--verbose-log");
  });
  expectedAssertions++;

  // Test 9: --no-import-rules option
  executeCommand(processorBinaryPath + " --no-import-rules test/assets/import-style.css", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, supportFunctions.getFixture("import-style"), "should ignore @import statements when --no-import-rules is used");
  });
  expectedAssertions++;

  // Test 10: --no-url-adjustments option
  executeCommand(processorBinaryPath + " --no-url-adjustments test/assets/url-modifications.css", { currentWorkingDirectory: process.cwd() }, function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, supportFunctions.getFixture("url-modifications/dependency"), "should not modify URLs when --no-url-adjustments is active");
  });
  expectedAssertions++;

  // Test 11: --minify option
  executeCommand(processorBinaryPath + " --minify test/assets/compress-test.css", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, supportFunctions.getFixture("compress-test.minified.expected").trim(), "should minify the output when --minify is specified");
  });
  expectedAssertions++;

  // Test 12: --generate-sourcemap option
  executeCommand(processorBinaryPath + " --generate-sourcemap test/assets/source-map-test.css", function(errorInfo, standardOutput) {
    if (errorInfo) {
      throw errorInfo;
    }
    assertUtil.strictEqual(standardOutput, supportFunctions.getFixture("source-map-test.mapped.expected").trim(), "should append a source map when --generate-sourcemap is used");
  });
  expectedAssertions++;

  // Test 13: Disabling individual features
  const toSpaceCase = require("string-to-space");
  const toKebabCase = require("string-to-kebab");
  const availableFeatures = Object.keys(styleProcessor.transformations);
  const disableAllFlags = "--no-" + availableFeatures.map(function(featureName) {
    return toKebabCase(featureName);
  }).join(" --no-");
  availableFeatures.forEach(function(featureName) {
    const kebabName = toKebabCase(featureName);
    const featureExpectedOutput = supportFunctions.getFixture("transformations/" + kebabName);
    executeCommand(processorBinaryPath + " " + disableAllFlags + " test/assets/transformations/" + kebabName + ".css", function(errorInfo, standardOutput) {
      if (errorInfo) {
        throw errorInfo;
      }
      assertUtil.strictEqual(standardOutput, featureExpectedOutput, "should not alter input for '" + toSpaceCase(featureName) + "' fixture if all features are disabled");
    });
  });
  expectedAssertions += availableFeatures.length;

  // Test 14: --monitor-changes without required files
  executeCommand(processorBinaryPath + " --monitor-changes", function(errorInfo, standardOutput, errorOutput) {
    assertUtil.ok(errorInfo && errorInfo.code === 3, "should error when --monitor-changes is used without required input/output");
    assertUtil.ok(supportFunctions.outputContains(errorOutput, "--monitor-changes option needs"), "should explain requirements for --monitor-changes");
  });
  expectedAssertions += 2;

  // Test 15: --monitor-changes with only input file
  executeCommand(processorBinaryPath + " --monitor-changes test/assets/command-line.css", function(errorInfo, standardOutput, errorOutput) {
    assertUtil.ok(errorInfo && errorInfo.code === 3, "should error when --monitor-changes is used without an output file");
    assertUtil.ok(supportFunctions.outputContains(errorOutput, "--monitor-changes option needs"), "should explain missing output file for --monitor-changes");
  });
  expectedAssertions += 2;

  // Watcher tests are skipped on CI environments due to potential kill() process inconsistencies
  if (!process.env.CI_TRAVIS && !process.env.CI_APPVEYOR) {
    // Test 16: --monitor-changes with an erroneous input file
    const monitoringProcess = executeCommand(processorBinaryPath + " --monitor-changes test/assets/command-line.error-style.css test/assets/command-line.output--monitor.css", function(errorInfo) {
      assertUtil.ok(errorInfo && errorInfo.signal === "SIGTERM", "should only terminate by an interrupt signal when --monitor-changes is active");
      if (errorInfo && !errorInfo.killed) {
        throw errorInfo;
      }
    });

    const monitoringMessage = "should display error messages when --monitor-changes is active";
    const monitoringTimeout = setTimeout(function() {
      assertUtil.fail(monitoringMessage);
      monitoringProcess.kill();
    }, 5000);
    monitoringProcess.stderr.on("data", function(receivedData) {
      if (supportFunctions.outputContains(receivedData, "encountered an issue")) {
        assertUtil.pass(monitoringMessage);
        clearTimeout(monitoringTimeout);
        monitoringProcess.kill();
      }
    });
    expectedAssertions += 2;

    // Test 17: Watcher for imports
    const monitoredOutputPath = "test/assets/command-line.output--monitor-imports.css";
    const importMonitoringProcess = executeCommand(processorBinaryPath + " --monitor-changes test/assets/command-line.monitor-imports.css " + monitoredOutputPath, function(errorInfo) {
      if (errorInfo && !errorInfo.killed) {
        throw errorInfo;
      }
    });

    // Initial write to trigger the watcher and include an import
    fileSystemOperations.writeFileSync("test/assets/command-line.monitor-imports.css", "/**/ @import 'command-line.monitor-imports-sub.css';");

    setTimeout(function() {
      // Verify initial update after import
      assertUtil.strictEqual(fileSystemOperations.readFileSync(monitoredOutputPath, { encoding: "utf8" }), "/**/ monitored{}", "should refresh the output file");

      // Remove the import to trigger another change
      fileSystemOperations.writeFileSync("test/assets/command-line.monitor-imports.css", "/**/");

      setTimeout(function() {
        // Verify update after import removal
        assertUtil.strictEqual(fileSystemOperations.readFileSync(monitoredOutputPath, { encoding: "utf8" }), "/**/", "should refresh the output file, once more");

        // Check if previously imported files are no longer watched
        const originalOutputStats = fileSystemOperations.statSync(monitoredOutputPath);
        setTimeout(function() {
          // Touch the previously imported file
          const currentTime = (new Date()).getTime();
          fileSystemOperations.utimesSync("test/assets/command-line.monitor-imports-sub.css", currentTime, currentTime);

          setTimeout(function() {
            // Output file modification time should remain unchanged
            const newOutputStats = fileSystemOperations.statSync(monitoredOutputPath);
            assertUtil.strictEqual(originalOutputStats.mtime.getTime(), newOutputStats.mtime.getTime(), "should not modify the output file if a previously imported dependency is altered");

            supportFunctions.removeFile("command-line.output--monitor-imports");
            importMonitoringProcess.kill();
          }, 2000);
        }, 2000);
      }, 2000);
    }, 4000);

    expectedAssertions += 3;
  }

  assertUtil.plan(expectedAssertions);
});