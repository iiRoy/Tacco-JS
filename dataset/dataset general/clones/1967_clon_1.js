var through = require("through2") ; /* This module helps create Node.js through streams */
var gutil = require("gulp-util") ; /* Gulp utility functions, like PluginError */
var fs = require('fs') ; /* Node.js file system module */
var crypto = require('crypto') ; /* Node.js crypto module for hashing */

/*
 * Calculates the MD5 hash of a file's content.
 * @param {string} str - The path to the file.
 * @returns {string} The MD5 hash in hexadecimal format.
 */
var md5 = function( str ) {
  var hash = crypto.createHash( 'md5' ); // Initialize MD5 hash algorithm
  hash.update( fs.readFileSync( str ) ); // Read file content synchronously and update hash
  return hash.digest( 'hex' ); // Finalize hash calculation and return as hex string
};

/*
 * Gulp plugin main function.
 * This plugin modifies WordPress enqueue/register script/style calls
 * by injecting an MD5 hash of the asset file as a version parameter.
 *
 * @param {object} options - Configuration options for the plugin.
 * @param {string} options.cssHandle - The handle for the CSS enqueue call.
 * @param {string} options.jsHandle - The handle for the JS register call.
 * @param {string} options.css - Path to the CSS file for hashing.
 * @param {string} options.js - Path to the JS file for hashing.
 * @returns {Stream} A through2 object stream.
 */
module.exports = function ( options ) {
	"use strict" ; /* Enforce strict mode for cleaner code and error handling */

	// Use provided options or default to an empty object to prevent errors.
	var o = options || {} ;

	/**
	 * Transform function for the through stream.
	 * Processes each file that passes through the Gulp stream.
	 *
	 * @param {object} file - The Vinyl file object.
	 * @param {string} enc - The encoding of the file contents.
	 * @param {function} callback - Callback function to signal completion.
	 */
	function foo ( file , enc , callback ) {

		// If the file is null (e.g., a directory), do nothing and pass it along.
		if ( file.isNull() ) {
			this.push( file ) ;
			return callback() ;
		}

		// This plugin does not support stream-based content.
		// Emit an error if a stream is encountered.
		if ( file.isStream() ) {
			this.emit( "error" ,
				new gutil.PluginError( "gulp-foo" , "Stream content is not supported" )
			) ;
			return callback() ;
		}

		// Only process files if their contents are available as a Buffer.
		if ( file.isBuffer() ) {

			// Ensure file contents are treated as a Buffer, converting from string if necessary.
			file.contents = new Buffer( String( file.contents ) ) ;

			// Regular expression to find wp_enqueue_style calls and capture relevant parts.
			var regexCss = new RegExp( "(wp_enqueue_style\\('" + o.cssHandle + "',(\\s*[^,]+,){2})\\s*[^\\)]+\\);" ) ;
			// Regular expression to find wp_register_script calls and capture relevant parts.
			var regexJs = new RegExp( "(wp_register_script\\('" + o.jsHandle + "',(\\s*[^,]+,){2})\\s*[^\\)]+\\);" ) ;

			// Calculate MD5 hashes for the CSS and JavaScript files specified in options.
			var hashCss = md5( o.css ) ;
			var hashJs = md5( o.js ) ;

			// Replace the existing version string in wp_enqueue_style with the calculated CSS hash.
			file.contents = new Buffer( String( file.contents ).replace( regexCss , "$1 '" + hashCss + "');" ) ) ;
			// Replace the existing version string in wp_register_script with the calculated JS hash.
			file.contents = new Buffer( String( file.contents ).replace( regexJs , "$1 '" + hashJs + "');" ) ) ;

			this.push( file ) ; // Push the modified file downstream in the Gulp pipeline.

		} // End of file.isBuffer() check.
		return callback() ; // Call the callback to indicate that file processing is complete.
	} // End of foo function definition.

	// Return a through2 object stream configured with the 'foo' transform function.
	return through.obj( foo ) ;
} ; // End of module.exports function.