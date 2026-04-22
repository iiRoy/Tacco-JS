'use strict'; // Enforce strict mode for cleaner code and better error handling.


// Load necessary Node.js modules and external libraries.
var path    = require( 'path' );      // Provides utilities for working with file and directory paths.
var postcss = require( 'postcss' );   // The core PostCSS library for CSS transformations.
var csswring  = require( 'csswring' );  // CSSWring, a PostCSS plugin for minifying CSS.
var chalk   = require( 'chalk' );     // A library for terminal string styling.
var maxmin  = require( 'maxmin' );     // Utility to report minified vs. original file sizes.


// The main Grunt task function, exported for use by Grunt.
module.exports = function ( grunt ) {

  // Declare variables for task-specific options and the PostCSS minifier instance.
  var options;    // Stores the resolved options for the current Grunt task.
  var minifier;   // The PostCSS processor configured with CSSWring and other plugins.


  /**
   * Determines and returns the appropriate source map content or option.
   * If `options.map` is a string, it's treated as a path prefix for an external map file.
   * The function attempts to read an existing source map from that path.
   * Otherwise, it directly returns the value of `options.map` (e.g., `true`, `false`, or `undefined`).
   *
   * @param {string} from - The original file path of the CSS source being processed.
   * @returns {string|boolean|undefined} The source map content (if found), or the raw `options.map` value.
   */
  function getMapOption ( from ) {
    // Check if the map option is a string, indicating a specific map file location.
    if ( typeof options.map === 'string' ) {
      // Construct the full path to the potential source map file.
      var mapPath = options.map + path.basename( from ) + '.map';

      // Verify if a source map file actually exists at the constructed path.
      if ( grunt.file.exists( mapPath ) ) {
        // If it exists, read its content and return it.
        return grunt.file.read( mapPath );
      }
    }

    // If `options.map` is not a string, or no map file was found, return the option's value directly.
    return options.map;
  }


  /**
   * Configures and returns a PostCSS plugin function that prepends a banner comment
   * to the CSS output. This ensures the specified text appears at the very beginning
   * of the generated CSS file. It also adds a newline after the banner for readability.
   *
   * @param {string} text - The string content to be used as the banner comment.
   * @returns {Function} A PostCSS plugin function designed to modify the CSS AST.
   */
  function setBanner ( text ) {
    // Return an anonymous function that acts as a PostCSS plugin.
    return function ( css ) {
      // Create a new comment node with the provided text and prepend it to the CSS root.
      css.prepend( postcss.comment( { text: text } ) );

      // If there's a second rule (meaning the banner isn't the only content),
      // add a newline character before it for better formatting.
      if ( css.rules[ 1 ] ) {
        css.rules[ 1 ] .before = '\n';
      }
    };
  }


  /**
   * Processes the input CSS using the pre-configured PostCSS minifier.
   * This function handles the actual minification and source map generation based on task options.
   *
   * @param {string|Object} input - The input CSS content (string) or a PostCSS AST object.
   * @param {string} to - The target output path for the minified CSS; used for source map references.
   * @returns {{css: string, map?: string}} An object containing the minified CSS string
   *          and an optional source map string if generated.
   */
  function minify ( input, to ) {
    // Execute the PostCSS processing pipeline with the specified options.
    return minifier.process( input, {
      inlineMap: options.mapInline, // Controls whether the source map is embedded directly in the CSS.
      map: options.map,             // General source map option (e.g., `true`, `false`, or a path).
      to: to                        // The destination file path, crucial for correct source map paths.
    } );
  }


  // Register the 'csswring' multi-task with Grunt.
  grunt.registerMultiTask( 'csswring', 'Minify CSS files using PostCSS-based CSSWring.', function ( ) {
    // Resolve task options, merging user-defined options with default values.
    options = this.options( {
      banner: undefined,          // No banner by default.
      map: undefined,             // No source map generation by default.
      mapInline: undefined,       // Source map not inlined by default.
      preserveHacks: undefined,   // CSS hacks are not preserved by default.
      removeAllComments: undefined, // Special comments are not removed by default.
      report: 'min'               // Default reporting style shows minified size.
    } );


    // Initialize the CSSWring PostCSS plugin with specific configuration.
    var processor = csswring( {
      preserveHacks: !!options.preserveHacks,       // Ensure boolean value for preserving hacks.
      removeAllComments: !!options.removeAllComments // Ensure boolean for removing all comments.
    } ) .postcss; // Extract the raw PostCSS plugin function from csswring.


    // Create a new PostCSS processor instance and add the CSSWring plugin to its pipeline.
    minifier = postcss( ) .use( processor );

    // If a banner text is provided in the options, add the banner plugin to the minifier.
    if ( typeof options.banner === 'string' ) {
      minifier.use( setBanner( options.banner ) );
    }

    // Iterate over each file group defined in the Grunt configuration for this task.
    this.files.forEach( function ( f ) {
      // Process source files: first filter out non-existent files, then concatenate them into a single PostCSS AST.
      var parsed = f.src
        .filter( function ( filepath ) {
          // Check if the current source file actually exists on the filesystem.
          if ( ! grunt.file.exists( filepath ) ) {
            // Log a warning for missing files and exclude them from further processing.
            grunt.log.warn( 'Source file "' + filepath + '" not found.' );
            return false;
          } else {
            // Include existing files for minification.
            return true;
          }
        } )
        .reduce( function ( parsed, filepath ) {
          // Read the content of the current CSS file.
          var input = grunt.file.read( filepath );
          // Parse the CSS content into a PostCSS Abstract Syntax Tree (AST),
          // incorporating source map information if available.
          var output = postcss.parse( input, { from: filepath, map: getMapOption( filepath ) } );

          // If `parsed` already contains an AST, append the new `output` AST to it.
          // Otherwise, `output` becomes the initial AST for the reduction.
          return parsed ? parsed.append( output ) : output;
        }, null ); // Initialize the accumulator `parsed` to null.

      // If no valid files were parsed (e.g., all were missing), skip the rest of this file group.
      if ( ! parsed ) {
        return;
      }

      // Get the original CSS content (before minification) from the parsed AST for size comparison.
      var inputCss = parsed.toResult( ) .css;
      // Perform the actual minification using the configured `minifier` and get the result.
      var result = minify( parsed, f.dest );

      // Write the minified CSS content to the specified destination file.
      grunt.file.write( f.dest, result.css );
      // Log the creation of the minified file, including size comparison information.
      grunt.log.writeln( 'File ' + chalk.cyan( f.dest ) + ' created: ' + maxmin( inputCss, result.css, options.report === 'gzip' ) );

      // If a source map was generated during minification, write it to a separate file.
      if ( result.map ) {
        grunt.file.write( f.dest + '.map', result.map );
        // Log the creation of the source map file.
        grunt.log.writeln( 'File ' + chalk.cyan( f.dest + '.map' ) + ' created (source map).' );
      }
    } );
  } );
};