/*
 * This is the main application entry point.
 * It processes the input and determines the coprimality status.
 */
function Main  (  input  )
{
	// Process the raw input string by splitting it into lines.
	input = input.split ( "\n" ) ;

	// N is the first number in the input, representing the count of elements (though not directly used in the logic here).
	N = Number ( input [ 0 ] ) ;

	/*
	 * An is an array of numbers obtained from the second line of input.
	 * The string is split by spaces, and each part is converted to a number.
	 */
	let An = input [ 1 ] . split ( " " ) . map ( Number ) ;


	// Check for "not coprime" condition first: if the greatest common divisor of all numbers is not 1.
	if ( gcd ( ... An ) !== 1 )
	{
		console . log ( "not coprime" ) ; // Output the result for "not coprime".
		return ;                          // Exit the function early.
	}


	// Initialize a frequency array to count occurrences of numbers and their multiples.
	let freq = Array ( 1000001 ) . fill ( 0 ) ;

	// First pass: Check for direct duplicates among the input numbers.
	for ( let A of An )
	{
		// Skip the number 1 as it doesn't affect GCD calculations in this context (it's coprime with everything).
		if ( A === 1 )
			continue ;

		// Increment the frequency count for the current number A.
		freq [ A ] ++ ;

		// If a number appears more than once, they are setwise coprime, but not pairwise coprime, and the overall GCD condition was already checked.
		// However, in this specific algorithm, if a number appears twice, it means they share that common factor.
		// And since the overall GCD was 1, it implies something else.
		// This condition is for when the array contains '1's that make the overall GCD 1, but other numbers are not pairwise coprime.
		// Re-reading: This check is actually for when An contains duplicate numbers other than 1.
		// If N numbers are present, and one number appears twice, then the numbers are setwise coprime.
		// Example: [2, 3, 2] -> gcd is 1. But '2' appears twice. This makes them 'setwise coprime'.
		if ( freq [ A ] > 1 )
		{
			console . log ( "setwise coprime" ) ; // Output for "setwise coprime".
			return ;                              // Exit.
		}
	}


	// Second pass: Check for common factors among numbers (pairwise coprimality).
	// Iterate through potential prime factors (or any number up to the max possible value).
	for ( let i = 2 ; i <= 1000001 ; i ++ )
	{
		let tmp = 0 ; // Temporary counter for factors.

		// For each potential factor 'i', check its multiples.
		// j represents a multiple of i.
		for ( let j = i ; j <= 1000001 ; j += i )
		{
			tmp += freq [ j ] ; // Add the frequency of 'j' to 'tmp'.
			                    // 'freq[j]' > 0 means 'j' is one of the numbers in An.
			                    // If 'j' is in An, and 'i' divides 'j', then 'i' is a factor of 'j'.

			// If 'tmp' reaches 2 or more, it means at least two numbers in An share the factor 'i'.
			// This indicates they are not pairwise coprime.
			if ( tmp >= 2 )
			{
				console . log ( "setwise coprime" ) ; // Output for "setwise coprime".
				return ;                              // Exit.
			}
		}
	}

	// If neither "not coprime" nor "setwise coprime" conditions were met, then they are pairwise coprime.
	console . log ( "pairwise coprime" ) ;

} // End of Main function definition.


/*
 * Calculates the Greatest Common Divisor (GCD) of an arbitrary number of arguments.
 * Uses the Euclidean algorithm recursively.
 */
function gcd ( ... arg )
{

	// Helper function 'f' for recursive GCD calculation of two numbers.
	// (a, b) => b ? f(b, a % b) : a is a concise way to write the Euclidean algorithm.
	var f = ( a , b ) => b ? f ( b , a % b ) : a ;

	// Initialize the answer with the first argument.
	var ans = arg [ 0 ] ;

	// Iterate through the rest of the arguments, calculating GCD cumulatively.
	for ( var i = 1 ; i < arg . length ; i ++ )
	{
		ans = f ( ans , arg [ i ] ) ; // Update 'ans' with the GCD of current 'ans' and the next argument.
	}

	return ans ; // Return the final GCD.

} // End of gcd function.


// Invoke the Main function with input read from standard input.
// This line acts as the program's entry point when executed.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;