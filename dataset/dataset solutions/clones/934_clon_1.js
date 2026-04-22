/*
 * This file contains a JavaScript program designed to process string datasets.
 * It primarily focuses on dynamic programming techniques to compute a specific value
 * based on the character comparisons between two input strings.
 *
 * This version is a Type I clone, meaning it is functionally identical
 * to its source, but with significant changes in whitespace and comments
 * to alter its visual representation without affecting its execution.
 */

// Establish a shorthand for console.log, which is frequently used for output.
var log = console.log;

// This block checks if the script is running in a Node.js-like environment.
// If 'process' is defined, it means we are likely in Node.js and can
// interact with standard input/output streams.
if ( typeof process != "undefined" )
{
	// Initialize an empty string buffer to accumulate all incoming data from stdin.
	var input = "";

	// Resume the standard input stream to ensure it's open and ready to receive data.
	process.stdin.resume( );

	// Set the character encoding for the standard input stream to UTF-8.
	// This ensures proper handling of various character sets.
	process.stdin.setEncoding ( 'utf8' );

	// Register an event listener for when data chunks are received on stdin.
	process.stdin.on
	(
		'data',
		function ( chunk )
		{
			// Append each received data chunk to the 'input' buffer.
			input += chunk;
		}
	); // End of 'data' event handler definition.

	// Register an event listener for when the standard input stream ends.
	// This signifies that all expected input has been received.
	process.stdin.on ( 'end', function ()
	{
		// Once all input is gathered, split the entire string by newline characters
		// to get an array where each element is a line of input.
		var lines = input.split( "\n" );

		// Invoke the main processing function, passing it the array of input lines.
		main ( lines );
	} ); // End of 'end' event handler definition.
} // End of Node.js environment check block.



// The primary function responsible for orchestrating the processing of input lines.
function main ( lines )
{
	// Remove the very first line from the 'lines' array.
	// This is often done to discard a header or a count of test cases.
	lines.shift( );

	// Begin a loop that continues as long as there are lines remaining to process.
	while ( lines.length > 0 )
	{
		// Extract the next two lines from the 'lines' array to form a 'dataset'.
		// This suggests each dataset consists of two lines of input.
		var dataset = lines.slice( 0, 2 );

		// Process the extracted dataset. The map function iterates over each
		// string in the dataset (i.e., each of the two lines).
		dataset = dataset.map( function ( row )
		{
			// For each 'row' (string), perform the following operations:
			// 1. Split the string into an array of individual characters.
			// 2. Filter this array, keeping only characters that are lowercase English letters.
			//    - 'e.charCodeAt(0)' gets the ASCII/Unicode value of the character.
			//    - '97 <= code && code <= 122' checks if the character code falls
			//      within the range for 'a' through 'z'.
			// 3. Join the filtered characters back into a single string.
			return row.split( "" ).filter( function ( e )
			{
				var code = e.charCodeAt( 0 ); // Get the character's ASCII code.
				return 97 <= code && code <= 122; // Is it a lowercase letter?
			} ).join( "" ); // Reconstruct the string with only lowercase letters.
		} ); // End of the map callback function.

		// After cleaning and preparing the 'dataset', pass it to a dedicated function
		// for further, more specific processing.
		processDataset ( dataset );

		// Remove the two lines that have just been processed from the 'lines' array.
		// This prepares the array for the next iteration of the loop.
		lines = lines.slice( 2 );
	} // End of the while loop for processing all lines.
} // End of the 'main' function.


// This function is responsible for the core logic of processing a single dataset,
// which consists of two cleaned strings. It likely implements a dynamic programming
// algorithm to find a relationship or value between these two strings.
function processDataset ( dataset )
{
	// Declare and initialize a 2D array 'A'. This array will serve as a
	// dynamic programming table to store intermediate results.
	var A = [ ];

	// Extract the first string from the dataset. This string will be referred to as 'f'.
	var f = dataset[ 0 ];

	// Extract the second string from the dataset. This string will be referred to as 's'.
	var s = dataset[ 1 ];

	// Begin a try-catch block to gracefully handle any potential errors during
	// the intensive computation process.
	try
	{
		// Outer loop: Iterates through each character of the first string 'f'.
		// 'i' represents the current index in string 'f'.
		for
		(
			var i = 0; // Initialize loop counter 'i'.
			i < f.length; // Loop continues as long as 'i' is within the bounds of 'f'.
			i++ // Increment 'i' after each iteration.
		)
		{
			// Initialize a new inner array (row) for the DP table 'A' at index 'i'.
			A[ i ] = [ ];

			// Inner loop: Iterates through each character of the second string 's'.
			// 'j' represents the current index in string 's'.
			for
			(
				var j = 0; // Initialize loop counter 'j'.
				j < s.length; // Loop continues as long as 'j' is within the bounds of 's'.
				j++ // Increment 'j' after each iteration.
			)
			{
				// Check if the characters at the current positions in 'f' and 's' are identical.
				if ( f.charAt( i ) == s.charAt( j ) )
				{
					// If they match, assign a value of 1 to the current cell in the DP table.
					A[ i ][ j ] = 1;
				}
				else
				{
					// If they do not match, assign a value of 0.
					A[ i ][ j ] = 0;
				}

				// Apply dynamic programming rules based on the cell's position in the table.
				if ( i == 0 && j == 0 )
				{
					// Base case: For the very first cell (top-left corner), no previous values exist.
					// Add 0, effectively keeping its initial value (0 or 1).
					A[ i ][ j ] += 0;
				}
				else if ( i == 0 ) // If in the first row (i.e., 'i' is 0, but 'j' is not 0).
				{
					// The value is the maximum of its current value and the value from the cell to its left.
					A[ i ][ j ] = Math.max( A[ i ][ j - 1 ], A[ i ][ j ] );
				}
				else if ( j == 0 ) // If in the first column (i.e., 'j' is 0, but 'i' is not 0).
				{
					// The value is the maximum of its current value and the value from the cell directly above it.
					A[ i ][ j ] = Math.max( A[ i - 1 ][ j ], A[ i ][ j ] );
				}
				else // General case: For any other cell not in the first row or column.
				{
					// This is the main recurrence relation.
					// It takes the minimum of two expressions:
					// 1. The maximum of the cell above and the cell to the left, plus the current cell's value.
					// 2. The minimum of 'i' and 'j', plus 1.
					A[ i ][ j ] = Math.min( Math.max( A[ i - 1 ][ j ], A[ i ][ j - 1 ] ) + A[ i ][ j ], Math.min( i, j ) + 1 );
				}
			} // End of inner loop (j).
		} // End of outer loop (i).

		// After filling the entire DP table, the final result is typically found
		// in the bottom-rightmost cell. Log this value to the console.
		// Note: 'i' and 'j' will be one past their last valid index after the loops.
		log( A[ i - 1 ][ j - 1 ] );
	}
	catch ( e )
	{
		// If any error occurs within the try block, catch it here.
		// Log the error object to the console for debugging purposes.
		log( e );
	}
} // End of the 'processDataset' function.