/*
 * Module Dependencies:
 * This section handles the necessary external modules for the builder script.
 * @fileoverview Main build script for DataChannel.js library.
 */

var fs       = require( 'fs' )
  , package  = JSON.parse( fs.readFileSync( __dirname + '/../package.json' ) )  // Loads package metadata
  , uglify   = require( 'uglify-js' );                                        // UglifyJS for minification


/*
 * License Headers Management
 *
 * Defines various template strings for license headers,
 * distinguishing between development and production builds.
 *
 * @api private
 */

var template    = '/*! datachannel.%ext% build:' + package.version +
                  ', %type%. Copyright(c) 2013 Jesús Leganés Combarro "Piranna" <piranna@gmail.com> */'

  , prefix      = '\n(function(exports){\n' // Wrapper prefix for IIFE

  , development = template.replace('%type%', 'development').replace('%ext%', 'js') // Dev header
  , production  = template.replace('%type%', 'production' ).replace('%ext%', 'min.js') // Prod header

  , suffix      = '\n})(this);\n'; // Wrapper suffix for IIFE


/*
 * Conditional Code Inclusion Tags
 *
 * These tags allow for server-side (Node.js) specific code
 * to be conditionally removed during client-side builds.
 *
 * @api private
 */

var starttagIF  = '// if node' // Marks the beginning of a Node.js specific block
  , endtagIF    = '// end node'; // Marks the end of a Node.js specific block


/*
 * Core Modules for Base Build
 *
 * This array specifies the fundamental JavaScript files
 * that constitute the base DataChannel client build.
 *
 * @const
 * @type {Array}
 * @api private
 */

var base = [
    '../lib/EventTarget.js'  // EventTarget implementation
  , '../lib/reliable.min.js' // Reliable communication library
  , 'datachannel.js'         // Main DataChannel logic
];


// Define important file paths and output names.
var DIST_FOLDER   = '/../dist/';   // Output directory for built files
var SOURCE_FOLDER = '/../src/';    // Source directory for input files
var OUTPUT_NAME   = 'datachannel'; // Base name for output files


/**
 * DataChannel Builder Function.
 *
 * This function orchestrates the bundling, minification,
 * and conditional code removal for the DataChannel library.
 *
 * @param {Array} transports The transports that needs to be bundled. (Not explicitly used in this builder, but part of original signature intent)
 * @param {Object} [options] Options to configure the building process.
 * @param {Function} callback Last argument should always be the callback.
 * @callback {String|Boolean} err An optional argument, if it exists then an
 *    error occurred during the build process.
 * @callback {String} result The result of the build process.
 * @api public
 */

