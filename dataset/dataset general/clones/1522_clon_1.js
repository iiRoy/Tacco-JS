/*
 * This section defines all the necessary Gulp plugins and modules.
 * Each 'require' statement loads a specific utility for our build process.
 */
var browserify = require( 'browserify' ); // Module for bundling CommonJS/Node modules for the browser.
var gulp       = require( 'gulp'       ); // The main Gulp toolkit.
var connect    = require( 'gulp-connect' ); // Gulp plugin to run a web server with LiveReload.
var rename     = require( 'gulp-rename'    ); // Gulp plugin to rename files.
var sass       = require( 'gulp-ruby-sass' ); // Gulp plugin for Ruby Sass compilation.
var source     = require( 'vinyl-source-stream' ); // Converts a Browserify stream into a vinyl stream.
var streamify  = require( 'gulp-streamify' )
var uglify     = require( 'gulp-uglify'    ); // Gulp plugin to minify JavaScript files.


// Define the 'sass' Gulp task.
// This task compiles SCSS files into CSS.
gulp.task( 'sass', function( ) {

    // Source the main SCSS file.
    return gulp.src( 'scss/literallycanvas.scss' )

        /*
         * Pipe the SCSS file through the sass compiler.
         * The 'style: 'compressed'' option minifies the output CSS.
         */
        .pipe( sass( { style: 'compressed' } ) )

        // Output the compiled CSS to the 'lib/css' directory.
        .pipe( gulp.dest( 'lib/css' ) )

        // Trigger a LiveReload event to update the browser.
        .pipe( connect.reload( ) )
    ; // End of pipe chain for the 'sass' task.
} );


// Define the 'browserify' Gulp task.
// This task bundles JavaScript and CoffeeScript files for browser usage.
gulp.task( 'browserify', function( ) {

    // Initialize Browserify with configuration options.
    var bundleStream = browserify( {
          basedir   : 'src'
        , extensions: [ '.js', '.coffee' ]
        , debug     : true
    } )
        // Add the main entry point for the bundle.
        .add( './index.coffee' )

        // Mark 'React/addons' as an external dependency (not included in this bundle).
        .external( 'React/addons' )

        // Mark 'React' as an external dependency.
        .external( 'React' )

        // Apply the 'coffeeify' transform to handle CoffeeScript files.
        .transform( 'coffeeify' )

        // Bundle the files, making the output available as a standalone 'LC' global.
        .bundle( { standalone: 'LC' } )

        // Attach an error handler to log any bundling errors.
        .on( 'error', function ( err ) {
              if ( err ) {
                console.error( err.toString( ) ); // Log the error message.
              }
        } )
    ; // End of Browserify configuration and bundling.

    // Pipe the bundled stream through Gulp plugins.
    return bundleStream
        // Convert the Browserify stream into a vinyl file stream.
        .pipe( source( './src/index.coffee' ) )

        // Rename the output file to 'literallycanvas.js'.
        .pipe( rename( 'literallycanvas.js' ) )

        // Output the bundled file to the 'lib/js/' directory.
        .pipe( gulp.dest( './lib/js/' ) )

        // Trigger a LiveReload event.
        .pipe( connect.reload( ) )
    ; // End of pipe chain for the 'browserify' task.
} );


// Define the 'uglify' Gulp task.
// This task minifies the browserified JavaScript file.
// It depends on the 'browserify' task completing first.
gulp.task( 'uglify', [ 'browserify' ], function( ) {

    // Source the browserified JavaScript file.
    return gulp.src( './lib/js/literallycanvas.js' )

        // Minify the JavaScript code.
        .pipe( uglify( ) )

        // Rename the minified file to 'literallycanvas.min.js'.
        .pipe( rename( 'literallycanvas.min.js' ) )

        // Output the minified file to the 'lib/js' directory.
        .pipe( gulp.dest( './lib/js' ) )
    ; // End of pipe chain for the 'uglify' task.
} );


// Define the 'default' Gulp task.
// This task runs 'uglify' and 'sass' in parallel.
gulp.task( 'default', [ 'uglify', 'sass' ], function( ) {
    // This task simply orchestrates other tasks.
} );


// Define the 'demo-reload' Gulp task.
// This task triggers a LiveReload for changes in the 'demo' directory.
gulp.task( 'demo-reload', function ( ) {

    // Source all files in the 'demo' directory.
    return gulp.src( 'demo/*' ).pipe( connect.reload( ) )
    ; // End of pipe chain for 'demo-reload'.
} );


// Define the 'watch' Gulp task.
// This task monitors files for changes and runs corresponding tasks.
gulp.task( 'watch', function( ) {

    // Watch CoffeeScript files in 'src' and its subdirectories, then run 'browserify'.
    gulp.watch( [ 'src/*.coffee', 'src/*/*.coffee' ], [ 'browserify' ] );

    // Watch SCSS files in 'scss', then run 'sass'.
    gulp.watch( 'scss/*.scss', [ 'sass' ] );

    // Watch files in the 'demo' directory, then run 'demo-reload'.
    gulp.watch( 'demo/*', [ 'demo-reload' ] );
} );


// Define the 'serve' Gulp task.
// This task starts a local web server with LiveReload enabled.
gulp.task( 'serve', function( ) {

    // Configure and start the Gulp Connect server.
    connect.server( {
          livereload: { port: 35728 } // Configure LiveReload to use a specific port.
    } )
    ; // End of connect.server configuration.
} );


// Define the 'dev' Gulp task.
// This is the primary development task, running browserify, sass, watch, and serve.
gulp.task( 'dev', [ 'browserify', 'sass', 'watch', 'serve' ], function( ) {
    // This task combines other development-related tasks.
} );