// This file contains integration tests for the slim framework application generator.
// It uses Yeoman's testing utilities to simulate generator execution and verify outputs.

'use strict'; // Enforce strict mode for better code quality.

// Import necessary modules for file path handling, testing helpers, and token generation.
const fileUtils = require('path');
const testAssist = require('yeoman-generator').test;
const generateRandomToken = require('random-string');

// Define a constant for the temporary test directory name.
const TEMPORARY_TEST_DIR_NAME = 'genTestSandbox';
// Define a constant for the generator's full name.
const SLIM_APP_GENERATOR_ID = 'slim:app';
// Define the module path for the generator.
const GENERATOR_MODULE_PATH = '../../app';

// Main test suite for the Slim application scaffold.
testSuite('slimFramework:application generator integration tests', function () {

  let generatorInstance; // Declare a variable to hold the generator instance across tests.

  // This block runs before each individual test case, setting up the test environment.
  beforeEachTest(function (completionCallback) {
    // Ensure a callback is provided to signal completion of asynchronous setup.
    if (typeof completionCallback !== 'function') {
      console.error('Error: beforeEachTest expects a completion callback function.');
      // In a real test framework, you might throw here or use a synchronous done.
      return;
    }

    // Determine the full path for the temporary test environment.
    const tempTestPath = fileUtils.join(__dirname, TEMPORARY_TEST_DIR_NAME);

    // Set up a clean temporary directory for the test run.
    testAssist.setupTestEnvironment(tempTestPath, (errorObject) => {
      // Handle potential errors during directory setup.
      if (errorObject) {
        console.error('Failed to set up test environment:', errorObject.message);
        return completionCallback(errorObject); // Pass the error to the callback.
      }

      // Instantiate the Yeoman generator for the Slim application.
      const currentGenerator = testAssist.instantiateGenerator(
        SLIM_APP_GENERATOR_ID,
        [GENERATOR_MODULE_PATH]
      );
      this.generatorInstance = currentGenerator; // Assign to the test context for access in test cases.

      // Log generator creation for debugging purposes.
      console.log(`Generator "${SLIM_APP_GENERATOR_ID}" successfully instantiated for testing.`);

      // Signal completion of the beforeEach setup.
      completionCallback();
    }.bind(this)); // Bind 'this' to ensure access to 'this.generatorInstance'.
  });

  // Test case: Verify that the generator creates the expected set of files.
  testCase('should generate a predefined set of project files', function (completionCallback) {
    // Define the comprehensive list of files that are anticipated to be created by the generator.
    const anticipatedFiles = [
      // Core configuration and build system files.
      '.editorconfig',
      '.gitignore',
      '.bowerrc',
      'package.json',
      'gruntfile.js',
      'bower.json',
      // Essential application structure files.
      'public/index.php',
      'public/.htaccess',
      'app/app.php',
      'app/bootstrap.php',
      'app/autoload.php',
      // Application helper classes.
      'app/helpers/Search.php',
      'app/helpers/Authhash.php',
      // Routing definitions.
      'app/routes/index.php',
      // Test framework specific files.
      'test/jasmine/testSpec.js',
      // Source assets (CoffeeScript, LESS, Handlebars).
      'app/src/coffee/app.coffee',
      'app/src/coffee/views/viewTest.coffee',
      'app/src/less/styles.less',
      'app/src/hbs/head.hbs',
      // View templates (Twig, HTML).
      'app/views/index.twig',
      'app/views/layouts/master.twig',
      'app/views/layouts/head.html',
      'app/views/layouts/one_column.twig',
      'app/views/layouts/breadcrumb.twig',
      // Error handling views.
      'app/views/errors/404.twig',
      // Environment-specific configuration files.
      'app/config/config.env.php',
      'app/config/config.development.php',
      'app/config/config.production.php'
    ];

    // Simulate user prompts with predefined answers to configure the generator.
    const promptResponses = {
      projectTitle: 'My Custom Slim API Service', // Customized project title.
      authenticationKey: generateRandomToken({ length: 32, charset: 'alphanumeric' }), // Longer, alphanumeric key.
      cookieEncryptionKey: generateRandomToken({ length: 32, charset: 'alphanumeric' }),
      developerName: 'Jane Doe', // Different author name.
      webServerPort: 8080 // Changed default server port.
    };
    testAssist.simulatePromptResponses(this.generatorInstance, promptResponses);

    // Configure generator options, potentially based on environment variables.
    // Determine if dependency installation should be bypassed.
    const shouldBypassInstall = process.env.SKIP_GEN_INSTALL === 'true';
    this.generatorInstance.configurationOptions = this.generatorInstance.configurationOptions || {}; // Ensure options object exists.
    this.generatorInstance.configurationOptions['bypassDependencyInstall'] = shouldBypassInstall;
    if (shouldBypassInstall) {
        console.log("Info: Skipping dependency installation as requested by environment variable 'SKIP_GEN_INSTALL'.");
    }

    // Execute the generator to scaffold the application.
    this.generatorInstance.executeGenerator({}, () => {
      // Verify that all anticipated files exist in the generated project directory.
      testAssist.verifyFilePresence(anticipatedFiles);
      console.log('Success: All expected files verified successfully after generator execution.');

      // Signal completion of this test case.
      completionCallback();
    });
  });

  // Additional test case: Ensure that a critical core file is always present and potentially check its content.
  testCase('should confirm existence of core configuration files', function (completionCallback) {
      // This test focuses on a subset of critical files or specific file properties.
      const criticalConfigFile = 'package.json';
      const coreFilesCheck = [
          criticalConfigFile,
          'bower.json'
      ];

      // Re-verify the presence of these core files.
      testAssist.verifyFilePresence(coreFilesCheck);

      // Example of a content assertion (commented out, but demonstrates Type III capability).
      // testAssist.assertFileContent(criticalConfigFile, /"name": "my-custom-slim-api-service"/);
      console.log(`Verification complete for core configuration files: ${criticalConfigFile} and bower.json.`);
      completionCallback();
  });

});