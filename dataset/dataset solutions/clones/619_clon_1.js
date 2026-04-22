/*
 * This JavaScript program processes a series of arithmetic operations
 * based on input read from standard input (/dev/stdin).
 * It calculates a running total 'x' by applying operations
 * (addition, subtraction, multiplication, division) and operands
 * provided in an alternating sequence.
 *
 * The calculation process terminates when an '=' operator is encountered.
 * After each operation, the intermediate result is rounded to the nearest integer.
 */


// Import the 'fs' (file system) module, which is a core Node.js module,
// to enable synchronous file reading operations.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// The raw input string is first cleaned by removing any leading or trailing
// whitespace characters using the 'trim()' method.
// Subsequently, it is split into an array of strings, where each element
// represents a line from the input, using the newline character as a delimiter.
var arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize the primary accumulator variable 'x'.
// The very first element of the 'arr' array (at index 0) is expected to be
// the initial numeric value. The '-0' is a concise JavaScript idiom to
// explicitly coerce a string value into a number type.
var x = arr [ 0 ] - 0 ;


// Commence the main processing loop. This loop iterates through the 'arr' array,
// starting from the second element (index 1), as the first element was already
// used for initialization. The loop increment 'i = i + 2' ensures that it
// processes an operator and its corresponding operand in each iteration.
for ( var i = 1 ; i < arr . length ; i = i + 2 )
{
    // Check if the current element, which is expected to be an operator,
    // is an equality sign. If it is, this signifies the end of the input
    // sequence for operations, and the loop is terminated.
    if ( arr [ i ] == "=" ) break ; // Exit the loop if the termination operator is found.

    // If the operator is a plus sign, perform an addition operation.
    // The operand is the subsequent element in the array (arr[i+1]),
    // which is also explicitly converted to a number.
    if ( arr [ i ] == "+" ) x += ( arr [ i + 1 ] - 0 ) ; // Add the operand to 'x'.

    // If the operator is a minus sign, perform a subtraction operation.
    // The operand (arr[i+1]) is subtracted from 'x'.
    if ( arr [ i ] == "-" ) x -= ( arr [ i + 1 ] - 0 ) ; // Subtract the operand from 'x'.

    // If the operator is an asterisk, perform a multiplication operation.
    // 'x' is multiplied by the operand (arr[i+1]).
    if ( arr [ i ] == "*" ) x *= ( arr [ i + 1 ] - 0 ) ; // Multiply 'x' by the operand.

    // If the operator is a forward slash, perform a division operation.
    // 'x' is divided by the operand (arr[i+1]).
    if ( arr [ i ] == "/" ) x /= ( arr [ i + 1 ] - 0 ) ; // Divide 'x' by the operand.

    /*
     * After each arithmetic operation, the current value of 'x' is rounded
     * to the nearest whole number. The 'toFixed(0)' method converts the number
     * into a string representation with zero decimal places.
     * The subsequent '-0' trick then converts this string back into a numeric type,
     * effectively rounding the number.
     */
    x = x . toFixed ( 0 ) - 0 ;
}


// Finally, after all operations have been processed (or the termination
// operator was encountered), the final computed value of 'x' is printed
// to the standard console output.
console . log ( x ) ;