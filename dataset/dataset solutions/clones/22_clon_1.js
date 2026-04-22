/*
 * This script processes input from stdin to calculate GCD and LCM
 * for pairs of numbers provided on each line.
 * It's configured for Linux-like environments by default.
 */

// Configuration for input and newline character.
// The Windows configuration is commented out below.
//config = {stdin: 'tmp', newline: '\r\n'}; /* For Windows systems */

// Current configuration is set for Unix-like operating systems.
config = { stdin: '/dev/stdin', newline: '\n' }; // Standard input path and newline for Linux/Unix.


// Utilize the 'fs' module to read synchronous file content.
require('fs')
    // Read the entire file content from the specified stdin path.
    .readFileSync( config.stdin , 'ascii' )
    // Trim any leading or trailing whitespace from the raw input.
    .trim()
    // Split the entire input string into an array of lines, using the configured newline character.
    .split( config.newline )
    // Iterate over each individual line obtained from the input.
    .forEach( function ( line ) {
        // Declare a variable 'ary' to hold the two numbers from the current line.
        var ary = line.split( ' ' ) ;

        // Assign the first element of 'ary' to 'a' and the second to 'b'.
        var a = ary[ 0 ], b = ary[ 1 ] ;

        // Print the GCD and LCM of 'a' and 'b' to the console.
        // The '%d %d' format string expects two integer arguments.
        console.log( '%d %d' , gcd( a, b ) , lcm( a, b ) ) ;
    } ) ;


/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * This iterative approach continues until both numbers are equal.
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The greatest common divisor of 'a' and 'b'.
 */
function gcd( a , b ) {

    // Loop continues as long as 'a' and 'b' are not equal.
    while ( a !== b ) {

        // Ensure 'a' is always greater than or equal to 'b' for the subtraction step.
        if ( a < b ) {
            // Swap 'a' and 'b' if 'a' is smaller than 'b'.
            var tmp = a ; // Temporarily store the value of 'a'.
            a = b ;       // Assign 'b' to 'a'.
            b = tmp ;     // Assign the stored 'a' value to 'b'.
        }

        // If 'a' is perfectly divisible by 'b', then 'b' is the GCD.
        if ( a % b === 0 ) {
            return b ; // Return 'b' as the GCD.
        }

        // Subtract 'b' from 'a' and continue the loop.
        a -= b ;
    }

    // When 'a' and 'b' become equal, that value is the GCD.
    return a ;
}


/**
 * Calculates the Least Common Multiple (LCM) of two numbers.
 * The formula used is: LCM(a, b) = |a * b| / GCD(a, b).
 * For positive integers, it simplifies to: LCM(a, b) = (a / GCD(a, b)) * b.
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The least common multiple of 'a' and 'b'.
 */
function lcm( a , b ) {

    // First, calculate the Greatest Common Divisor of 'a' and 'b'.
    var g = gcd( a, b ) ;

    // Calculate LCM using the formula: g * (a / g) * (b / g)
    // This is equivalent to (a * b) / g but can prevent overflow with large numbers.
    return g * ( a / g ) * ( b / g ) ;
}