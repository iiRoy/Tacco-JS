/*
 * Configuration settings for the build and compilation processes.
 * These paths define where various assets and source files are located
 * or should be placed during the build pipeline.
 */

var configs =
{
  buildAssets: 'build/public/assets/', // Directory for built assets
  buildAssetsVendor: 'build/public/assets/vendor/', // Directory for built vendor assets
  buildHtml: 'build/public/',       // Output directory for HTML files
  buildPublic: 'build/public/',    // General public build directory
  buildSrc: 'build/public/',      // Source directory within build public
  buildSrcDemo: 'build/public/demo/', // Demo source directory within build public
  buildTmpSrc: 'build/demo/',     // Temporary source directory for demo
  buildVendor: 'build/public/vendor/', // Vendor directory within build public

  compileMainJs: 'main.js', // Name of the main JavaScript file after compilation

  compileAssets: 'bin/public/assets/', // Compiled assets directory
  compileAssetsVendor: 'bin/public/assets/vendor/', // Compiled vendor assets directory
  compileHtml: 'bin/public/',       // Compiled HTML output directory
  compilePublic: 'bin/public/',    // General public compilation directory
  compileSrc: 'bin/public/src/',     // Compiled source directory

  mbTmpSrc: 'build/mb/', // Temporary directory for Mithril Bootstrap
  rootFiles: [ 'public/**/*.*' ] // Files at the root of the public directory
};

// Application-specific file configurations
var appFiles = {
  assets: [ 'demo/assets/**/*.*' ], // Demo application assets
  html: [ 'demo/index.html' ],     // Demo application HTML
  jsx: [ 'demo/src/**/*.jsx' ],    // Demo application JSX files
};

// Mithril Bootstrap (mb) related files
var mbFiles = {
  jsx: [ 'src/*.jsx', 'src/*/*.jsx' ], // JSX files for Mithril Bootstrap
};

// Documentation files configuration
var docFiles = {
  md: [ 'src/*/docs/*.md' ], // Markdown documentation files
  jsx: [ 'src/*/docs/*.jsx' ]  // JSX documentation files
};

// Vendor-specific files
var vendorFiles = {
  assets: [
    'vendor/bootstrap/fonts/*.*', // Bootstrap font assets
  ],
  js: [
    'vendor/mithril/mithril.js',       // Mithril JavaScript library
    'vendor/min-require/min-require.js' // Min-Require JavaScript library
  ],
};

// Constants used throughout the build process
var consts = {
  livereloadPort: 35729, // Port for live-reload server
};

/* ---------------------------------------------------------------------------------------------------------------- */
// Gulp task implementations begin here.
// These tasks define the various steps for building and compiling the project.
/* ---------------------------------------------------------------------------------------------------------------- */

var fs = require( 'fs' ); // Node.js file system module
var gulp = require( 'gulp' ); // Gulp build system
var path = require( 'path' ); // Node.js path module
var plugins = require( 'gulp-load-plugins' )(); // Gulp plugins loader
var runSequence = require( 'run-sequence' ); // Gulp task runner for sequential execution

var colors = plugins.util.colors; // Gulp-util colors for console output
var log = plugins.util.log;      // Gulp-util log for console messages

/**
 * Cleans specified files or directories.
 * @param {string|string[]} filepath - The path(s) to clean.
 * @param {function} cb - Callback function to execute after cleaning.
 */
function clean ( filepath, cb ) {

  log( 'Cleaning', colors.magenta( filepath ) ); // Log the cleaning action

  gulp.src( filepath, { read: false } ) // Get the source files, don't read content
    .pipe( plugins.clean( { force: false } ) ) // Clean (delete) the files
    .on( 'end', cb || function() {} )         // Call callback on end, or empty function
    .on( 'error', log );                      // Log any errors
}

/**
 * Generates a revisioned filename pattern.
 * E.g., 'main.js' -> 'main-*.js'
 * @param {string} filename - The original filename.
 * @returns {string} The revisioned filename pattern.
 */
function revName ( filename ) {
  var index = filename.search( /\.[^.]*$/ ); // Find the last dot before the extension
  return filename.substr( 0, index ) + '-*' + filename.substr( index ); // Insert '-*' before extension
}

// Task to copy documentation JSX sources
gulp.task( 'copyDocsSources', function ( cb ) {
  gulp.src( docFiles.jsx, { base: 'src' } ) // Source JSX documentation files
    .pipe( plugins.changed( configs.buildSrcDemo ) ) // Only pass changed files
    .pipe( gulp.dest( configs.buildTmpSrc ) )       // Output to temporary build directory
    .on( 'end', cb || function() {} )              // Call callback on completion
    .on( 'error', log );                           // Log errors
} );

