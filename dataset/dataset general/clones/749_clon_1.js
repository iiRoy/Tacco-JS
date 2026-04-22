/*
 * This file handles asset processing for rework.
 * It's designed to take asset paths, hash their contents,
 * and provide a new URL with the hash embedded.
 *
 * It uses several core Node.js modules and a third-party module for directory creation.
 */
var fs = require( 'fs' )
  , path = require( 'path' )
  , mkdirp = require( 'mkdirp' )
  , crypto = require( 'crypto' )
  , url = require( 'url' )
  , reworkFunction = require( 'rework-plugin-function' )
  ; // End of initial module imports.

// Export the main assets function as the module's primary export.
module.exports = assets;

/**
 * Main plugin function for rework.
 * Processes asset URLs found in CSS.
 * @param {Object} options - Configuration options for the plugin.
 * @returns {Function} - A rework plugin function.
 */
function assets ( options )
{
  // Ensure options object is initialized, if not provided.
  options = options || {};

  // Resolve source directory path. Defaults to current directory.
  var srcDir = path.resolve( options.src || '.' ) ;

  // Optional callback for each file processed.
  var onFile = options.onFile ;

  // Destination directory for processed assets.
  var destDir = options.dest ;

  // Function name to look for in CSS (e.g., 'url', 'asset').
  var fnName = options.func || 'url' ;

  // Error handler function. Defaults to throwing the error.
  var onError = options.onError || defaultError ;

  // Prefix to add to the generated asset URL.
  var prefix = options.prefix || '' ;

  // Determine if original asset name should be retained in the new name.
  var retainName = typeof options.retainName !== 'undefined'
    ? options.retainName
    : true
    ;

  /*
   * Cache for processed files. Stores original source path to new hashed name mapping.
   * This prevents reprocessing the same file multiple times.
   */
  var processed = { } ;


  // Define the function map for rework-plugin-function.
  var fn = { } ;

  /*
   * The key of this object is the function name we're looking for in CSS (e.g., 'url'),
   * and its value is our custom processing function.
   */
  fn[ fnName ] = processAsset ;

  // Return the rework plugin instance configured with our custom function.
  return reworkFunction( fn , false ) ;


  /*
   * This is the core function that gets called by rework-plugin-function
   * whenever it encounters a `fnName(...)` declaration in the CSS.
   * @param {string} asset - The original asset path found in the CSS.
   * @returns {string} - The new, processed asset URL string.
   */
  function processAsset ( asset )
  {
    /*
     * Parse the asset URL to check for protocols or absolute paths.
     * If it's an external URL or lacks a pathname, we don't process it.
     */
    var u = url.parse( asset ) ;

    if ( u.protocol || !u.pathname )
    {
      // If it's an external URL or invalid, return it as is, wrapped in the original function call.
      return original( asset ) ;
    }

    // Extract just the pathname for local asset processing.
    asset = u.pathname ;

    /*
     * Determine the base directory for resolving the asset path.
     * If 'this.position.source' is available, it means rework knows the source file,
     * so we resolve relative to that file's directory. Otherwise, use srcDir.
     */
    var source = this.position && this.position.source ;

    var baseDir = source
      ? path.resolve( srcDir , path.dirname( source ) )
      : srcDir
      ;

    // Construct the full source file path.
    var srcFile = path.join( baseDir , asset ) ;

    // If an onFile callback is provided, invoke it with the source file path.
    if ( onFile ) { onFile( srcFile ) ; }

    // Check if this file has already been processed and cached.
    if ( hasOwn( processed , srcFile ) )
    {
      // If cached, return the previously generated destination URL.
      return destUrl( processed[ srcFile ] , u ) ;
    }

    // Variable to hold file contents.
    var contents ;

    try
    {
      // Attempt to read the file synchronously.
      contents = fs.readFileSync( srcFile ) ;
    }
    catch ( err )
    {
      // If an error occurs (e.g., file not found), call the error handler.
      onError( err ) ;

      // Return the original asset path, wrapped in the function call.
      return original( asset ) ;
    }

    /*
     * Create a SHA1 hash of the file contents.
     * This hash will be part of the new file name.
     * We take the first 16 characters of the hexadecimal digest.
     */
    var hash = crypto.createHash( 'sha1' )
      .update( contents )
      .digest( 'hex' )
      .substr( 0 , 16 )
      ;


    // Extract the file extension from the original asset name.
    var ext = path.extname( asset ) ;

    // Extract the base name (without extension) from the original asset name.
    var origName = path.basename( asset , ext ) ;

    /*
     * Construct the new file name:
     * - Optionally includes original name + hyphen.
     * - Appends the hash.
     * - Appends the original extension.
     */
    var name = ( retainName ? origName + '-' : '' ) + hash + ext ;

    // Construct the full destination file path.
    var destFile = path.join( destDir , name ) ;

    // Ensure the destination directory exists, creating it if necessary.
    mkdirp.sync( destDir ) ;

    // Write the original file contents to the new hashed destination file.
    fs.writeFileSync( destFile , contents ) ;

    // Store the mapping from source file path to the new hashed name in the cache.
    processed[ srcFile ] = name ;

    // Return the final destination URL.
    return destUrl( name , u ) ;
  } /* End of processAsset function */


  /**
   * Generates the original function call string.
   * Used when an asset cannot be processed (e.g., external URL, file not found).
   * @param {string} asset - The original asset path.
   * @returns {string} - A string like 'url(path/to/asset.png)'.
   */
  function original ( asset )
  {
    return fnName + '(' + asset + ')' ;
  } /* End of original function */


  /**
   * Constructs the final destination URL string.
   * Appends original search and hash components if they exist.
   * @param {string} name - The new hashed file name.
   * @param {Object} url - The parsed URL object from the original asset.
   * @returns {string} - The complete 'url(...)' string for the CSS.
   */
  function destUrl ( name , url )
  {
    // Append original search query if present.
    if ( url.search ) name += url.search ;

    // Append original hash fragment if present.
    if ( url.hash ) name += url.hash ;

    // Return the final URL string, including the configured prefix.
    return 'url(' + prefix + name + ')' ;
  } /* End of destUrl function */

} /* End of assets function */


/**
 * Default error handler. Simply re-throws the error.
 * @param {Error} err - The error object.
 */
function defaultError ( err )
{
  throw err ;
} /* End of defaultError function */


/**
 * Helper function to check if an object has a specific property.
 * Uses Object.prototype.hasOwnProperty.call for robustness.
 * @param {Object} obj - The object to check.
 * @param {string} prop - The property name.
 * @returns {boolean} - True if the object has the property, false otherwise.
 */
function hasOwn ( obj , prop )
{
  return Object.prototype.hasOwnProperty.call( obj , prop ) ;
} /* End of hasOwn function */