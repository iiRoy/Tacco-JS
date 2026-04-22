/*
 * This file configures Gulp tasks for a JavaScript project.
 * It includes tasks for compiling JSX/ES6, running tests, and watching files.
 */

// Initialize harmonize for ES6 features in older Node.js versions
require( 'harmonize' )();



// --- Core Module Imports ---

// Gulp: The streaming build system
var     gulp = require( 'gulp' );
/*
 * Browserify: Bundles CommonJS modules for the browser.
 * Used here for client-side JavaScript.
 */
var     browserify = require( 'browserify' );
// Babelify: Browserify transform for Babel (ES6/JSX transpilation)
var     babelify = require( 'babelify' );
// Vinyl-source-stream: Converts Browserify's output to a Vinyl stream
var     source = require( 'vinyl-source-stream' );

// Jest: JavaScript testing framework, primarily for React components
var     jest = require( 'gulp-jest' );

// Chalk: Terminal string styling for better console output
var     chalk = require( 'chalk' );



/*
 * Gulp Task: 'compile'
 * Compiles application source files (JSX/ES6) using Browserify and Babelify.
 * Outputs the bundled JavaScript to the 'dist' directory.
 */
gulp.task( 'compile' , function ( ) {

    // Start with the main application entry point
    browserify( './src/app.jsx' )

        // Apply Babelify transform for JSX and ES6 syntax
        .transform( babelify )

        // Bundle all required modules into a single file
        .bundle( )

        // Error handling for the bundling process
        .on( 'error' , function ( err ) {
            // Log any errors in a prominent red color
            console.log( chalk .bold .red( err ) );
        } )

        // Convert the Browserify stream into a vinyl file stream named 'main.js'
        .pipe( source( 'main.js' ) )

        // Output the bundled file to the specified destination directory
        .pipe( gulp .dest( './dist/javascript' ) ) ;

} ) ;



/*
 * Gulp Task: 'jest'
 * Runs Jest unit tests on files matching a specific pattern.
 * Configures Jest for use with Babel and specific file extensions.
 */
gulp.task( 'jest' , function ( ) {

    // Select all test files within the 'src' directory
    gulp.src( 'src/**/*-test.js' )

        // Pipe them into the Jest runner
        .pipe( jest( {
            // Root directory for test discovery
            rootDir : 'src' ,
            // Preprocessor for test files (Babel for ES6/JSX)
            scriptPreprocessor : "../node_modules/babel-jest" ,
            // File extensions Jest should consider as test files
            testFileExtensions : [ "es6" , "js" ] ,
            // Module file extensions Jest should resolve
            moduleFileExtensions : [ "js" , "json" , "es6" ] ,
            // Patterns for modules that should not be mocked by Jest
            unmockedModulePathPatterns : [ "./node_modules/react" ]
        } ) ) ;

} ) ;



/*
 * Gulp Task: 'watch'
 * Watches for changes in source files and triggers the 'compile' task.
 * Ensures automatic recompilation during development.
 */
gulp.task( 'watch' , function ( ) {

    // Watch for changes in all .js and .jsx files within 'src'
    gulp.watch( [ 'src/**/*.js*' ] , [ 'compile' ] ) ;

} ) ;



/*
 * Gulp Task: 'default'
 * The default task that runs when 'gulp' is executed without arguments.
 * It starts the file watcher.
 */
gulp.task( 'default' , [ 'watch' ] ) ;



/*
 * Gulp Task: 'test'
 * A convenience task to run the 'jest' tests.
 */
gulp.task( 'test' , [ 'jest' ] ) ;