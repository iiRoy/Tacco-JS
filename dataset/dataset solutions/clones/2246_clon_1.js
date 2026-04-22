/*
 * This JavaScript file defines a main function that processes
 * a single character input to find the next character in the
 * English alphabet. It reads input from standard input.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Define the primary function for processing the input.
function	main	(	input	)
{
	// Declare a variable 'c' to store the processed input character.
	// The .trim() method removes leading/trailing whitespace.
	var	c	=	input	.	trim	(	)	;

	// Initialize an array 'alphabet' containing all lowercase English letters.
	// This array serves as our reference for character lookup.
	var	alphabet	=
		[
			'a'	,	'b'	,	'c'	,	'd'	,	'e'	,	'f'	,	'g'	,
			'h'	,	'i'	,	'j'	,	'k'	,	'l'	,	'm'	,	'n'	,
			'o'	,	'p'	,	'q'	,	'r'	,	's'	,	't'	'u'	,
			'v'	,	'w'	,	'x'	,	'y'	,	'z'
		]	; /* End of alphabet array definition */

	// Find the index of the input character 'c' within the 'alphabet' array.
	// If 'c' is not found, indexOf returns -1.
	var	result	=	alphabet	.	indexOf	(	c	)	;

	// Output the character that immediately follows the input character
	// in the alphabet. We access the array element at (result + 1) index.
	console	.	log	(	alphabet	[	result	+	1	]	)	;

} // End of main function definition


// This section handles reading input from standard input and calling the main function.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin'.
// The input is read as 'utf8' encoded text.
main	(	require	(	'fs'	)	.	readFileSync	(	'/dev/stdin'	,	'utf8'	)	)	;

/*
 * End of the script.
 * This program expects a single lowercase English letter as input.
 */