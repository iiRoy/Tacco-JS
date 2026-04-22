/*
 * This JavaScript program reads an integer from standard input,
 * performs a specific calculation based on the input value,
 * and then prints the result to the console.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */


// Declare a variable 'inp' to store the input string.
var inp = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Parse the input string into an integer.
// The resulting integer value is stored in the variable 'x'.
var x = parseInt ( inp ) ;


// Initialize the 'ans' variable.
// This part calculates the contribution from full 500-unit segments.
// It determines how many times 500 fits into 'x', then multiplies that count by 1000.
var ans = Math . floor ( x / 500 ) * 1000 ;


// Add to 'ans' the contribution from the remainder.
// First, calculate the remainder when 'x' is divided by 500 (x % 500).
// Then, determine how many full 5-unit segments are in this remainder.
// Finally, multiply that count by 5 and add it to the existing 'ans'.
ans += Math . floor ( ( x % 500 ) / 5 ) * 5 ;


// Output the final calculated answer to the standard output.
console . log ( ans ) ;

// End of the JavaScript program.