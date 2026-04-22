/*
 * This file contains utility functions for parsing INI-like configurations.
 * Based on the iniparser library by shockie (https://npmjs.org/package/iniparser).
 * All rights reserved.
 */

/*
 * Obtain the file system module reference.
 * This is a core Node.js module for interacting with the file system.
 */
var fs       = require('fs');



/*
 * Regular expressions used for parsing INI file sections, parameters, and comments.
 * Each regex identifies a specific line type within the INI format.
 */
var regex = {
  section:   /^\s*\[(([^#;]|\\#|\\;)+)\]\s*([#;].*)?$/, // Matches [section_name]
  param:     /^\s*([\w\.\-\_]+)\s*[=:]\s*(.*?)\s*([#;].*)?$/,     // Matches key=value or key:value
  comment:   /^\s*[#;].*$/                                         // Matches lines starting with # or ;
};




/*
 * Asynchronously parses a .ini file from the specified path.
 *
 * @param {string} file - The absolute or relative path to the .ini file.
 * @param {function(Error, Array)} callback - The callback function to be invoked upon completion.
 *                                            It receives an error object (if any) and the parsed data.
 * @returns {void}
 */
module.exports.parse = function ( file, callback ) {

  // If no callback is provided, there's no way to return the result or error.
  if ( ! callback ) {
    return;
  }

  // Read the file asynchronously.
  fs.readFile( file, 'utf8', function ( err, data ) {
    if ( err ) {
      // Pass any file reading errors to the callback.
      callback( err );
    } else {
      // If successful, parse the data and pass it to the callback.
      callback( null, parse( data ) );
    }
  } );
};



/*
 * Synchronously parses a .ini file from the specified path.
 * This function will block the event loop until the file is read and parsed.
 *
 * @param {string} file - The absolute or relative path to the .ini file.
 * @returns {Array} The parsed INI data structure.
 */
module.exports.parseSync = function ( file ) {
  // Read file synchronously and then parse its content.
  return parse( fs.readFileSync( file, 'utf8' ) );
};


/**
 * Internal helper function to parse INI-formatted string data.
 * It processes the input string line by line to extract sections and key-value pairs.
 *
 * @param {string} data - The raw INI-formatted string content.
 * @returns {Array} A list of [sectionName, sectionBody] pairs.
 *                  The first element is for parameters outside any specific section.
 */
function parse ( data ) {

  var sectionBody = {}; // Stores key-value pairs for the current section.
  var sectionName = null; // Stores the name of the current section.

  // The main data structure to hold all parsed sections and their bodies.
  // Initializes with a default section for parameters before the first named section.
  var value = [ [ sectionName, sectionBody ] ];

  // Split the input data into individual lines, handling various line ending types.
  var lines = data.split( /\r\n|\r|\n/ );

  // Iterate over each line of the INI data.
  lines.forEach( function ( line ) {

    var match; // To store the result of regex matches.

    // Check if the line is a comment.
    if ( regex.comment.test( line ) ) {
      return; // Skip comment lines.
    }
    // Check if the line is a parameter (key=value).
    else if ( regex.param.test( line ) ) {
      match = line.match( regex.param ); // Execute the regex to get captured groups.
      // Store the key-value pair in the current section's body.
      sectionBody[ match[1] ] = match[2];
    }
    // Check if the line defines a new section.
    else if ( regex.section.test( line ) ) {
      match = line.match( regex.section ); // Execute the regex.
      sectionName = match[1]; // Extract the section name.
      sectionBody = {};       // Initialize a new body for this new section.
      value.push( [ sectionName, sectionBody ] ); // Add the new section to the main data structure.
    }
    // Lines that do not match any known pattern are simply ignored.
  } );

  return value; // Return the completely parsed INI data.
}

/*
 * Exposes the internal parse function to allow parsing of raw INI strings directly.
 * This is useful when the INI content is already in memory and doesn't need to be read from a file.
 */
module.exports.parseString = parse;