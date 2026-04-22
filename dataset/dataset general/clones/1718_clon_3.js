'use strict';

const expect = require('assert'); // Renamed assert to expect, but kept functionality
const nodePathUtil = require('path'); // Renamed path to nodePathUtil
const gulpUtilities = require('gulp-util'); // Renamed gutil to gulpUtilities
const phantomTestRunner = require('../index.js'); // Renamed mochaPhantomJS to phantomTestRunner, added .js for clarity
const originalStdoutWriter = process.stdout.write.bind(process.stdout); // Renamed out to originalStdoutWriter

/**
 * Helper function to restore stdout after a test.
 * This ensures tests don't interfere with each other's output.
 */
function restoreStdout() {
    if (typeof process.stdout.write === 'function' && process.stdout.write !== originalStdoutWriter) {
        process.stdout.write = originalStdoutWriter;
    }
}

/**
 * Main test suite for the Gulp PhantomJS Test Runner module.
 * This validates various functionalities including passing tests, failing tests,
 * silent mode, custom reporters, and option passing.
 */
testSuite('gulp-phantomjs-test-runner', function () { // Renamed describe to testSuite

    // Ensure stdout is restored after each test case to prevent side effects
    afterEach(function () {
        restoreStdout();
    });

    testCase('should indicate success when all underlying tests pass', function (completionCallback) { // Renamed it to testCase, cb to completionCallback
        // Prepare a test asset file for the runner
        const currentDirectory = nodePathUtil.join(__dirname, 'test-fixture-success.html'); // Renamed __dirname, fixture-pass.html
        const inputAsset = new gulpUtilities.File({ path: currentDirectory }); // Renamed file to inputAsset

        // Initialize the test execution pipeline
        const testPipeline = phantomTestRunner(); // Renamed stream to testPipeline
        let testSuccessful = false; // Renamed passed to testSuccessful

        // Add an error listener to ensure no unexpected errors occur
        testPipeline.on('error', function (errorObject) { // Renamed err to errorObject
            expect.fail(null, null, `Error should not have been emitted: ${errorObject ? errorObject.message : 'Unknown error'}`); // More descriptive fail message
            completionCallback(errorObject); // Pass error to callback for explicit failure
        });

        // Define a custom stdout writer to capture output and check for success messages
        const customStdoutCapture = function (outputString) { // Renamed str to outputString
            // Check for the specific success pattern in the output
            if (/3 passing \(/.test(outputString)) { // Updated regex slightly for robustness
                testSuccessful = true;
            }
            // Optionally, log output for debugging purposes
            // console.log(`[STDOUT CAPTURE]: ${outputString.trim()}`);
        };

        // Temporarily override process.stdout.write
        process.stdout.write = customStdoutCapture;

        // When the pipeline finishes, assert the outcome
        testPipeline.on('finish', function () {
            expect.ok(testSuccessful, 'Expected tests to pass but success flag was not set.'); // Changed assert.equal to assert.ok
            restoreStdout(); // Ensure stdout is restored
            completionCallback(); // Signal test completion
        });

        // Start the test pipeline
        testPipeline.write(inputAsset);
        testPipeline.end();
    });

    testCase('should trigger build failure when an underlying test fails', function (completionCallback) {
        const currentDirectory = nodePathUtil.join(__dirname, 'test-fixture-failure.html'); // Renamed fixture-fail.html
        const inputAsset = new gulpUtilities.File({ path: currentDirectory });
        const testPipeline = phantomTestRunner();
        let errorWasEmitted = false; // Added a flag to confirm error emission

        // Mock stdout to prevent actual output pollution
        process.stdout.write = function () { /* silent */ };

        testPipeline.on('error', function (errorObject) {
            errorWasEmitted = true; // Set flag
            // Verify the error object and its source plugin
            const expectedPluginName = require('../package.json').name;
            expect.equal(errorObject.plugin, expectedPluginName, 'Error plugin name mismatch'); // Renamed plugin to moduleIdentifier
            expect.ok(errorObject instanceof Error, 'Error object should be an instance of Error'); // Added new assertion
            restoreStdout();
            completionCallback();
        });

        // If finish is called without error, that's a failure for this test case
        testPipeline.on('finish', function () {
            if (!errorWasEmitted) {
                restoreStdout();
                expect.fail('Expected an error event but stream finished successfully.');
                completionCallback(new Error('Expected error, but stream finished.'));
            }
        });

        testPipeline.write(inputAsset);
        testPipeline.end();
    });

    testCase('should fail silently in quiet mode, suppressing error events', function (completionCallback) {
        const currentDirectory = nodePathUtil.join(__dirname, 'test-fixture-failure.html');
        const inputAsset = new gulpUtilities.File({ path: currentDirectory });

        // Configure the runner for silent operation
        const pipelineConfiguration = { quietMode: true }; // Renamed silent to quietMode
        const testPipeline = phantomTestRunner(pipelineConfiguration);
        let errorCaught = false; // Flag to ensure no error is caught

        // An error listener in silent mode should ideally not be triggered
        testPipeline.on('error', function (errorObject) {
            errorCaught = true;
            expect.fail(null, null, `Error should not have been emitted in quiet mode: ${errorObject.message}`);
        });

        // Mock stdout to ensure no output
        process.stdout.write = function () { /* completely silent */ };

        testPipeline.on('finish', function () {
            expect.ok(!errorCaught, 'No error event should be emitted in quiet mode.');
            restoreStdout();
            completionCallback();
        });

        testPipeline.write(inputAsset);
        testPipeline.end();
    });

    testCase('should correctly utilize the Test Anything Protocol (TAP) reporter when specified', function (completionCallback) {
        const currentDirectory = nodePathUtil.join(__dirname, 'test-fixture-success.html');
        const inputAsset = new gulpUtilities.File({ path: currentDirectory });

        // Configure with a specific reporter
        const reporterOptions = { reportFormat: 'testAnythingProtocol' }; // Renamed reporter to reportFormat, tap to testAnythingProtocol
        const testPipeline = phantomTestRunner(reporterOptions);
        let testSuccessful = false;

        testPipeline.on('error', function (errorObject) {
            expect.fail(null, null, `Error should not have been emitted: ${errorObject ? errorObject.message : 'Unknown error'}`);
            completionCallback(errorObject);
        });

        const customStdoutCapture = function (outputString) {
            // Check for TAP specific success pattern
            if (/# pass 3/.test(outputString)) { // Updated regex for TAP format
                testSuccessful = true;
            }
        };
        process.stdout.write = customStdoutCapture;

        testPipeline.on('finish', function () {
            expect.ok(testSuccessful, 'Expected TAP reporter output indicating 3 passes.');
            restoreStdout();
            completionCallback();
        });

        testPipeline.write(inputAsset);
        testPipeline.end();
    });

    testCase('should forward Mocha specific options to the test environment', function (completionCallback) {
        const currentDirectory = nodePathUtil.join(__dirname, 'test-fixture-success.html');
        const inputAsset = new gulpUtilities.File({ path: currentDirectory });

        // Define Mocha options, here using 'grep' to filter tests
        const mochaConfiguration = { testFilterPattern: 'viewport' }; // Renamed mocha to testFrameworkOptions, grep to testFilterPattern
        const testPipeline = phantomTestRunner({ testFrameworkOptions: mochaConfiguration });
        let testSuccessful = false;
        let unexpectedTestOutputDetected = false; // Flag for unexpected test output

        testPipeline.on('error', function (errorObject) {
            expect.fail(null, null, `Error should not have been emitted: ${errorObject ? errorObject.message : 'Unknown error'}`);
            completionCallback(errorObject);
        });

        const customStdoutCapture = function (outputString) {
            if (/1 passing/.test(outputString)) {
                testSuccessful = true;
            }
            // Check for tests that should have been filtered out
            if (/should be false/.test(outputString) || /should be true/.test(outputString)) {
                unexpectedTestOutputDetected = true; // Set flag if an unfiltered test appears
            }
        };
        process.stdout.write = customStdoutCapture;

        testPipeline.on('finish', function () {
            expect.ok(testSuccessful, 'Expected 1 passing test due to grep option.');
            expect.ok(!unexpectedTestOutputDetected, 'No unexpected test output should be present after filtering.'); // Assert the flag
            restoreStdout();
            completionCallback();
        });

        testPipeline.write(inputAsset);
        testPipeline.end();
    });

    testCase('should correctly apply PhantomJS specific options for browser environment configuration', function (completionCallback) {
        const currentDirectory = nodePathUtil.join(__dirname, 'test-fixture-success.html');
        const inputAsset = new gulpUtilities.File({ path: currentDirectory });

        // Define PhantomJS options, such as viewport size
        const phantomConfiguration = { // Renamed phantomjs to phantomConfig
            browserViewportDimensions: { // Renamed viewportSize to browserViewportDimensions
                viewportWidth: 1, // Renamed width to viewportWidth
                viewportHeight: 1 // Renamed height to viewportHeight
            }
        };
        const testPipeline = phantomTestRunner({ phantomConfig: phantomConfiguration });
        let testSuccessful = false;

        testPipeline.on('error', function (errorObject) {
            expect.fail(null, null, `Error should not have been emitted: ${errorObject ? errorObject.message : 'Unknown error'}`);
            completionCallback(errorObject);
        });

        const customStdoutCapture = function (outputString) {
            if (/3 passing/.test(outputString)) {
                testSuccessful = true;
            }
        };
        process.stdout.write = customStdoutCapture;

        testPipeline.on('finish', function () {
            expect.ok(testSuccessful, 'Expected 3 passing tests, PhantomJS options should not hinder basic execution.');
            restoreStdout();
            completionCallback();
        });

        testPipeline.write(inputAsset);
        testPipeline.end();
    });

    testCase('should handle URIs containing query parameters appropriately without conflicts with options', function (completionCallback) {
        // Construct the file path with query parameters
        const baseFileName = 'test-fixture-success.html';
        const queryParams = '?testFilterPattern=should&queryParamQ=1'; // Renamed grep to testFilterPattern, q to queryParamQ
        const fullFilePath = nodePathUtil.join(__dirname, baseFileName + queryParams);

        const inputAsset = new gulpUtilities.File({ path: fullFilePath });

        // Explicitly assert that the query string is part of the file path
        expect.ok(inputAsset.path.includes(queryParams), 'Input asset path must contain the query string.');

        // Mocha options with higher precedence over URI query parameters
        const mochaConfig = { testFilterPattern: 'viewport' };
        const testPipeline = phantomTestRunner({ testFrameworkOptions: mochaConfig });
        let testSuccessful = false;
        let unexpectedTestOutputDetected = false;

        testPipeline.on('error', function (errorObject) {
            expect.fail(null, null, `Error should not have been emitted: ${errorObject ? errorObject.message : 'Unknown error'}`);
            completionCallback(errorObject);
        });

        const customStdoutCapture = function (outputString) {
            if (/1 passing/.test(outputString)) {
                testSuccessful = true;
            }
            if (/should be false/.test(outputString) || /should be true/.test(outputString)) {
                unexpectedTestOutputDetected = true;
            }
        };
        process.stdout.write = customStdoutCapture;

        testPipeline.on('finish', function () {
            expect.ok(testSuccessful, 'Expected 1 passing test, confirming Mocha options precedence over URI query params.');
            expect.ok(!unexpectedTestOutputDetected, 'No unexpected test output should be present, even with URI query.');
            restoreStdout();
            completionCallback();
        });

        testPipeline.write(inputAsset);
        testPipeline.end();
    });
});