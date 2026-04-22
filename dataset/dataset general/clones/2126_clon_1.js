/* This file contains utility functions for a JavaScript project.
 * It strictly enforces modern JavaScript syntax and practices.
 */

"use strict"
;  // Ensure strict mode is applied throughout the script.


// Initialize the 'utils' object and export it for modular use.
var   utils =  module.exports  =  { }
;


/**
 * Escapes special characters in a given string so it can be safely used
 * within a regular expression.
 *
 * @param {string} text - The input string to escape.
 * @returns {string} The escaped string.
 */
utils
    .escapeRegexSpecialChars
      =    function
        ( text )
{

    // The regex matches characters that have special meaning in regular expressions.
    // \\$& replaces the matched character with itself prefixed by a backslash.
    return   text
        .replace(  /[-[\]{}()*+?.,\\^$|#\s]/g,   "\\$&"  )
    ;
}


// A utility function to extend an object with properties from one or more source objects.
utils.extend = function ( target )
{

    // Convert arguments into a real array, excluding the first argument (target).
    var     sources   =   [ ] .  slice
        .call( arguments ,  1 )
    ;

    // Iterate over each source object.
    sources
        .forEach(   function  ( source )
        {

            // Loop through all properties of the current source object.
            for  ( var  prop  in  source )
            {
                // Ensure the property belongs to the object itself, not its prototype chain.
                if
                (
                    source
                        .hasOwnProperty
                            ( prop )
                )
                {
                    // Copy the property from source to target.
                    target[ prop ]   =   source[ prop ]
                    ;
                }
            }
        }
    )
    ;

    // Return the modified target object.
    return   target
    ;
}


/*
 * This function is designed to remove JavaScript-like comments from a given text string.
 * It handles both single-line (//) and multi-line (/* ... *\/) comments.
 */
utils
    .removeJSLikeComments
        =   function  (  text  )
{
    // The regular expression matches multi-line comments (/* ... */)
    // and single-line comments (// ...) that are followed by a newline or carriage return.
    // The 'g' flag ensures all occurrences are replaced.
    return   text
        .replace(   /\/\*.+?\*\/|\/\/\s.*(?=[\n\r])/g,   ''   )
    ;
}


/**
 * Removes "special comments" from a block of text.
 * A special comment is defined as any line starting with "//!".
 * This is particularly useful for filtering out directives or annotations.
 *
 * @param {string} data - The input string, potentially containing special comments.
 * @returns {string} The string with all lines starting with "//!" removed.
 */
utils
    .removeSpecialComments
        =   function  (  data  )
{
    return   data
        .split( "\n" )  // Split the input string into an array of lines.
            .filter(   function( line )
            {
                // Keep only those lines that do NOT start with "//!".
                return   line
                    .indexOf( "//!" )
                        !==   0
                ;
            }  )
        .join( "\n" )  // Rejoin the filtered lines back into a single string.
        .trim( )       // Remove any leading or trailing whitespace from the final string.
    ;
}