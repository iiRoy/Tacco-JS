/*
 * This JavaScript program reads a number from standard input,
 * then performs a financial calculation over a period
 * specified by that input number.
 * It simulates an amount growing with interest, rounded up.
 */

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire content from /dev/stdin as a UTF-8 string

// Convert the string input into a numerical value.
// Subtracting zero is a common trick for type coercion to number.
input = input - 0 ;


// Initialize the principal amount 'm'.
// This variable will hold the value that is iteratively calculated.
var m = 100000 ;


// Start a loop that runs for 'input' number of iterations.
// Each iteration represents a single period (e.g., a year) for the calculation.
for ( var i = 0 ; i < input ; i ++ ) {

  // Apply an annual interest rate of 5%.
  // The amount 'm' is multiplied by 1.05 (100% + 5%).
  m = m * 1.05 ;

  // Round the amount 'm' up to the nearest thousand.
  // First, divide by 1000, then use Math.ceil to round up to the nearest integer,
  // and finally multiply by 1000 to get the value rounded up to the nearest thousand.
  m = Math . ceil ( m / 1000 ) * 1000 ;

} // End of the for loop


// Output the final calculated value of 'm' to the console.
// This will be the result after all iterations and rounding.
console . log ( m ) ;