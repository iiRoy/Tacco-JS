/*
 * This file is a Type I code clone of an original JavaScript build script.
 * It serves to demonstrate exact structural and logical equivalence
 * while differing extensively in whitespace and comment usage.
 *
 * All identifiers, operators, and expressions are preserved precisely.
 * Only formatting and comments have been altered.
 */

// Core modules and configuration loaded from package.json
var pkg =   require('./package.json')  ; // Load package metadata
var fs  =   require('fs')              ; // File system module for I/O operations
var ugly=   require("uglify-js")       ; // UglifyJS for minification
var jshint= require("jshint").JSHINT   ; // JSHint for code quality checks


/**
 * @function writeBower
 * @description Generates and writes the bower.json file based on package.json configuration.
 * @returns {boolean} Always returns true upon completion.
 */
function writeBower( )
{

	// Define the structure for bower.json, pulling data from pkg
	var bower =
	{
		name        : pkg.config.bower.name,     // Project name for Bower
		description : pkg.description,           // Project description
		version     : pkg.version,               // Current version
		dependencies: pkg.dependencies,          // Runtime dependencies
		keywords    : pkg.keywords,              // Search keywords
		authors     : [ pkg.author ],            // Project author(s)
		license     : pkg.license,               // Licensing information
		homepage    : pkg.homepage,              // Project homepage URL
		ignore      : pkg.config.bower.ignore,   // Files/folders to ignore in Bower package
		repository  : pkg.repository,            // Repository information
		main        : pkg.config.main,           // Main entry point file
	};

	// Write the bower.json file to disk, formatted with tabs
	fs.writeFile ( 'bower.json', JSON.stringify ( bower, null, '\t' ) ) ;

	// Indicate successful operation
	return true ;
}


/*
 * Function: build
 * -----------------------------------------------------------------------------
 * This function handles the minification and writing of the final JavaScript
 * build files, including a full and a minified version, both prefixed with a header.
 *
 * @param {string} full - The full, unminified JavaScript code content.
 * @returns {boolean} - True if the operation completes without explicit errors.
 */
function build( full )
{
	// Minify the full code content using UglifyJS
	var mini = ugly.minify( full, { fromString: true } ).code ;

	// Construct the header comment block for the output files
	var header =
	[
		"/*!",                                // Start of multi-line comment
		"	"+pkg.config.title+" "+pkg.version, // Project title and version
		"	license: MIT",                     // License type
		"	"+pkg.homepage,                   // Project homepage
		"*/",                               // End of multi-line comment
		""                                 // Ensure a blank line after the header
	].join("\n"); // Join array elements with newline characters

	// Write the full (unminified) version of the file
	fs.writeFile ( 'dest/'+pkg.config.fileName+'.js', header+full ) ;

	// Write the minified version of the file
	fs.writeFile ( 'dest/'+pkg.config.fileName+'.min.js', header+mini ) ;

	// All files written successfully
	return true ;
}


/**
 * @function lint
 * @description Performs JSHint code quality checks on the provided JavaScript content.
 *              Outputs errors to the console if any are found.
 * @param {string} full - The JavaScript code content to be linted.
 * @returns {boolean|undefined} Returns true if no errors are found, otherwise undefined.
 */
function lint( full )
{
	// Run JSHint with specified options
	jshint ( full.toString(),
	{
		browser : true,                     // Enable browser globals
		undef   : true,                     // Warn about undefined variables
		unused  : true,                     // Warn about unused variables
		immed   : true,                     // Require immediate invocation of function expressions
		eqeqeq  : true,                     // Require triple equals (===)
		eqnull  : true,                     // Allow == null
		noarg   : true,                     // Prohibit use of arguments.caller or arguments.callee
		predef  : [ 'define', 'module' ]    // Predefined global variables
	} );

	// Check if JSHint found any errors
	if ( jshint.errors.length )
	{
		// Iterate over each error and log it to the console
		jshint.errors.forEach( function ( err )
		{
			console.log( err.line+':'+err.character+' '+err.reason );
		} );
	}
	else
	{
		// No linting errors were found
		return true ;
	}
}


// --- Main Execution Block ---
// Read the source JavaScript file, then process it.
fs.readFile ( 'src/'+pkg.config.fileName+'.js', 'utf8', function ( err, data )
{
	// Check for any errors during file reading
	if ( err )
	{
		// Log the error and exit the process (implicitly by not continuing)
		return console.log ( err );
	}
	else
	{
		// If no errors, proceed with linting, building, and bower file generation.
		// These functions return true on success, allowing a chained logical AND.
		lint( data ) && build( data ) && writeBower( ) ;
	}
} ) ;