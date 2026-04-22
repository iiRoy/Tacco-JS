/*
 * This is a Type I clone of the original JavaScript code.
 * It features extensive changes in whitespace and comments
 * while preserving the exact structure and identifiers.
 */

var log = console.log; // Assigns console.log to a local variable for convenience.


if ( typeof process !=  "undefined" )
{
	// This block handles input when running in a Node.js environment.
	var input = "";
	process.stdin.resume( );
	process.stdin.setEncoding( 'utf8' );

	process.stdin.on( 'data', function ( chunk ) {
		input += chunk; // Appends incoming data chunks to the input string.
	} );

	process.stdin.on( 'end', function ( ) {
		before( input ); // Calls the 'before' function once all input is received.
	} );
}



function before( input )
{
	/*
	 * This function preprocesses the raw input string.
	 * It splits the input into lines, removes the first and last lines,
	 * and then passes the remaining lines to the main processing function.
	 */
	var lines = input.split( "\n" );
	lines.shift( ); // Removes the first line (often metadata or blank).
	lines.pop( ); // Removes the last line (often blank or EOF marker).

	main( lines ); // Invokes the core logic with the processed lines.
}


/*
 * Main processing logic for the given datasets.
 * This section of the code parses numerical data and performs calculations.
 */
function main( lines )
{
	lines.shift( ); // Discards the very first line of the actual data set.

	// Transforms each line into an array of numbers.
	lines = lines.map( function ( e )
	{
		var f = e.split( " " ); // Splits the line by spaces.
		var ret = f.map( function ( g )
		{
			return Number( g ); // Converts each string part to a number.
		} );
		return ret; // Returns the array of numbers for the current line.
	} );

	var datasets = [ ]; // Array to hold grouped datasets.

	// Group lines into pairs of datasets.
	while ( lines.length > 1 )
	{
		// This comment was originally in Japanese, now rephrased.
		// It seems to imply that two lines form a single dataset.
		var arr = [ ];
		arr.push( lines.shift( ) ); // Takes the first line of the pair.
		arr.push( lines.shift( ) ); // Takes the second line of the pair.
		datasets.push( arr ); // Adds the pair to the collection of datasets.
	}

	// Process each collected dataset.
	datasets.forEach( function ( e )
	{
		var ppow = e[0][1]; // Extracts a specific value from the first part of the dataset.
		var diff = [ ]; // Array to store differences.

		// Calculates differences between consecutive elements in the second part of the dataset.
		e[1].forEach( function ( f, i, a )
		{
			if ( i == 0 )
			{
				return; // Skips the first element as there's no preceding one.
			}
			else
			{
				diff.push( a[i] - a[i - 1] ); // Stores the difference.
			}
		} );

		// Sorts the calculated differences in descending order.
		diff.sort( function ( a, b )
		{
			return b - a; // Descending sort.
		} );

		// Slices the sorted differences array based on the 'ppow' value.
		diff = diff.slice( ppow - 1 ); // Keeps elements from index (ppow - 1) onwards.

		var sum = 0; // Initializes sum.

		// Calculates the sum of the remaining differences.
		if ( diff.length > 0 )
		{
			sum = diff.reduce( function ( p, c )
			{
				return p + c; // Accumulates the sum.
			} );
		}
		else
		{
			sum = 0; // If no differences, sum remains zero.
		}
		log( sum ); // Outputs the final calculated sum.
	} );
}