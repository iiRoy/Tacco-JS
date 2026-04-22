/*
 * This is a JavaScript file demonstrating a simple comparison function.
 * It reads input from /dev/stdin, parses two numbers,
 * and then prints their comparison result.
 */

'use strict' ; // Enforce strict mode for better error handling and cleaner code.

// This is the main immediately-invoked function expression (IIFE)
// that encapsulates the entire script.
( function ( stdin ) {

    // Read the entire standard input, convert it to a string,
    // remove leading/trailing whitespace, and split it by newline characters.
    var inputs = stdin . toString ( ) . trim ( ) . split ( '\n' ) ;

    // Parse the first line of input.
    // It's expected to contain two space-separated numbers.
    var params = inputs [ 0 ] . split ( ' ' ) . map ( Number ) ;


    // Another IIFE to process the parsed parameters.
    // It takes two arguments, 'a' and 'b'.
    ( function ( a , b ) {

        // Call the comparison function 'f' with 'a' and 'b'
        // and print the result to the console.
        console . log ( f ( a , b ) ) ;

        /**
         * Compares two numbers and returns a string indicating their relationship.
         * @param {number} a - The first number.
         * @param {number} b - The second number.
         * @returns {string} - 'a > b', 'a < b', or 'a == b'.
         */
        function f ( a , b ) {
            // Check if 'a' is greater than 'b'.
            if ( a > b ) {
                return 'a > b' ;
            }

            // Check if 'a' is less than 'b'.
            if ( a < b ) {
                return 'a < b' ;
            }

            // If neither of the above conditions is met, 'a' must be equal to 'b'.
            return 'a == b' ;
        }

    } ( params [ 0 ] , params [ 1 ] ) ) ; // Pass the first two parameters as 'a' and 'b'.


} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read the file synchronously and pass its content.