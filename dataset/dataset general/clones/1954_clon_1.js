'use strict' ;

// This file contains a utility for rendering data structures as formatted strings.
// It supports coloring and indentation for better readability.

// --- Module Dependencies Section ---
// Load the 'colors' module to enable colored output in the terminal.
// This module extends String.prototype to add color methods.
require( 'colors' ) ;

// Load local utility functions from 'utils.js'.
// 'Utils' object contains helper methods like 'indent' and 'getMaxIndexLength'.
var Utils = require( './utils' ) ;

// --- Version Export ---
// Export the version number of this package, read from 'package.json'.
exports . version = require( '../package.json' ) . version ;


/*
 * Main Render Function
 *
 * This function recursively renders various data types (objects, arrays, primitives)
 * into a human-readable, color-formatted string.
 *
 * @param {any} data - The data structure to be rendered.
 * @param {object} options - Configuration options for rendering.
 * @param {number} indentation - The base indentation level for the current rendering context.
 *
 * Example Usage of Options:
 *
 * {
 *   emptyArrayMsg: '(array is empty)', // Message displayed for empty arrays
 *   keysColor: 'blue',                 // Color for object keys
 *   dashColor: 'yellow',               // Color for array item dashes
 *   stringColor: 'cyan',               // Color for string values
 *   numberColor: 'magenta',            // Color for number values
 *   defaultIndentation: 3,             // Default spaces for nested structures
 *   noColor: false,                    // Disable all color output if true
 *   inlineArrays: true                 // Attempt to render simple arrays on a single line
 * }
 */
exports . render = function render ( data , options , indentation ) {
  // Initialize parameters with default values if not provided.
  // Set initial indentation to 0 if undefined or null.
  indentation = indentation || 0 ;

  // Ensure options is an object to prevent errors.
  options = options || { } ;

  // Set default message for empty arrays.
  options . emptyArrayMsg = options . emptyArrayMsg || '(empty array)' ;

  // Set default color for object keys.
  options . keysColor = options . keysColor || 'green' ;

  // Set default color for array dashes.
  options . dashColor = options . dashColor || 'green' ;

  // Set default color for numbers.
  options . numberColor = options . numberColor || 'blue' ;

  // Set default indentation for nested structures.
  options . defaultIndentation = options . defaultIndentation || 2 ;

  // Ensure 'noColor' is a boolean.
  options . noColor = !! options . noColor ;

  // Set default color for strings. Can be null if no special string color is desired.
  options . stringColor = options . stringColor || null ;


  // This array will accumulate all the lines of the formatted output.
  var output = [ ] ;


  /**
   * Helper function: Determines if a given input can be serialized directly onto a single line.
   * This is useful for primitives and simple data types.
   *
   * @param {any} input - The value to check.
   * @param {boolean} onlyPrimitives - If true, only checks for true primitives (no inline arrays).
   * @returns {boolean} - True if serializable, false otherwise.
   */
  var isSerializable = function ( input , onlyPrimitives ) {
    // Check for standard primitive types and null.
    if ( typeof input === 'boolean' ||
         typeof input === 'number' ||
         input === null ||
         input instanceof Date )
    {
      return true ;
    }

    // A string is serializable if it's a single line (no newlines).
    if ( typeof input === 'string' && input . indexOf( '\n' ) === -1 ) {
      return true ;
    }

    // If 'inlineArrays' option is enabled and we are not restricted to only primitives,
    // check if an array's first element is serializable.
    if ( options . inlineArrays && ! onlyPrimitives ) {
      if ( Array . isArray( input ) && isSerializable( input[ 0 ] , true ) ) {
        return true ;
      }
    }

    return false ;
  } ; // End of isSerializable helper.


  /**
   * Helper function: Indents each line of a multi-line string.
   *
   * @param {string} string - The multi-line string to indent.
   * @param {number} spaces - The number of spaces to add to the beginning of each line.
   * @returns {string} - The indented string.
   */
  var indentLines = function ( string , spaces ) {
    var lines = string . split( '\n' ) ;
    lines = lines . map( function ( line ) {
      return Utils . indent( spaces ) + line ;
    } ) ;
    return lines . join( '\n' ) ;
  } ; // End of indentLines helper.


  /**
   * Helper function: Applies color to the input based on its type and options.
   *
   * @param {any} input - The value to colorize.
   * @returns {string} - The colorized string representation of the input.
   */
  var addColorToData = function ( input ) {
    // If coloring is disabled, return the input as is.
    if ( options . noColor ) {
      return input ;
    }

    // Apply specific color for strings if `stringColor` is set.
    if ( typeof input === 'string' ) {
      return options . stringColor ? input[ options . stringColor ] : input ;
    }

    // Convert input to string for color application (colors module extends String.prototype).
    var sInput = input + '' ;

    // Apply specific colors for boolean values.
    if ( input === true ) {
      return sInput . green ;
    }
    if ( input === false ) {
      return sInput . red ;
    }

    // Apply specific color for null.
    if ( input === null ) {
      return sInput . grey ;
    }

    // Apply specific color for numbers.
    if ( typeof input === 'number' ) {
      return sInput[ options . numberColor ] ;
    }

    // Special handling for arrays - join elements without specific color for the array itself.
    if ( Array . isArray( input ) ) {
      return input . join( ', ' ) ;
    }

    // Default return for other types.
    return sInput ;
  } ; // End of addColorToData helper.


  // --- Main Rendering Logic ---

  // Case 1: The data is a simple, serializable value (primitive, single-line string, etc.).
  if ( isSerializable( data ) ) {
    output . push( Utils . indent( indentation ) + addColorToData( data ) ) ;
  }
  // Case 2: The data is a multi-line string. Render it within triple quotes.
  else if ( typeof data === 'string' ) {
    output . push( Utils . indent( indentation ) + '"""' ) ;
    output . push( indentLines( data , indentation + options . defaultIndentation ) ) ;
    output . push( Utils . indent( indentation ) + '"""' ) ;
  }
  // Case 3: The data is an array.
  else if ( Array . isArray( data ) ) {
    // If the array is empty, render the `emptyArrayMsg`.
    if ( data . length === 0 ) {
      output . push( Utils . indent( indentation ) + options . emptyArrayMsg ) ;
    } else {
      // Iterate over each element in the array.
      data . forEach( function ( element ) {
        // Prepare the dash prefix for each array element.
        var line = ( '- ' ) ;
        if ( ! options . noColor ) {
          line = line[ options . dashColor ] ;
        }
        line = Utils . indent( indentation ) + line ;

        // If the array element is serializable, render it on the same line as the dash.
        if ( isSerializable( element ) ) {
          line += exports . render( element , options ) ;
          output . push( line ) ;
        }
        // If the element is an array or object, render it on the next line with increased indentation.
        else {
          output . push( line ) ;
          output . push( exports . render(
            element , options , indentation + options . defaultIndentation
          ) ) ;
        }
      } ) ;
    }
  }
  // Case 4: The data is an object.
  else if ( typeof data === 'object' ) {
    // Determine the length of the longest key to align values aesthetically.
    var maxIndexLength = Utils . getMaxIndexLength( data ) ;
    var key ;
    var isError = data instanceof Error ; // Special handling for Error objects.

    // Iterate over all own properties of the object.
    Object . getOwnPropertyNames( data ) . forEach( function ( i ) {
      // Prepare the key string with its colon and potential color.
      key = ( i + ': ' ) ;
      if ( ! options . noColor ) {
        key = key[ options . keysColor ] ;
      }
      key = Utils . indent( indentation ) + key ;

      // Skip `undefined` values, as they are not valid JSON.
      if ( data[ i ] === undefined ) {
        return ;
      }

      // If the value is serializable (and not the 'stack' property of an Error object),
      // render it on the same line as the key.
      if ( isSerializable( data[ i ] ) && ( ! isError || i !== 'stack' ) ) {
        key += exports . render( data[ i ] , options , maxIndexLength - i . length ) ;
        output . push( key ) ;
      }
      // If the value is an array or object (or the 'stack' property of an Error),
      // render it on the next line with increased indentation.
      else {
        output . push( key ) ;
        output . push(
          exports . render(
            isError && i === 'stack' ? data[ i ] . split( '\n' ) : data[ i ] ,
            options ,
            indentation + options . defaultIndentation
          )
        ) ;
      }
    } ) ;
  }
  // Finally, join all accumulated lines into a single string with newline separators.
  return output . join( '\n' ) ;
} ; // End of exports.render function.


