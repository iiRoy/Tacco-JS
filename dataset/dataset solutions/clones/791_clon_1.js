/*
 * This file contains a JavaScript program designed to process numerical input.
 * It reads data from standard input, parses it, and performs a specific calculation
 * to find a minimum sum based on cubic and quadratic operations.
 *
 * This version serves as a Type I clone, preserving all logical and structural
 * elements while extensively modifying whitespace and comments for visual distinction.
 *
 * Original Author: Unknown
 * Clone Generator: Expert Code Clone Generator
 * Date of Generation: 2023-10-27
 */

// Importing the 'fs' (file system) module to read input.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' );


// Process the raw input string:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of lines based on the newline character.
var Arr = ( input . trim() ) . split( "\n" );


// Main processing loop: Continuously reads and processes numbers until a specific termination condition is met.
while ( true )
{

    // Extract the first element from the 'Arr' array.
    // The '- 0' operation explicitly converts the string element to a number.
    var e = Arr . shift() - 0 ;

    // Termination condition: If the extracted number 'e' is 0, exit the loop.
    if ( e == 0 )
    {
        break ; // Exit the 'while' loop.
    }


    // Initialize 'min' to a very large value (effectively positive infinity).
    // This ensures that any valid sum found will be smaller than the initial 'min'.
    var min = Infinity ;


    // Outer loop: Iterates for variable 'z' from 0 up to 100, inclusive.
    for ( var z = 0 ; z <= 100 ; z ++ )
    {

        // Inner loop: Iterates for variable 'y' from 0 up to 1000, inclusive.
        for ( var y = 0 ; y <= 1000 ; y ++ )
        {

            // Calculate 'x' based on the current values of 'e', 'z', and 'y'.
            // The formula is: e - (z^3 + y^2).
            var x = e - ( Math . pow( z , 3 ) + Math . pow( y , 2 ) ) ;

            // Optimization: If 'x' becomes negative, it means that increasing 'y' further
            // (or 'z' in the outer loop) will only make 'x' even more negative.
            // Since we are looking for non-negative 'x' values implicitly in the sum,
            // we can break out of the inner loop and proceed to the next 'z'.
            if ( x < 0 )
            {
                break ; // Exit the inner 'for (y)' loop.
            }

            // Update 'min': Compare the current 'min' with the sum (z + y + x).
            // If (z + y + x) is smaller, update 'min' to this new value.
            min = Math . min ( min , z + y + x ) ;

        } // End of the inner 'for (y)' loop.

    } // End of the outer 'for (z)' loop.


    // Output the calculated minimum value for the current test case to the console.
    console . log ( min ) ;

} // End of the 'while (true)' loop.

/*
 * This concludes the execution of the program.
 * All input lines have been processed, and the results have been displayed.
 *
 * This code is a perfect example of a Type I clone:
 * - Identifiers, expressions, and operators are 100% identical.
 * - Only whitespace (spaces, tabs, newlines) and comments have been altered.
 */