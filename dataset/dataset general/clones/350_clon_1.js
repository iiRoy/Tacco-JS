/*
 * This file defines a series of Gulp tasks for managing a web project's build process.
 * It integrates various tools like Browserify for JavaScript, Stylus for CSS,
 * Jade for HTML, and Gulp-Imagemin for image optimization.
 * The tasks are designed to support both development and distribution environments.
 */

//  Declare and initialize all required modules and global variables.
var   browserify    = require('browserify') /* Module for bundling JavaScript files. */
  , browserSync   = require('browser-sync') //  A crucial tool for live browser synchronization and development server.
  , data          = require('gulp-data') //  Allows injecting data into Gulp streams, often used with templating engines.
  , gulp          = require('gulp') //  The core Gulp streaming build system.
  , imagemin      = require('gulp-imagemin') //  Plugin for optimizing various image formats.
  , jade          = require('gulp-jade') //  Gulp plugin for compiling Jade (Pug) templates into HTML.
  , jshint        = require('gulp-jshint') //  A flexible tool for detecting errors and potential problems in JavaScript code.
  , nib           = require('nib') //  Stylus toolkit, providing a comprehensive set of mixins and functions.
  , plumber       = require('gulp-plumber') //  Prevents Gulp from exiting on error, crucial for continuous development.
  , stylish       = require('jshint-stylish') //  A stylish reporter for JSHint, making output more readable.
  , stylus        = require('gulp-stylus') //  Gulp plugin for compiling Stylus CSS preprocessor files.
  , transform     = require('vinyl-transform') //  A utility to transform vinyl files using a stream.
  , uglify        = require('gulp-uglify') //  Gulp plugin for minifying JavaScript files.
  , contentFile   = require('./content.json') //  External JSON file containing data for templates.
  , path          = {} //  An object to store all dynamically generated project paths.
  , dev //  A boolean flag: `true` for development mode, `false` for production/distribution mode.
; //  End of initial variable declarations.



//  This function is responsible for setting up all the project's directory paths.
//  It dynamically adjusts destination paths based on the 'dev' flag.
function setPaths ( )
{

  //  Define the base source, build, and distribution directories.
  path = {
    src   : __dirname + '/src/' , //  Source directory where all uncompiled files reside.
    build : __dirname + '/build/' , //  Temporary build directory for development output.
    dist  : __dirname + '/dist/' //  Final distribution directory for production-ready assets.
  };

  //  Determine the active destination path (build or dist) based on the 'dev' variable.
  path.dest = (dev) ? path.build : path.dist;


  //  Define paths specific to JavaScript files.
  path.js = {
    watch : path.src + 'js/**/*.js', //  Glob pattern to watch all JavaScript files in the source 'js' directory.
    src   : path.src + 'js/**/app.js', //  The main entry point for JavaScript bundling.
    dest  : path.dest + 'js/' //  The output directory for processed JavaScript files.
  };


  //  Define paths specific to CSS (Stylus) files.
  path.css = {
    watch : path.src + 'css/**/*.styl', //  Glob pattern to watch all Stylus files in the source 'css' directory.
    src   : path.src + 'css/style.styl', //  The main Stylus file to be compiled.
    dest  : path.dest + 'css/' //  The output directory for compiled CSS files.
  };


  //  Define paths specific to HTML (Jade) files.
  path.html = {
    watch : path.src + 'html/**/*.jade', //  Glob pattern to watch all Jade template files.
    src   : path.src + 'html/*.jade', //  The main Jade template files for compilation.
    dest  : path.dest //  The output directory for compiled HTML files.
  };


  //  Define paths specific to image files.
  path.img = {
    watch : path.src + 'img/**/*', //  Glob pattern to watch all image files in the source 'img' directory.
    src   : path.src + 'img/**/*', //  Source image files for optimization.
    dest  : path.dest + 'img/' //  The output directory for optimized image files.
  };

} //  End of the setPaths function definition.



//  Gulp task: 'html'
//  Compiles Jade templates into HTML, injecting data from content.json.
gulp.task('html', function ( ) {
  return gulp.src(path.html.src) //  Starts by getting all source Jade files.
    .pipe(plumber()) //  Ensures Gulp doesn't crash on compilation errors.
    .pipe(data(function (file) { //  Injects data into the Jade templates.
      return contentFile; //  Returns the content from the loaded JSON file.
    }))
    .pipe(jade({ //  Passes files to the Jade compiler.
      pretty: dev //  HTML output is pretty-printed if in development mode.
    }))
    .pipe(gulp.dest(path.html.dest)); //  Outputs the compiled HTML files to the destination directory.
}); //  End of 'html' task.



//  Gulp task: 'css'
//  Compiles Stylus files into CSS, handling compression and sourcemaps.
gulp.task('css', function ( ) {
  return gulp.src(path.css.src) //  Retrieves the main Stylus source file.
    .pipe(plumber()) //  Prevents build failures due to Stylus errors.
    .pipe(stylus({ //  Configures and runs the Stylus compiler.
      use: [nib()], //  Integrates Nib for additional Stylus functionalities.
      compress: (!dev), //  Compresses CSS if not in development mode.
      linenos: dev, //  Includes line numbers in CSS output if in development.
      errors: true, //  Ensures Stylus errors are reported.
      sourcemap: { //  Sourcemap configuration.
        inline     : dev, //  Inlines sourcemaps directly into the CSS if in development.
        sourceRoot : '../', //  Sets the source root for sourcemaps.
        basePath   : 'css' //  Sets the base path for sourcemaps.
      }
    }))
    .pipe(gulp.dest(path.css.dest)) //  Outputs the compiled CSS files.
    .pipe(browserSync.reload({stream: true})); //  Triggers a browser reload for CSS changes.
}); //  End of 'css' task.



