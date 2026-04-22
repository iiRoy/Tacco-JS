/*
 * This is a Type I clone, generated according to the specified rules.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered to create a visually distinct, yet functionally identical, code fragment.
 */


/**
 *
 *  Web Starter Kit Project Source
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and limitations under the License.
 *
 */


'use strict' ; // Enforce strict mode for cleaner code.


//  Include Gulp and all necessary development tools.
//  These modules are crucial for our build process.
var gulp         = require( 'gulp' ) ;
var $            = require( 'gulp-load-plugins' ) ( ) ; // Loads Gulp plugins.
var del          = require( 'del' ) ;                   // Deletes files and folders.
var runSequence  = require( 'run-sequence' ) ;         // Runs a sequence of Gulp tasks.
var browserSync  = require( 'browser-sync' ) ;         // Synchronized browser testing.
var pagespeed    = require( 'psi' ) ;                   // Google PageSpeed Insights.
var reload       = browserSync . reload ;               // Shortcut for browser reload.


// List of browsers to support with Autoprefixer.
// This ensures broad compatibility for CSS properties.
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10'       ,
  'ie_mob >= 10'   ,
  'ff >= 30'       ,
  'chrome >= 34'   ,
  'safari >= 7'    ,
  'opera >= 23'    ,
  'ios >= 7'       ,
  'android >= 4.4' ,
  'bb >= 10'
] ;


// Gulp task to lint JavaScript files for potential errors and style issues.
// Uses JSHint for code quality checks.
gulp . task ( 'jshint' , function ( ) {
  return gulp . src ( 'app/scripts/**/*.js' )
    . pipe ( reload ( {
      stream : true ,
      once   : true
    } ) )
    . pipe ( $ . jshint ( ) )
    . pipe ( $ . jshint . reporter ( 'jshint-stylish' ) )
    . pipe ( $ . if ( ! browserSync . active , $ . jshint . reporter ( 'fail' ) ) ) ;
} ) ;


// Task for optimizing image assets.
// Images are compressed and cached for faster build times.
gulp . task ( 'images' , function ( ) {
  return gulp . src ( 'app/images/**/*' )
    . pipe ( $ . cache ( $ . imagemin ( {
      progressive : true , // Optimize images progressively.
      interlaced  : true   // Interlace GIFs for faster loading.
    } ) ) )
    . pipe ( gulp . dest ( 'dist/images' ) )
    . pipe ( $ . size ( {
      title : 'images'
    } ) ) ;
} ) ;


// Copies all root-level files from the 'app' directory to 'dist'.
// Excludes HTML files as they are handled by the 'html' task.
gulp . task ( 'copy' , function ( ) {
  return gulp . src ( [
    'app/*'                                     ,
    '!app/*.html'                               , // Exclude HTML files.
    'node_modules/apache-server-configs/dist/.htaccess' // Include .htaccess.
  ] , {
    dot : true // Ensures dotfiles like .htaccess are copied.
  } ) . pipe ( gulp . dest ( 'dist' ) )
    . pipe ( $ . size ( {
      title : 'copy'
    } ) ) ;
} ) ;


// Copies web fonts from the 'app/fonts' directory to the 'dist/fonts' directory.
gulp . task ( 'fonts' , function ( ) {
  return gulp . src ( [ 'app/fonts/**' ] )
    . pipe ( gulp . dest ( 'dist/fonts' ) )
    . pipe ( $ . size ( {
      title : 'fonts'
    } ) ) ;
} ) ;


// Compiles Sass stylesheets to CSS and automatically prefixes them for browser compatibility.
// Also concatenates and minifies the CSS for production.
gulp . task ( 'styles' , function ( ) {
  // It's generally best practice not to add Sass partials (files starting with '_') to `gulp.src`.
  // They should be imported by main Sass files.
  return gulp . src ( [
    'app/styles/*.scss'       ,
    'app/styles/**/*.css'     ,
    'app/styles/bootstrap.scss'
  ] )
    . pipe ( $ . changed ( 'styles' , {
      extension : '.scss'
    } ) )
    . pipe ( $ . rubySass ( {
      style     : 'expanded' , // Output style: 'expanded' or 'compressed'.
      precision : 10           // Number of decimal places to preserve.
    } ) )
    . on ( 'error' , console . error . bind ( console ) ) // Error handling for Sass compilation.
    . pipe ( $ . autoprefixer ( {
      browsers : AUTOPREFIXER_BROWSERS
    } ) )
    . pipe ( gulp . dest ( '.tmp/styles' ) ) // Output unprefixed CSS to .tmp directory.
    // Concatenate and Minify Styles for production readiness.
    . pipe ( $ . if ( '*.css' , $ . csso ( ) ) )
    . pipe ( gulp . dest ( 'dist/styles' ) )
    . pipe ( $ . size ( {
      title : 'styles'
    } ) ) ;
} ) ;


