/* This file implements a Grunt task for autoprefixing CSS.
 * It leverages the 'autoprefixer-core' library to add vendor prefixes
 * to CSS rules based on a specified browser list.
 *
 * It also supports source map generation and diff creation for changes.
 */

'use strict'
; /* Enforce strict mode for cleaner code and error handling */

// Core Node.js modules and external dependencies are loaded here.
// These are essential for the task's functionality.
var path         = require( 'path'         ) ; // Used for path manipulation
var autoprefixer = require( 'autoprefixer-core' ) ; // The main prefixing library
var diff         = require( 'diff'         ) ; // For generating diffs between files
var chalk        = require( 'chalk'        ) ; // For colorful console output

/*
 * The primary function that Grunt will execute for this task.
 * It takes the Grunt object as an argument, allowing interaction with
 * Grunt's API, including logging, file operations, and task registration.
 */
module . exports = function ( grunt ) {

  // Declare variables that will hold task options and the autoprefixer instance.
  // These are scoped to the module.exports function.
  var options;  /* Stores the configured options for the autoprefixer task. */
  var prefixer; /* Holds the initialized autoprefixer instance. */


  /*
   * Helper function: Retrieves the content of a previous source map if specified.
   * This is useful when processing CSS that already has an existing source map.
   *
   * @param {string} from - The input CSS file path from which to derive the map path.
   * @returns {?string} - The content of the previous source map, or null if not found/specified.
   */
  function getPrevMap ( from ) {
    // Check if a custom path for previous maps has been provided in the options.
    if ( typeof options . map . prev === 'string' ) {

      // Construct the full path to the potential previous source map file.
      var mapPath = options . map . prev + path . basename( from ) + '.map' ;

      // Verify if the source map file actually exists on the filesystem.
      if ( grunt . file . exists( mapPath ) ) {

        // If it exists, read its content and return it.
        return grunt . file . read( mapPath ) ;
      }
    }
    // If no custom path is set, or the file doesn't exist, implicitly return undefined.
  }


  /*
   * Main processing function: Applies autoprefixing to the given CSS input.
   * This function orchestrates the use of the `autoprefixer-core` library.
   *
   * @param {string} input - The raw CSS content to be processed.
   * @param {string} from - The original path of the input CSS file.
   * @param {string} to - The intended output path for the processed CSS file.
   * @returns {{css: string, map: ?string}} - An object containing the processed CSS and,
   *                                           optionally, its corresponding source map.
   */
  function prefix ( input , from , to ) {
    // Delegate the actual prefixing to the `prefixer` instance.
    return prefixer . process ( input , {
      // Configuration for source map generation.
      map : ( typeof options . map === 'boolean' )
              ? options . map // If 'map' is a boolean, use it directly.
              : { // Otherwise, it's an object with detailed map options.
                  prev          : getPrevMap( from ) , // Get previous map content if available.
                  inline        : ( typeof options . map . inline        === 'boolean' ) ? options . map . inline        : true , // Inline map by default.
                  annotation    : ( typeof options . map . annotation    === 'string'  ) ? options . map . annotation    : true , // Annotation by default.
                  sourcesContent: ( typeof options . map . sourcesContent === 'boolean' ) ? options . map . sourcesContent : true   // Include sources content by default.
                } ,
      from : from , // Original file path.
      to   : to   , // Destination file path.
      safe : options . safe // Use 'safe' mode if enabled in options.
    } ) ;
  }


  /*
   * Simple logging utility function.
   * Uses Grunt's verbose writeln for output, which only shows if Grunt is run with `--verbose`.
   *
   * @param {string} msg - The message string to be logged.
   */
  function log ( msg ) {
    grunt . verbose . writeln( msg ) ;
  }


  /*
   * Register the 'autoprefixer' Grunt multi-task.
   * This defines how the task behaves when executed.
   */
  grunt . registerMultiTask ( 'autoprefixer' , 'Prefix CSS files.' , function ( ) {

    // Initialize task options with defaults.
    // 'this.options' merges user-defined options with these defaults.
    options = this . options ( {
      browsers : undefined , // Browsers to target (e.g., ['last 2 versions', 'ie 9']).
      cascade  : true      , // Should prefixes be indented for better readability?
      diff     : false     , // Generate a diff file showing changes?
      map      : false     , // Generate source maps?
      remove   : true      , // Remove outdated prefixes?
      safe     : false       // Use Autoprefixer's safe mode (prevents syntax errors)?
    } ) ;


    // Initialize a tally object to keep track of processed files.
    var tally = {
      sheets : 0 , // Count of CSS stylesheets processed.
      maps   : 0 , // Count of source maps generated.
      diffs  : 0   // Count of diff files generated.
    } ;


    // Initialize the autoprefixer instance with the configured browser list and other settings.
    prefixer = autoprefixer ( {
      browsers : options . browsers ,
      cascade  : options . cascade  ,
      remove   : options . remove
    } ) ;


    // Iterate over all file groups defined in the Grunt configuration for this task.
    this . files . forEach ( function ( f ) {

      // Check if any source files were actually found for the current file group.
      if ( ! f . src . length ) {
        // If no source files, issue a warning and skip this group.
        return grunt . fail . warn ( 'No source files were found.' ) ;
      }


      // Use a try-catch block to gracefully handle potential errors during file processing.
      try {
        // Iterate over each source file within the current file group.
        f . src . forEach ( function ( filepath ) {
          // Determine the destination path. If 'f.dest' is not specified, use the source filepath.
          var dest   = f . dest || filepath ;
          // Read the content of the input CSS file.
          var input  = grunt . file . read ( filepath ) ;
          // Process the CSS content using the 'prefix' helper function.
          var output = prefix ( input , filepath , dest ) ;


          // Write the processed CSS content to the destination file.
          grunt . file . write ( dest , output . css ) ;
          // Log the creation of the CSS file.
          log ( 'File ' + chalk . cyan( dest ) + ' created.' ) ;
          // Increment the count of processed stylesheets.
          tally . sheets ++ ;


          // If a source map was generated (output.map is not null/undefined).
          if ( output . map ) {
            // Write the source map content to a file.
            grunt . file . write ( dest + '.map' , output . map . toString( ) ) ;
            // Log the creation of the source map file.
            log ( 'File ' + chalk . cyan( dest + '.map' ) + ' created (source map).' ) ;
            // Increment the count of generated source maps.
            tally . maps ++ ;
          }


          // If diff generation is enabled in the options.
          if ( options . diff ) {
            // Determine the diff file path. Use 'options.diff' if it's a string, otherwise append '.diff'.
            var diffPath = ( typeof options . diff === 'string' ) ? options . diff : dest + '.diff' ;

            // Create and write the diff patch to the specified diff file.
            grunt . file . write ( diffPath , diff . createPatch ( dest , input , output . css ) ) ;
            // Log the creation of the diff file.
            log ( 'File ' + chalk . cyan( diffPath ) + ' created (diff).' ) ;
            // Increment the count of generated diffs.
            tally . diffs ++ ;
          }
        } ) ;
      } catch ( e ) {
        // If any error occurs during processing, fail the Grunt task fatally.
        grunt . fail . fatal ( e ) ;
      }
    } ) ;


    // Final logging: Summarize the task's outcome.
    // Report the number of stylesheets processed.
    if ( tally . sheets ) {
      grunt . log . ok ( tally . sheets + ' ' + 'autoprefixed ' + grunt . util . pluralize ( tally . sheets , 'stylesheet/stylesheets' ) + ' created.' ) ;
    }

    // Report the number of source maps created.
    if ( tally . maps ) {
      grunt . log . ok ( tally . maps + ' ' + grunt . util . pluralize ( tally . maps , 'sourcemap/sourcemaps' ) + ' created.' ) ;
    }

    // Report the number of diff files generated.
    if ( tally . diffs ) {
      grunt . log . ok ( tally . diffs + ' ' + grunt . util . pluralize ( tally . diffs , 'diff/diffs' ) + ' created.' ) ;
    }
  } ) ;
} ; /* End of module.exports function */