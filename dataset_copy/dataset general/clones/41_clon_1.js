/*
 * Karma configuration file for testing.
 *
 * This configuration is based on the official Karma documentation:
 * http://karma-runner.github.io/0.12/config/configuration-file.html
 *
 * This particular configuration was originally generated on 2015-01-05
 * using the generator-karma tool, specifically version 0.8.3.
 */


module.exports = function ( config ) {

  /* Enforce strict mode for the entire script. */
  'use strict';

  // Set up the configuration for Karma.
  config.set ( {

    // enable / disable watching file and executing tests whenever any file changes
    // If set to true, Karma will re-run tests automatically on file modifications.
    autoWatch : true ,


    // base path, that will be used to resolve files and exclude
    // This path is relative to the location of this configuration file.
    basePath : '../' ,


    // testing framework to use (e.g., jasmine, mocha, qunit, etc.)
    // We are using Jasmine for our test suites.
    frameworks : [ 'jasmine' ] ,


    // list of files / patterns to load in the browser for testing
    files : [
      'bower_components/d3/d3.min.js' ,        // D3.js library
      'bower_components/angular/angular.js' ,  // Angular core
      'bower_components/angular-mocks/angular-mocks.js' , // Angular mocks for testing
      'bower_components/angular-animate/angular-animate.js' , // Angular Animate module
      'bower_components/angular-cookies/angular-cookies.js' , // Angular Cookies module
      'bower_components/angular-resource/angular-resource.js' , // Angular Resource module
      'bower_components/angular-route/angular-route.js' , // Angular Route module
      'bower_components/angular-sanitize/angular-sanitize.js' , // Angular Sanitize module
      'bower_components/angular-touch/angular-touch.js' , // Angular Touch module
      'bower_components/jquery/dist/jquery.js' , // jQuery library
      'bower_components/jasmine-jquery/lib/jasmine-jquery.js' , // Jasmine-jQuery for DOM testing
      'bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js' , // Angular Leaflet Directive
      'bower_components/spin.js/spin.js' , // Spin.js for loading indicators
      'app/scripts/**/*.js' , // All application scripts
      'test/spec/**/*.js' , // All test specification files

      // fixtures for tests, not included directly but served
      { pattern : 'test/mock/*.json' , watched : true , served : true , included : false }
    ] ,

    // list of files / patterns to exclude from the test run
    exclude : [ ] ,


    // web server port used by Karma
    port : 8080 ,


    /*
     * Start these browsers for testing.
     * Currently available options include:
     * - Chrome
     * - ChromeCanary
     * - Firefox
     * - Opera
     * - Safari (Mac OS only)
     * - PhantomJS (headless browser, good for CI)
     * - IE (Windows only)
     */
    browsers : [
      'PhantomJS' // Using PhantomJS for headless testing.
    ] ,


    // Which Karma plugins to enable for this configuration
    plugins : [
      'karma-phantomjs-launcher' , // Plugin for launching PhantomJS
      'karma-jasmine' , // Plugin for Jasmine framework integration
      'karma-nyan-reporter' // Plugin for Nyan reporter
    ] ,


    // Continuous Integration mode
    // if true, Karma will capture browsers, run tests once, and then exit.
    singleRun : false ,


    // Enable or disable colors in the output (e.g., for reporters).
    colors : true ,


    // List of reporters to use.
    reporters : [
      'nyan' // Using the Nyan reporter for fun.
    ] ,


    /*
     * Level of logging for Karma's output.
     * Possible values are:
     * LOG_DISABLE   - No logging
     * LOG_ERROR     - Only error messages
     * LOG_WARN      - Warning and error messages
     * LOG_INFO      - Informational, warning, and error messages (default)
     * LOG_DEBUG     - All messages, including debug information
     */
    logLevel : config.LOG_INFO

    // Uncomment the following lines if you are using Grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root to prevent conflicts with the site root
    // urlRoot: '_karma_'
  } ) ;
} ;
// End of Karma configuration.