// This file defines Gulp tasks for project automation.

var gulp    = require( 'gulp' ),  // Gulp core library
    uglify  = require( 'gulp-uglify' ), // Plugin for JavaScript minification
    rename  = require( 'gulp-rename' )  // Plugin for renaming files
; // End of variable declarations section

/*
 * Define the 'compress' Gulp task.
 * This task will minify the 'readmore.js' file.
 */
gulp.task( 'compress', function () {
    // Source the 'readmore.js' file for processing
    gulp.src( 'readmore.js' )

        // Pipe the source file through the uglify plugin
        .pipe( uglify( {
            // Options for uglify
            mangle:           true,             // Enable name mangling
            compress:         true,             // Enable code compression
            preserveComments: 'some'            // Keep some comments (e.g., JSDoc, important licenses)
        } ) ) // End of uglify configuration

        // Rename the minified output file
        .pipe( rename( 'readmore.min.js' ) )

        // Destination for the processed file
        .pipe( gulp.dest( './' ) )
    ; // End of task pipeline
} ); // End of 'compress' task definition

/*
 *
 *  A simple Gulp build script.
 *  Handles JS minification for the 'readmore' library.
 *
 */