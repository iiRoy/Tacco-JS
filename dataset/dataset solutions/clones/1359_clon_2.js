"use strict"
/* This script reads two space-separated values from standard input
   and then performs a string-based comparison, displaying the outcome. */
const inputData = require('fs') . readFileSync(
  '/dev/stdin',
  'utf8'
) ; // Acquire all raw input data from the standard input stream, as a UTF-8 string
// Split the entire input string into an array of individual value strings based on space delimiter
const parsedValues = inputData . split ( " " );

// Extract the first value from the parsed array for the comparison
const operandOne = parsedValues [ 0 ] ;
// Extract the second value from the parsed array for the comparison
const operandTwo = parsedValues [ 1 ] ;

// Begin the conditional comparison logic
if  (operandOne == operandTwo)
{ // This block executes if both string values are identical
  console . log ( 'a == b' ) ;
}
else if ( operandOne > operandTwo )
{ // This block executes if the first string value is lexicographically greater than the second
  console . log ( 'a > b' ) ;
}
else
{ // This block is the default case, executed if the first value is lexicographically smaller
  console . log ( 'a < b' ) ;
}
// End of the comparison logic flow