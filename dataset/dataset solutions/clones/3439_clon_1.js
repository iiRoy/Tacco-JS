/*
 * This function serves as the primary entry point for processing the given input.
 * It is designed to find the index of the number in a list that is closest to the average
 * of all numbers in that list.
 */
function Main ( input ) {
	// The input is initially a single string. We split it into an array of strings
	// based on newline characters to separate individual lines of data.
	input = input . split ( "\n" ) ;

	// The first line of the input (input[0]) contains the count of numbers, N.
	// The `~~` operator is a concise way to convert a string to an integer (similar to Math.floor()
	// for positive numbers or parseInt() without a radix, but often faster).
	var N = ~~ input [ 0 ] ;

	// The second line of the input (input[1]) contains the space-separated numbers.
	// We first split this string by spaces to get an array of number strings.
	// Then, we use `map` with `~~` again to convert each string number into an actual integer.
	var a = input [ 1 ] . split ( " " ) . map ( a => ~~ a ) ;

	// Initialize a variable to hold the sum of all numbers in array 'a'.
	var sum = 0 ;

	// This loop iterates through the array 'a' from the first element up to N-1 (inclusive).
	// Its purpose is to calculate the total sum of all numbers in the array.
	for ( var i = 0 ; i < N ; i ++ ) {
		// Add the current element a[i] to the running total 'sum'.
		sum += a [ i ] ;
	}

	// This second loop transforms each element of array 'a'.
	// Instead of a raw number, each element becomes an object with two properties:
	// 'val': The absolute difference between the original number and the average of all numbers.
	// 'index': The original position (index) of the number in the input array.
	for ( var i = 0 ; i < N ; i ++ ) {
		// Calculate the absolute difference from the mean (sum / N).
		// This 'val' will be used for sorting to find the closest number.
		a [ i ] = { val : Math . abs ( a [ i ] - sum / N ) , index : i } ;
	}

	// Sort the array 'a' based on the 'val' property of its objects.
	// The sort function `(b, c) => b.val - c.val` performs an ascending sort,
	// meaning objects with smaller 'val' (closer to the average) will come first.
	a = a . sort ( ( b , c ) => b . val - c . val ) ;

	// After sorting, the first element of the array (a[0]) will be the object
	// corresponding to the number closest to the average.
	// We return its 'index' property, which is its original position in the input list.
	return a [ 0 ] . index ;
}


/*
 * The following block of code is responsible for handling the execution environment.
 * It allows the 'Main' function to be run both in a Node.js environment (e.g., competitive programming platforms)
 * and in a browser-like environment for testing or embedded execution.
 *
 * This section is essentially a self-executing anonymous function (IIFE - Immediately Invoked Function Expression).
 * It checks for the presence of 'require' to determine the environment.
 *
 * Any changes here are purely for visual distinction via whitespace and comments,
 * adhering strictly to Type I cloning rules.
 */

( ( b , c , d ) =>
	"undefined" != typeof require
		? // If 'require' exists, we are likely in a Node.js environment.
		  // Read input from /dev/stdin, pass it to Main, and print the result to console.
		  console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) )
		: // Otherwise, assume a browser-like or non-Node environment.
		  // This part simulates an input and displays the output in a basic HTML structure.
		  [
				// The input string 'b' is processed:
				// - Split by newlines, remove the first and last lines (which are typically metadata or empty),
				// - Then rejoin the remaining lines to form the effective input for Main.
				( b = b . split ( "\n" ) . slice ( 1 , -1 ) . join ( "\n" ) ) ,
				// Call the Main function with the processed input 'b'.
				// A try-catch block is used to gracefully handle potential errors during execution.
				( c = function ( ) {
					try {
						return Main ( b ) ;
					} catch ( f ) {
						// If an error occurs, return its stack trace or message.
						return f . stack || f . message ;
					}
				} ( ) ) ,
				// Determine the data type of the result 'c'.
				( d = typeof c ) ,
				// If the result 'c' is not already a string, convert it to a JSON string.
				// This ensures consistent output formatting.
				"string" == d || ( c = JSON . stringify ( c ) ) ,
				// Dynamically create an HTML form element.
				// Append several child elements (textareas and line breaks) to display
				// the input, result type, and the result itself.
				$ ( "<form>" ) . append (
					[
						// Configuration for the first textarea: 10 rows, displays the processed input 'b'.
						[ 10 , b ] ,
						// A line break.
						0 ,
						// Configuration for the second textarea: 1 row, displays the type of the result 'd'.
						[ 1 , d ] ,
						// Another line break.
						0 ,
						// Configuration for the third textarea: 10 rows, displays the final result 'c'.
						[ 10 , c ]
					] . map (
						// Map function to create jQuery objects for textareas or line breaks.
						// If 'f' is truthy (meaning it's an array for a textarea), create a textarea.
						// Otherwise (if 'f' is 0), create a line break.
						( f ) =>
							$ ( f ? "<textarea>" : "<br>" , f && { rows : f [ 0 ] , cols : 40 , text : f [ 1 ] } )
					)
				) . appendTo ( "body" ) // Append the entire form to the HTML body.
		  ]
)
// This is the actual input string that gets passed to the IIFE as argument 'b'
// when running in the browser-like environment.
( `
5
2 5 2 5 6
` ) ;