/*
 *  This file contains a JavaScript program.
 *  The primary function, 'Main', processes input data.
 *  A helper function, 'Judge', is used for specific calculations.
 */

// Function to calculate a color value based on coordinates and parameters.
function Judge ( x , y , c , k , tx , ty )
{
	// Initialize the color variable with the input color 'c'.
	var col = c ;

	// Check if the horizontal displacement divided by 'k' is odd.
	// If it is, toggle the color value.
	if ( Math . floor ( ( tx - x ) / k ) % 2 != 0 )
	{
		col ^= 1 ; // XOR with 1 to flip the bit (0 to 1, 1 to 0).
	}

	// Check if the vertical displacement divided by 'k' is odd.
	// If it is, toggle the color value again.
	if ( Math . floor ( ( ty - y ) / k ) % 2 != 0 )
	{
		col ^= 1 ; // Another XOR operation.
	}

	// Return the final calculated color.
	return col ;
}


/*
 * Main function to process the entire input dataset.
 * The 'input' parameter contains all data as a single string.
 */
function Main ( input )
{
	// Split the input string into an array of lines.
	// Each line of the original input becomes an element in the 'input' array.
	input = input . split ( "\n" ) ;


	// Parse the first line to get count (cnt) and 'k' value.
	var tmp = input [ 0 ] . split ( " " ) ;

	// Convert string values to numbers by subtracting 0.
	var cnt = tmp [ 0 ] - 0 ;
	var k = tmp [ 1 ] - 0 ;

	// Initialize arrays to store x-coordinates, y-coordinates, and colors.
	var x = [ ] ;
	var y = [ ] ;
	var c = [ ] ;


	// A variable to store the maximum count found, initialized to 0.
	var ret = 0 ;

	// Loop through the input lines starting from the second line (index 1)
	// to populate the x, y, and c arrays.
	for ( i = 0 ; i < cnt ; i ++ )
	{
		// Split each data line by space.
		tmp = input [ i + 1 ] . split ( " " ) ;

		// Push parsed x and y coordinates into their respective arrays.
		x . push ( tmp [ 0 ] - 0 ) ;
		y . push ( tmp [ 1 ] - 0 ) ;

		// Convert color string ("B" or other) to a numerical representation (0 or 1).
		c . push ( tmp [ 2 ] == "B" ? 0 : 1 ) ;
	}


	// --- Core logic: Iterate through potential starting points and calculate sums ---

	// Outer loop iterating 'cnt' times (based on number of data points).
	for ( i = 0 ; i < cnt ; i ++ )
	{
		// Nested loop iterating 'k' times for horizontal offset 'a'.
		for ( a = 0 ; a < k ; a ++ )
		{
			// Innermost loop iterating 'k' times for vertical offset 'b'.
			for ( b = 0 ; b < k ; b ++ )
			{
				// Initialize sum for the current (a, b) offset combination.
				var sum = 0 ;

				// Loop through all data points (j) to apply the Judge function.
				for ( j = 0 ; j < cnt ; j ++ )
				{
					// Call Judge function with adjusted coordinates and current data point.
					// Add 1 to sum if the judged color matches the actual color (c[j]), else add 0.
					sum += ( Judge ( x [ i ] - a , y [ i ] - b , c [ 0 ] , k , x [ j ] , y [ j ] ) == c [ j ] ) ? 1 : 0 ;
				}

				// If the current sum is greater than the maximum found so far, update 'ret'.
				if ( ret < sum )
				{
					ret = sum ;
				}
			}
		}
	}

	// --- Output the final result ---
	// Print the maximum calculated sum to the console.
	console . log ( '%d' , ret ) ;
}
/*
 * Please do not edit the line below this comment.
 * It handles reading input from standard I/O and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;