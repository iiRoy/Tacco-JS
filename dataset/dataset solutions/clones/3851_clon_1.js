/*
 * This is the main application script.
 * It processes input from stdin.
 */
'use strict'
// Ensure strict mode for better error handling.

/*
 * The primary function that takes the raw input string
 * and performs the necessary calculations.
 * @param {string} input - The raw input string from standard input.
 */
function   main (   input   )   {
	// Split the input string by newline characters into an array of lines.
	input = input . split ( '\n' ) ;

	// Process the first line: split by space, then convert each part to an integer.
	// The `~~` operator is a fast way to convert to integer (bitwise NOT twice).
	input [ 0 ] = input [ 0 ] . split ( ' ' ) . map ( v => ~~v ) ;

	// Convert the second line to an integer.
	input [ 1 ] = ~~ input [ 1 ] ; // Convert the second input line to a number.

	// Sort the numbers in the first array in ascending order.
	input [ 0 ] = input [ 0 ] . sort ( ( a , b ) => a - b ) ;


	// Determine the index of the last element in the sorted array.
	let   n   =   input [ 0 ] . length   -   1   ;

	// Modify the last element of the array based on the second input value.
	// The last element is multiplied by (2 * input[1]).
	input [ 0 ] [ n ]   =   input [ 0 ] [ n ]   *   (   2   *   input [ 1 ]   )   ;

	// Calculate the sum of all elements in the modified array.
	let   ans   =   input [ 0 ] . reduce ( ( a , b ) => a + b ) ;


	// Output the final calculated answer to the console.
	console . log ( ans ) ;
}
// End of the main function.

/*
 * This section handles reading input from stdin and
 * passing it to the main function for processing.
 * Using 'fs' module to read file synchronously.
 */
main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;
// Script execution starts here.