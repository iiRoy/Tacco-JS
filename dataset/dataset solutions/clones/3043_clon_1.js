' use strict ' /* This directive enforces stricter parsing and error handling in the code. */ ' ;


function   Main  (   input   )   {


	// Define a large constant M, though its actual usage might be limited in this specific problem context.
	var   M   =   Math . pow (   2   ,   50   )   ;


	/*
	 * K is a modulo constant, commonly used in competitive programming
	 * for problems involving large numbers to prevent overflow and
	 * ensure results fit within standard integer types.
	 * It's a prime number.
	 */
	const   K   =   998244353   ;


	// Process the input string.
	// 1. Remove leading/trailing whitespace.
	// 2. Split into an array of strings by one or more whitespace characters.
	// 3. Convert each string element to a number using the unary minus operator trick (x => x-0).
	input   =   input
		. trim ( )
		. split (   / \s+ /   )
		. map (   x   =>   x   -   0   )   ;


	// The first element of the processed input array is N.
	var   N   =   input . shift ( )   ; // Removes N from the input array, leaving only the 'g' or 'b' values.


	// Calculate the sum of the remaining numbers in the input array.
	var   sum   =   input . reduce (   (   a   ,   c   )   =>   a   +   c   )   ;


	// Determine 'half' which is used as the target sum for the dynamic programming states.
	var   half   =   Math . floor (   sum   /   2   )   ;


	// Initialize a 2D array for dynamic programming, named 'dp'.
	// dp[i][j] will store the number of ways to achieve a sum 'j'
	// using an arbitrary number of 'g' and 'b' elements from input[0] to input[i-1].
	var   dp   =   [ ]   ;


	// Loop to initialize the rows of the dp table.
	for   (   let   i   =   0   ;   i   <=   N   ;   i   ++   )   {

		dp [   i   ]   =   [ ]   ; // Initialize current row as an empty array.

		// Loop to initialize columns for the current row.
		for   (   let   j   =   0   ;   j   <=   half   ;   j   ++   )   {

			dp [   i   ] [   j   ]   =   0   ; // Set initial value to zero.
		}
	}


	// Base case: There is one way to achieve a sum of 0 with no items.
	dp [   0   ] [   0   ]   =   1   ;


	// Fill the dp table using iteration.
	// The outer loop iterates through each item in the input array (from 0 to N-1).
	for   (   let   i   =   0   ;   i   <   N   ;   i   ++   )   {

		// The inner loop iterates through all possible sums up to 'half'.
		for   (   let   j   =   0   ;   j   <=   half   ;   j   ++   )   {

			// Case 1: Do not include the current item input[i].
			// The number of ways to get sum 'j' using items up to 'i' is carried over.
			dp [   i   +   1   ] [   j   ]   +=   dp [   i   ] [   j   ]   ;
			dp [   i   +   1   ] [   j   ]   %=   K   ; // Apply modulo K.


			// Case 2: Include the current item input[i].
			// Check if adding input[i] keeps the sum within the 'half' limit.
			if   (   j   +   input [   i   ]   <=   half   )   {

				// If input[i] is included, it can be assigned to 'g' or 'b',
				// effectively doubling the number of ways from the previous state.
				dp [   i   +   1   ] [   j   +   input [   i   ]   ]   +=   2   *   dp [   i   ] [   j   ]   ;
				dp [   i   +   1   ] [   j   +   input [   i   ]   ]   %=   K   ; // Apply modulo K.
			}
		}
	}


	// Initialize the answer variable.
	var   ans   =   1   ;

	// Calculate 3^N (mod K). This represents the total ways if all items
	// could be assigned to 'g', 'b', or ignored, for each item.
	// (Actually, it's 3 choices for each item: green, blue, or not chosen for the first partition,
	// but this might be a shortcut for a specific problem context)
	for   (   let   i   =   0   ;   i   <   N   ;   i   ++   )   {

		ans   *=   3   ;
		ans   %=   K   ;
	}


	// Subtract contributions from the 'dp' table.
	// This part likely deals with overcounted or invalid states.
	// For each possible sum 'x' in the last row of 'dp' (dp[N]),
	// subtract 3 * x from the answer.
	dp [   N   ] . forEach (   function   (   x   ,   i   ,   arr   )   {

		ans   -   =   3   *   x   ; // Subtract 3 times the count for sum 'x'.
	}   )   ;


	// Initialize another 2D array for dynamic programming, named 'DP'.
	// DP[i][j] will store the number of ways to achieve a sum 'j'
	// using an arbitrary number of 'g' elements from input[0] to input[i-1].
	var   DP   =   [ ]   ;


	// Loop to initialize the rows of the DP table.
	for   (   let   i   =   0   ;   i   <=   N   ;   i   ++   )   {

		DP [   i   ]   =   [ ]   ; // Initialize current row.

		// Loop to initialize columns for the current row.
		for   (   let   j   =   0   ;   j   <=   half   ;   j   ++   )   {

			DP [   i   ] [   j   ]   =   0   ; // Set initial value to zero.
		}
	}


	// Base case for DP: One way to achieve sum 0 with no items.
	DP [   0   ] [   0   ]   =   1   ;


	// Fill the DP table using iteration.
	// The outer loop iterates through each item in the input array.
	for   (   let   i   =   0   ;   i   <   N   ;   i   ++   )   {

		// The inner loop iterates through all possible sums up to 'half'.
		for   (   let   j   =   0   ;   j   <=   half   ;   j   ++   )   {

			// Case 1: Do not include the current item input[i].
			DP [   i   +   1   ] [   j   ]   +=   DP [   i   ] [   j   ]   ;
			DP [   i   +   1   ] [   j   ]   %=   K   ; // Apply modulo K.

			// Case 2: Include the current item input[i].
			// Check if adding input[i] keeps the sum within the 'half' limit.
			if   (   j   +   input [   i   ]   <=   half   )   {

				// If input[i] is included, it can only be assigned to 'g' (one way).
				DP [   i   +   1   ] [   j   +   input [   i   ]   ]   +=   DP [   i   ] [   j   ]   ;
				DP [   i   + 1 ] [   j   +   input [   i   ]   ]   %=   K   ; // Apply modulo K.
			}
		}
	}


	// Conditional adjustment to the answer if the total sum is even.
	if   (   sum   %   2   ===   0   )   {

		// Add 3 times the count from DP[N][half] to the answer.
		// This likely accounts for specific symmetric cases when the total sum can be perfectly divided.
		ans   +=   3   *   DP [   N   ] [   half   ]   ;
		ans   %=   K   ; // Apply modulo K.
	}


	// Final modulo operations to ensure the answer is within the valid range [0, K-1].
	ans   %=   K   ; // First modulo, might result in a negative number if 'ans' was negative.
	ans   +=   K   ; // Add K to make sure it's positive.
	ans   %=   K   ; // Final modulo to get the correct positive remainder.

	// Output the calculated answer to the console.
	console . log (   ans   )   ;


} // End of the Main function definition.


/*
 * This line reads input from standard input (usually a file in competitive programming environments),
 * converts it to a UTF-8 string, and then passes it to the Main function for processing.
 * The 'require('fs')' module is used for file system operations.
 */
Main (   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;