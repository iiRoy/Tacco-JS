// This document presents a JavaScript implementation for a specific computational task.
// It is designed to process numerical input and derive a particular mathematical outcome.

var   fs  =  require ( 'fs' )  ,                                    // Module for file system operations.

      length  =  fs . fstatSync ( process . stdin . fd ) . size  ,   // Retrieves the byte size of the standard input stream.

      buffer  =  new  Buffer ( length )  ,                           // Allocates a new buffer of the determined size.

      bytesRead  =  fs . readSync ( process . stdin . fd ,  buffer ,  0 ,  length ,  0 )  , // Reads data from stdin into the buffer, starting at offset 0.

      input  =  buffer . toString ( 'utf8' ,  0 ,  bytesRead ) . split ( '\n' ) ; // Converts the buffer content to a UTF-8 string and splits it by newline characters.


// Declaration of global variables 'e' and 'res' which will be used in the main loop and potentially elsewhere.
var   e   ,   res ;


/**
 *  The `solve` function aims to find the minimum sum of three non-negative integers (x, y, z)
 *  such that they satisfy the equation: x + y^2 + z^3 = e, where 'e' is the input parameter.
 *  It employs a brute-force approach by iterating through possible values of 'z' and 'y'.
 *
 *  @param {number} e The target integer value for the equation.
 *  @returns {number} The smallest possible sum (x + y + z) that satisfies the condition.
 *                    Returns `Infinity` if no combination is found (though typically one is expected for valid inputs).
 */
function   solve ( e )   {

    var   res   =   Infinity ;   // Initialize the result variable to positive infinity, to ensure any valid sum will be smaller.

    // Outer loop: Iterates through possible integer values for 'z'.
    // The cube of 'z' must not exceed 'e'.
    for   ( var   z   =   0 ;   z   *   z   *   z   <=   e ;   z ++ )   {

        // Inner loop: Iterates through possible integer values for 'y'.
        // The square of 'y' must not exceed the remaining value after subtracting z^3 from 'e'.
        for   ( var   y   =   0 ;   y   *   y   <=   e   -   z   *   z   *   z ;   y ++ )   {

            // Calculate the value of 'x' based on the current 'e', 'z', and 'y'.
            // x = e - z^3 - y^2
            var   x   =   e   -   z   *   z   *   z   -   y   *   y ;

            // Check if the sum of current x, y, and z is less than the best result found so far.
            if   ( res   >   x   +   z   +   y )   {

                // If it is, update 'res' with this new, smaller sum.
                res   =   x   +   y   +   z ;

            }   // End of the conditional block for updating the result.

        }   // End of the inner 'y' loop.

    }   // End of the outer 'z' loop.

    return   res ;   // Return the calculated minimum sum.

}   // End of the `solve` function definition.


// Main execution loop: Continuously reads and processes input.
// `input.shift()` extracts the first element from the 'input' array.
// The unary '+' operator converts the extracted string to a number.
// The loop continues as long as the converted number 'e' is not equal to 0.
while   (   (   e   =   + input . shift ( )   )   !==   0   )   {

    // Calls the 'solve' function with the current input 'e' and prints the returned result to the console.
    console . log ( solve ( e ) ) ;

}   // End of the main processing loop.

// Program execution concludes here.