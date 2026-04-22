/*
 * This JavaScript file processes input from standard input
 * to determine a specific condition based on four numbers.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'fs' (file system) module to read from standard input.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );

// Process the input string:
// 1. Trim any leading/trailing whitespace.
// 2. Split the string by spaces into an array of strings.
// 3. Map each string in the array to its Number representation.
// 4. Use array destructuring to assign the first four numbers to variables a, b, c, and d.
var [a, b, c, d] = input.trim() . split ( " " ) . map ( Number ) ;

// Check a specific condition involving variables 'a' and 'b'.
// The condition is true if:
// 1. The product of 'a' and 'b' is odd ( (a*b)%2 != 0 ).
// AND
// 2. The sum of 'a' and 'b' is odd ( (a+b)%2 != 0 ).
if ( ( ( a * b ) % 2 != 0 ) && ( ( a + b ) % 2 != 0 ) ) {
    // If both conditions are met, print "No" to the console.
    console . log ( "No" ) ;
}
else {
    // Otherwise (if at least one condition is false), print "Yes" to the console.
    console . log ( "Yes" ) ;
}

// End of script.