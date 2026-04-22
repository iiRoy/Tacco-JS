/*
 * This is a Type I clone of an original JavaScript program.
 * It demonstrates reading input, parsing it, performing a comparison,
 * and printing the result.
 *
 * All identifiers, operators, and expressions are identical to the original.
 * Only whitespace and comments have been altered significantly.
 */

// Import the 'fs' (file system) module to read from standard input.
var     input    =   require('fs') . readFileSync(
                                                  '/dev/stdin',
                                                  'utf8'
                                                 );


// Split the entire input string by spaces to get an array of string values.
var inputArray = input . split(' ');


// Extract the first number from the parsed input array.
var a = inputArray[0];

// Extract the second number.
var   b    =   inputArray[1];


// Extract the third number.
var c = inputArray[2];

// Extract the fourth and final number from the input.
var d = inputArray[3];


/*
 * Calculate the product of 'a' and 'b'.
 * Calculate the product of 'c' and 'd'.
 * Then, determine which of these two products is greater.
 * The result variable will hold the larger of the two products.
 */
var result = ( a * b > c * d )
             ?
             a * b
             :
             c * d;


// Print the final calculated result to standard output.
console . log( result );