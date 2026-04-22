var data = /* This array stores various configuration parameters. */
/* Each inner array represents a different set of values. */
[
	/* Row 0: Multiplier, Price per unit, Limit */
	[ 500 * 3 , 850 * 3 * 0.88 , 4 ] ,

	/* Row 1: Multiplier, Price per unit, Limit */
	[ 300 * 4 , 550 * 4 * 0.85 , 5 ] ,

	/* Row 2: Multiplier, Price per unit, Limit */
	[ 200 * 5 , 380 * 5 * 0.8  , 6 ] ,

	/* Row 3: Multiplier, Price per unit, Limit */
	[ 500     , 850          , 11 ] ,

	/* Row 4: Multiplier, Price per unit, Limit */
	[ 300     , 550          , 17 ] ,

	/* Row 5: Multiplier, Price per unit, Limit */
	[ 200     , 380          , 26 ]
] ; // End of data array definition.



// This function calculates the minimum price for a given input value.
var f = function ( input )
{
	var min   = 100000000 ; // Initialize min with a very large number.
	var index = [ 0 , 0 , 0 , 0 , 0 , 0 ] ; // Array to hold loop indices.

	// Begin a series of deeply nested loops.
	// Each loop iterates up to a limit defined in the 'data' array.
	for ( index [ 0 ] = 0 ; index [ 0 ] < data [ 0 ] [ 2 ] ; index [ 0 ] ++ )
	{
		for ( index [ 1 ] = 0 ; index [ 1 ] < data [ 1 ] [ 2 ] ; index [ 1 ] ++ )
		{
			for ( index [ 2 ] = 0 ; index [ 2 ] < data [ 2 ] [ 2 ] ; index [ 2 ] ++ )
			{
				for ( index [ 3 ] = 0 ; index [ 3 ] < data [ 3 ] [ 2 ] ; index [ 3 ] ++ )
				{
					for ( index [ 4 ] = 0 ; index [ 4 ] < data [ 4 ] [ 2 ] ; index [ 4 ] ++ )
					{
						for ( index [ 5 ] = 0 ; index [ 5 ] < data [ 5 ] [ 2 ] ; index [ 5 ] ++ )
						{
							// Initialize current 'g' (sum of multipliers) and 'price' for this combination.
							var g     = 0 ;
							var price = 0 ;

							// Calculate 'g' and 'price' based on current index combination.
							for ( var i = 0 ; i < 6 ; i ++ )
							{
								g     += index [ i ] * data [ i ] [ 0 ] ; // Accumulate 'g'
								price += index [ i ] * data [ i ] [ 1 ] ; // Accumulate 'price'
							}

							// If the calculated 'g' matches the input, update the minimum price.
							if ( g == input )
							{
								min = Math . min ( price , min ) ; // Update min if current price is lower.
							}
						} // End of innermost loop (index[5]).
					} // End of index[4] loop.
				} // End of index[3] loop.
			} // End of index[2] loop.
		} // End of index[1] loop.
	} // End of outermost loop (index[0]).

	return min ; // Return the calculated minimum price.
} ; // End of function f.


var lines = [ ] ; // Array to store input lines from stdin.


process . stdin . resume ( ) ; // Ensure stdin is open.

process . stdin . setEncoding ( 'utf8' ) ; // Set encoding for input data.

// Event listener for 'data' chunks from stdin.
process . stdin . on ( 'data' , function ( chunk )
{
	// Process each line in the chunk.
	chunk . trim ( ) . split ( '\n' ) . forEach ( function ( line )
	{
		lines . push ( line ) ; // Add the processed line to the 'lines' array.
	} ) ;
} ) ; // End of 'data' event handler.

// Event listener for 'end' of stdin stream.
process . stdin . on ( 'end' , function ( )
{
	// Iterate through all collected input lines.
	for ( var i = 0 ; i < lines . length ; i ++ )
	{
		// Parse the line as an integer.
		var e = parseInt ( lines [ i ] . trim ( ) ) ;

		// If input is 0, terminate the program.
		if ( e == 0 )
		{
			return ;
		}

		// Call function 'f' with the parsed input and print the result.
		console . log ( f ( e ) ) ;
	}
} ) ; // End of 'end' event handler.