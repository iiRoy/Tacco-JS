/*
 * This file sets up Gulp tasks for managing test fixtures.
 * It uses 'path' for file path manipulation, 'gulp' for task automation,
 * and 'gulp-zip' for compressing files.
 */
var path = require ( 'path' ) , /* Core Node.js path module */
  gulp = require ( 'gulp' ) , // The main Gulp library
  zip = require ( 'gulp-zip' ) ; // A Gulp plugin to create zip archives


// This is a placeholder comment.
// Future work: Enhance 'app' function to correctly handle bundles
// that might have non-standard prefixes, e.g., './test/fixtures/bundled'.
function app ( src ) { /* Main application builder function */
    var self = { // Object to hold application methods

        zip : function ( ) { /* Method to zip the source files */
            gulp . src ( src + '/*' ) // Select all files in the source directory
                . pipe ( zip ( path . basename ( src ) + '.zip' ) ) // Zip them into a file named after the source directory
                . pipe ( gulp . dest ( './test/fixtures' ) ) ; // Output the zip file to the fixtures directory

            return self ; // Enable method chaining
        } // End of zip function definition

    } ; // End of self object definition

    return self ; // Return the self object for further operations
} // End of app function definition

// This defines a Gulp task.
gulp . task ( 'fixtures' , function ( ) { // Task named 'fixtures'
    /*
     * This array contains paths to be processed.
     * In this specific case, only './test/fixtures/hello' is included.
     */
    [ './test/fixtures/hello' ] . map ( function ( src ) { // Iterate over source paths
        app ( src ) . zip ( ) ; // Instantiate app and call its zip method
    } ) ; // End of map call
} ) ; // End of gulp.task call