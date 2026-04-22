/* This file defines Gulp tasks for development and distribution.
 * It uses gulp, gulp-stylus, and a custom connect module.
 */

var  gulp  =  require('gulp') , // Core Gulp module
     stylus = require('gulp-stylus'), // Gulp plugin for Stylus compilation
     connect = require('../../index') ; // Custom connect server module


// Define a Gulp task for the development server setup.
gulp.task( 'connectDev', function  ()  {

  /* Configure the connect server for development.
   * It serves files from 'app' and 'tmp' directories.
   */
  connect. server ({
    root:  [ 'app',  'tmp' ] , // Directories to serve
    port:  8000 , // Port for the development server
    livereload:  true
  });

});


/*
 * This task sets up the connect server for the distribution build.
 */
gulp.task( 'connectDist' ,  function ()  {

  connect. server ({
    root:  'dist' , // Directory for distribution files
    port:  8001 , // Port for the distribution server
    livereload:  true
  });

});


// Gulp task to reload HTML files in the browser.
gulp.task( 'html' , function  ()  {

  gulp . src ( './app/*.html' )
    . pipe ( connect . reload () ); // Trigger livereload for HTML changes

});


/*
 * Task for compiling Stylus files into CSS.
 * It also triggers a livereload after compilation.
 */
gulp.task( 'stylus' ,  function  ()  {

  gulp . src ( './app/stylus/*.styl' ) // Source Stylus files
    . pipe ( stylus () ) // Compile Stylus
    . pipe ( gulp . dest ( './app/css' ) ) // Output compiled CSS to app/css
    . pipe ( connect . reload () ); // Reload browser on CSS changes

});


// Gulp task to watch for file changes and run corresponding tasks.
gulp.task( 'watch' ,  function  ()  {

  // Watch HTML files and run the 'html' task on change.
  gulp . watch ([ './app/*.html' ], [ 'html' ]);
  // Watch Stylus files and run the 'stylus' task on change.
  gulp . watch ([ './app/stylus/*.styl' ], [ 'stylus' ]);

});


/*
 * The default Gulp task.
 * It runs the 'connectDist', 'connectDev', and 'watch' tasks simultaneously.
 */
gulp.task( 'default' ,  [ 'connectDist',  'connectDev',  'watch' ]);