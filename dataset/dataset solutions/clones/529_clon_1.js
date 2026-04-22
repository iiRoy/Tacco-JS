function   main ( )
{ // This is the main function where the program logic resides.

	var   n   =   scan ( ) ;  /* Read the first input value. It represents 'n'. */
	var   m   =   scan ( ) ; /* Read the second input value, representing 'm'. */


	var   e   =   [ ] ; // Initialize an empty array 'e' for storing edges.
	var   f   =   [ ] ; // Initialize another empty array 'f' for storing special edges.


	// Loop 'm' times to process each input string.
	rep ( m ,   function ( )
	{
		var   s   =   scan ( 'string' ) ; // Read an input string.

		// Split the string 's' by various operators to extract numeric parts.
		var   p   =   s . split ( /<=|>=|\*|\+|-/ ) ;

		// Convert string parts to numbers and adjust their values.
		p [ 0 ]   =   + p [ 0 ]   -   1 ; // Decrement the first part.
		p [ 1 ]   =   + p [ 1 ]   -   1 ; // Decrement the second part.
		p [ 2 ]   =   + p [ 2 ] ;         // Convert the third part to a number.


		var   u ; // Declare variable 'u'.

		// Determine the value of 'u' based on the presence of '*' in 's'.
		if ( s . indexOf ( '*' )   !==   -1 )
		{
			u   =   2 ; // If '*' is present, set 'u' to 2.
		}
		else
		{
			// Otherwise, determine 'u' based on the presence of '<='.
			u   =   + ( s . indexOf ( '<=' )   ===   -1 ) ;
		}


		var   v   =   + ( s . indexOf ( '+' )   ===   -1 ) ; // Determine 'v' based on the presence of '+'.


		// Conditional logic based on the values of 'u' and 'v'.
		if ( u   ==   0 )
		{
			if ( v   ==   0 )
			{
				e [ e . length ]   =   [ p [ 1 ] ,   p [ 0 ] ,   - p [ 2 ] ] ; // Add edge to 'e'.
			}
			else
			{
				e [ e . length ]   =   [ p [ 1 ] ,   p [ 0 ] ,   0 ] ; // Add first edge to 'e'.
				e [ e . length ]   =   [ p [ 0 ] ,   p [ 1 ] ,   p [ 2 ] ] ; // Add second edge to 'e'.
			}
		}
		else   if ( u   ==   1 )
		{
			if ( v   ==   0 )
			{
				e [ e . length ]   =   [ p [ 0 ] ,   p [ 1 ] ,   - p [ 2 ] ] ; // Add edge to 'e'.
			}
			else
			{
				e [ e . length ]   =   [ p [ 1 ] ,   p [ 0 ] ,   p [ 2 ] ] ; // Add first edge to 'e'.
				e [ e . length ]   =   [ p [ 0 ] ,   p [ 1 ] ,   0 ] ; // Add second edge to 'e'.
			}
		}
		else // This block handles the case where u is 2.
		{
			if ( v   ==   0 )
			{
				// Add a pair of edges to 'f'.
				f [ f . length ]   =   [ [ p [ 0 ] ,   p [ 1 ] ,   - p [ 2 ] ] ,   [ p [ 1 ] ,   p [ 0 ] ,   - p [ 2 ] ] ] ;
			}
			else
			{
				e [ e . length ]   =   [ p [ 1 ] ,   p [ 0 ] ,   p [ 2 ] ] ; // Add first edge to 'e'.
				e [ e . length ]   =   [ p [ 0 ] ,   p [ 1 ] ,   p [ 2 ] ] ; // Add second edge to 'e'.
			}
		}
	} ) ; /* End of the rep loop for processing input strings. */


	var ans   =   - Infinity ; // Initialize 'ans' to negative infinity.

	// Iterate through all possible combinations for elements in 'f'.
	rep ( 1   <<   f . length ,   function ( comb )
	{
		// Create a copy of 'e' for the current combination.
		var   g   =   [ ] . concat ( e ) ;

		// Add specific edges from 'f' based on the current combination 'comb'.
		rep ( f . length ,   function ( i )
		{
			g [ g . length ]   =   f [ i ] [ ( comb   >>   i )   &   1 ] ;
		} ) ;


		var   d   =   [ ] ; // Initialize array 'd' for distances.
		// Initialize all distances to Infinity.
		rep ( n ,   function ( i )
		{
			d [ i ]   =   Infinity ;
		} ) ;
		d [ 0 ]   =   0 ; // Set the distance of the starting node (node 0) to 0.


		// Bellman-Ford algorithm to find shortest paths.
		// Iterate 'n' times.
		rep ( n ,   function ( i )
		{
			// Iterate through all edges in 'g'.
			rep ( g . length ,   function ( j )
			{
				var   edge   =   g [ j ] ; // Get the current edge.
				// Relax the edge: update distance if a shorter path is found.
				d [ edge [ 1 ] ]   =   Math . min ( d [ edge [ 0 ] ]   +   edge [ 2 ] ,   d [ edge [ 1 ] ] ) ;
			} ) ;
		} ) ;

		// If the distance to node 0 is non-negative after 'n' iterations,
		// it means there's no negative cycle reachable from node 0.
		if ( d [ 0 ]   >=   0 )
		{
			// Update 'ans' with the maximum distance to node (n-1) found so far.
			ans   =   Math . max ( ans ,   d [ n   -   1 ] ) ;
		}
	} ) ; /* End of the loop for combinations. */


	// Output the final answer based on its value.
	if ( ans   ==   Infinity )
	{
		print ( 'inf' ) ; // If ans is Infinity, print 'inf'.
	}
	else   if ( ans   ==   - Infinity )
	{
		print ( -1 ) ; // If ans is -Infinity, print -1.
	}
	else
	{
		print ( ans ) ; // Otherwise, print the calculated answer.
	}
} /* End of the main function. */


function   rep ( a ,   b ,   c )
{
	// This function serves as a flexible loop utility.
	// It can be called with two or three arguments.
	if ( c   ==   null )
	{
		c   =   b ; // If 'c' is not provided, 'b' becomes the callback.
		b   =   a ; // And 'a' becomes the loop limit.
		a   =   0 ; // Start the loop from 0.
	}
	for ( var   i   =   a ;   i   <   b ;   ++ i )
	{
		c ( i ) ; // Execute the callback function with the current index 'i'.
	}
} /* End of rep function. */


// --- Global Input/Output Setup ---

// Resume standard input stream.
process . stdin . resume ( ) ;
// Set the encoding for standard input.
process . stdin . setEncoding ( 'utf8' ) ;

var   input   =   '' ; // Global variable to accumulate input data.
var   input_index   =   0 ; // Global index to track current position in parsed input.


function   scan ( type )
{
	// This function reads the next token from the input.
	if ( type   ===   'string' )
	{
		return   input [ input_index ++ ] ; // Return as string and advance index.
	}
	else
	{
		return   + input [ input_index ++ ] ; // Convert to number, return, and advance index.
	}
}


function   print ( val )
{
	// This function prints a value to the console.
	console . log ( val ) ;
}


// Event listener for incoming data on standard input.
process . stdin . on ( 'data' ,   function ( chunk )
{
	input   +=   chunk ; // Append received data chunk to the 'input' string.
} ) ;

// Event listener for the end of standard input stream.
process . stdin . on ( 'end' ,   function ( )
{
	// Split the accumulated input string by whitespace characters.
	input   =   input . split ( /\s+/ ) ;
	main ( ) ; // Call the main function to start program execution.
} ) ;