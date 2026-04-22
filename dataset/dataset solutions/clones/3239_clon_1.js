/*
 * This is the main function definition.
 * It takes a single string 'input' as its argument.
 * The purpose of this function is to process the input
 * and calculate a specific value based on character comparisons
 * across multiple lines of the input.
 */
function     Main  (   input   )
{
	// The first step is to clean up the input string.
	// This removes any leading or trailing whitespace characters.
	input   =   input.trim(  ) ; // Assigns the trimmed input back to the 'input' variable.

	/*
	 * Next, we parse the length from the first line of the input.
	 * The input is expected to be a multi-line string,
	 * where lines are separated by newline characters ("\n").
	 * The first line is treated as the length indicator.
	 */
	var     len    =   parseInt(   input.split("\n")[0]   ) ; // Converts the first line to an integer.

	// We then extract the three primary strings (A, B, C) from the subsequent lines of the input.
	// These strings will be used for character-by-character comparison.
	var     A      =   input.split(  "\n"  )[1]  ; /* This is the first string for comparison. */
	var     B      =   input.split(  "\n"  )[2]  ; // This is the second string for comparison.
	var     C      =   input.split(  "\n"  )[3]  ; // And this is the third string for comparison.

	// Initialize a counter variable.
	// This variable will accumulate the result of our character comparisons.
	var     count   =   0 ;

	// An early exit condition: If all three strings are identical from the start,
	// there's no need to perform character-by-character comparisons.
	// The count remains 0 in this scenario.
	if  (   A   ==   B   &&   B   ==   C   )
	{
		console.log(   count   ) ; // Output the initial count (which is 0).
		return  ; // Terminate function execution immediately.
	}

	// This is the core logic loop.
	// It iterates through each character position, from the first (index 0)
	// up to, but not including, the determined length 'len'.
	for   (   var   i   =   0   ;   i   <   len   ;   i++   )
	{
		// Extract single characters at the current index 'i' from each of the three strings.
		// `slice(i, i + 1)` effectively gets the character at index `i`.
		var   tmpA   =   A.slice(   i   ,   i   +   1   ) ; // Character from string A.
		var   tmpB   =   B.slice(   i   ,   i   +   1   ) ; /* Character from string B. */
		var   tmpC   =   C.slice(   i   ,   i   +   1   ) ; // Character from string C.

		// Now, apply conditional logic based on the equality of these three characters.
		if   (   tmpA   ==   tmpB   &&   tmpB   ==   tmpC   )
		{
			// If all three characters are identical, no change to 'count' is needed for this position.
			continue ; // Skip to the next iteration of the loop.
		}   else   if   (   tmpA   !=   tmpB   &&   tmpB   !=   tmpC   )
		{
			// If all three characters are distinct from each other (e.g., 'a', 'b', 'c').
			// In this case, the count is incremented by 2.
			count   +=   2 ;
		}   else
		{
			// This 'else' block covers the case where exactly two characters are the same,
			// and one is different (e.g., 'a', 'a', 'b' or 'a', 'b', 'a' or 'b', 'a', 'a').
			// Here, the count is incremented by 1.
			count++ ;
		}
	}

	// After the loop completes, the final calculated count is printed to the console.
	console.log(   count   ) ;
}

// This line is responsible for invoking the Main function.
// It reads the input from standard input using Node.js's 'fs' module.
// The input is read synchronously and decoded as UTF-8.
Main(   require("fs").readFileSync(   "/dev/stdin"   ,   "utf8"   )   ) ;