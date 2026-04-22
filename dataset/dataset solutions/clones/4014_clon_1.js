// This is an expert-generated Type I clone.
// The original code processes input data for a specific problem.

/*
 * Main function: Entry point for processing the input.
 * It takes the entire input string as a parameter.
 */
function Main ( input )
{
	// Split the input string into individual lines.
	var line = input.split ( "\n" );

	// Parse the first line to get dimensions and step size.
	var tmp = line [ 0 ] .split ( " " );

	var height = Number ( tmp [ 0 ] ); // Height of the grid.
	var width = Number ( tmp [ 1 ] );  // Width of the grid (though not directly used later for grid traversal).
	var step = Number ( tmp [ 2 ] );   // The step value for movements.

	// A mapping to store coordinates for each number.
	var mapping = [ ];

	/*
	 * Loop through the grid data lines to populate the mapping.
	 * The grid numbers start from line 1 up to 'height'.
	 */
	for ( var i = 1 ; i < height + 1 ; i ++ )
	{
		var row = line [ i ] .split ( " " ); // Split the current line into numbers.

		// Iterate through each number in the current row.
		for ( var j = 0 ; j < row .length ; j ++ )
		{
			// Convert the string representation of the number to an actual number.
			var A = Number ( row [ j ] );

			// Store the x (row index) and y (column index + 1) coordinates for number A.
			mapping [ A ] = { "x" : i , "y" : j + 1 };
		}
	}

	// Determine the number of examination queries from the line after the grid data.
	var num_exams = Number ( line [ height + 1 ] );

	// Arrays to store the 'from' and 'to' points for each examination query.
	var from = [ ];
	var to = [ ];

	/*
	 * Populate the 'from' and 'to' arrays based on the examination query lines.
	 * These lines start after the grid data and 'num_exams' declaration.
	 */
	for ( var j = 1 ; j < num_exams + 1 ; j ++ )
	{
		var tmp = line [ height + 1 + j ] .split ( " " ); // Split the current query line.
		from .push ( Number ( tmp [ 0 ] ) );             // Add the 'from' number.
		to .push ( Number ( tmp [ 1 ] ) );               // Add the 'to' number.
	}


	var ans = [ ]; // Array to store the calculated answers for each query.


	// Process each examination query.
	for ( var k = 0 ; k < from .length ; k ++ )
	{
		ans [ k ] = 0; // Initialize the answer for the current query.

		// Calculate the number of segments required to go from 'from' to 'to'.
		var loop = ( to [ k ] - from [ k ] ) / step;

		// Iterate through each segment of the path.
		for ( var l = 0 ; l < loop ; l ++ )
		{
			// Get the coordinates for the current 'from' point in the segment.
			var frompoint = mapping [ from [ k ] + l * step ];

			// Get the coordinates for the current 'to' point in the segment.
			var topoint = mapping [ from [ k ] + ( l + 1 ) * step ];

			// Calculate Manhattan distance for this segment and add to the total answer.
			ans [ k ] += Math .abs ( topoint .x - frompoint .x ) + Math .abs ( topoint .y - frompoint .y );
		}
	}

	// Output the results, joined by newlines.
	console .log ( ans .join ( "\n" ) );
}

/*
 * DO NOT EDIT BELOW THIS LINE.
 * This section handles standard input/output and calls the Main function.
 * It reads the entire input from /dev/stdin, assuming UTF-8 encoding.
 */
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) );