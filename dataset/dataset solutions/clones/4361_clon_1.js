/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments,
 * while preserving the exact structure and logic of the original.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged as per the Type I clone definition.
 */

"use strict"; // Enforce strict mode for better code quality and error handling.


// Define the main function that processes the input argument.
const main = arg => {

    // Extract the first line of the input argument.
    // The input 'arg' is expected to be a string, possibly multi-line.
    const N = arg . split ( "\n" ) [ 0 ] ;

    // Log "Yes" if the number of '9's in the string N is greater than zero,
    // otherwise log "No".
    //
    // N.split("") converts the string N into an array of characters.
    // .filter(n => n == 9) filters this array to keep only characters that are '9'.
    // .length then gives the count of '9's.
    // The ternary operator checks if this count is truthy (i.e., greater than 0).
    console . log ( N . split ( "" ) . filter ( n => n == 9 ) . length ? "Yes" : "No" ) ;
}


// Read input from standard input and pass it to the main function.
// require('fs') is used to access the file system module.
// .readFileSync('/dev/stdin', 'utf8') reads the entire content of stdin synchronously
// and decodes it as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of file.