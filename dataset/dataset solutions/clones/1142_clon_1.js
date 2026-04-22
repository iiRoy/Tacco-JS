/*
 * This JavaScript function calculates the Longest Increasing Subsequence (LIS)
 * length for a given array `T`.
 *
 * The input array `T` is expected to be globally accessible or implicitly available
 * in the scope where LIS() is called.
 * The first element T[0] is modified as part of the algorithm's setup for
 * correct indexing and comparison.
 */

function LIS()
{
	// Declare and initialize 'n' based on the value of T[0] plus one.
	var  n  =  T[0]  +  1;


	// Initialize an empty array 'L' to store the lengths of increasing subsequences.
	var  L  =  [];

	/*
	 * The 'P' array would typically be used to store predecessor indices
	 * to reconstruct the actual LIS. However, in this specific implementation,
	 * 'P' is commented out and thus not utilized.
	 */
	//   var P=[];


	// --- Core Algorithm Setup ---

	// Modify the first element of the input array 'T'. This is a common
	// technique in dynamic programming problems for base cases or boundary conditions.
	T[0] = 0;

	// Set the initial LIS length for the first element to 0.
	L[0] = 0;

	// Predecessor for the first element, if 'P' were active.
	//   P[0]=-1;


	// Outer loop: Iterate through the array 'T' starting from the second element (index 1).
	for
	(
		var   i   =   1;
		i   <   T.length;
		i++
	)
	{
		// Initialize 'k' to 0. 'k' will hold the index of the element that precedes
		// T[i] in the longest increasing subsequence found so far.
		var   k   =   0;

		// Inner loop: Iterate from the beginning of the array up to the current index 'i-1'.
		for
		(
			var   j   =   0;
			j   <=   i   -   1;
			j++
		)
		{
			// Conditional check:
			// 1. T[j] must be strictly less than T[i] to maintain an increasing subsequence.
			// 2. The LIS length ending at T[j] (L[j]) must be greater than
			//    the LIS length ending at the current best predecessor (L[k]).
			if
			(
				T[j]   <   T[i]   &&
				L[j]   >   L[k]
			)
			{
				// If both conditions are met, 'j' becomes the new best predecessor index.
				k   =   j;
			}
		}

		// Calculate the LIS length ending at T[i]:
		// It's 1 (for T[i] itself) plus the LIS length ending at its best predecessor T[k].
		L[i]   =   L[k]   +   1;

		// If 'P' array were active, we would store the predecessor here.
		//   P[i] = k;
	}

	/*
	 * After the loops complete, the 'L' array contains the length of the
	 * longest increasing subsequence ending at each position.
	 * To find the overall LIS length, we find the maximum value within 'L'.
	 * Math.max.apply(null, L) is used to find the maximum element in an array.
	 */
	var   max   =   Math.max.apply(   null,   L   );

	// Output the final computed maximum LIS length to the console.
	console.log(   max   );
}


// --- Script Entry Point and Input Handling ---

// Read input from the standard input stream.
// The 'fs' module is used for file system operations, specifically 'readFileSync'.
// The path '/dev/stdin' is typical for reading standard input in competitive programming environments.
// 'utf8' specifies the encoding.
var   input   =   require('fs').readFileSync(   '/dev/stdin',   'utf8'   );

// Process the raw input string:
// 1. '.trim()' removes any leading or trailing whitespace (like newlines).
// 2. '.split("\n")' splits the string into an array of strings,
//    where each element is a line from the input.
// 3. '.map(Number)' converts each string element in the array to its numeric equivalent.
// The resulting array of numbers is stored in the global variable 'T'.
var   T   =   (   input.trim()   ) .   split(   "\n"   ) .   map(   Number   );

// Invoke the LIS function to execute the algorithm and print the result.
LIS();

// End of JavaScript program.