/*
 * Render From String Function
 *
 * This function takes a string, attempts to parse it as JSON, and then renders
 * the parsed data using the main `exports.render` function.
 * It also handles non-JSON prefixes in the input string.
 *
 * @param {string} data - The string containing JSON data to be parsed and rendered.
 * @param {object} options - Configuration options, same as `exports.render`.
 * @param {number} indentation - Base indentation, same as `exports.render`.
 *
 * Example of options hash:
 *
 *     {
 *       emptyArrayMsg: '(empty)', // Rendered message on empty strings
 *       keysColor: 'blue',        // Color for keys in hashes
 *       dashColor: 'red',         // Color for the dashes in arrays
 *       defaultIndentation: 2     // Indentation on nested objects
 *     }
 */
exports . renderString = function renderString ( data , options , indentation ) {

  var output = '' ; // Accumulates output, including non-JSON prefix.
  var parsedData ; // Variable to hold the result of JSON.parse.

  // If the input is not a string or is an empty string, return an empty string.
  if ( typeof data !== 'string' || data === '' ) {
    return '' ;
  }

  // Handle cases where the string might have non-JSON characters at the beginning.
  // This attempts to find the start of a JSON object '{' or array '['.
  if ( data[ 0 ] !== '{' && data[ 0 ] !== '[' ) {
    var beginingOfJson ; // Index where the JSON structure actually begins.

    // Determine the earliest occurrence of '{' or '['.
    if ( data . indexOf( '{' ) === -1 ) {
      beginingOfJson = data . indexOf( '[' ) ;
    } else if ( data . indexOf( '[' ) === -1 ) {
      beginingOfJson = data . indexOf( '{' ) ;
    } else if ( data . indexOf( '{' ) < data . indexOf( '[' ) ) {
      beginingOfJson = data . indexOf( '{' ) ;
    } else {
      beginingOfJson = data . indexOf( '[' ) ;
    }

    // If a JSON start is found, append the prefix to output and trim 'data'.
    if ( beginingOfJson !== -1 ) {
      output += data . substr( 0 , beginingOfJson ) + '\n' ;
      data = data . substr( beginingOfJson ) ;
    } else {
      // If no JSON start is found, the whole string is non-JSON or invalid, return it as is.
      return data;
    }
  }

  // Attempt to parse the (potentially trimmed) data as JSON.
  try {
    parsedData = JSON . parse( data ) ;
  } catch ( e ) {
    // If JSON parsing fails, return an error message.
    return 'Error:' . red + ' Not valid JSON!' ;
  }

  // Call the main `exports.render` method with the parsed data.
  output += exports . render( parsedData , options , indentation ) ;

  // Return the complete output.
  return output ;
} ; // End of exports.renderString function.