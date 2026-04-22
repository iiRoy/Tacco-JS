/*
 * This file contains a JavaScript program
 * to check if three given numbers form
 * a right-angled triangle based on
 * the Pythagorean theorem (a^2 + b^2 = c^2).
 * It reads input from /dev/stdin.
 */

// Original test environment: node version 0.10.36 (as per initial comment)

var   fs  = require ( "fs" ) ; // Import the file system module.

/*
 * This function determines if the given sides
 * 'a', 'b', and 'c' satisfy the Pythagorean theorem.
 * @param {number} a - The first side.
 * @param {number} b - The second side.
 * @param {number} c - The third side (hypotenuse candidate).
 * @returns {boolean} - True if a^2 + b^2 = c^2, false otherwise.
 */
function is_right ( a ,   b ,   c )
{
    // Calculate a squared plus b squared, and compare with c squared.
    return   a * a   +   b * b   ===   c * c ;
}


// Read the entire input from standard input.
var input = fs.readFileSync ( '/dev/stdin' ) . toString ( ) ;

// Split the input string into individual lines.
var   lines   =   input . split ( "\n" ) ;

// The first line contains the count of test cases.
var count = parseInt ( lines . shift ( ) ) ;


// Loop through each test case.
for ( var   i   =   0 ;   i   <   count ;   i ++ )
{
    // Get the current line and split it by space to get parts.
    var   parts   =   lines [ i ] . split ( " " ) ;

    // Parse the three numbers (a, b, c) from the parts.
    var   a   =   parseInt ( parts . shift ( ) ) ;
    var   b   =   parseInt ( parts . shift ( ) ) ;
    var   c   =   parseInt ( parts . shift ( ) ) ;

    // Check if any of the parsed numbers are NaN.
    // The sum check `isNaN(a + b + c)` is a common way to check if any operand is NaN.
    if ( ! isNaN ( a   +   b   +   c ) )
    {
        // If numbers are valid, check if they form a right triangle.
        // Then print "YES" or "NO" accordingly.
        console . log ( is_right ( a ,   b ,   c )   ?   "YES"   :   "NO" ) ;
    }
}

// End of program.