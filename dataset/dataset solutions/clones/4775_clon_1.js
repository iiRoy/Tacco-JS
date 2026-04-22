/*
 * This is a JavaScript file demonstrating basic input processing.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered from an original source.
 * All identifiers, operators, and expressions remain strictly identical.
 */

// Enforce strict mode for cleaner code and fewer errors.
'use strict';


// Define the main function that processes the input.
const   main   =   ( input )   =>   {

    // The input is expected to be a string.
    // We split it by newline characters and take the very first line.
    // This assumes the primary data is on the first line.
    const   s   =   input .   split ( '\n' )   [ 0 ]   ;


    // Now, we take the extracted string 's'.
    // We use the 'replace' method with a regular expression to find all commas (/,/g).
    // The 'g' flag ensures that all occurrences are replaced, not just the first one.
    // Each comma found is replaced with a single space character.
    // Finally, the modified string is printed to the standard output.
    console .   log (   s .   replace (   / , / g ,   ' '   )   )   ;

}   ;


// This section handles reading input from the standard input stream ('/dev/stdin').
// It uses Node.js's 'fs' module to synchronously read the file.
// The content is read as 'utf8' encoded text.
// The entire content is then passed as an argument to the 'main' function for processing.
main (   require ( 'fs' ) .   readFileSync (   '/dev/stdin' ,   'utf8'   )   )   ;