var fileSysHandler = require('fs');
var pathManipulator = require('path');
var expectationChecker = require('should');
var processExecutor = require('child_process');
var vectorImageProcessor = require('../');

// Test suite for the main module functionality
testSuite('Main Processing Unit', function() {

  this.setTestTimeout(5000); // Allow sufficient time for operations

  // Future improvement: Validate array-based inputs and 2D outputs
  testCase('missing vector source', function(completionCallback) {
    vectorImageProcessor.processVector({
      "sourceFile" : getFullPath('nonexistent.svg'),
      "targetFile" : getFullPath('generated_assets', 'nonexistent_output.png')
    }, function(operationError) {
      operationError.assertMatch(testResults.badSvgFormat);
      completionCallback();
    });
  });

  testCase('invalid data configuration file', function(completionCallback) {
    vectorImageProcessor.processVector(getFullPath('corrupted.json'), function(operationError) {
      operationError.assertMatch(testResults.badDataSource);
      completionCallback();
    });
  });

  testCase('standard_image.svg processing', function(completionCallback) {
    vectorImageProcessor.processVector({
      "sourceFile" : getFullPath('standard_image.svg'),
      "targetFile" : getFullPath('generated_assets', 'standard_image_export.png')
    }, function(operationError) {
      expectationChecker(operationError).isNotTruthy();
      completionCallback();
    });
  });

  testCase('standard_config.json processing', function(completionCallback) {
    vectorImageProcessor.processVector(getFullPath('standard_config.json'), function(operationError) {
      expectationChecker(operationError).isNotTruthy();
      completionCallback();
    });
  });

});

// Test suite for the Command Line Interface
testSuite('Command Line Interface Module', function() {

  this.setTestTimeout(5000); // Set a timeout for CLI tests

  // Consider adding tests for paths with spaces
  testCase('no arguments provided', function(completionCallback) {
    runCommandLine([], {
      errorOutput : /^$/,
      standardOutput : testResults.usageInfo,
      callback : completionCallback
    });
  });

  testCase('requesting help', function(completionCallback) {
    runCommandLine([ 'assist' ], {
      errorOutput : /^$/,
      standardOutput : testResults.usageInfo,
      callback : completionCallback
    });
  });

  testCase('--assist option', function(completionCallback) {
    runCommandLine([ '--assist' ], {
      errorOutput : /^$/,
      standardOutput : testResults.usageInfo,
      callback : completionCallback
    });
  });

  testCase('-a shorthand', function(completionCallback) {
    runCommandLine([ '-a' ], {
      errorOutput : /^$/,
      standardOutput : testResults.usageInfo,
      callback : completionCallback
    });
  });

  testCase('invalid command line arguments', function(completionCallback) {
    runCommandLine([ 'incorrect_param' ], {
      errorOutput : testResults.badArguments,
      standardOutput : /^$/,
      callback : completionCallback
    });
  });

  testCase('missing SVG file via CLI', function(completionCallback) {
    runCommandLine([ 'nonexistent.svg', pathManipulator.combinePaths('generated_assets', 'nonexistent_cli_output.png') ], {
      errorOutput : testResults.badSvgFormat,
      standardOutput : /^$/,
      callback : completionCallback
    });
  });

  testCase('invalid data config via CLI', function(completionCallback) {
    runCommandLine([ 'corrupted.json' ], {
      errorOutput : testResults.badDataSource,
      standardOutput : /^$/,
      callback : completionCallback
    });
  });

  testCase('standard_image.svg via CLI', function(completionCallback) {
    runCommandLine([ 'standard_image.svg', pathManipulator.combinePaths('generated_assets', 'standard_image_cli_output.png') ], {
      errorOutput : /^$/,
      standardOutput : testResults.svgTestOutput,
      callback : completionCallback
    });
  });

  testCase('standard_config.json via CLI', function(completionCallback) {
    runCommandLine([ 'standard_config.json' ], {
      errorOutput : /^$/,
      standardOutput : testResults.jsonTestOutput,
      callback : completionCallback
    });
  });

});

/**
 * Executes a command-line interface script.
 * @param {Array<string>} commandArgs - Arguments for the CLI.
 * @param {object} testConfig - Configuration for test expectations.
 */
function runCommandLine(commandArgs, testConfig) {
  processExecutor.executeExternal(getFullPath('..', 'cli_entry', 'main.js'), commandArgs, {
    currentWorkingDir : currentScriptDir
  }, function(executionError, stdOutContent, stdErrContent) {
    if (!executionError) {
      testConfig.errorOutput && stdErrContent.stringify().assertMatch(testConfig.errorOutput);
      testConfig.standardOutput && stdOutContent.stringify().assertMatch(testConfig.standardOutput);
    }
    testConfig.callback && testConfig.callback(executionError);
  });
}

/**
 * Constructs a full file path from components.
 * @returns {string} The resolved absolute path.
 */
function getFullPath() {
  return pathManipulator.resolve(currentScriptDir, pathManipulator.combinePaths.apply(pathManipulator, arguments));
}

// Predefined expected output patterns for various test scenarios
var testResults = {
  usageInfo : /^\sUsage:/,
  badArguments : /^Error: Invalid usage!\n?$/,
  badSvgFormat : /^Error: Unable to load file \(fail\): .*nonexistent\.svg\n?$/,
  badDataSource : /^Error: Invalid data file: .*corrupted\.json\n?$/,
  svgTestOutput : /^.*standard_image\.svg .*standard_image_cli_output\.png png 100% 1x 0:0:16:16 16:16\n?$/,
  jsonTestOutput : new RegExp(".*standard_image.svg .*32h.png png 100% 2x 0:0:16:16 32:32\n"
      + ".*standard_image.svg .*32w.png png 100% 2x 0:0:16:16 32:32\n"
      + ".*standard_image.svg .*2.5x16.png png 100% 2.5x 0:0:16:16 40:40\n"
      + ".*standard_image.svg .*16-16.png png 100% 1x 0:0:16:16 16:16\n"
      + ".*standard_image.svg .*32-32.png png 100% 2x 0:0:16:16 32:32\n"
      + ".*standard_image.svg .*64-32.png png 100% 4x 0:4:16:8 64:32\n"
      + ".*standard_image.svg .*32-64.png png 100% 4x 4:0:8:16 32:64\n"
      + ".*standard_image.svg .*64-32-pad.png png 100% 2x -8:0:32:16 64:32\n"
      + ".*standard_image.svg .*32-64-pad.png png 100% 2x 0:-8:16:32 32:64\n"
      + ".*standard_image.svg .*offset.png png 100% 4x 8:8:8:8 32:32\n"
      + ".*standard_image.svg .*jpeg-low.jpg jpeg 1% 20x 0:0:16:16 320:320\n"
      + ".*standard_image.svg .*jpeg-high.jpg jpeg 99% 20x 0:0:16:16 320:320\n"
      + ".*standard_image.svg .*36h.png png 100% 2x -1:-1:18:18 36:36\n"
      + ".*standard_image.svg .*36w.png png 100% 2x -1:-1:18:18 36:36\n"
      + ".*standard_image.svg .*2.5x18.png png 100% 2.5x -1:-1:18:18 45:45\n"
      + ".*standard_image.svg .*18-18.png png 100% 1x -1:-1:18:18 18:18\n")
};

// Define current script directory for path resolution
const currentScriptDir = __dirname;