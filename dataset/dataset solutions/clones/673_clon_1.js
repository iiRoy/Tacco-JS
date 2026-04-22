/*
 * This JavaScript program processes numerical data from standard input.
 * It reads lines, parses numbers, performs calculations, and outputs a final integer.
 * This is a Type I clone, meaning only whitespace and comments have been altered
 * from the original source code, preserving full functional equivalence.
 */

// Import the 'fs' (file system) module to handle input/output operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;
// The `readFileSync` method reads the entire content of the specified file synchronously.
// Here, '/dev/stdin' represents the standard input stream.
// The 'utf8' encoding is specified for reading the input.


var lines = input . split( '\n' ) ; // Split the entire input string into an array of individual lines.
// Each element in the 'lines' array will be one line from the input.


// Start a loop that continues as long as there are lines to process.
// The `lines.shift()` method removes the first element from the 'lines' array
// and returns it. This element is then assigned to the 'line' variable.
while ( line  =  lines.shift() )
{
	// Process the current 'line':
	// 1. `line.split(' ')` splits the string by spaces, creating an array of string numbers.
	// 2. `.map(function(a) { return parseInt(a); })` iterates over this array,
	//    converting each string element 'a' into an integer using `parseInt()`.
	// The resulting array of integers is stored in variable 's'.
	var s = line . split( ' ' ) . map( function( a ) { return parseInt( a ) ; } ) ;


	// Declare and initialize an array named 'args'.
	// This array will store the sums of specific pairs of integers from the 's' array.
	// The unary '+' operator before each 's[index]' ensures explicit number conversion,
	// though `parseInt` already provides numeric values.
	var args =
	[
		  + s[ 0 ]  +  s[ 1 ]
		, + s[ 2 ]  +  s[ 3 ]
		, + s[ 4 ]  +  s[ 5 ]
	] ;


	var k = 0 ; // Initialize an accumulator variable 'k' to zero. This variable will store the final result.


	// Begin a standard 'for' loop to iterate through each element of the 'args' array.
	for ( var i = 0 ; i < args . length ; i ++ )
	{
		// Calculate the integer division of the current 'args[i]' by 3.
		// `Math.floor()` ensures that the result is an integer (truncating any decimal part).
		// Add this result to 'k'.
		k += Math . floor( args[ i ]  /  3 ) ;

		// Update the current 'args[i]' to its remainder when divided by 3.
		// This uses the modulo assignment operator.
		args[ i ]  %=  3 ;
	}

	// After the loop, perform one final calculation:
	// Sum the remaining values in 'args' (which are now 0, 1, or 2).
	// Calculate the integer division of this sum by 3.
	// Add this final result to 'k'.
	k += Math . floor( ( args[ 0 ]  +  args[ 1 ]  +  args[ 2 ] )  /  3 ) ;


	// Print the final calculated value of 'k' to the standard output.
	console . log( k ) ;
}
// End of the main processing loop and the JavaScript program.