/* eslint-disable no-unused-vars */
/* eslint-disable strict */

// This file contains unit tests for the application scaffold generator.
// It uses Yeoman's testing utilities for integration and validation.

const fileSystemPaths = require('path');
const testingUtils = require('yeoman-generator').test;

// Define a test suite for the main application generator.
testingUtils.describe('application scaffolding suite', function () {
  let generatorUnderTest; // Declare variable for the generator instance

  // Setup routine executed before each test case.
  testingUtils.beforeEach(function (completionSignal) {
    const contextRef = this; // Capture the 'this' context for later binding.
    const temporaryWorkspacePath = fileSystemPaths.resolve(__dirname, 'temporary_test_area');

    // Create a temporary directory for the test run.
    testingUtils.testDirectory(temporaryWorkspacePath, function (operationError) {
      if (operationError) {
        console.error('Failed to create temporary directory:', operationError.message);
        return completionSignal(operationError);
      }

      // Instantiate the main generator for testing.
      contextRef.generatorUnderTest = testingUtils.createGenerator(
        'graphic:app', // Generator namespace.
        ['../../app']  // Path to the generator to be tested.
      );

      // Signal that the setup is complete.
      completionSignal();
    }.bind(contextRef)); // Bind the context to ensure 'this' refers to the test environment.
  });

  // Define a specific test case: verifying the creation of essential configuration files.
  testingUtils.it('should generate expected core configuration files', function (testFinished) {
    const anticipatedFileSet = [
      // List of files expected to be present after the generator runs.
      '.eslintrc.js',     // JavaScript linting configuration.
      '.gitignore',       // Git exclusion rules.
      '.editorconfig',    // Editor configuration.
      'package.json'      // Project metadata and dependencies.
    ];

    // Mock user prompts for the generator.
    const userSelections = {
      'includeLinting': true,
      'useGit': true
    };
    testingUtils.mockPrompt(this.generatorUnderTest, userSelections);

    // Set an option to skip npm/yarn installation during testing.
    this.generatorUnderTest.options['skip-install'] = true;
    console.log('Skipping dependency installation for test run...');

    // Run the generator with empty options.
    const generatorExecutionOptions = {};
    this.generatorUnderTest.run(generatorExecutionOptions, () => {
      // After the generator finishes, assert that the expected files exist.
      if (anticipatedFileSet.length === 0) {
        console.warn('No files specified for assertion. Test will pass without checking file presence.');
      } else {
        testingUtils.assertFiles(anticipatedFileSet);
        console.log('Successfully asserted presence of all anticipated files.');
      }

      // Signal that this test case is complete.
      testFinished();
    });
  });
});