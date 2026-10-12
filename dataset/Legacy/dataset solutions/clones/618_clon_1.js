/*
 * This JavaScript program reads input from stdin,
 * processes a series of arithmetic operations,
 * and then prints the final result to the console.
 *
 * It's designed to handle basic arithmetic operations:
 * addition, subtraction, multiplication, and division.
 * The input format expects an initial number,
 * followed by alternating operators and numbers.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// --- Data Preparation Section ---

// Read the entire input, trim any leading/trailing whitespace,
// and then split it into an array of strings based on newline characters.
var arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize the accumulator variable 'x' with the first number from the input array.
// The '-0' trick converts the string to a number.
var x = arr [ 0 ] - 0 ; // The initial value for our calculation.


/*
 * Iterate through the 'arr' array, starting from the second element (index 1).
 * We process elements in pairs: an operator and an operand.
 * Hence, the loop increment is 'i = i + 2'.
 */
for ( var i = 1 ; i < arr . length ; i = i + 2 )
{
    // Check for the termination condition: if the operator is "=", stop processing.
    if ( arr [ i ] == "=" )
        break ; // Exit the loop if the equality sign is encountered.

    // Perform addition if the operator is "+".
    // Convert the next element (operand) to a number using '-0'.
    if ( arr [ i ] == "+" )
        x += ( arr [ i + 1 ] - 0 ) ;

    // Perform subtraction if the operator is "-".
    if ( arr [ i ] == "-" )
        x -= ( arr [ i + 1 ] - 0 ) ;

    // Perform multiplication if the operator is "*".
    if ( arr [ i ] == "*" )
        x *= ( arr [ i + 1 ] - 0 ) ;

    // Perform division if the operator is "/".
    // Note: Division by zero is not explicitly handled here.
    if ( arr [ i ] == "/" )
        x /= ( arr [ i + 1 ] - 0 ) ;

    // After each operation, ensure 'x' is an integer by converting it
    // to a fixed-point number with 0 decimal places and then back to a number.
    x = x . toFixed ( 0 ) - 0 ;
}

// Finally, print the computed value of 'x' to the standard output.
console . log ( x ) ;

// This closing parenthesis seems to be an error in the original code,
// as there's no opening parenthesis for it in this snippet.
// It is kept identical as per Type I cloning definition.
} );