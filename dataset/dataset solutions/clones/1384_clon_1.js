/*
 * This JavaScript program is designed to read multiple lines of input
 * from standard input, identify the lexicographically smallest string
 * among them (after skipping the first two lines), and then
 * print that smallest string to the console.
 *
 * It operates by initializing a 'minimum' value with the third line
 * of input and then iterating through all subsequent lines,
 * updating the 'minimum' whenever a lexicographically smaller line is found.
 */

// Utilize the Node.js 'fs' (file system) module to synchronously read
// the entire content of standard input ('/dev/stdin') as a UTF-8 string.
var   input   =   require   (   'fs'   ) .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// Split the accumulated input string into an array of individual lines,
// using the newline character ('\n') as the delimiter for splitting.
var   lines   =   input .   split   (   '\n'   )   ;


// Remove the very first line from the 'lines' array.
// This line is typically ignored or contains metadata not needed for the core logic.
lines .   shift   (   )   ;

// Remove the new first line (which was originally the second line)
// and assign its value as the initial 'minimum' string for comparison.
var   min   =   lines .   shift   (   )   ;

// Declare a variable 'word' which will temporarily hold each line
// as it is processed during the iteration.
var   word   ;

// Begin a loop that continues as long as there are lines remaining in the 'lines' array.
// In each iteration, 'lines.shift()' removes and returns the next line,
// which is then assigned to 'word'. The loop terminates when 'lines.shift()'
// returns an undefined value (meaning the array is empty).
while   (   word   =   lines .   shift   (   )   )
{
	// Perform a lexicographical comparison: if the current 'word' is
	// strictly less than the current 'min' value...
	if   (   word   <   min   )
	{
		// ...then update 'min' to this new, lexicographically smaller 'word'.
		min   =   word   ;
	}
}

// After the loop has finished processing all available lines,
// print the final determined lexicographically smallest string ('min')
// to the standard output.
console .   log   (   min   )   ;