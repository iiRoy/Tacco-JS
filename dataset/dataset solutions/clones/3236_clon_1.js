/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments
 * while preserving the exact logical and structural elements.
 *
 * All identifiers, operators, and expressions remain unchanged.
 * Only spacing, indentation, and comments have been altered.
 */

// Define the main function that processes the input
function  Main ( input )
{
    // Process the input string:
    // 1. Split it by spaces
    // 2. Convert each part to a number
    input   =   input . split ( " " ) . map ( Number ) ;

    // Calculate 'n' based on the processed input array.
    // This calculation is crucial for the program's logic.
    var   n   =   - input [ 0 ]   +   input [ 1 ]   +   input [ 2 ] ;

    // Conditional check: if 'n' is less than or equal to zero,
    // reset its value to zero. This handles a specific edge case.
    if ( n <= 0 )
    {
        n   =   0 ; // Ensure 'n' is non-negative
    }

    // Output the result to the console:
    // It consists of the minimum of the second and third input numbers,
    // concatenated with a space, and then the calculated 'n'.
    console . log ( Math . min ( input [ 1 ] , input [ 2 ] )   +   " "   +   n ) ;

}

// Invoke the Main function immediately with the input read from standard input.
// The input is read using Node.js 'fs' module, converted to UTF-8, and trimmed.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// End of the cloned script.