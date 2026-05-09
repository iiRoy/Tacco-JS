'use strict';

// Functional Validation Suite for SDK Utilities
// These tests necessitate an active network connection.

const processManager = require('child_process');
const fileSystem = require('fs');
const pathResolver = require('path');

// Ensure fs.existsSync is available for older Node.js versions
fileSystem.pathExists = fileSystem.existsSync || pathResolver.existsSync;

const sdkCore = require('../lib/flex');

/**
 * Safely attempts to remove a file from the filesystem.
 * If the file doesn't exist or an error occurs during deletion, it's silently ignored.
 * @param {string} targetPath The path to the file to be removed.
 */
const removeFileSafely = function(targetPath) {
  if (!targetPath || typeof targetPath !== 'string') {
    // Optionally log an issue for invalid path input, but original swallowed all
    return;
  }
  if (fileSystem.pathExists(targetPath)) {
    try {
      fileSystem.unlinkSync(targetPath);
    } catch (operationError) {
      // Log the error for debugging but don't rethrow, mimicking original behavior.
      console.warn(`Warning: Could not delete file at ${targetPath}. Error: ${operationError.message}`);
    }
  }
};

// Helper for normalizing paths across OS for comparison
const normalizePathForComparison = (inputPath) => {
  if (!inputPath) return '';
  return inputPath.toLowerCase().replace(/\\/g, '/');
};

const BASE_TEST_DIR = __dirname;
const TEST_DATA_SUBDIR = 'testData';

