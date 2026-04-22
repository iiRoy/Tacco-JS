/*
 * This JavaScript program processes numerical input to calculate a specific sequence.
 * It demonstrates array manipulation, Set usage for unique elements, and basic arithmetic.
 *
 * This version includes extensive whitespace and comments for illustrative purposes,
 * without altering the core logic or structure of the original code.
 */

function   Main   (   arg   )
{
	// The primary function that orchestrates the entire logic.
	// It accepts 'arg', which is expected to be a multi-line string input.

	var   N   =   arg . split ( "\n" ) [ 0 ]   -   0   ;
	// Extract the first line of the input string.
	// Split by newline character, take the first element (index 0),
	// and then subtract 0 to explicitly convert it to a number. This N represents the upper bound.


	var   A   =   arg . split ( "\n" ) [ 1 ] . split ( " " ) . map ( v => v - 0 )   ;
	// Extract the second line of the input.
	// Split by newline (index 1), then split that line by space characters.
	// Finally, use the 'map' function to convert each resulting string element 'v' into a number (v - 0).
	// This creates an array 'A' of numerical values.


	var   tmp   =   new   Set ( A )   ;
	// Create a new Set object named 'tmp' from the array 'A'.
	// A Set automatically stores only unique values, so 'tmp.size' will give the count of distinct numbers in A.


	var   ans   =   [ ]   ;
	// Initialize an empty array named 'ans'. This array will store all the calculated results.


	ans . push ( N )   ;
	// The problem specification indicates that the first element of the answer sequence
	// should always be the value of N itself. So, we add N to our 'ans' array.


	// We now iterate from K = 2 up to N (inclusive) to compute the subsequent elements for 'ans'.
	for   (   var   K   =   2   ;   K   <=   N   ;   K ++   )
	{
		// Within the loop, we check a condition based on the size of our unique elements set.
		if   (   tmp . size   <   K   )
		{
			// If the number of unique elements (tmp.size) is strictly less than the current K,
			// the problem requires us to push a zero into the answer array.
			ans . push ( 0 )   ;
		}
		else
		{
			// Otherwise (if tmp.size is greater than or equal to K),
			// we calculate the floor division of tmp.size by K.
			// Math.floor ensures we get an integer result, truncating any decimal part.
			ans . push ( Math . floor ( tmp . size   /   K ) )   ;
		}
	}


	// After the loop has completed, the 'ans' array contains all the required numerical results.
	// We join these numbers with newline characters (`\n`) to form a single string,
	// and then explicitly call .toString() (though join already returns a string).
	// Finally, this formatted string is printed to the console (standard output).
	console . log ( ans . join ( "\n" ) . toString ( ) )   ;


	return   ;
	// The function concludes its execution. In JavaScript, explicit 'return;' is optional
	// for functions that don't return a specific value, but it can enhance clarity.
}


// This line is responsible for initiating the program.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 encoded string.
// The 'require("fs").readFileSync' method is used for this purpose.
// The obtained input string is then passed as the 'arg' parameter to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) )   ;