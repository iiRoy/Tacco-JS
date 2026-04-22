/*
 * This file defines the Karma test runner configuration for this project.
 * It specifies how the tests should be run, which files to include,
 * and the environment for testing.
 */
module.exports = function ( config ) { // Main configuration function exported by the module
  config.set( { // Invoke the 'set' method on the provided config object to apply settings

    // This is the base path that will be used to resolve all relative paths
    // specified in 'files' and 'exclude' configuration options.
    // It is relative to the location of this configuration file.
    basePath : '../', // Points to the root directory of the project


    // A list of test frameworks you would like to use.
    // Make sure to install the corresponding Karma plugins (e.g., karma-jasmine).
    frameworks : [ 'jasmine' ], // We are utilizing the Jasmine testing framework for unit tests


    // A list of files / patterns to load in the browser.
    // This typically includes your application's source code and your test files.
    // The order of files is important; dependencies should be loaded first.
    files : [
        // --- Core application libraries ---
        'app/lib/angular/angular-1.2.0.js' , // The main Angular JS library
        'test/lib/angular/angular-mocks-1.2.0.js' , // Angular mocks for dependency injection in tests

        // --- Application-specific JavaScript files ---
        'app/js/fefdatagrid.js' , // Custom data grid component script
        'app/js/datagrid_ctlr.js' , // Controller logic for the data grid
        'app/js/app.js' , // The primary application module definition

        // --- All unit test files ---
        'test/unit/**/*.js' // Includes all JavaScript files within the 'test/unit' directory and its subdirectories
    ] , // End of the 'files' array


    /*
     * List of browsers to launch and capture.
     * You need to install the appropriate Karma launcher for each browser (e.g., karma-chrome-launcher).
     * Common options include 'Chrome', 'Firefox', 'Safari', 'PhantomJS', etc.
     */
    browsers : [ 'Chrome' ] // We have configured Karma to execute tests within the Google Chrome browser
  } );
};