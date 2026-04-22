/*
 * This script processes input from stdin.
 * It expects three space-separated numbers (a, b, c)
 * and calculates how many numbers between a and b (inclusive)
 * are divisors of c.
 */

'use strict'; // Enforce strict mode for cleaner code.

// Event listener for incoming data on standard input.
process.stdin.on ( 'data' , function ( chunk )
{

    // Convert the data chunk to a string, then remove leading/trailing whitespace.
    var inputs = chunk.toString ( ).trim ( ) ;

    // Split the string by spaces and convert each part to a number.
    var data = inputs . split ( ' ' ) . map ( Number ) ;

    // Assign the parsed numbers to variables.
    var a = data [ 0 ] ; // First number: start of range.
    var b = data [ 1 ] ; // Second number: end of range.
    var c = data [ 2 ] ; // Third number: the number to check divisors for.

    var count = 0 ; // Initialize a counter for divisors.

    // Loop through the numbers from 'a' to 'b' (inclusive).
    for ( var i = a ; i < b + 1 ; i ++ )
    {
        // Check if 'i' is a divisor of 'c'.
        // The modulo operator (%) returns the remainder of a division.
        // If the remainder is 0, 'i' is a divisor.
        if ( c % i === 0 )
        {
            count ++ ; // Increment the counter if 'i' is a divisor.
        }
    }

    // Output the final count of divisors to standard output.
    console . log ( count ) ;


} ) ; // End of 'data' event listener.

// Ensure the standard input stream remains open.
process . stdin . resume ( ) ;

// Set the encoding for standard input.
process . stdin . setEncoding ( 'utf8' ) ; // Use UTF-8 encoding for input.