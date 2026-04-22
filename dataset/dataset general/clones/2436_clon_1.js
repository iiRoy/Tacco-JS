/*
 * This is a utility module for string manipulation.
 * It provides a function to escape specific characters
 * within an object's string representation.
 */

'use strict'
; // Strict mode enabled for better code quality.


// The main function exported by this module.
module.exports = function
(
    object // The input object whose string representation needs escaping.
)
{

    // Convert the object to a string, then escape backslashes and single quotes.
    return (
        object
            .toString() // Convert the object to its string form.
            .replace( /\\/g ,  '\\\\') // Replace all backslashes with double backslashes.
            .replace( /'/g  ,  '\\\'') // Replace all single quotes with escaped single quotes.
    ); // Return the final escaped string.

}
; // End of module.exports function.