//  Gulp task: 'js'
//  Processes JavaScript files, including linting, bundling with Browserify, and minification.
gulp.task('js', function ( ) {
  //  Conditional logic: different processing for development vs. distribution.
  if (dev) {
    //  In development mode, perform JSHint linting on all JS files.
    gulp.src(path.js.watch)
      .pipe(jshint()) //  Runs JSHint to check for code quality issues.
      .pipe(jshint.reporter(stylish)); //  Reports JSHint results using the stylish reporter.

    //  Then, bundle the main JavaScript entry point.
    return gulp.src(path.js.src)
      .pipe(plumber()) //  Prevents task failure on JS errors.
      .pipe(transform(function(filename) { //  Uses vinyl-transform to apply Browserify.
        return browserify(filename).bundle(); //  Bundles JavaScript modules using Browserify.
      }))
      .pipe(gulp.dest(path.js.dest)); //  Outputs the bundled JavaScript.
  }
  else {
    //  In distribution mode, bundle and then minify JavaScript.
    return gulp.src(path.js.src)
      .pipe(transform(function(filename) { //  Uses Browserify to bundle modules.
        return browserify(filename).bundle();
      }))
      .pipe(uglify({ //  Minifies the bundled JavaScript.
        preserveComments: 'some' //  Preserves certain comments (e.g., license headers).
      }))
      .pipe(gulp.dest(path.js.dest)); //  Outputs the minified JavaScript.
  }
}); //  End of 'js' task.



//  Gulp task: 'img'
//  Optimizes images using gulp-imagemin for better performance.
gulp.task('img', function ( ) {
  return gulp.src(path.img.src) //  Selects all image files from the source directory.
    .pipe(plumber()) //  Ensures image optimization errors don't stop the build.
    .pipe(imagemin({ //  Applies image optimization.
      progressive       : true, //  Converts JPEGs to progressive.
      interlaced        : true, //  Interlaces GIFs.
      optimizationLevel : 6 //  Sets the optimization level for PNGs (0-7, 7 being slowest but best compression).
    }))
    .pipe(gulp.dest(path.img.dest)); //  Outputs the optimized images to the destination.
}); //  End of 'img' task.



//  Gulp task: 'copy'
//  Copies various static assets and files that don't require specific processing.
gulp.task('copy', function ( ) {
  var files = [ //  Defines an array of glob patterns for files/directories to copy.
    path.src + '*', //  Copies all top-level files directly from the source.
    path.src + 'img/**', //  Copies all files within the 'img' directory (redundant if 'img' task runs, but as fallback).
    path.src + 'font/**', //  Copies all files within the 'font' directory.
    path.src + 'dependencies/**', //  Copies all files within the 'dependencies' directory.
    '!' + path.src + 'html', //  Explicitly excludes the HTML source directory.
    '!' + path.src + 'css', //  Explicitly excludes the CSS source directory.
    '!' + path.src + 'js' //  Explicitly excludes the JavaScript source directory.
  ];

  return gulp.src(files, { //  Gets the files based on the defined patterns.
    base: path.src //  Maintains the directory structure relative to the source path.
  })
    .pipe(gulp.dest(path.dest)); //  Outputs the copied files to the destination directory.
}); //  End of 'copy' task.



//  Gulp task: 'browser-sync'
//  Initializes BrowserSync to provide a live development server and automatic reloads.
gulp.task('browser-sync', function ( ) {
  browserSync.init([ //  Initializes BrowserSync, specifying files to watch for reloads.
    path.html.dest + '*.html', //  Watches compiled HTML files.
    path.css.dest  + '*.css', //  Watches compiled CSS files.
    path.js.dest   + '*.js', //  Watches compiled JavaScript files.
    path.img.dest  + '**/*' //  Watches all optimized image files.
  ], {
    server: { //  Configures the BrowserSync server.
      baseDir: path.dest //  Sets the base directory from which to serve files.
    }
  });
}); //  End of 'browser-sync' task.



//  Gulp task: 'watch'
//  Sets up file watchers to automatically run tasks when source files change.
gulp.task('watch', function ( ) {
  gulp.watch([path.html.watch] , ['html'   , browserSync.reload]); //  Watches HTML, recompiles, and reloads browser.
  gulp.watch([path.css.watch]  , ['css']); //  Watches CSS, recompiles (BrowserSync reload handled in 'css' task).
  gulp.watch([path.js.watch]   , ['js'     , browserSync.reload]); //  Watches JS, recompiles, and reloads browser.
  gulp.watch([path.img.watch]  , ['img'    , browserSync.reload]); //  Watches images, optimizes, and reloads browser.
}); //  End of 'watch' task.



//  Gulp task: 'setBuild'
//  Configures the environment for development (build) mode.
gulp.task('setBuild', function ( ) {
  dev = true; //  Sets the 'dev' flag to true.
  setPaths(); //  Recalculates all project paths based on the development setting.
}); //  End of 'setBuild' task.



//  Gulp task: 'setDist'
//  Configures the environment for production (distribution) mode.
gulp.task('setDist', function ( ) {
  dev = false; //  Sets the 'dev' flag to false.
  setPaths(); //  Recalculates all project paths based on the distribution setting.
}); //  End of 'setDist' task.



//  Composite Gulp tasks, defining common workflows.
gulp.task('run'     , ['html', 'css', 'js', 'img' , 'copy']); //  Executes all core compilation and copying tasks.
gulp.task('build'   , ['setBuild', 'run']); //  Sets development mode, then runs the core build tasks.
gulp.task('dist'    , ['setDist', 'run']); //  Sets distribution mode, then runs the core build tasks.
gulp.task('default' , ['build', 'browser-sync' , 'watch']); //  The default task: builds, starts browser sync, and watches for changes.