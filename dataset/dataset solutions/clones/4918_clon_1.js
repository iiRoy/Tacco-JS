/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered to create a visually distinct but functionally identical clone.
 */

// Define the main function that processes the input.
function Main(  input  ) {
	// The input is expected to be a string, split it by newline characters.
	// This creates an array where each element is a line from the input.
	input = input . split ( "\n" ) ;


	// The first line of the input is assigned to the constant 'S'.
	const S = input[0] ;

	// Initialize a variable 'score' to keep track of the current score.
	var score = 0 ;

	// Begin a loop that iterates through each character of the string 'S'.
	for ( var i = 0 ; i < S . length ; i ++ ) {
		// Check if the current character is exactly "p".
		if ( S[i] === "p" ) {
			// If it is "p", decrement the score by one.
			score -- ;
		}
	}

	// Calculate the final result:
	// Take the length of the string 'S', divide it by 2, and round down (floor).
	// Then, add the accumulated 'score' to this value.
	// Finally, print the result to the console.
	console . log ( Math . floor ( S . length / 2 ) + score ) ;

} // End of the Main function definition.


// *****************************************************************************
// * DO NOT EDIT THE LINES BELOW THIS POINT.                                 *
// * These lines handle reading input from standard input and calling Main.  *
// *****************************************************************************

// Original comment:
// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）

// Read all input from standard input (usually /dev/stdin in competitive programming environments)
// as a UTF-8 encoded string.
// Then, pass this entire string to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of file.
// This script processes a given input string based on specific character occurrences.