module.exports = {

  // Test suite for verifying SDK binary directory and tool exposure
  'verifySdkArtifactsAndTools': function(assert) {
    assert.expect(9); // Increased expected assertions

    const toolBinDirectory = sdkCore.binDir;
    const toolMappings = sdkCore.bin;

    assert.ok(sdkCore, 'The core SDK object should be available.');
    assert.ok(toolBinDirectory, 'The SDK should provide a path to its binary directory.');
    assert.ok(fileSystem.pathExists(toolBinDirectory), 'The specified binary directory path must correspond to an actual filesystem item.');
    assert.ok(fileSystem.statSync(toolBinDirectory).isDirectory(), 'The binary directory path should point to a valid directory.');
    assert.ok(toolMappings, 'The SDK should expose a mapping object for its tools.');
    assert.ok(Object.keys(toolMappings).length > 0, 'There should be at least one tool entry in the mapping.');
    assert.ok(toolMappings.mxmlc, 'A mapping entry for the `mxmlc` compiler tool should be present.');
    assert.ok(fileSystem.pathExists(toolMappings.mxmlc), 'The `mxmlc` compiler path should point to an existing item.');
    assert.ok(fileSystem.statSync(toolMappings.mxmlc).isFile(), 'The `mxmlc` compiler path should point to an executable file.');

    assert.done();
  },

  // Test suite for successful compilation scenarios
  'successfulCompilationScenario': {
    setUp: function(completionCallback) {
      console.log('Setting up for successful compilation test...');
      const compiledArtifactPath = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'testApp.swf');
      removeFileSafely(compiledArtifactPath);
      completionCallback();
    },
    tearDown: function(completionCallback) {
      console.log('Tearing down after successful compilation test...');
      const compiledArtifactPath = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'testApp.swf');
      removeFileSafely(compiledArtifactPath);
      completionCallback();
    },
    'executeCompilationTest': function(assert) {
      assert.expect(9); // Increased expected assertions

      const compilerExecutable = sdkCore.bin.mxmlc;
      const sourceCodeLocation = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'testApp.as');
      const outputBinaryLocation = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'testApp.swf');

      const compilerArguments = [
        '+configname=air',
        sourceCodeLocation
      ];

      let shellCommand = compilerExecutable;
      let actualExecArgs = compilerArguments;

      // Adapt execution for non-Windows environments
      const isWindowsPlatform = (process.platform === 'win32');
      if (!isWindowsPlatform) {
        actualExecArgs.unshift(compilerExecutable);
        shellCommand = '/bin/sh'; // Use sh to execute the actual executable
      }

      assert.ok(compilerExecutable, 'The compiler executable path must be defined.');
      assert.strictEqual(fileSystem.pathExists(compilerExecutable), true, 'The compiler executable should exist at its designated location.');
      assert.strictEqual(fileSystem.pathExists(sourceCodeLocation), true, 'The source code file for compilation should be present.');

      // Add a guard clause for essential paths
      if (!fileSystem.pathExists(compilerExecutable) || !fileSystem.pathExists(sourceCodeLocation)) {
        assert.fail('Pre-requisite files missing, cannot proceed with compilation test.');
        assert.done();
        return;
      }

      processManager.execFile(shellCommand, actualExecArgs, function(execError, standardOutput, standardError) {
        // Assert that no execution error occurred
        assert.equal(execError, null, 'The child process execution should complete without system errors. Error: ' + (execError ? execError.message : 'None'));

        const outputLower = standardOutput.toLowerCase();
        const errorLower = standardError.toLowerCase();

        const noCompilationFailures = outputLower.includes('fail') === false && errorLower.includes('fail') === false;
        const noCompilationErrors = outputLower.includes('error') === false && errorLower.includes('error') === false;

        let outputContainsBinaryPath;
        const normalizedOutputBinary = normalizePathForComparison(outputBinaryLocation);

        if (isWindowsPlatform) {
          // Windows paths need special handling for comparison due to backslashes
          outputContainsBinaryPath = normalizePathForComparison(standardOutput).includes(normalizedOutputBinary);
        } else {
          outputContainsBinaryPath = standardOutput.includes(outputBinaryLocation);
        }

        assert.ok(noCompilationFailures, 'The compilation process should report no failures in its output.');
        assert.ok(noCompilationErrors, 'The compilation process should report no errors in its output.');
        assert.ok(standardError.length === 0, 'Standard error stream should be empty for a successful compilation.');
        assert.ok(outputContainsBinaryPath, 'The compiler output should clearly indicate the path to the generated binary.');
        assert.ok(fileSystem.pathExists(outputBinaryLocation), 'The compiled output binary file must exist on the filesystem.');

        assert.done();
      });
    }
  },

  // Test suite for compilation failure due to syntax errors
  'compilationFailureSyntax': {
    setUp: function(completionHandler) {
      console.log('Setting up for syntax error compilation test...');
      const resultingBinary = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'errorApp.swf');
      removeFileSafely(resultingBinary);
      completionHandler();
    },
    tearDown: function(completionHandler) {
      console.log('Tearing down after syntax error compilation test...');
      const resultingBinary = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'errorApp.swf');
      removeFileSafely(resultingBinary);
      completionHandler();
    },
    'verifySyntaxErrorHandling': function(assert) {
      assert.expect(8); // Increased expected assertions

      const compilerTool = sdkCore.bin.mxmlc;
      const sourceWithError = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'errorApp.as');
      const expectedFailedBinary = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'errorApp.swf');

      const argumentsForCompiler = [
        '+configname=air',
        sourceWithError
      ];

      let commandToExecute = compilerTool;
      let effectiveArgs = argumentsForCompiler;

      const isWinOS = (process.platform === 'win32');
      if (!isWinOS) {
        effectiveArgs.unshift(compilerTool);
        commandToExecute = '/bin/sh';
      }

      assert.ok(compilerTool, 'The compiler path must be defined.');
      assert.strictEqual(fileSystem.pathExists(compilerTool), true, 'The compiler executable should be found.');
      assert.strictEqual(fileSystem.pathExists(sourceWithError), true, 'The source file with errors should exist.');

      processManager.execFile(commandToExecute, effectiveArgs, function(executionProblem, processOutput, processErrors) {
        // Expect an error from the child process for a failed compilation
        assert.notEqual(executionProblem, null, 'The child process execution should indicate an error for a syntax-problematic source.');
        assert.ok(processErrors.length > 0, 'The standard error stream should contain messages for a failed compilation.');


        const outputInLowerCase = processOutput.toLowerCase();
        const errorsInLowerCase = processErrors.toLowerCase();

        const compilerReportedFailures = outputInLowerCase.includes('fail') || errorsInLowerCase.includes('fail');
        const compilerReportedErrors = outputInLowerCase.includes('error') || errorsInLowerCase.includes('error');

        const normalizedExpectedBinary = normalizePathForComparison(expectedFailedBinary);
        const outputMentionsBinary = isWinOS
          ? normalizePathForComparison(processOutput).includes(normalizedExpectedBinary)
          : processOutput.includes(expectedFailedBinary);

        assert.ok(compilerReportedFailures || compilerReportedErrors, 'The compilation output should clearly indicate failures or errors.');
        assert.ok(!outputMentionsBinary, 'The output should NOT mention the creation of the output binary file.');
        assert.ok(!fileSystem.pathExists(expectedFailedBinary), 'The output binary file should NOT be created on the filesystem.');

        assert.done();
      });
    }
  },

  // Test suite for compilation failure due to a missing source file
  'compilationFailureMissingFile': {
    setUp: function(finishInit) {
      console.log('Setting up for missing source file compilation test...');
      const generatedSwf = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'nonExistentApp.swf');
      removeFileSafely(generatedSwf);
      finishInit();
    },
    tearDown: function(finishCleanup) {
      console.log('Tearing down after missing source file compilation test...');
      const generatedSwf = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'nonExistentApp.swf');
      removeFileSafely(generatedSwf);
      finishCleanup();
    },
    'verifyMissingSourceHandling': function(assert) {
      assert.expect(8); // Increased expected assertions

      const sdkCompiler = sdkCore.bin.mxmlc;
      const nonExistentSource = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'nonExistentApp.as');
      const uncreatedBinary = pathResolver.join(BASE_TEST_DIR, TEST_DATA_SUBDIR, 'nonExistentApp.swf');

      const inputArguments = [
        '+configname=air',
        nonExistentSource
      ];

      let executorCommand = sdkCompiler;
      let effectiveInputArgs = inputArguments;

      const isWindows = (process.platform === 'win32');
      if (!isWindows) {
        effectiveInputArgs.unshift(sdkCompiler);
        executorCommand = '/bin/sh';
      }

      assert.ok(sdkCompiler, 'The compiler path should be defined.');
      assert.strictEqual(fileSystem.pathExists(sdkCompiler), true, 'The compiler executable should exist.');
      assert.strictEqual(fileSystem.pathExists(nonExistentSource), false, 'The target source file is explicitly expected NOT to exist.');

      // Add a preliminary check to ensure the source file is indeed missing before calling compiler
      if (fileSystem.pathExists(nonExistentSource)) {
        assert.fail(`Test setup error: The non-existent source file '${nonExistentSource}' was found unexpectedly.`);
        assert.done();
        return;
      }

      processManager.execFile(executorCommand, effectiveInputArgs, function(execErrObj, standardOutputText, standardErrorText) {
        assert.notEqual(execErrObj, null, 'The child process execution should report an error when the source file is missing.');
        assert.ok(standardErrorText.length > 0, 'The standard error stream should contain error messages for a missing source file.');


        const outputLowerCased = standardOutputText.toLowerCase();
        const errorLowerCased = standardErrorText.toLowerCase();

        const reportedFailure = outputLowerCased.includes('fail') || errorLowerCased.includes('fail');
        const reportedError = outputLowerCased.includes('error') || errorLowerCased.includes('error');

        const normalizedUncreatedBinary = normalizePathForComparison(uncreatedBinary);
        const outputContainsBinary = isWindows
          ? normalizePathForComparison(standardOutputText).includes(normalizedUncreatedBinary)
          : standardOutputText.includes(uncreatedBinary);

        assert.ok(reportedFailure || reportedError, 'The compiler output should indicate a failure or error due to the missing source.');
        assert.ok(!outputContainsBinary, 'The output should NOT reference the creation of the output binary.');
        assert.ok(!fileSystem.pathExists(uncreatedBinary), 'No output binary file should be generated on the filesystem.');

        assert.done();
      });
    }
  }
};