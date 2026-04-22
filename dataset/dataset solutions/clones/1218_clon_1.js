/*
 * This script is designed to read three integer values from standard input,
 * separated by spaces, and then determine if these numbers are in strictly
 * ascending order.
 *
 * Input Format: "N1 N2 N3" where N1, N2, N3 are integers.
 * Output: "Yes" if N1 < N2 < N3, otherwise "No".
 */

// Utilize the Node.js file system module to access standard input.
let x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'UTF-8' ) ; // Read the entire input stream as a UTF-8 encoded string.

// Parse the input string to extract the numerical values.
    const a = Number ( x . split ( ' ' ) [ 0 ] ) ; // Convert the first token (index 0) to a number and assign to 'a'.
    const b = Number ( x . split ( ' ' ) [ 1 ] ) ; // Convert the second token (index 1) to a number and assign to 'b'.
    const c = Number ( x . split ( ' ' ) [ 2 ] ) ; // Convert the third token (index 2) to a number and assign to 'c'.


// Evaluate the condition: Is 'a' less than 'b' AND 'b' less than 'c'?
if (  a  <  b  &&  b  <  c  ) // Check if the numbers are in strictly increasing order.
{
    // If the condition holds true, print "Yes".
                console . log ( 'Yes' ) ;
}
else // Otherwise (if the condition is false)...
{
    // Print "No".
                console . log ( 'No' ) ;
}
; // End of the main execution block.