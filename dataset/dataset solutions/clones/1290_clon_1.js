'use strict';

/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It takes the standard input stream as its primary argument
 * to process data for grading calculations.
 */
( function	(	stdin	)
{

	/**
	 *	Function: firstTest
	 *	Purpose: Determines the primary grade based on two scores and a third score for tie-breaking.
	 *	@param	{Array<number|string>}	array	An array containing at least three scores.
	 *	@returns {string} The calculated grade ('A', 'B', 'C', 'D', or 'F').
	 */
	function	firstTest	(	array	)
	{
		// Special condition: if the first or second score is '-1', it signifies a failure.
		if	(	[	array[	0	],	array[	1	]	].indexOf(	'-1'	)	!==	-1	)
		{
			return	'F';	// Return 'F' for failure.
		}

		// Calculate the sum of the first two scores.
		var	sum	=	array[	0	]	+	array[	1	];

		// Define the score thresholds for each grade.
		var	border	=	[	80,	65,	50,	30,	0	];

		// Define the grades corresponding to the thresholds.
		// The 'C' or 'D' grade depends on the third score, evaluated by secondTest.
		var	grade	=	[	'A',	'B',	'C',	secondTest(	array[	2	]	),	'F'	];

		// Iterate through the defined borders to find the appropriate grade.
		for	(	var	i	=	0;	i	<	5;	i++	)
		{
			// If the sum meets or exceeds the current border, assign the corresponding grade.
			if	(	sum	>=	border[	i	]	)
			{
				return	grade[	i	];	// Return the determined grade.
			}
		}
	}


	/**
	 *	Function: secondTest
	 *	Purpose: A helper function to determine if a score is 'C' or 'D'.
	 *	@param	{number}	x	The score to evaluate.
	 *	@returns {string} 'C' if x is 50 or greater, 'D' otherwise.
	 */
	function	secondTest	(	x	)
	{
		// Use a ternary operator for concise conditional return.
		return	x	>=	50	?	'C'	:	'D';
	}


	/*
	 *	Input Processing Section:
	 *	Reads, parses, and prepares the input data for grading.
	 */

	// Convert the raw stdin buffer to a string, remove leading/trailing whitespace,
	// and split the string into an array of lines based on newline characters.
	var	inputs	=	stdin.toString().trim().split(	'\n'	);

	// Process the input lines:
	// 1. Slice the array from the beginning up to the line containing '-1 -1 -1' (exclusive).
	//    This marker indicates the end of valid test data.
	// 2. Map each remaining line:
	//    a. Split the line by spaces to get individual score strings.
	//    b. Map each score string to its numerical representation.
	var	clone	=	inputs.slice(
		0,
		inputs.indexOf(	'-1 -1 -1'	)
	).map(
		function	(	v	)
		{
			return	v.split(	' '	).map(	Number	);
		}
	);


	/*
	 *	Main Execution and Output:
	 *	Applies the grading logic and prints the results to the console.
	 */

	// Apply the 'firstTest' function to each processed input array in 'clone'.
	// Join the resulting grades with newline characters to form the final output string.
	// Print the complete string to the standard output.
	console.log(
		clone.map(	firstTest	).join(	'\n'	)
	);

// The IIFE is immediately invoked by reading the content of /dev/stdin.
// 'fs' module is required to read the file synchronously.
}	)(	require(	'fs'	).readFileSync(	'/dev/stdin',	'utf8'	)	);