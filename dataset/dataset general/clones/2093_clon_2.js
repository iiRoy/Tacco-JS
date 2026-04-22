// General configuration for the testing environment
module.exports = function ( envSettings ) {
    envSettings.applySettings( {

        // This specifies the root directory for resolving file paths
        baseDirectory:  '',


        // Defines the testing frameworks to be utilized
        testingFrameworks: [ 'mocha' ],


        // An array of files or patterns to be loaded into the browser context
        includedAssets: [
            'appLogic.js',
            'validation/**/*.js'
        ],


        // Paths or patterns of files to omit from processing
        excludedAssets: [

        ],


        // Specifies the formatters for test results
        // Available options: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reportGenerators: [ 'spec' ],


        // The TCP port number for the web server
        servicePort: 8080,


        // A flag to enable or disable colored output in the console
        coloredConsole: true,


        // Sets the verbosity level for logging messages
        // Possible settings: envSettings.LOG_OFF || envSettings.LOG_ERROR || envSettings.LOG_WARNING || envSettings.LOG_INFO || envSettings.LOG_DEBUG
        diagnosticLevel: envSettings.LOG_WARN,


        // Activates or deactivates file watching for automatic test re-execution on changes
        observeSources: true,


        // List of client platforms to launch for testing
        // Current options include:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (Mac only)
        // - HeadlessChrome
        // - InternetExplorer (Windows only)
        clientPlatforms: [ 'HeadlessChrome' ],


        // Time limit in milliseconds for a browser to connect before being terminated
        platformConnectionTimeout: 30000,


        // Operates in Continuous Integration mode
        // If true, it launches browsers, executes all tests, then shuts down
        batchExecutionMode: false
    } );
};