// Task to build documentation Markdown files into JSX
gulp.task( 'buildDocsMd', function ( cb ) {

  gulp.src( docFiles.md, { base: 'src' } ) // Source Markdown documentation files
    .pipe( plugins.plumber() )             // Prevent Gulp from crashing on errors
    .pipe( plugins.changed( configs.buildTmpSrc, { extension: '.jsx' } ) ) // Only process changed MD files
    .pipe( plugins.markdown() )            // Convert Markdown to HTML
    .pipe( plugins.insert.prepend( '<div>\n' ) ) // Wrap HTML in a div
    .pipe( plugins.insert.append( '</div>' ) )  // Close the div
    .pipe( plugins.rename( {
      prefix: '_',     // Add underscore prefix
      extname: '.jsx' // Change extension to .jsx
    } ) )
    .pipe( gulp.dest( configs.buildTmpSrc ) ) // Output to temporary build directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Task to build documentation MSX (Mithril JSX) files
gulp.task( 'buildDocsMsx', function ( cb ) {
  // Source all JSX files within the docs subdirectories in the temporary build path
  gulp.src( path.join( configs.buildTmpSrc, '**/docs/*.jsx' ), { base: configs.buildTmpSrc } )
    .pipe( plugins.plumber() ) // Error handling
    .pipe( plugins.changed( configs.buildTmpSrc, { extension: '.js' } ) ) // Process only changed JSX files
    .pipe( plugins.msx() )     // Transform JSX to JS
    // .pipe(plugins.sweetjs({modules: ['./res/template-compiler.sjs']})) // Optional: Sweet.js transformation
    // .pipe(plugins.size({showFiles: true})) // Optional: Show file sizes
    .pipe( gulp.dest( configs.buildTmpSrc ) ) // Output the transformed JS to temporary build directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Task to build demo MSX (Mithril JSX) files
gulp.task( 'buildDemoMsx', function ( cb ) {
  gulp.src( docFiles.jsx, { base: 'src' } ) // Source JSX documentation files
    .pipe( plugins.plumber() )              // Error handling
    .pipe( plugins.changed( configs.buildTmpSrc, { extension: '.js' } ) ) // Process only changed JSX files
    .pipe( plugins.msx() )                  // Transform JSX to JS
    // .pipe(plugins.sweetjs({modules: ['./res/template-compiler.sjs']})) // Optional: Sweet.js transformation
    // .pipe(plugins.size({showFiles: true})) // Optional: Show file sizes
    .pipe( gulp.dest( configs.buildTmpSrc ) ) // Output the transformed JS to temporary build directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Combine *.jsx, wrap them in CommonJs style and store in build/src/app
// This task processes the temporary JavaScript files, includes them, and wraps them for CommonJS.
gulp.task( 'buildAppScriptsInclude', function ( cb ) {

  gulp.src( path.join( configs.buildTmpSrc, '**/*.js' ), { base: configs.buildTmpSrc } ) // Source all JS files from temporary directory
    .pipe( plugins.plumber() ) // Error handling
    // .pipe(plugins.changed(configs.buildSrcDemo)) // Optional: Only process changed files if uncommented
    .pipe( plugins.includeJs( { ext: 'js', cache: true, showFiles: 'Building' } ) ) // Include JS files
    .pipe( plugins.includeJs( { exactName: true, cache: 'jsx', keyword: 'CONTENT', recursive: false, transform: function ( s ) { return JSON.stringify( s ); } } ) ) // Include JSX content
    .pipe( plugins.jsPrettify( { indent_size: 2, max_preserve_newlines: 2 } ) ) // Prettify JavaScript code
    .pipe( plugins.wrapRequire() ) // Wrap modules with require()
    // .pipe(plugins.size({showFiles: true})) // Optional: Show file sizes
    .pipe( gulp.dest( configs.buildSrcDemo ) ) // Output to demo source directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Convert app scripts from .jsx to .js
gulp.task( 'buildAppScriptsMsx', function ( cb ) {
  gulp.src( appFiles.jsx, { base: 'demo/src' } ) // Source application JSX files
    .pipe( plugins.plumber() ) // Error handling
    .pipe( plugins.changed( configs.buildTmpSrc, { extension: '.js' } ) ) // Process only changed JSX files
    .pipe( plugins.msx() )     // Transform JSX to JS
    // .pipe(plugins.sweetjs({modules: ['./res/template-compiler.sjs']})) // Optional: Sweet.js transformation
    // .pipe(plugins.size({showFiles: true})) // Optional: Show file sizes
    .pipe( gulp.dest( configs.buildTmpSrc ) ) // Output to temporary build directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Combine and convert *.jsx into runnable JS
gulp.task( 'buildAppScripts', function ( cb ) {
  // Run tasks sequentially: build docs, build demo, then include app scripts
  runSequence( 'buildDocsMd', 'buildDocsMsx', 'buildDemoMsx', 'buildAppScriptsMsx', 'buildAppScriptsInclude', cb );
} );

// Copy vendor scripts to build/public/vendor
gulp.task( 'buildVendorScripts', function ( cb ) {
  gulp.src( vendorFiles.js, { base: 'vendor' } ) // Source vendor JavaScript files
    .pipe( gulp.dest( 'build/public/vendor' ) ) // Output to vendor directory in build public
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Concat all scripts to bin/public/assets/main-***.js
gulp.task( 'compileScripts', function ( cb ) {
  // First, clean any previously revisioned main.js files
  clean( path.join( configs.compileAssets, revName( configs.compileMainJs ) ), _compileScripts );

  // Inner function to perform the actual compilation after cleaning
  function _compileScripts () {
    var glob = [].concat(
      // vendorFiles.js || [], // Optional: Include all vendor JS, currently commented out
      path.join( configs.buildPublic, 'vendor/min-require/min-require.js' ), // Min-require specifically included
      [ path.join( configs.buildSrcDemo, '**/*.js' ), // All demo source JS files
        path.join( '!' + configs.buildSrcDemo, '**/_*.js' ) ] // Exclude files starting with underscore
    );
    gulp.src( glob ) // Source all specified JavaScript files
      .pipe( plugins.plumber() ) // Error handling
      .pipe( plugins.concat( configs.compileMainJs ) ) // Concatenate into main.js
      .pipe( plugins.insert.append( '\n\nrequire(\'main\');\n' ) ) // Append main require statement
      .pipe( plugins.streamify( plugins.uglify( { mangle: true } ) ) ) // Uglify (minify) the JavaScript
      .pipe( plugins.streamify( plugins.rev() ) ) // Add revision hash to filename
      .pipe( plugins.size( { showFiles: true } ) ) // Show file size in console
      .pipe( gulp.dest( configs.compileAssets ) ) // Output to compiled assets directory
      .on( 'end', cb || function() {} )
      .on( 'error', log );
  }
} );

// Copy vendor and app assets to build/public/assets
gulp.task( 'buildAppAssets', function ( cb ) {
  gulp.src( appFiles.assets, { base: 'demo/assets' } ) // Source demo app assets
    .pipe( plugins.changed( configs.buildAssets ) )  // Only pass changed files
    .pipe( gulp.dest( configs.buildAssets ) )       // Output to built assets directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

gulp.task( 'buildVendorAssets', function ( cb ) {
  gulp.src( vendorFiles.assets ) // Source vendor assets
    .pipe( gulp.dest( configs.buildAssetsVendor ) ) // Output to built vendor assets directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Copy assets from build/public/assets to bin/public/assets
gulp.task( 'compileAssets', function ( cb ) {
  // Source all assets from the built assets directory
  gulp.src( path.join( configs.buildAssets, '**/*.*' ), { base: configs.buildAssets } )
    .pipe( gulp.dest( configs.compileAssets ) ) // Output to compiled assets directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

/**
 * Injects script or link tags into HTML.
 * @param {string} tag - The tag name for the starttag comment (e.g., 'vendor', 'demo').
 * @param {string} path - The path to ignore when generating relative URLs.
 * @param {string|string[]} glob - Glob pattern(s) for files to inject.
 * @returns {Stream} A Gulp stream for injection.
 */
function injectHtml ( tag, path, glob ) {
  return plugins.inject(
    gulp.src( glob, { read: false } ), { // Source files for injection, don't read content
      starttag: '<!-- ' + tag + '.{{ext}} -->', // Start tag for injection
      endtag: '<!-- end -->',                 // End tag for injection
      addRootSlash: false,                   // Don't add root slash to paths
      ignorePath: path,                      // Path to ignore
      sort: function ( a, b ) { return a < b ? -1 : a > b ? 1 : 0; } // Sort injected files
    }
  );
}

// Builds the main index.html file for the development environment
gulp.task( 'buildIndexHtml', function ( cb ) {
  gulp.src( appFiles.html ) // Source the main HTML file
    .pipe( plugins.plumber() ) // Error handling
    .pipe( injectHtml( 'vendor', configs.buildPublic,
      [
        path.join( configs.buildAssetsVendor, '**/*.css' ),      // Vendor CSS
        path.join( configs.buildVendor, '**/*.js' ),             // Vendor JS
        path.join( configs.buildPublic, 'assets/mithril-bootstrap.js' ) // Mithril Bootstrap JS
      ]
    ) )
    .pipe( injectHtml( 'demo', configs.buildPublic,
      [
        path.join( configs.buildPublic, 'assets/demo.css' ), // Demo CSS
        path.join( configs.buildSrcDemo, '**/*.js' ),       // Demo source JS
        path.join( '!' + configs.buildSrcDemo, '**/_*.js' ) // Exclude underscore files
      ]
    ) )
    .pipe( plugins.insert.append( '<script>require(\'main\');</script>' ) ) // Append main require script
    .pipe( plugins.insert.append( '<script src="//localhost:' + consts.livereloadPort + '/livereload.js"></script>' ) ) // Append livereload script
    // .pipe(plugins.size({showFiles:true})) // Optional: Show file size
    .pipe( gulp.dest( configs.buildHtml ) ) // Output to built HTML directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Compiles the main index.html file for production
gulp.task( 'compileIndexHtml', function ( cb ) {
  gulp.src( appFiles.html ) // Source the main HTML file
    .pipe( plugins.plumber() ) // Error handling
    .pipe( injectHtml( 'demo', configs.compilePublic,
      [
        path.join( configs.compileAssets, 'vendor/bootstrap.css' ), // Compiled Bootstrap CSS
        path.join( configs.compileAssets, 'demo.css' ),             // Compiled demo CSS
        path.join( configs.compileAssets, 'vendor/mithril.js' ),    // Compiled Mithril JS
        path.join( configs.compileAssets, 'mithril-bootstrap.js' ), // Compiled Mithril Bootstrap JS
        path.join( configs.compileAssets, revName( configs.compileMainJs ) ) // Compiled and revisioned main JS
      ]
    ) )
    .pipe( plugins.minifyHtml() ) // Minify the HTML
    .pipe( plugins.size( { showFiles: true } ) ) // Show file size
    .pipe( gulp.dest( configs.compileHtml ) ) // Output to compiled HTML directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Copies root files to the build directory
gulp.task( 'buildRootFiles', function ( cb ) {
  gulp.src( configs.rootFiles, { base: '.' } ) // Source root files
    .pipe( plugins.changed( 'build' ) )     // Only pass changed files
    .pipe( gulp.dest( 'build' ) )          // Output to build directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Copies root files to the bin directory for compilation
gulp.task( 'compileRootFiles', function ( cb ) {
  gulp.src( configs.rootFiles, { base: '.' } ) // Source root files
    .pipe( gulp.dest( 'bin' ) )             // Output to bin directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Builds Mithril Bootstrap (mb) JSX files
gulp.task( 'buildBootstrapMsx', function ( cb ) {
  gulp.src( mbFiles.jsx, { base: 'src' } ) // Source Mithril Bootstrap JSX files
    .pipe( plugins.plumber() ) // Error handling
    .pipe( plugins.changed( configs.mbTmpSrc, { extension: '.js' } ) ) // Only process changed JSX files
    .pipe( plugins.msx() )     // Transform JSX to JS
    .pipe( gulp.dest( configs.mbTmpSrc ) ) // Output to temporary Mithril Bootstrap directory
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Includes and processes Mithril Bootstrap (mb) JavaScript files
gulp.task( 'buildBootstrapInclude', function ( cb ) {
  // Source all JS files from the temporary Mithril Bootstrap directory
  gulp.src( path.join( configs.mbTmpSrc, '**/*.js' ), { base: configs.mbTmpSrc } )
    .pipe( plugins.plumber() ) // Error handling
    .pipe( plugins.includeJs( { ext: 'js', cache: true, showFiles: 'Building' } ) ) // Include JS files
    .pipe( gulp.dest( 'dist' ) ) // Output to 'dist' directory
    .pipe( gulp.dest( 'build/public/assets' ) ) // Also output to built public assets
    .on( 'end', cb || function() {} )
    .on( 'error', log );
} );

// Main task for building Mithril Bootstrap
gulp.task( 'buildBootstrap', function ( cb ) {
  runSequence( 'buildBootstrapMsx', 'buildBootstrapInclude', function () {
    gulp.src( 'dist/*.js' ) // Source JS files from 'dist'
      .pipe( gulp.dest( configs.buildAssets ) ); // Output to built assets
    cb(); // Call the main callback
  } );
} );

/* ---------------------------------------------------------------------------------------------------------------- */
// Major tasks: clean, build, compile, and default.
// These tasks orchestrate the execution of the smaller, individual tasks defined above.
/* ---------------------------------------------------------------------------------------------------------------- */

// Task to clean all build and compilation output directories
gulp.task( 'clean', function ( cb ) {
  clean( [ 'build', 'bin', 'dist' ], cb ); // Clean 'build', 'bin', and 'dist' directories
} );

// Main build task for development
gulp.task( 'build', function ( cb ) {
  runSequence( 'clean', // Start by cleaning
    [
      'copyDocsSources',       // Copy documentation sources
      'buildAppScripts',       // Build application scripts (JSX to JS, includes)
      'buildVendorScripts',    // Copy vendor JavaScript files
      'buildAppAssets',        // Copy application assets
      'buildVendorAssets',     // Copy vendor assets
      'buildRootFiles',        // Copy root files
      'buildBootstrap'         // Build Mithril Bootstrap
    ],
    'buildIndexHtml', // Build the main HTML file last
    cb );
} );

// Main compilation task for production
gulp.task( 'compile', function ( cb ) {
  runSequence( 'build', // First, run the full 'build' task
    [ 'compileScripts', 'compileAssets', 'compileRootFiles' ], // Then, run compilation tasks in parallel
    'compileIndexHtml', // Finally, compile the index HTML
    cb );
} );

// Default task, runs 'compile'
gulp.task( 'default', [ 'compile' ] );

// Tasks to run whenever a source file changes (for development)
gulp.task( 'watch', function ( cb ) {

  var eventColors = {
    added: colors.green,   // Color for 'added' events
    changed: colors.magenta, // Color for 'changed' events
    deleted: colors.red,     // Color for 'deleted' events
    renamed: colors.green    // Color for 'renamed' events
  };

  /**
   * Logs file change events to the console.
   * @param {object} e - The event object from Gulp watch.
   */
  function logChanged ( e ) {
    var c = eventColors[ e.type ] || colors.white; // Get color based on event type
    log( '[' + c( e.type ) + ']', colors.magenta( path.relative( process.cwd(), e.path ) ) ); // Log event type and file path
  }

  var lr = plugins.livereload( consts.livereloadPort ); // Initialize livereload server
  /**
   * Creates a function that runs Gulp tasks.
   * @returns {function} A function that takes an event and runs the specified tasks.
   */
  function runTasks () {
    var args = arguments; // Capture arguments (task names)
    return function ( e ) { runSequence.apply( this, args ); }; // Return a function that applies runSequence
  }

  /**
   * Creates a function that reloads the browser.
   * @param {string} filepath - The file path to signal for reload.
   * @returns {function} A function that triggers livereload.
   */
  function reload ( filepath ) {
    return function ( cb ) { lr.changed( filepath ); }; // Trigger livereload for the given path
  }

  var indexHtmlPath = 'index.html'; // Constant for index HTML path

  // Watch application assets and reload 'assets/demo.css' on change
  gulp.watch( appFiles.assets, runTasks( 'buildAppAssets', reload( 'assets/demo.css' ) ) );
  // Watch application HTML and reload 'index.html' on change
  gulp.watch( appFiles.html, runTasks( 'buildIndexHtml', reload( indexHtmlPath ) ) );
  // Watch root files
  gulp.watch( configs.rootFiles, runTasks( 'buildRootFiles' ) );

  // Watch JSX and Markdown files for app and docs
  gulp.watch( [ appFiles.jsx, docFiles.jsx, docFiles.md ], function ( e ) {
    logChanged( e ); // Log the change event

    runSequence( 'copyDocsSources', 'buildAppScripts', 'buildIndexHtml', reload( indexHtmlPath ) ); // Rebuild scripts and HTML
  } );

  // Watch Mithril Bootstrap JSX files
  gulp.watch( mbFiles.jsx, function ( e ) {
    logChanged( e ); // Log the change event

    runSequence( 'buildBootstrap', reload( indexHtmlPath ) ); // Rebuild bootstrap and reload
  } );
} );