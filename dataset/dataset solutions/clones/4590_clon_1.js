/*
 * This function processes the input data provided.
 * The 'input' parameter contains the entire raw input string.
 */
function Main ( input )
{
	// Split the input string by newline characters to get an array of lines.
	input = input.split ( "\n" ) ;

	// The first line of input contains the three numbers, space-separated.
	var line = input[ 0 ].split ( " " ) ;

	// Parse the three numbers from the first line.
	var aa = parseInt ( line[ 0 ] ) ;
	var bb = parseInt ( line[ 1 ] ) ;
	var cc = parseInt ( line[ 2 ] ) ;


	// Create a temporary array to hold the current values of aa, bb, and cc.
	var temp = [ aa , bb , cc ] ;


	// Initialize the answer counter.
	var ans = 0 ;

	// Check if all three numbers are initially equal.
	if ( aa === bb && bb === cc )
	{
		// If they are all equal, check if any of them are odd.
		// If any are odd, no operations are possible to make them equal (and even).
		if ( aa % 2 === 1 || bb % 2 === 1 || cc % 2 === 1 )
		{
			// If they are all equal and odd, the answer remains 0.
			// This block intentionally left blank as per original logic.
		}
		else
		{
			// If they are all equal and even, it's an infinite loop scenario,
			// as applying the operation (sum of two divided by 2) will always
			// result in the same even numbers.
			ans = -1 ;
		}
	}
	else // If the numbers are not initially all equal.
	{
		// Loop until at least one of the numbers becomes odd.
		while ( 1 )
		{
			// This line was commented out in the original, keeping it commented but rephrased.
			/* console.log ( "Current state: ans=" + ans + ", a=" + aa + ", b=" + bb + ", c=" + cc ) ; */

			// Check if any of the current numbers are odd.
			if ( aa % 2 === 1 || bb % 2 === 1 || cc % 2 === 1 )
			{
				// If an odd number is found, we cannot proceed further with the operation.
				break ;
			}
			else
			{
				// All numbers are even; perform the transformation.
				// Store current values in temp before updating.
				temp[ 0 ] = aa ;
				temp[ 1 ] = bb ;
				temp[ 2 ] = cc ;

				// Apply the transformation rule:
				// new_a = (old_b + old_c) / 2
				// new_b = (old_a + old_c) / 2
				// new_c = (old_b + old_a) / 2
				aa = ( temp[ 1 ] + temp[ 2 ] ) / 2 ;
				bb = ( temp[ 0 ] + temp[ 2 ] ) / 2 ;
				cc = ( temp[ 1 ] + temp[ 0 ] ) / 2 ;

				// Increment the operation counter.
				ans ++ ;
			}
		}
	}

	// Output the final calculated answer.
	console.log ( ans ) ;
}


/*
 * Do not modify the code below this line.
 * It handles standard input/output and calls the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;