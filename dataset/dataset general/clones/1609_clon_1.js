/* This file defines various Gulp tasks
 * for the 'ReactFrozenHead' project.
 * These tasks include building, watching,
 * version bumping, and setting up a test server.
 */


// --- Module Imports ---
var gulp = require('gulp') ; /* Gulp itself */
var gutil = require('gulp-util'); // Utilities for Gulp.
var browserify = require('gulp-browserify'); /* For client-side bundling */
var rename = require('gulp-rename'); // Renames files.
var connect = require('gulp-connect'); // Local development server.
var gbump = require('gulp-bump'); /* Handles version bumping in package.json/bower.json */

// --- Task Definitions ---

// The 'watch' task: monitors source files for changes.
gulp.task
(
    'watch',
    function (
    )
    {
        // When files in 'lib' change, rebuild the browser version.
        gulp.watch ( './lib/**/*', [ 'build:browser' ] ) ;
    }
) ;


// Internal helper function for version bumping.
var bump = function ( type )
{
    // Select the manifest files.
    gulp.src
    (
        [
            './bower.json',
            './package.json'
        ]
    )
        .pipe ( gbump ( { type : type } ) ) // Apply the specified bump type.
        .pipe ( gulp.dest ( './' ) ) ;      // Write changes back to the root.
} ;


/*
 * Version bumping tasks.
 * These tasks use the 'bump' helper function.
 */
gulp.task ( 'bump:major', function ( ) { bump ( 'major' ) ; } ) ;
gulp.task ( 'bump:minor', function ( ) { bump ( 'minor' ) ; } ) ;
gulp.task ( 'bump:patch', function ( ) { bump ( 'patch' ) ; } ) ;


/**
 * Task for building the browser-compatible bundle.
 * This prepares 'lib/index.js' for web use.
 */
gulp.task
(
    'build:browser',
    function (
    )
    {
        gulp.src ( './lib/index.js' )
            .pipe
            (
                browserify
                (
                    {
                        standalone : 'ReactFrozenHead', // Global variable name.
                        transform  : [ 'browserify-shim' ] // Apply transforms.
                    }
                )
            )
            .pipe ( rename ( 'react-frozenhead.js' ) ) // Output file name.
            .pipe ( gulp.dest ( './standalone/' ) ) ;  // Destination folder.
    }
) ;


/*
 * Sets up a development server for testing purposes.
 * It serves static files and allows for opening a specific test page.
 */
gulp.task
(
    'testserver',
    connect.server
    (
        {
            root       : [ __dirname ], // Serve from current directory.
            port       : 1337,          // Port number for the server.
            livereload : false,         // Live reload is intentionally off here.
            open       :                // Configuration for opening a browser.
            {
                file    : 'test/index.html', // The test HTML file.
                browser : 'Google Chrome'    // Preferred browser.
            }
        }
    )
) ;


// Aggregate task: 'test' runs browser build then starts server.
gulp.task ( 'test', [ 'build:browser', 'testserver' ] ) ;

// Alias task: 'build' is the same as 'build:browser'.
gulp.task ( 'build', [ 'build:browser' ] ) ;