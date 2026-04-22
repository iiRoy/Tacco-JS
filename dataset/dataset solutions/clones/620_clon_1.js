/* This JavaScript code snippet is designed to read numerical and operational input
 * from standard input, perform a series of calculations, and then output
 * the final integer result. It acts as a simple arithmetic calculator.
 *
 * This version includes extensive whitespace and comments to demonstrate
 * a Type I code clone, maintaining functional equivalence.
 */

    // Import the Node.js 'fs' (File System) module to handle file operations.
    // Specifically, 'readFileSync' is used to get content from '/dev/stdin'.
    var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

    // Prepare the input: first, remove any leading or trailing whitespace from the raw input string,
    // then split the string into an array of substrings using the newline character as a delimiter.
    var Arr = ( input . trim () ) . split ( "\n" ) ;

    // Initialize the primary calculation variable 'x'.
    // It takes the very first element of the 'Arr' array and converts it to a number
    // by subtracting zero. This element is expected to be the initial numeric value.
    var x = Arr [ 0 ] - 0 ;

    // Begin a loop to iterate through the operations and subsequent numbers.
    // The loop starts from the second element (index 1), as the first element was the initial value.
    // It steps by 2 because each operation consists of an operator followed by an operand.
    // The loop continues until it reaches the second-to-last element, as the last element might not have a pair.
    for ( var i = 1 ; i < arr . length - 1 ; i = i + 2 ) {

        // Check if the current element (which should be an operator) is an addition sign.
        if ( arr [ i ] == "+" )
            // If it is, add the next element (operand) to 'x'.
            // The operand is also converted to a number by subtracting zero.
            x += arr [ i + 1 ] - 0 ;

        // Check for the subtraction operator.
        if ( arr [ i ] == "-" )
            // If found, subtract the next operand from 'x'.
            x -= arr [ i + 1 ] - 0 ;

        // Check for the multiplication operator.
        if ( arr [ i ] == "*" )
            // If found, multiply 'x' by the next operand.
            x *= arr [ i + 1 ] - 0 ;

        // Check for the division operator.
        if ( arr [ i ] == "/" )
            // If found, divide 'x' by the next operand.
            x /= arr [ i + 1 ] - 0 ;

        // After each arithmetic operation, ensure 'x' is rounded to an integer.
        // The toFixed(0) method converts the number to a string with 0 decimal places,
        // so it implicitly converts back to a number in the next assignment.
        x = x . toFixed ( 0 ) ;

    } // End of the arithmetic processing loop.


    // Output the final calculated value of 'x' to the console (standard output).
    console . log ( x ) ;