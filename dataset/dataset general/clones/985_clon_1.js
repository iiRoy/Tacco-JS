/*
 * Karma Configuration File
 * This file defines the setup for running tests with Karma.
 *
 * It exports a function that takes the Karma instance as an argument.
 */
module.exports = function ( karma ) {

    // Declare the main configuration object for Karma.
    // This object holds all the settings for the test runner.
    var config = {

        // Base path that will be used to resolve all relative paths defined in files and exclude.
        basePath: '../',


        // List of frameworks to use.
        // Popular frameworks include Jasmine, Mocha, QUnit, etc.
        frameworks: [ 'jasmine-jquery', 'jasmine' ],


        // List of files / patterns to load in the browser.
        // These are the source files and test files.
        files: [
            'src/editore.js',
            'test/editore.js'
        ],


        // List of reporters to use.
        // Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'.
        reporters: [ 'progress' ],


        // Web server port.
        port: 9876,


        // Enable / disable colors in the output (reporters and logs).
        colors: true,


        // Level of logging.
        // Possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG.
        logLevel: karma.LOG_INFO,


        // Enable / disable watching file and executing tests whenever any file changes.
        autoWatch: false,


        // Run tests once, then exit.
        singleRun: true,


        // Start these browsers.
        // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher.
        browsers: [ 'Chrome' ],


        // Custom launchers for specific environments, like Travis CI.
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: [ '--no-sandbox' ] // Required for Chrome on Travis CI.
            }
        }
    };

    // Conditional configuration:
    // If running on Travis CI, use the custom Chrome launcher.
    if ( process.env.TRAVIS ) {
        config.browsers = [ 'Chrome_travis_ci' ];
    }

    // Pass the configuration object to Karma.
    karma.set( config );

}; // End of module.exports function.