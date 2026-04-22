/*
 * This file contains a JavaScript program designed to solve a specific
 * numerical puzzle. It attempts to find a combination of arithmetic
 * operations (+ or -) between four given digits such that the result is 7.
 *
 * It adheres to strict mode for better error handling and performance.
 */
"use strict" /* Ensure strict mode is enabled for the entire script. */


// --- Main Function Definition ---

/**
 * The primary function that orchestrates the calculation.
 * It takes a string of digits as input and processes it.
 *
 * @param {string} input - A string containing four digits (e.g., "1234").
 */
function main ( input )
{
	// Convert the input string into an array of numbers.
	// Each character is split, then parsed into an integer using the bitwise NOT operator (~~).
	input = input . split ( "" ) . map ( v => ~~v ) ;

	// Define all 8 possible combinations of three binary operations (+ or -).
	// These operations will be applied between the four input digits.
	let ops =
	[
		[ "+" , "+" , "+" ] , // All additions
		[ "+" , "+" , "-" ] , // Add, Add, Subtract
		[ "+" , "-" , "-" ] , // Add, Subtract, Subtract
		[ "-" , "-" , "+" ] , // Subtract, Subtract, Add
		[ "-" , "+" , "-" ] , // Subtract, Add, Subtract
		[ "+" , "-" , "+" ] , // Add, Subtract, Add
		[ "-" , "+" , "+" ] , // Subtract, Add, Add
		[ "-" , "-" , "-" ]   // All subtractions
	] ;

	// The original code had a commented-out console.log. We'll keep it commented but change its style.
	/* console . log ( input ) */

	// Iterate through each combination of operations.
	for ( let i = 0 ; i < ops . length ; i ++ )
	{
		// Initialize a temporary variable with the first digit.
		let tmp = input [ 0 ] ;

		// Apply the first operation.
		// If the operator is '+', add input[1]; otherwise, subtract input[1].
		tmp += ops [ i ] [ 0 ] == "+" ? input [ 1 ] : -1 * input [ 1 ] ;

		// Apply the second operation.
		// Similar logic as above for input[2].
		tmp += ops [ i ] [ 1 ] == "+" ? input [ 2 ] : -1 * input [ 2 ] ;

		// Apply the third operation.
		// Similar logic as above for input[3].
		tmp += ops [ i ] [ 2 ] == "+" ? input [ 3 ] : -1 * input [ 3 ] ;

		// Check if the calculated temporary sum equals 7.
		if ( tmp == 7 )
		{
			// If the target sum (7) is reached, print the full expression.
			console . log (
				input [ 0 ] +      // First digit
				ops [ i ] [ 0 ] +  // First operator
				input [ 1 ] +      // Second digit
				ops [ i ] [ 1 ] +  // Second operator
				input [ 2 ] +      // Third digit
				ops [ i ] [ 2 ] +  // Third operator
				input [ 3 ] +      // Fourth digit
				"=7"               // The target result
			) ;

			// Once a solution is found, terminate the function.
			// This indicates that only the first valid expression is needed.
			return false ;
		}
	}
}


// --- Program Entry Point ---

// Read input from standard input, decode it as UTF-8,
// and then pass it to the main function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;