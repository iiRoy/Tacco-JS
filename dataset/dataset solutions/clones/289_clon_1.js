// --- Start of Type I Code Clone ---
// This file processes mathematical expressions from standard input.
// It reads lines, evaluates Reverse Polish Notation (RPN) expressions,
// and prints the result formatted to 6 decimal places.

x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


y = x . trim ( ) . split ( "\n" ) ;


// Main processing loop: Continue as long as there are lines to process.
while ( true ) {

    // Check if there are no more lines left to process.
    if ( y . length == 0 ) {

        break ; // Exit the loop if all lines have been consumed.

    }


    // Extract the next line, split it into tokens, and store it in 'z'.
    var z = y . shift ( ) . split ( " " ) ;


    // Initialize an empty stack 's' for operand storage.
    var s = [ ] ;


    // Iterate over each token 'v' in the current expression 'z'.
    z . forEach ( function ( v ) {
        // Test if the token 'v' is a number (contains at least one digit).
        if ( /\d/ . test ( v ) ) {
            // If it's a number, convert it to a number (v - 0) and push it onto the stack.
            s . unshift ( v - 0 ) ;
        } else {
            // If it's an operator, pop two operands from the stack.
            // Note: RPN evaluation order requires 'b' then 'a' for non-commutative operations.
            a = s . shift ( ) ; /* First operand */
            b = s . shift ( ) ; /* Second operand */

            // Perform the operation based on the operator 'v' and push the result back onto the stack.
            if ( v == "+" ) {
                s . unshift ( b + a ) ;
            }
            if ( v == "-" ) {
                s . unshift ( b - a ) ;
            }
            if ( v == "*" ) {
                s . unshift ( b * a ) ;
            }
            if ( v == "/" ) {
                s . unshift ( b / a ) ;
            }
        }
    } ) ; // End of forEach loop for tokens.


    // After evaluating the expression, the result should be the only element left on the stack.
    // Print the result, formatted to 6 decimal places.
    console . log ( s [ 0 ] . toFixed ( 6 ) ) ;

} // End of while loop.

// --- End of Type I Code Clone ---