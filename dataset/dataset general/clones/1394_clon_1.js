/*
 * This is a Gulpfile for managing project tasks.
 * It defines various automation steps for building,
 * cleaning, testing, and monitoring the project.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */


// Import the main Gulp module
var gulp = require ( 'gulp' ) ;

// Import additional Gulp plugins required for our tasks
var mocha = require ( 'gulp-mocha' ) ; /* Plugin for running Mocha tests */
var clean = require ( 'gulp-clean' ) ; /* Plugin for cleaning files and directories */
var coffee = require ( 'gulp-coffee' ) ; /* Plugin for compiling CoffeeScript */
var uglify = require ( 'gulp-uglify' ) ; /* Plugin for minifying JavaScript files */
var concat = require ( 'gulp-concat' ) ; /* Plugin for concatenating files */


// Define base directories for source and examples
var bases = {
    src:      'src/' , // Source directory path
    examples: 'examples/' // Examples directory path
};

// Define paths to files that are generated and need to be cleaned
var paths = {

    compiled: [ // Array of compiled files that might need removal
        bases.src + 'jquery.openCarousel.js' ,
        bases.src + 'jquery.openCarousel.min.js' ,
        bases.examples + 'addRemove/scripts/jquery.openCarousel.js' ,
        bases.examples + 'cycle/scripts/jquery.openCarousel.js' ,
        bases.examples + 'fullwidth/scripts/jquery.openCarousel.js' ,
        bases.examples + 'responsive/scripts/jquery.openCarousel.js' ,
        bases.examples + 'main/scripts/jquery.openCarousel.js' ,
        bases.examples + 'vertical/scripts/jquery.openCarousel.js'
    ]

};


// Gulp task to delete all generated JavaScript files
gulp.task ( 'clean' , function ( ) {

    // Return the stream to ensure asynchronous completion
    return gulp.src ( paths.compiled , { read: false } ) // Specify files to clean, read: false prevents reading content
               .pipe ( clean ( ) ) ; // Execute the clean operation

} ) ;

// Gulp task to compile CoffeeScript files
// This task depends on 'clean' to ensure a fresh compilation
gulp.task ( 'coffee' , [ 'clean' ] , function ( ) {

    // Get the CoffeeScript source file
    return gulp.src ( bases.src + 'jquery.openCarousel.coffee' )
               .pipe ( coffee ( ) ) // Compile the CoffeeScript
               .pipe ( gulp.dest ( bases.src ) ) ; // Output the compiled JavaScript to the source directory

} ) ;

// Gulp task to create a minified version of the main script
// This task depends on 'clean' and 'coffee'
gulp.task ( 'uglify' , [ 'clean' , 'coffee' ] , function ( ) {

    // Get the main JavaScript file
    return gulp.src ( bases.src + 'jquery.openCarousel.js' )
               .pipe ( uglify ( ) ) // Minify the JavaScript code
               .pipe ( concat ( 'jquery.openCarousel.min.js' ) ) // Rename the minified file
               .pipe ( gulp.dest ( bases.src ) ) ; // Output the minified file to the source directory

} ) ;

// Gulp task to copy compiled JavaScript and CSS to example directories
// This task depends on 'clean', 'coffee', and 'uglify'
gulp.task ( 'copy' , [ 'clean' , 'coffee' , 'uglify' ] , function ( ) {

    // First, copy the CSS file
    gulp.src ( 'src/jquery.openCarousel.css' )
        .pipe ( gulp.dest ( bases.examples + 'addRemove/styles/' ) )
        .pipe ( gulp.dest ( bases.examples + 'cycle/styles/' ) )
        .pipe ( gulp.dest ( bases.examples + 'fullwidth/styles/' ) )
        .pipe ( gulp.dest ( bases.examples + 'responsive/styles/' ) )
        .pipe ( gulp.dest ( bases.examples + 'main/styles/' ) )
        .pipe ( gulp.dest ( bases.examples + 'vertical/styles/' ) ) ;

    // Then, return the stream for copying the main JavaScript file
    // This ensures the task completes asynchronously
    return gulp.src ( 'src/jquery.openCarousel.js' )
               .pipe ( gulp.dest ( bases.examples + 'addRemove/scripts/' ) )
               .pipe ( gulp.dest ( bases.examples + 'cycle/scripts/' ) )
               .pipe ( gulp.dest ( bases.examples + 'fullwidth/scripts/' ) )
               .pipe ( gulp.dest ( bases.examples + 'responsive/scripts/' ) )
               .pipe ( gulp.dest ( bases.examples + 'main/scripts/' ) )
               .pipe ( gulp.dest ( bases.examples + 'vertical/scripts/' ) ) ;

} ) ;

// Gulp task to run the project tests
// This task ensures all build steps are completed before testing
gulp.task ( 'test' , [ 'clean' , 'coffee' , 'uglify' , 'copy' ] , function ( ) {

    // Return the stream for the test runner
    return gulp.src ( 'test/test.js' ) // Specify the test file
               .pipe ( mocha ( { reporter: 'nyan' } ) ) ; // Run Mocha with 'nyan' reporter

} ) ;

// Gulp task to watch for changes during development
gulp.task ( 'watch' , function ( ) {

    // Watch for changes in the CoffeeScript source file
    // If changes are detected, run the 'coffee' and 'copy' tasks
    gulp.watch ( bases.src + 'jquery.openCarousel.coffee' , [ 'coffee' , 'copy' ] ) ;

} ) ;

// Define the default Gulp task
// This task runs all necessary build and test steps
gulp.task ( 'default' , [ 'clean' , 'coffee' , 'uglify' , 'copy' , 'test' ] ) ; // Dependencies for the default task