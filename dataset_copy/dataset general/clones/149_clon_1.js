/*
 * This file contains functionality tests for the Flex SDK integration.
 * These tests are built upon the nodeunit framework.
 *
 * IMPORTANT NOTE: An active internet connection is required for these tests
 * to execute successfully, as they may involve downloading SDK components.
 */

'use strict' ;


var childProcess = require('child_process');
var fs           = require('fs');
var path         = require('path');


/*
 * Polyfill for fs.existsSync if it's not present (e.g., older Node.js versions).
 * Ensures that the existsSync method is available consistently.
 */
fs . existsSync = fs . existsSync || path . existsSync ;


var flexSdk = require('../lib/flex') ; /* Load the Flex SDK utility module */


/**
 * Safely deletes a file if it exists.
 * This function attempts to unlink the file and catches any errors, preventing crashes.
 * @param {string} path The file path to delete.
 */
var safeDelete = function (path)
{
  if (fs.existsSync(path)) {
    try
    {
      fs.unlinkSync(path);
    }
    catch (err) { /* Any error during unlink is silently ignored here */ }
  }
};


module.exports = {

  /*
   * Test case: Verifies that the Flex SDK binary directory is correctly exposed
   * and that essential binaries like 'mxmlc' are found and are valid files.
   */
  testDownloadAndSdkExposure: function (test) {

    test.expect(8); // Expecting 8 assertions in this test.

    test.ok(flexSdk.binDir,
            'flexSdk.binDir should be a defined and non-empty path string');

    test.ok(fs.existsSync(flexSdk.binDir),
            'The path specified by flexSdk.binDir must correspond to an existing filesystem item');

    test.ok(fs.statSync(flexSdk.binDir).isDirectory(),
            'The path specified by flexSdk.binDir must point to an actual directory');

    test.ok(flexSdk.bin,
            'flexSdk.bin should be an object mapping binary names to their paths');

    test.ok(Object.keys(flexSdk.bin).length > 0,
            'The flexSdk.bin object should contain at least one binary mapping entry');

    test.ok(flexSdk.bin.mxmlc,
            'The flexSdk.bin object must include an entry for the `mxmlc` compiler');

    test.ok(fs.existsSync(flexSdk.bin.mxmlc),
            'The path for `mxmlc` specified in flexSdk.bin.mxmlc must point to an existing item');

    test.ok(fs.statSync(flexSdk.bin.mxmlc).isFile(),
            'The path for `mxmlc` must resolve to an actual file on the filesystem');

    test.done(); // Signal that this test is complete.
  },


  /*
   * Group of tests for successful compilation scenarios.
   */
  testCompileSuccess: {

    /*
     * setUp function: Executed before each test within this group.
     * Cleans up any previously generated binary file to ensure a clean state.
     */
    setUp: function (done) {
      // Determine the expected path for the compiled SWF binary.
      var targetBinary = path.join(__dirname, 'testData', 'testApp.swf');
      safeDelete(targetBinary); // Remove the binary if it exists.
      done(); // Callback to indicate setUp is finished.
    },

    /*
     * tearDown function: Executed after each test within this group.
     * Cleans up the generated binary file.
     */
    tearDown: function (done) {
      // Identify the path of the compiled SWF binary.
      var targetBinary = path.join(__dirname, 'testData', 'testApp.swf');
      safeDelete(targetBinary); // Ensure the binary is deleted after the test.
      done(); // Callback to indicate tearDown is finished.
    },

    /*
     * Main test function for successful compilation.
     */
    testIt: function (test) {
      test.expect(8); // This test expects 8 assertions.

      var executable   = flexSdk.bin.mxmlc;
      var targetSource = path.join(__dirname, 'testData', 'testApp.as');
      var targetBinary = path.join(__dirname, 'testData', 'testApp.swf');

      // Arguments to be passed to the mxmlc compiler.
      var childArgs = [
        '+configname=air', // Specify AIR configuration.
        targetSource       // Path to the source ActionScript file.
      ];

      /*
       * On non-Windows platforms, mxmlc might not be directly executable.
       * We prepend the executable to childArgs and use /bin/sh as the main executable.
       */
      if (process.platform !== 'win32') {
        childArgs.unshift(executable);
        executable = '/bin/sh';
      }

      test.ok(flexSdk.bin.mxmlc,
              'The path for `mxmlc` should be available in flexSdk.bin');
      test.strictEqual(fs.existsSync(flexSdk.bin.mxmlc), true,
                       '`mxmlc` executable file must exist at its expected location');
      test.strictEqual(fs.existsSync(targetSource), true,
                       'The source file for compilation (`testApp.as`) must exist');

      // Execute the compiler as a child process.
      childProcess.execFile(executable, childArgs, function (err, stdout, stderr) {
        test.equal(err, null,
                   'The child process execution should not result in an error: ' + (err || 'No error message'));

        var stdoutLower = stdout.toLowerCase();
        var stderrLower = stderr.toLowerCase();

        // Check for "fail" or "error" keywords in the output.
        var noFailures = stdoutLower.indexOf('fail') === -1 && stderrLower.indexOf('fail') === -1;
        var noErrors   = stdoutLower.indexOf('error') === -1 && stderrLower.indexOf('error') === -1;

        var containsSwfPath;
        // Special handling for Windows paths due to backslashes and case-insensitivity.
        if (process.platform === 'win32') {
          containsSwfPath = stdoutLower.replace(/\\/gi, '/')
                                     .indexOf(targetBinary.toLowerCase().replace(/\\/gi, '/')) !== -1;
        }
        else {
          containsSwfPath = stdout.indexOf(targetBinary) !== -1;
        }

        test.ok(noFailures, 'Compilation should complete without any reported failures');
        test.ok(noErrors, 'Compilation should complete without any reported errors');
        test.ok(containsSwfPath, 'The compiler output should indicate the path to the generated SWF binary');
        test.ok(fs.existsSync(targetBinary), 'The compiled output binary file should exist on the filesystem');

        test.done(); // Mark this specific test as finished.
      });
    }
  },


  /*
   * Group of tests for compilation failure due to syntax errors in the source code.
   */
  testCompileFailureDueToSynaxError: {

    /*
     * setUp function: Prepares the environment by ensuring no old binary exists.
     */
    setUp: function (done) {
      // Define the path for the binary that would be generated.
      var targetBinary = path.join(__dirname, 'testData', 'errorApp.swf');
      safeDelete(targetBinary); // Remove any pre-existing binary.
      done();
    },

    /*
     * tearDown function: Cleans up after each test in this group.
     */
    tearDown: function (done) {
      // Identify the path of the (expected not to exist) compiled SWF binary.
      var targetBinary = path.join(__dirname, 'testData', 'errorApp.swf');
      safeDelete(targetBinary); // Delete the binary if it was somehow created.
      done();
    },

    /*
     * Main test function for syntax error compilation failure.
     */
    testIt: function (test) {
      test.expect(7); // This test expects 7 assertions.

      var executable   = flexSdk.bin.mxmlc;
      var targetSource = path.join(__dirname, 'testData', 'errorApp.as');
      var targetBinary = path.join(__dirname, 'testData', 'errorApp.swf');

      var childArgs = [
        '+configname=air',
        targetSource
      ];

      // Adapt for non-Windows environments if necessary.
      if (process.platform !== 'win32') {
        childArgs.unshift(executable);
        executable = '/bin/sh';
      }

      test.ok(flexSdk.bin.mxmlc, 'Path for `mxmlc` should be available');
      test.strictEqual(fs.existsSync(flexSdk.bin.mxmlc), true, '`mxmlc` executable should exist');
      test.strictEqual(fs.existsSync(targetSource), true, 'The erroneous source file should exist');

      childProcess.execFile(executable, childArgs, function (err, stdout, stderr) {
        test.notEqual(err, null, 'The child process execution should report an error (non-null err)');

        var stdoutLower = stdout.toLowerCase();
        var stderrLower = stderr.toLowerCase();

        // Check if output indicates failures or errors.
        var hadFailures = stdoutLower.indexOf('fail') !== -1 || stderrLower.indexOf('fail') !== -1;
        var hadErrors   = stdoutLower.indexOf('error') !== -1 || stderrLower.indexOf('error') !== -1;
        var containsSwfPath;

        // Account for Windows path conventions.
        if (process.platform === 'win32') {
          containsSwfPath = stdoutLower.indexOf(targetBinary.toLowerCase()) !== -1;
        }
        else {
          containsSwfPath = stdout.indexOf(targetBinary) !== -1;
        }

        test.ok(hadFailures || hadErrors, 'Compilation should fail with reported failures or errors');
        test.ok(!containsSwfPath, 'The compiler output should NOT show a path to an output binary');
        test.ok(!fs.existsSync(targetBinary), 'The compiled output binary should NOT exist on the filesystem');

        test.done();
      });
    }
  },


  /*
   * Group of tests for compilation failure due to a missing source file.
   */
  testCompileFailureDueToMissingSource: {

    /*
     * setUp function: Clears any leftover binary before the test runs.
     */
    setUp: function (done) {
      // Define the target binary path for the non-existent source.
      var targetBinary = path.join(__dirname, 'testData', 'nonExistentApp.swf');
      safeDelete(targetBinary); // Ensure the binary is deleted.
      done();
    },

    /*
     * tearDown function: Cleans up any potential binary after the test.
     */
    tearDown: function (done) {
      // Define the target binary path for the non-existent source.
      var targetBinary = path.join(__dirname, 'testData', 'nonExistentApp.swf');
      safeDelete(targetBinary); // Delete the binary if it was created.
      done();
    },

    /*
     * Main test function for missing source compilation failure.
     */
    testIt: function (test) {
      test.expect(7); // This test expects 7 assertions.

      var executable   = flexSdk.bin.mxmlc;
      var targetSource = path.join(__dirname, 'testData', 'nonExistentApp.as');
      var targetBinary = path.join(__dirname, 'testData', 'nonExistentApp.swf');

      var childArgs = [
        '+configname=air',
        targetSource
      ];

      // Handle platform-specific executable adjustments.
      if (process.platform !== 'win32') {
        childArgs.unshift(executable);
        executable = '/bin/sh';
      }

      test.ok(flexSdk.bin.mxmlc, 'The path for `mxmlc` should be properly set');
      test.strictEqual(fs.existsSync(flexSdk.bin.mxmlc), true, '`mxmlc` executable must exist at its location');
      test.strictEqual(fs.existsSync(targetSource), false, 'The target source file should NOT exist for this test');

      childProcess.execFile(executable, childArgs, function (err, stdout, stderr) {
        test.notEqual(err, null, 'The child process execution should return an error (non-null err object)');

        var stdoutLower = stdout.toLowerCase();
        var stderrLower = stderr.toLowerCase();

        // Check output for failure or error indicators.
        var hadFailures = stdoutLower.indexOf('fail') !== -1 || stderrLower.indexOf('fail') !== -1;
        var hadErrors   = stdoutLower.indexOf('error') !== -1 || stderrLower.indexOf('error') !== -1;
        var containsSwfPath;

        // Handle path case-insensitivity on Windows.
        if (process.platform === 'win32') {
          containsSwfPath = stdoutLower.indexOf(targetBinary.toLowerCase()) !== -1;
        }
        else {
          containsSwfPath = stdout.indexOf(targetBinary) !== -1;
        }

        test.ok(hadFailures || hadErrors, 'Compilation should fail, indicating either failures or errors');
        test.ok(!containsSwfPath, 'The compiler output should NOT contain the path to an output binary');
        test.ok(!fs.existsSync(targetBinary), 'The compiled output binary should NOT be found on the filesystem');

        test.done();
      });
    }
  }
};