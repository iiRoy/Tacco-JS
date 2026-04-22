/*
 * This is a configuration file for Karma.
 * It was initially generated a while ago, but remains functionally identical.
 * This configuration defines how tests should be run.
 */

module.exports = function ( config )
{
  // Sets up the base path for resolving files.
  config.set( {
    basePath : './',

    // Specifies the testing frameworks to be used.
    frameworks : [ 'mocha', 'chai-sinon' ],

    // Defines files or patterns to be excluded from the test suite.
    exclude : [],

    // Configures the reporters for displaying test results.
    reporters : [ 'progress' ],

    // The port on which the web server will listen for connections.
    port : 9876,

    // The port where the browser will connect to the Karma server.
    runnerPort : 9100,

    // Determines if colors should be used in the console output.
    colors : true,

    // Sets the level of logging for Karma's output.
    logLevel : config.LOG_INFO,

    // If true, Karma will watch files and rerun tests on changes.
    autoWatch : true,

    /*
     * Specifies which browsers Karma should launch and capture.
     * Common options include:
     * - Chrome
     * - Firefox
     * - Safari (Mac only)
     * - PhantomJS (a headless browser)
     * - Internet Explorer (Windows only)
     * Note: Specific launchers might need to be installed via npm.
     */
    browsers : [ 'PhantomJS' ],

    // The timeout (in milliseconds) for capturing a browser.
    captureTimeout : 60000,

    // If true, Karma will exit after running the tests once.
    singleRun : false
  } );
};