// Scans HTML files for asset references (JS, CSS) and optimizes them.
// This includes concatenation, minification, and unCSS for removing unused styles.
gulp . task ( 'html' , function ( ) {
  var assets = $ . useref . assets ( {
    searchPath : '{.tmp,app}'
  } ) ;

  return gulp . src ( 'app/**/*.html' )
    . pipe ( assets )
    // Concatenate and Minify JavaScript files.
    . pipe ( $ . if ( '*.js' , $ . uglify ( {
      preserveComments : 'some'
    } ) ) )
    // Remove Any Unused CSS to reduce file size.
    // Note: If you're not using the Style Guide, you can safely remove
    // 'app/styleguide.html' from the html array below.
    . pipe ( $ . if ( '*.css' , $ . uncss ( {
      html : [
        'app/index.html'     ,
        'app/styleguide.html'
      ] ,
      // CSS Selectors for UnCSS to ignore (e.g., dynamically added classes).
      ignore : [
        /.navdrawer-container.open/ ,
        /.app-bar.open/
      ]
    } ) ) )
    // Concatenate and Minify Styles, especially for any remaining build blocks.
    . pipe ( $ . if ( '*.css' , $ . csso ( ) ) )
    . pipe ( assets . restore ( ) )
    . pipe ( $ . useref ( ) )
    // Update Production Style Guide Paths if necessary.
    . pipe ( $ . replace ( 'bootstrap.css' , 'bootstrap.min.css' ) )
    // Minify Any HTML files for optimal performance.
    . pipe ( $ . if ( '*.html' , $ . minifyHtml ( ) ) )
    // Output the processed files to the 'dist' directory.
    . pipe ( gulp . dest ( 'dist' ) )
    . pipe ( $ . size ( {
      title : 'html'
    } ) ) ;
} ) ;


// Clean Output Directory: Deletes the temporary and distribution folders.
gulp . task ( 'clean' , del . bind ( null , [ '.tmp' , 'dist' ] ) ) ;


// Watches files for changes and automatically reloads the browser.
// This task sets up a development server with live reloading.
gulp . task ( 'serve' , [ 'styles' ] , function ( ) {
  browserSync ( {
    notify : false , // Disable browser notifications.
    // To run as HTTPS, uncomment 'https: true'.
    // Be aware this uses an unsigned certificate, triggering browser warnings.
    // https: true,
    server : [ '.tmp' , 'app' ] // Serve content from .tmp first, then app.
  } ) ;

  // Watch for changes in various file types and trigger appropriate actions.
  gulp . watch ( [ 'app/**/*.html' ]             , reload ) ;
  gulp . watch ( [ 'app/styles/**/*.{scss,css}' ] , [ 'styles' , reload ] ) ;
  gulp . watch ( [ 'app/scripts/**/*.js' ]       , [ 'jshint' ] ) ;
  gulp . watch ( [ 'app/images/**/*' ]           , reload ) ;
} ) ;


// Builds the production files and then serves them from the 'dist' directory.
gulp . task ( 'serve:dist' , [ 'default' ] , function ( ) {
  browserSync ( {
    notify : false , // Prevent browser notifications during serving.
    // Option to serve over HTTPS (requires an unsigned certificate).
    // https: true,
    server : 'dist' // Serve files directly from the production 'dist' folder.
  } ) ;
} ) ;


// The default Gulp task, which orchestrates the entire build process.
// It cleans the output directories, processes styles, scripts, HTML, images, fonts, and copies other assets.
gulp . task ( 'default' , [ 'clean' ] , function ( cb ) {
  runSequence (
    'styles' ,
    [ 'jshint' , 'html' , 'images' , 'fonts' , 'copy' ] ,
    cb
  ) ;
} ) ;


// Runs Google PageSpeed Insights on the specified URL.
// Helps identify performance bottlenecks and improvements for your site.
gulp . task ( 'pagespeed' , pagespeed . bind ( null , {
  // By default, we use the free (no API key) tier of PageSpeed Insights.
  // If you have a Google Developer API key, you can provide it here:
  // key: 'YOUR_API_KEY' (See http://goo.gl/RkN0vE for more info).
  url      : 'https://example.com' , // !!! Update this URL to your public site's address. !!!
  strategy : 'mobile'                // Analyze the site for mobile performance.
} ) ) ;


// Dynamically loads custom Gulp tasks from the 'tasks' directory.
// This allows for modular organization of complex build processes.
try {
  require ( 'require-dir' ) ( 'tasks' ) ;
} catch ( err ) {
  // If the 'tasks' directory doesn't exist or there's an issue loading tasks,
  // the build process will continue without these custom tasks.
  // This try-catch block prevents the build from failing on missing custom tasks.
}

/* End of Type I Clone */