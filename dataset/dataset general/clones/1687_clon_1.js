/*
 * This file configures Karma, the spectacular test runner.
 * It sets up various options for testing JavaScript code.
 */

module.exports = function ( config ) {
    // The main configuration object for Karma.
    config.set ( {

        // Define the base path for resolving files and exclusions.
        // This path is relative to the location of this configuration file.
        basePath:    '.',

        // List of testing frameworks to be used.
        // Here, we are utilizing Jasmine for our tests.
        frameworks:  [
            'jasmine'
        ],

        // Define the files and patterns to include in the browser.
        // These files will be served and watched for changes.
        files:       [
            {
                pattern:   'src/*.js',
                watched:   true,
                served:    true,
                included:  true
            },

            // Test specification files.
            {
                pattern:   'test/*spec.js',
                watched:   true,
                served:    true,
                included:  true
            }
        ],

        // Files or patterns to be excluded from the test run.
        exclude:     [
            // No files are explicitly excluded in this configuration.
        ],

        /*
         * Reporters determine how test results are displayed.
         * Common values include 'dots', 'progress', 'junit', 'growl', 'coverage'.
         * The 'progress' reporter provides a simple, readable output.
         * This setting can also be overridden via the CLI, e.g., --reporters progress.
         */
        reporters:   [
            'progress'
        ],

        // The port number for the web server that serves the test files.
        // Can be overridden via CLI: --port 9876.
        port:        9876,

        // The port number for the CLI runner.
        // Can be overridden via CLI: --runner-port 9100.
        runnerPort:  9100,

        /*
         * Enable or disable color output in the terminal for reporters and logs.
         * Controlled by CLI flags: --colors or --no-colors.
         */
        colors:      true,

        // Set the logging level for Karma.
        // Possible values are: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
        // CLI override example: --log-level debug.
        logLevel:    config.LOG_INFO,

        /*
         * Automatically watch files for changes and re-execute tests.
         * CLI flags: --auto-watch or --no-auto-watch.
         */
        autoWatch:   true,

        /**
         * Specify which browsers Karma should launch and use for testing.
         * Available browsers typically include:
         * - Chrome
         * - ChromeCanary
         * - Firefox
         * - Opera
         * - Safari (Mac only)
         * - PhantomJS (headless browser)
         * - IE (Windows only)
         * This can be configured from the command line, for example:
         * CLI --browsers Chrome,Firefox,Safari
         */
        browsers:    [
            'Chrome'
        ],

        // If a browser fails to capture within this timeout (in milliseconds), it will be killed.
        // Default is usually 5000ms. CLI override: --capture-timeout 5000.
        captureTimeout: 10000,

        /*
         * Determine if tests should run once on start (after browsers are captured)
         * and then exit, or if Karma should keep running.
         * CLI flags: --single-run or --no-single-run.
         */
        singleRun:   false,

        /**
         * Report any test specifications that take longer than the specified
         * milliseconds to execute. Helps identify slow tests.
         * CLI option: --report-slower-than 500.
         */
        reportSlowerThan: 500,

        // Preprocessors to apply to files before they are served to the browser.
        // Commonly used for things like code coverage, transpilation, etc.
        preprocessors: {
            // No specific preprocessors are defined here for now.
        }

    } );

};