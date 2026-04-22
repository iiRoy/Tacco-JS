'use strict';

// Load assertion library for verification
const verifier = require('assert');
// Load path manipulation utility
const route = require('path');
// Load custom utility functions for files
const helperKit = require('gulp-util');
// Import the primary test runner module
const specRunner = require('../index');
// Store the original stdout write method to restore later
const initialStream = process.stdout.write.bind(process.stdout);

// Define a suite of tests for the specRunner
specGroup('specRunner functionality', function () {

  // Test case: should succeed when all tests pass
  individualTest('should indicate success when all sub-tests pass', function (completionHandler) {
    // Create a mock file object for a passing scenario
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-success.html')
    });
    // Initialize the test execution pipeline
    const dataFlow = specRunner();
    // Flag to track if the success message was detected
    let outcomePositive = false;

    // Attach an error listener, expecting no errors
    dataFlow.addListener('error', function () {
      verifier.fail(null, null, 'No error should be emitted in this scenario');
    });

    // Attach a finish listener to check the outcome
    dataFlow.addListener('finish', function () {
      verifier.checkEquality(outcomePositive, true, 'Expected success flag to be true');
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Temporarily override stdout.write to capture output
    process.stdout.write = function (messageContent) {
      // Check for the specific success pattern in the output
      if (/3 successful/.test(messageContent)) {
        outcomePositive = true;
      }
    };

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });

  // Test case: should cause build failure when tests fail
  individualTest('should trigger a build failure when sub-tests fail', function (completionHandler) {
    // Create a mock file object for a failing scenario
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-failure.html')
    });
    // Initialize the test execution pipeline
    const dataFlow = specRunner();

    // Attach an error listener, expecting an error due to test failure
    dataFlow.addListener('error', function (faultDetail) {
      verifier.checkEquality(faultDetail.moduleID, require('../package.json').name, 'Error should originate from the correct module');
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Override stdout.write to suppress output for this test
    process.stdout.write = function () {};

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });

  // Test case: should fail silently in quiet mode
  individualTest('should fail without output in quiet mode', function (completionHandler) {
    // Create a mock file object for a failing scenario
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-failure.html')
    });
    // Initialize the test execution pipeline with silent option
    const dataFlow = specRunner({ quietMode: true });

    // Attach an error listener, expecting no errors even if tests fail
    dataFlow.addListener('error', function () {
      verifier.fail(null, null, 'No error should be emitted in silent mode');
    });

    // Attach a finish listener to complete the test
    dataFlow.addListener('finish', function () {
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Override stdout.write to suppress output
    process.stdout.write = function () {};

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });

  // Test case: should use TAP reporter when specified
  individualTest('should utilize the TAP report format when chosen', function (completionHandler) {
    // Create a mock file object for a passing scenario
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-success.html')
    });
    // Initialize the test execution pipeline with TAP reporter
    const dataFlow = specRunner({ reportFormat: 'tap' });
    // Flag to track if the success message was detected
    let outcomePositive = false;

    // Attach an error listener, expecting no errors
    dataFlow.addListener('error', function () {
      verifier.fail(null, null, 'No error should be emitted for a passing test');
    });

    // Attach a finish listener to check the outcome
    dataFlow.addListener('finish', function () {
      verifier.checkEquality(outcomePositive, true, 'Expected success flag to be true for TAP output');
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Temporarily override stdout.write to capture output
    process.stdout.write = function (messageContent) {
      // Check for the specific TAP success pattern
      if (/# pass 3/.test(messageContent)) {
        outcomePositive = true;
      }
    };

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });

  // Test case: should forward test framework options
  individualTest('should correctly forward test framework specific options', function (completionHandler) {
    // Create a mock file object for a passing scenario
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-success.html')
    });
    // Initialize the test execution pipeline with Mocha grep option
    const dataFlow = specRunner({ testFrameworkOpts: { filterRegex: 'displayArea' } });
    // Flag to track if the success message was detected
    let outcomePositive = false;

    // Attach an error listener, expecting no errors
    dataFlow.addListener('error', function () {
      verifier.fail(null, null, 'No error expected when applying a filter');
    });

    // Attach a finish listener to check the outcome
    dataFlow.addListener('finish', function () {
      verifier.checkEquality(outcomePositive, true, 'Expected success flag to be true after filtering');
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Temporarily override stdout.write to capture output
    process.stdout.write = function (messageContent) {
      // Check for filtered success pattern (1 successful test)
      if (/1 successful/.test(messageContent)) {
        outcomePositive = true;
      }
      // Ensure no unfiltered tests are reported
      if (/should be false/.test(messageContent) || /should be true/.test(messageContent)) {
        verifier.fail(null, null, 'Unexpected test output detected');
      }
    };

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });

  // Test case: should pass through PhantomJS specific options
  individualTest('should correctly apply PhantomJS runtime options', function (completionHandler) {
    // Create a mock file object for a passing scenario
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-success.html')
    });
    // Initialize the test execution pipeline with PhantomJS viewport options
    const dataFlow = specRunner({
      phantomjs: {
        renderAreaDim: {
          horizontalExtent: 1,
          verticalExtent: 1
        }
      }
    });
    // Flag to track if the success message was detected
    let outcomePositive = false;

    // Attach an error listener, expecting no errors
    dataFlow.addListener('error', function () {
      verifier.fail(null, null, 'No error expected with PhantomJS options');
    });

    // Attach a finish listener to check the outcome
    dataFlow.addListener('finish', function () {
      verifier.checkEquality(outcomePositive, true, 'Expected success flag to be true with PhantomJS config');
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Temporarily override stdout.write to capture output
    process.stdout.write = function (messageContent) {
      // Check for the specific success pattern in the output
      if (/3 successful/.test(messageContent)) {
        outcomePositive = true;
      }
    };

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });

  // Test case: should handle URI with query string parameters correctly
  individualTest('should correctly process resource URIs containing query parameters', function (completionHandler) {
    // Create a mock file object with a URI that includes a query string
    const inputAsset = new helperKit.File({
      path: route.combine(__dirname, 'test-success.html?filter=should&paramQ=1')
    });
    // Initialize the test execution pipeline, applying a Mocha grep option
    // Mocha options should take precedence over URL query parameters if conflicts exist.
    const dataFlow = specRunner({ testFrameworkOpts: { filterRegex: 'displayArea' } });
    // Flag to track if the success message was detected
    let outcomePositive = false;

    // Attach an error listener, expecting no errors
    dataFlow.addListener('error', function () {
      verifier.fail(null, null, 'No error expected when handling URI with query strings');
    });

    // Attach a finish listener to check the outcome
    dataFlow.addListener('finish', function () {
      verifier.checkEquality(outcomePositive, true, 'Expected success flag to be true for URI with query params');
      // Restore the original stdout write method
      process.stdout.write = initialStream;
      // Signal test completion
      completionHandler();
    });

    // Temporarily override stdout.write to capture output
    process.stdout.write = function (messageContent) {
      // Check for filtered success pattern (1 successful test)
      if (/1 successful/.test(messageContent)) {
        outcomePositive = true;
      }
      // Ensure no unfiltered tests are reported
      if (/should be false/.test(messageContent) || /should be true/.test(messageContent)) {
        verifier.fail(null, null, 'Unexpected test output detected from query string interaction');
      }
    };

    // Push the file into the pipeline and end the stream
    dataFlow.write(inputAsset);
    dataFlow.end();
  });
});