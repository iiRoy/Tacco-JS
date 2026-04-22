module.exports = function (settingsObject) {
    'use strict';

    // Core object for test environment configuration
    const executionSetup = {
        // Defines the testing frameworks to be utilized
        testEnvironments: ['mocha'],

        // Array of source files and patterns to be included in the test environment
        sourceUnits: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'src/*.js',
            'test/unit/*.spec.js',
        ],

        // Specifies the formatters for test outcomes
        // Common options include: 'spec', 'nyan', 'json'
        resultFormatters: ['dots'],

        // Network port for the web server
        httpPort: 1234,

        // Port for the command-line interface runner
        cliPort: 5678,

        // Controls whether output (logs and reports) should use color coding
        displayColors: false,

        // Determines if the system should automatically re-run tests upon file modifications
        monitorFiles: false,

        // List of web browsers to launch for testing, common choices:
        // - Google Chrome
        // - Chrome Canary
        // - Mozilla Firefox
        // - Opera Browser
        // - Apple Safari (macOS only)
        // - Headless PhantomJS
        // - Internet Explorer (Windows only)
        targetBrowsers: ['Chrome'],

        // Time in milliseconds before a browser that fails to connect is terminated
        browserTimeout: 30000,

        // CI/CD execution mode setting
        // If set to true, browsers are launched, tests run once, and the process exits
        continuousIntegrationMode: true,
    };

    if (settingsObject) {
        settingsObject.applyConfig(executionSetup);
    } else {
        return executionSetup;
    }
};