var builder = module.exports = function () {

  // Initialize variables for options, callback, and potential errors.
  var options, callback, error = null;

  // Convert arguments object to a true array.
  var args = Array.prototype.slice.call( arguments, 0 );

  // Default settings for the build process.
  var settings = {
        minify: true,   // Should the output be minified?
        node:   false,  // Should Node.js specific code be included?
        custom: []      // Array for custom code snippets to be included.
      };


  // Process arguments to extract options and the callback function.
  // This supports flexible argument passing.
  args.forEach( function ( arg ) {

    // Determine the type of the current argument.
    var type = Object.prototype.toString.call( arg )
                 .replace( /\[object\s(\w+)\]/gi , '$1' )
                 .toLowerCase();

    // Assign argument based on its type.
    switch ( type ) {
      case 'object':   // If it's an object, it's the options.
        return options = arg;
      case 'function': // If it's a function, it's the callback.
        return callback = arg;
    }
  } );


  // Ensure options object is initialized, even if not provided.
  options = options || {};


  // Merge user-provided options into default settings.
  // This allows overriding default behavior.
  for ( var option in options ) {
    settings[ option ] = options[ option ];
  }


  // Prepare the list of files to be bundled.
  var files = [];
  base.forEach( function ( file ) {
    files.push( __dirname + SOURCE_FOLDER + file );
  } );


  // Object to store the content of each read file.
  var results = {};

  // Iterate over each file and read its content asynchronously.
  files.forEach( function ( file ) {

    fs.readFile( file, function ( err, content ) {

      // If an error occurs during file reading, capture it.
      if ( err ) error = err;

      // Store the content of the file.
      results[ file ] = content;

      // Check if all files have been read.
      // If not, return early and wait for more files to complete.
      if ( Object.keys( results ).length !== files.length ) return;


      // All files are read, proceed with concatenation and processing.
      var code = development, // Start with the development license header.
          ignore = 0;         // Counter for conditional code blocks.
        
      code += prefix; // Add the IIFE prefix.

      // Concatenate the content of all base files in order.
      files.forEach( function ( file ) {
        code += results[ file ];
      } );


      // If custom code snippets are provided, append them.
      if ( settings.custom.length ) {
        settings.custom.forEach( function ( content ) {
          code += content;
        } );
      }


      // If `node` setting is false, remove Node.js specific code blocks.
      if ( !settings.node ) {

        code = code.split( '\n' ).filter( function ( line ) {

          // Check for start and end tags for conditional blocks.
          var start = line.indexOf( starttagIF ) >= 0,
              end   = line.indexOf( endtagIF   ) >= 0,
              ret   = ignore; // Current ignore state.

          // If a start tag is found, increment ignore counter.
          if ( start ) {
            ignore++;
            ret = ignore; // Mark this line to be ignored.
          }

          // If an end tag is found, decrement ignore counter for the next line.
          if ( end ) {
            ignore--;
          }

          // Only return lines where `ignore` is 0 (i.e., not inside a conditional block).
          return ret == 0;

        } ).join( '\n' ); // Rejoin the filtered lines.
      }


      code += suffix; // Add the IIFE suffix.
      
      // If minification is requested, process the code further.
      if ( settings.minify ) {

        // Parse the code into an Abstract Syntax Tree (AST).
        var ast = uglify.parser.parse( code );

        // Mangle variable and function names to reduce size.
        ast = uglify.uglify.ast_mangle( ast );

        // Squeeze the AST to remove unnecessary nodes and reduce size.
        ast = uglify.uglify.ast_squeeze( ast );

        // Generate minified code, prefixed with the production header.
        code = production + uglify.uglify.gen_code( ast, { ascii_only: true } );
      }


      // Invoke the callback with any error and the final generated code.
      callback( error, code );
    } );
  } );
};


/**
 * Expose the version of the package.
 *
 * @type {String}
 * @api public
 */

builder.version = package.version;


/**
 * Command Line Interface (CLI) Support.
 *
 * This block enables direct execution of the build script
 * from the command line, allowing generation of builds
 * without importing it as a module.
 */

if ( !module.parent ) {

  // Process command-line arguments.
  // The first two arguments are 'node' and the script path, which we slice off.
  var args = process.argv.slice( 2 );

  // Generate a development build.
  // If arguments are provided, pass them; otherwise, pass false.
  builder( args.length ? args : false, { minify: false }, function ( err, content ) {

    if ( err ) return console.error( err ); // Log error if build fails.

    console.log( __dirname ); // Log current directory for context.

    // Write the development build to the specified output file.
    fs.write(
        fs.openSync( __dirname + DIST_FOLDER + OUTPUT_NAME + '.js', 'w' )
      , content
      , 0
      , 'utf8'
    );

    console.log( 'Successfully generated the development build: ' + OUTPUT_NAME + '.js' );
  } );


  // Generate a production (minified) build.
  // If arguments are provided, pass them; otherwise, pass false.
  builder( args.length ? args : false, function ( err, content ) {

    if ( err ) return console.error( err ); // Log error if build fails.

    // Write the production build to the specified output file.
    fs.write(
        fs.openSync( __dirname + DIST_FOLDER + OUTPUT_NAME + '.min.js', 'w' )
      , content
      , 0
      , 'utf8'
    );

    console.log( 'Successfully generated the production build: ' + OUTPUT_NAME + '.min.js' );
  } );
}