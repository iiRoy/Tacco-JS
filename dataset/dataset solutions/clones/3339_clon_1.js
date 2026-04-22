/*
 * This is a Type I clone of a JavaScript program.
 * It strictly adheres to the definition provided:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This implies:
 * - Every identifier, variable name, function name, operator, and expression
 *   must remain absolutely unchanged from the original source.
 * - The only permitted alterations are modifications to whitespace (such as
 *   indentation, spacing around operators, adding/removing blank lines)
 *   and comments (adding new comments, modifying existing ones, or removing them).
 *
 * The objective is to make the resulting code appear significantly different
 * visually, while preserving its precise logical and structural identity.
 */

'use strict'
	;	// Directives like 'use strict' can also have trailing comments.


const	mod	=	1e9	+	7	;	// This constant defines the modulus for arithmetic operations.
							// It's a large prime, commonly used in competitive programming.


	function	solve	(	N	,	K	,	A	)	{	/* This is the primary function
										that implements the dynamic programming
										solution to the problem. */

		// The base condition: If the target sum K is zero, there's always one way
		// (by selecting no elements).
		if	(	K	===	0	)
		{
			return	1	;	// Return 1 for the base case.
		}


		// Initialize the dynamic programming array 'dp'.
		// dp[j] will store the number of ways to achieve sum 'j' using elements up to the current index.
		var	dp	=	new	Array	(	K	+	1	)	.	fill	(	0	)	;


		// Initialize the prefix sum array 'prefix'.
		// prefix[i][j] will store the cumulative sum of dp values up to 'j' for the 'i'-th element.
		var	prefix	=	new	Array	(	N	)
				.	fill	(	0	)	// Fill with 0 initially.
				.	map	(	e	=>	new	Array	(	K	+	1	)	.	fill	(	0	)	)	;	// Each element is an array of size K+1, also filled with 0s.


		// Outer loop: Iterate through each element A[i] in the input array.
		for	(	var	i	=	0	;	i	<	N	;	i	++	)
		{
			// Inner loop: Iterate through all possible sums 'j' from 0 up to K.
			for	(	var	j	=	0	;	j	<=	K	;	j	++	)
			{
				// Special handling for the first element (i = 0).
				if	(	i	===	0	)
				{
					// If j is less than or equal to the first element A[0],
					// there's 1 way to make sum 'j' (by choosing A[0] if j == A[0], or not choosing it if j < A[0] and j=0).
					// This specific DP problem's base case for i=0 seems to be "ways to make sum j using only A[0]".
					// If j is 0, it's 1 way (don't pick A[0]). If j > 0 and j <= A[0], it's 1 way (pick A[0]).
					dp	[	j	]	=	j	<=	A	[	i	]	?	1	:	0	;


					// Calculate the prefix sum for the current row (i) and column (j).
					// This helps in quickly querying sums of ranges later.
					prefix	[	i	]	[	j	]	=
							j	>	0
								?	(	(	prefix	[	i	]	[	j	-	1	]	+	dp	[	j	]	)	%	mod	)
								:	(	dp	[	j	]	%	mod	)	;
				}
				else	// For all subsequent elements (i > 0).
				{
					// The DP transition for dp[j] involves using prefix sums from the previous row (i-1).
					// This efficiently calculates the sum of dp values in a range.
					dp	[	j	]	=
							(	j	-	1	-	A	[	i	]	)	>=	0
								?	(	(	prefix	[	i	-	1	]	[	j	]	-	prefix	[	i	-	1	]	[	j	-	A	[	i	]	-	1	]	)	%	mod	)
								:	(	prefix	[	i	-	1	]	[	j	]	%	mod	)	;


					// Calculate the prefix sum for the current row (i) and column (j).
					// This maintains the prefix sums for the current state.
					prefix	[	i	]	[	j	]	=
							j	>	0
								?	(	(	prefix	[	i	]	[	j	-	1	]	+	dp	[	j	]	)	%	mod	)
								:	(	dp	[	j	]	%	mod	)	;
				}
			}
		}

		// After processing all elements and all possible sums,
		// the final answer is stored in dp[K].
		return	dp	[	K	]	%	mod	;	// Ensure the final result is within the modulo range.
	}


	/*
	 * The main function serves as the entry point for the program's execution.
	 * It handles input parsing, calls the core 'solve' logic, and outputs the result.
	 */
	function	main	(	input	)	{

		// Split the entire input string by newline characters to get individual lines.
		var	lines	=	input	.	split	(	"\n"	)	;

		// Parse the first line to extract N and K.
		var	NK	=	lines	[	0	]
						.	split	(	' '	)	// Split the first line by spaces.
						.	map	(	l	=>	parseInt	(	l	)	)	;	// Convert each part to an integer.

		var	N	=	NK	[	0	]	;	// N represents the number of elements in array A.
		var	K	=	NK	[	1	]	;	// K represents the target sum.

		// Parse the second line to get the array A.
		var	A	=	lines	[	1	]
						.	split	(	' '	)	// Split the second line by spaces.
						.	map	(	l	=>	parseInt	(	l	)	)	;	// Convert each part to an integer.

		// Call the 'solve' function with the parsed N, K, and A.
		var	ans	=	solve	(	N	,	K	,	A	)	;

		// Output the calculated answer to the console.
		console	.	log	(	ans	)	;

	}


// This is the program's actual execution trigger.
// It reads the entire content of standard input (usually from a file or piped data)
// as a UTF-8 string and passes it to the 'main' function.
main	(
		require	(	'fs'	)	.	readFileSync	(	'/dev/stdin'	,	'utf8'	)
	)	;