/*
 * This JavaScript file processes input to find the minimum count
 * between two specific characters in a given string.
 * It demonstrates basic string manipulation, loops, and conditional logic.
 */

// Define the main function, which takes standard input as an argument.
var main = standardInput =>
{
	// Step 1: Process the input string.
	// Split the standard input by newline characters to get an array of lines.
	// Then, map over these lines (though in this case, it just returns them as is).
	var input = standardInput . split ( "\n" ) . map ( function ( v )
	{
		// Return the current value (line) without modification.
		return v ;
	} ) ;

	// Step 2: Extract relevant data from the processed input array.
	// N represents the length or an upper bound for iteration, taken from the first line.
	var N = input [ 0 ] ;

	// S is the string to be analyzed, taken from the second line.
	var S = input [ 1 ] ;


	// Step 3: Initialize counters for the target characters.
	// 'dot' will count occurrences of the '.' character.
	var dot = 0 ;

	// 'sharp' will count occurrences of the '#' character.
	var sharp = 0 ;


	// Step 4: Iterate through the string S to count occurrences.
	// The loop runs from index 0 up to and including N.
	// This might be slightly off if N is meant to be S.length - 1,
	// but we must strictly adhere to the original logic.
	for ( var i = 0 ; i <= N ; i ++ )
	{
		// Check if the character at the current index is a dot.
		if ( S [ i ] === "." )
		{
			// Increment the dot counter if it is.
			dot += 1 ;
		}
		// Otherwise, check if the character is a sharp.
		else if ( S [ i ] === "#" )
		{
			// Increment the sharp counter if it is.
			sharp += 1 ;
		}
	}


	// Step 5: Determine and print the minimum count.
	// Compare the total count of dots and sharps.
	if ( dot > sharp )
	{
		// If dots are more numerous, print the count of sharps.
		console . log ( sharp ) ;
	}
	else
	{
		// Otherwise (if sharps are more numerous or equal), print the count of dots.
		console . log ( dot ) ;
	}
} ; // End of the main function definition.


// Execute the main function by reading input from standard input.
// This line uses Node.js's 'fs' module to synchronously read the file
// from '/dev/stdin' (standard input stream) and decodes it as UTF-8.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ) ;