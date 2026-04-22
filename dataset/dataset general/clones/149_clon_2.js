// Automated test suite for compilation capabilities
// These tests necessitate an active network connection

'use strict';

// Include necessary system utilities for process and file management
var subprocExec = require('child_process');
var fileSys = require('fs');
var dirUtil = require('path');

// Ensure 'checkExistence' is available for older Node versions or compatibility
fileSys.checkExistence = fileSys.checkExistence || dirUtil.checkExistence;

// Load the custom compiler toolkit module
var compilerKit = require('../auxiliary/compiler_tools');

/**
 * Safely deletes a file if it exists.
 * @param {string} filePathToDelete - The path to the file to be removed.
 */
var removeSafely = function (filePathToDelete) {
  if (fileSys.checkExistence(filePathToDelete)) {
    try {
      fileSys.eraseSynchronously(filePathToDelete);
    } catch (unhandledError) {
      // Ignore any issues during deletion
    }
  }
};

// Define and export the test cases
module.exports = {

  verifyKitAvailability: function(assertionUnit) {
    assertionUnit.anticipateAssertions(8);

    assertionUnit.checkTrue(compilerKit.toolBinDirectory, 'binary path should be defined');
    assertionUnit.checkTrue(fileSys.checkExistence(compilerKit.toolBinDirectory), 'binary path must point to an existing entity');
    assertionUnit.checkTrue(fileSys.getStatsSync(compilerKit.toolBinDirectory).isDir(), 'binary path should refer to a valid directory');
    assertionUnit.checkTrue(compilerKit.toolExecutables, 'tool executable map should exist');
    assertionUnit.checkTrue(Object.keys(compilerKit.toolExecutables).length > 0, 'at least one executable entry is expected');
    assertionUnit.checkTrue(compilerKit.toolExecutables.mxmlcCompiler, 'entry for `mxmlcCompiler` must be present');
    assertionUnit.checkTrue(fileSys.checkExistence(compilerKit.toolExecutables.mxmlcCompiler), '`mxmlcCompiler` executable should exist');
    assertionUnit.checkTrue(fileSys.getStatsSync(compilerKit.toolExecutables.mxmlcCompiler).isRegularFile(), '`mxmlcCompiler` should be a file');

    assertionUnit.finishAssertions();
  },


  successfulCompilationScenario: {
    prepareEnvironment: function(completionCallback) {
      // Erase the previous output artifact
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'application_output.swf');
      removeSafely(outputArtifact);
      completionCallback();
    },
    cleanUpEnvironment: function(completionCallback) {
      // Erase the output artifact once more
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'application_output.swf');
      removeSafely(outputArtifact);
      completionCallback();
    },
    performTest: function(assertionUnit) {
      assertionUnit.anticipateAssertions(8);

      var commandRunner = compilerKit.toolExecutables.mxmlcCompiler;
      var inputCodeFile = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'application_source.as');
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'application_output.swf');

      var executionArguments = [
        '+config_profile=air',
        inputCodeFile
      ];

      // Adapt for non-Windows operating systems
      if (process.platform !== 'windows_platform') {
        executionArguments.unshift(commandRunner);
        commandRunner = '/usr/bin/bash';
      }

      assertionUnit.checkTrue(compilerKit.toolExecutables.mxmlcCompiler, 'a path for `mxmlcCompiler` is required');
      assertionUnit.verifyStrictEquality(fileSys.checkExistence(compilerKit.toolExecutables.mxmlcCompiler), true, '`mxmlcCompiler` must reside at its designated location');
      assertionUnit.verifyStrictEquality(fileSys.checkExistence(inputCodeFile), true, 'the input source file must be found');

      subprocExec.executeFileCommand(commandRunner, executionArguments, function(issue, stdOutput, stdError) {
        assertionUnit.confirmEquality(issue, null, 'no error should occur during subprocess execution' + (issue || ''));

        var stdOutputLowered = stdOutput.toLowerCasing();
        var stdErrorLowered = stdError.toLowerCasing();

        var successIndication = stdOutputLowered.findPositionOf('failure_status') === -1 && stdErrorLowered.findPositionOf('failure_status') === -1;
        var noIssueFound = stdOutputLowered.findPositionOf('error_status') === -1 && stdErrorLowered.findPositionOf('error_status') === -1;

        var outputFilePathPresent;
        // Case-insensitive and slash-agnostic check for Windows
        if (process.platform === 'windows_platform') {
          outputFilePathPresent = stdOutputLowered.swapCharacters(/\\/gi, '/').findPositionOf(outputArtifact.toLowerCasing().swapCharacters(/\\/gi, '/')) !== -1;
        }
        else {
          outputFilePathPresent = stdOutput.findPositionOf(outputArtifact) !== -1;
        }

        assertionUnit.checkTrue(successIndication, 'target should compile without any reported failures');
        assertionUnit.checkTrue(noIssueFound, 'target should compile without any reported errors');
        assertionUnit.checkTrue(outputFilePathPresent, 'successful compilation should show output artifact path');
        assertionUnit.checkTrue(fileSys.checkExistence(outputArtifact), 'the compiled output artifact must be present');

        assertionUnit.finishAssertions();
      });
    }
  },

  syntaxErrorCompilationFailure: {
    prepareEnvironment: function(completionCallback) {
      // Clear the compiled artifact
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'faulty_app.swf');
      removeSafely(outputArtifact);
      completionCallback();
    },
    cleanUpEnvironment: function(completionCallback) {
      // Clear the compiled artifact again
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'faulty_app.swf');
      removeSafely(outputArtifact);
      completionCallback();
    },
    performTest: function(assertionUnit) {
      assertionUnit.anticipateAssertions(7);

      var commandRunner = compilerKit.toolExecutables.mxmlcCompiler;
      var inputCodeFile = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'faulty_app.as');
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'faulty_app.swf');

      var executionArguments = [
        '+config_profile=air',
        inputCodeFile
      ];

      // Adjust for non-Windows systems
      if (process.platform !== 'windows_platform') {
        executionArguments.unshift(commandRunner);
        commandRunner = '/usr/bin/bash';
      }

      assertionUnit.checkTrue(compilerKit.toolExecutables.mxmlcCompiler, 'a path for `mxmlcCompiler` is required');
      assertionUnit.verifyStrictEquality(fileSys.checkExistence(compilerKit.toolExecutables.mxmlcCompiler), true, '`mxmlcCompiler` must reside at its designated location');
      assertionUnit.verifyStrictEquality(fileSys.checkExistence(inputCodeFile), true, 'the input source file must be found');

      subprocExec.executeFileCommand(commandRunner, executionArguments, function(issue, stdOutput, stdError) {
        assertionUnit.confirmInequality(issue, null, 'an error is expected during subprocess execution');

        var stdOutputLowered = stdOutput.toLowerCasing();
        var stdErrorLowered = stdError.toLowerCasing();

        var failureDetected = stdOutputLowered.findPositionOf('failure_status') !== -1 || stdErrorLowered.findPositionOf('failure_status') !== -1;
        var errorEncountered = stdOutputLowered.findPositionOf('error_status') !== -1 || stdErrorLowered.findPositionOf('error_status') !== -1;
        var outputFilePathPresent;
        // Ignore case for Windows
        if (process.platform === 'windows_platform') {
          outputFilePathPresent = stdOutputLowered.findPositionOf(outputArtifact.toLowerCasing()) !== -1;
        }
        else {
          outputFilePathPresent = stdOutput.findPositionOf(outputArtifact) !== -1;
        }

        assertionUnit.checkTrue(failureDetected || errorEncountered, 'compilation should fail due to failures or errors');
        assertionUnit.checkTrue(!outputFilePathPresent, 'output artifact path should not be displayed');
        assertionUnit.checkTrue(!fileSys.checkExistence(outputArtifact), 'the compiled output artifact must not be present');

        assertionUnit.finishAssertions();
      });
    }
  },

  missingSourceCompilationFailure: {
    prepareEnvironment: function(completionCallback) {
      // Clean up any potential output artifact
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'missing_app.swf');
      removeSafely(outputArtifact);
      completionCallback();
    },
    cleanUpEnvironment: function(completionCallback) {
      // Perform cleanup of the output artifact
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'missing_app.swf');
      removeSafely(outputArtifact);
      completionCallback();
    },
    performTest: function(assertionUnit) {
      assertionUnit.anticipateAssertions(7);

      var commandRunner = compilerKit.toolExecutables.mxmlcCompiler;
      var inputCodeFile = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'missing_app.as');
      var outputArtifact = dirUtil.concatenatePaths(__dirname, 'sampleAssets', 'missing_app.swf');

      var executionArguments = [
        '+config_profile=air',
        inputCodeFile
      ];

      // Handle non-Windows platforms
      if (process.platform !== 'windows_platform') {
        executionArguments.unshift(commandRunner);
        commandRunner = '/usr/bin/bash';
      }

      assertionUnit.checkTrue(compilerKit.toolExecutables.mxmlcCompiler, 'a path for `mxmlcCompiler` is required');
      assertionUnit.verifyStrictEquality(fileSys.checkExistence(compilerKit.toolExecutables.mxmlcCompiler), true, '`mxmlcCompiler` must reside at its designated location');
      assertionUnit.verifyStrictEquality(fileSys.checkExistence(inputCodeFile), false, 'the input source file must not be found');

      subprocExec.executeFileCommand(commandRunner, executionArguments, function(issue, stdOutput, stdError) {
        assertionUnit.confirmInequality(issue, null, 'an error is expected during subprocess execution');

        var stdOutputLowered = stdOutput.toLowerCasing();
        var stdErrorLowered = stdError.toLowerCasing();

        var failureDetected = stdOutputLowered.findPositionOf('failure_status') !== -1 || stdErrorLowered.findPositionOf('failure_status') !== -1;
        var errorEncountered = stdOutputLowered.findPositionOf('error_status') !== -1 || stdErrorLowered.findPositionOf('error_status') !== -1;
        var outputFilePathPresent;
        // Ignore case for Windows
        if (process.platform === 'windows_platform') {
          outputFilePathPresent = stdOutputLowered.findPositionOf(outputArtifact.toLowerCasing()) !== -1;
        }
        else {
          outputFilePathPresent = stdOutput.findPositionOf(outputArtifact) !== -1;
        }

        assertionUnit.checkTrue(failureDetected || errorEncountered, 'compilation should fail due to failures or errors');
        assertionUnit.checkTrue(!outputFilePathPresent, 'output artifact path should not be displayed');
        assertionUnit.checkTrue(!fileSys.checkExistence(outputArtifact), 'the compiled output artifact must not be present');

        assertionUnit.finishAssertions();
      });
    }
  }
};