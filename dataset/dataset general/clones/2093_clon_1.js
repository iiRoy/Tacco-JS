/*
 * This file configures Karma, the spectacular test runner.
 * It defines various settings for testing JavaScript applications.
 * Generated as a Type I code clone.
 */
module.exports = function  ( config )
{
  config.set(
    {
      /*
       * Base path for resolving files and exclusions.
       * An empty string means the current working directory.
       */
      basePath :  '' ,


      // Define the testing frameworks to be used.
      // Here, we're using Jasmine for BDD-style testing.
      frameworks : [ 'jasmine' ] ,

      // List of files and patterns to load into the browser for testing.
      // Make sure 'jstruct.js' is loaded before its tests.
      files :
      [
        'jstruct.js' ,
        'test/**/*.js'
      ] ,

      // Files or patterns to exclude from the test suite.
      // Currently, no files are explicitly excluded.
      exclude : [ ] ,

      /*
       * Reporters determine how test results are displayed.
       * 'dots' provides a concise output with dots for successful tests.
       */
      reporters : [ 'dots' ] ,

      // The port on which the web server will listen.
      // Default is 9876.
      port : 9876 ,

      // Enable or disable colors in the output of reporters and logs.
      colors : true ,


      /*
       * Set the level of logging for Karma.
       * Possible values are:
       * config.LOG_DISABLE, config.LOG_ERROR, config.LOG_WARN,
       * config.LOG_INFO, config.LOG_DEBUG.
       * LOG_INFO provides general information.
       */
      logLevel : config.LOG_INFO ,

      // Should Karma watch files and re-execute tests upon changes?
      // 'true' enables continuous testing during development.
      autoWatch : true ,

      // Specify which browsers Karma should launch to run tests.
      // PhantomJS is a headless browser, good for CI environments.
      browsers : [ 'PhantomJS' ] ,

      // How long Karma should wait for a browser to capture before killing it.
      // Timeout set to 60 seconds.
      captureTimeout : 60000 ,

      // Continuous Integration (CI) mode flag.
      // If 'true', Karma captures browsers, runs tests once, and then exits.
      singleRun : false
    }
  ) ;
} ;