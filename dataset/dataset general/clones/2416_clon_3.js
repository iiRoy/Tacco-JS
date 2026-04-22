'use strict'; // Ensures strict parsing and execution of JavaScript code.

/**
 * @file This module provides the comprehensive configuration settings for the Karma test runner.
 *       It outlines the environment, testing frameworks, file inclusions, preprocessors, and
 *       reporting mechanisms for the project's unit tests. The setup is optimized for both
 *       development and continuous integration workflows.
 */

// The main export is a function that receives the Karma configuration builder object.
module.exports = function configureKarmaTestSuite(testEnvironmentSettings) {

    // --- Input Validation and Early Exit ---
    // A basic check to ensure the provided settings object is valid and has the 'set' method.
    if (!testEnvironmentSettings || typeof testEnvironmentSettings.set !== 'function') {
        // Log an error if the configuration object is not as expected.
        console.error('ERROR: The provided test environment settings object is invalid or lacks the necessary "set" method. Cannot proceed with configuration.');
        // Exit the function to prevent further errors.
        return;
    }

    // --- Configuration Variables and Constants ---
    // Define a constant for the base path, typically an empty string for the project root.
    const projectRootDirectory = '';

    // Specify the primary testing framework to be utilized.
    const mainTestingFramework = 'jasmine';

    // Determine the logging verbosity level for the test runner.
    // Using a direct reference to the Karma-provided constant.
    const currentLogLevel = testEnvironmentSettings.LOG_INFO;

    // Set a flag to indicate whether the test suite should run only once and then exit.
    // This is crucial for CI/CD pipelines.
    const shouldExecuteTestsOnce = !false; // Equivalent to 'true'

    // --- Dynamic Array and Object Construction for Configuration ---

    // 1. Browsers/Execution Environments
    const targetBrowsers = [];
    // Add PhantomJS as a headless browser for efficient testing.
    targetBrowsers.push('PhantomJS');
    // Additional browsers could be added here, e.g., targetBrowsers.push('ChromeHeadless');

    // 2. Reporting Tools
    const testResultReporters = new Array(); // Alternative array creation method.
    // The 'dots' reporter provides a compact, console-friendly output.
    testResultReporters.push('dots');
    // The 'coverage' reporter generates code coverage reports.
    testResultReporters.push('coverage');

    // 3. Source Files and Test Specifications
    const filesToLoadInBrowser = [];
    // Include the main Angular library.
    filesToLoadInBrowser.push('components/angular/angular.js');
    // Include Angular mocks for testing.
    filesToLoadInBrowser.push('components/angular-mocks/angular-mocks.js');

    // Define paths for core application logic and the compiled Angular module.
    const coreApplicationLogicPath = 'src/md5.js';
    const compiledAngularModulePath = 'build/angular-gravatar.js';
    const testSpecificationPath = 'build/spec/tests.js';

    // Add these files to the list of resources to be loaded.
    filesToLoadInBrowser.push(coreApplicationLogicPath);
    filesToLoadInBrowser.push(compiledAngularModulePath);
    filesToLoadInBrowser.push(testSpecificationPath);

    // 4. Preprocessors
    const filePreprocessors = {};
    // Apply the 'coverage' preprocessor to the main Angular module file.
    // This instruments the code for coverage analysis.
    filePreprocessors[compiledAngularModulePath] = 'coverage';

    // --- Final Configuration Object Assembly ---
    // Create the primary configuration object that will be passed to Karma.
    const finalConfigurationSettings = {
        // Specifies the base path for all relative file paths.
        basePath: projectRootDirectory,

        // Lists the testing frameworks Karma should use.
        frameworks: [mainTestingFramework],

        // Sets the level of logging output from Karma.
        logLevel: currentLogLevel,

        // Defines the browsers in which the tests will be executed.
        browsers: targetBrowsers,

        // If true, Karma will start, run the tests, and then exit.
        singleRun: shouldExecuteTestsOnce,

        // Configures the reporters to display and save test results.
        reporters: testResultReporters,

        // Specifies the array of files to be loaded by the browser in the order listed.
        files: filesToLoadInBrowser,

        // Defines preprocessors to apply to specific files before they are served to the browser.
        preprocessors: filePreprocessors
    };

    // --- Apply Configuration ---
    // Pass the constructed configuration object to Karma's 'set' method.
    testEnvironmentSettings.set(finalConfigurationSettings);

    // Optional: Log a message indicating successful configuration.
    // console.log('Karma test runner configuration has been successfully applied.');
};