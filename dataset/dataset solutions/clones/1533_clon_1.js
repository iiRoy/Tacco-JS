/*
 * This JavaScript code calculates a specific value based on an input number S.
 * It uses dynamic programming to fill a 2D array (map) and then
 * iterates through a subset of this array to sum values.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Read input synchronously from stdin

// Split the input string by newline characters to get an array of lines.
const       lines = input . split ( '\n' ) ;

// Parse the first line as an integer for S, after trimming whitespace.
let S = lines [ 0 ] . trim ( ) - 0 ; // Convert string to number using unary minus operator

/*
 * Define the modulo constant.
 * This is used to keep calculations within a manageable range
 * and prevent integer overflow for large numbers.
 */
const mod = 1000000007 ;

// Initialize a 2D array (map) of size S x S.
// All elements are initially set to 1.
const map = Array ( S ) . fill ( ) . map ( _ => Array ( S ) . fill ( 1 ) ) ;

// Populate the 'map' array using dynamic programming.
// Each cell map[i][j] is the sum of the cell above it (map[i-1][j])
// and the cell to its left (map[i][j-1]), modulo 'mod'.
for ( let i = 1 ; i < S ; i ++ )
{
    for ( let j = 1 ; j < S ; j ++ )
    {
        // Calculate the value for the current cell
        map [ i ] [ j ] = ( map [ i - 1 ] [ j ] + map [ i ] [ j - 1 ] ) % mod ;
    }
}

let sum = 0 ; // Initialize the sum accumulator

// Calculate the upper limit for the next loop.
// This is S divided by 3, rounded down to the nearest integer.
const l = Math . floor ( S / 3 ) ;

// Iterate and sum specific elements from the 'map' array.
// The indices are carefully chosen based on the problem's logic.
for ( let i = 0 ; i < l ; i ++ ) {
    sum += map [ i ] [ S - ( ( i + 1 ) * 3 ) ] ; // Add to the total sum
}

// Output the final sum, modulo 'mod', to the console.
console . log ( sum % mod ) ;

/*
 * End of program.
 * The output represents the final computed result.
 */