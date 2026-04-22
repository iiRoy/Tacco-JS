/*
 * This is a JavaScript program example.
 * It's designed to process a specific type of input.
 * The main logic resides within the 'Main' function.
 */

function   Main  (  input  )
{
	// The input string is first split by spaces.
	// This creates an array of strings.
	input   =   input .   split  (  " "  )   ;


	/*
	 *  Next, we need to process the fourth element of the input array (index 3).
	 *  It's expected to be a string representing a number,
	 *  and we want to get its individual digits as numbers.
	 */
	input [   3   ]    =    input [   3   ]   .   split  (  ""  )   .   map  (  Number  )   ;


	// From the array of digits, we are only interested in the last digit.
	input [   3   ]    =    input [   3   ]   [   input [   3   ]   .   length   -   1   ]   ;


	// Finally, we perform a conditional calculation based on the last digit's parity.
	// The result of this calculation is then printed to the console.
	console   .   log  (
		input [   3   ]   %   2   ==   1
		?   // If the last digit is odd (remainder when divided by 2 is 1)
		input [   1   ]   -   input [   0   ]
		:   // Otherwise (if the last digit is even)
		input [   0   ]   -   input [   1   ]
	)   ; // End of the console output statement.
}

// The 'Main' function is immediately invoked with input read from standard input.
// This handles reading the entire file content, decoding it as UTF-8, and trimming whitespace.
Main  (
	require  (  "fs"  )   .   readFileSync  (
		"/dev/stdin"  ,
		"utf8"
	)   .   trim  (  )
)   ;

// End of the JavaScript program.