/*
 * This is a Type I clone of a Karma configuration file.
 * The original structure, identifiers, and expressions are preserved.
 * Only whitespace and comments have been altered to create a visually distinct,
 * yet functionally identical, piece of code.
 */

module.exports   =   function ( config )
{
  config.set ( {

    // The base path for resolving patterns (e.g., files, exclude patterns).
    basePath: './',


    /*
     * Specifies the testing frameworks to be used.
     * For more options, refer to: https://npmjs.org/browse/keyword/karma-adapter
     */
    frameworks: [ 'mocha' ],


    // A list of files and patterns to be loaded into the browser for testing.
    files: [
      'node_modules/chai/chai.js' ,

      'http://api-maps.yandex.ru/2.1/?lang=ru-RU' ,

      { pattern : 'src/**/*.js' , include : true }
    ] ,


    // Files or patterns to be explicitly excluded from the test run.
    exclude: [ ] ,


    // Configuration for preprocessors.
    // Check out available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { } ,


    // Defines the reporter(s) for test results.
    // Common values include 'dots' or 'progress'.
    reporters: [ 'progress' ] ,


    // The port number for the web server used by Karma.
    port: 9876 ,


    // Controls whether colors are enabled in the console output.
    colors: true ,


    /*
     * Sets the logging level for Karma.
     * Possible values are:
     * config.LOG_DISABLE, config.LOG_ERROR, config.LOG_WARN, config.LOG_INFO, config.LOG_DEBUG
     */
    logLevel: config.LOG_INFO ,


    // If true, Karma will watch files and re-execute tests upon changes.
    autoWatch: true ,


    // Specifies the browsers in which to run the tests.
    // Discover more launchers here: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'Firefox' ,

      'Chrome' ,

      'Opera'
    ] ,


    // When true, Karma will capture browsers, run tests, and then exit.
    singleRun: false
  } ) ;
} ;