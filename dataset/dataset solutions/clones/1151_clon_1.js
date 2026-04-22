/*
 * This JavaScript code processes a 2D grid of numbers to find the maximum area
 * of a rectangle composed entirely of '0's.
 * It uses dynamic programming principles to track 'dominant' points and
 * calculate rectangle dimensions.
 */

/* Global logger reference, for convenience */
var log = console.log;

/* Check if running in a Node.js-like environment to handle input */
if ( typeof process != "undefined" )
{
    /* Initialize an empty string to accumulate input data */
    var input = "";

    /* Resume standard input stream */
    process.stdin.resume( );

    /* Set encoding for incoming data */
    process.stdin.setEncoding( 'utf8' );

    /* Event listener for 'data' chunks from stdin */
    process.stdin.on(
        'data',
        function( chunk )
        {
            input += chunk; /* Append chunk to input string */
        }
    );

    /* Event listener for 'end' of stdin stream */
    process.stdin.on(
        'end',
        function( )
        {
            /* Split the accumulated input into an array of lines */
            var lines = input.split( "\n" );

            /* Call the main processing function with the parsed lines */
            main( lines );
        }
    );
}

// -----------------------------------------------------------------------------
// Helper functions for geometric comparisons and calculations
// -----------------------------------------------------------------------------

/**
 * Determines if point 'b' is "righter" than point 'a'.
 * (Based on column index comparison).
 * @param {Array<number>} a - The first point [row, col].
 * @param {Array<number>} b - The second point [row, col].
 * @returns {boolean} True if b's column is greater than a's column.
 */
function isright( a, b )
{
	return a[1] < b[1]; // b is righter if its column index is larger
}

/**
 * Determines if point 'b' is "downer" than point 'a'.
 * (Based on row index comparison).
 * @param {Array<number>} a - The first point [row, col].
 * @param {Array<number>} b - The second point [row, col].
 * @returns {boolean} True if b's row is greater than a's row.
 */
function isdown( a, b )
{
	return a[0] < b[0]; // b is downer if its row index is larger
}

/**
 * Calculates the point immediately to the right of 'a'.
 * @param {Array<number>} a - The reference point [row, col].
 * @returns {Array<number>} A new point [row, col+1].
 */
function get_right( a )
{
	return [ a[0], a[1] + 1 ]; // Return point with same row, next column
}

/**
 * Calculates the point immediately below 'a'.
 * @param {Array<number>} a - The reference point [row, col].
 * @returns {Array<number>} A new point [row+1, col].
 */
function get_down( a )
{
	return [ a[0] + 1, a[1] ]; // Return point with next row, same column
}

/**
 * Checks if point 'a' is "subdominant" within a given list of 'dominants'.
 * A point 'a' is subdominant if there exists another point 'c' in 'dominants'
 * such that 'c' dominates 'a' (i.e., 'c' is to the left or above 'a'
 * while sharing a coordinate).
 * This function modifies the 'dominants' array temporarily by adding/removing
 * a dummy element.
 * @param {Array<number>} a - The point to check for subdominance [row, col].
 * @param {Array<Array<number>>} dominants - A list of dominant points.
 * @returns {boolean} True if 'a' is subdominant, false otherwise.
 */
function exists_more_dominant( a, dominants )
{
	/*
	 * This logic appears to use unshift/shift to simulate adding a dummy
	 * element and then removing it, possibly to handle edge cases or for
	 * a specific functional programming style. The 'alpha' variable is unused.
	 */
	var alpha = dominants.unshift( false ); // Add dummy element, alpha gets new length

	var ret = dominants.reduce( ( p, c ) =>
	{
		if ( p )
		{
			return p; // If already found a dominant, keep returning true
		}
		else
		{
			// Check for dominance if points share a column
			if ( a[1] == c[1] )
			{
				return isdown( c, a ); // Is 'c' above 'a'? (i.e., c[0] < a[0])
			}

			// Check for dominance if points share a row
			if ( a[0] == c[0] )
			{
				return isright( c, a ); // Is 'c' to the left of 'a'? (i.e., c[1] < a[1])
			}

			return p; // No dominance found yet, continue
		}
	} );

	dominants.shift( ); // Remove the dummy element added earlier

	return ret; // Return the result of the dominance check
}


// -----------------------------------------------------------------------------
// Main function to process the grid and find the largest rectangle of zeros
// -----------------------------------------------------------------------------

/**
 * Main function that processes input lines representing a grid
 * and calculates the maximum area of a rectangle consisting of '0's.
 * @param {Array<string>} lines - An array of strings, where the first
 *                                contains H and W, and subsequent lines
 *                                represent rows of the grid.
 */
function main( lines )
{
	/* Parse input lines into a 2D array of numbers */
	var lines2 = lines.map( e => e.split( " " ).map( f => Number( f ) ) );

	/* Extract grid dimensions from the first line */
	var top_line = lines2.shift( );
	var H        = top_line[0]; // Height of the grid
	var W        = top_line[1]; // Width of the grid

	/* Initialize maximum area found so far */
	var max = -1;

	/*
	 * Initialize 2D arrays for dynamic programming:
	 * n_x[h][w]: Stores the row index of the nearest '1' to the top of (h,w),
	 *            or -1 if all cells above are '0's. This helps define height.
	 * n_y[h][w]: Stores the column index of the nearest '1' to the left of (h,w),
	 *            or -1 if all cells to the left are '0's. This helps define width.
	 * dom[h][w]: Stores a list of "dominant" points for the rectangle ending at (h,w).
	 *            A dominant point (r,c) signifies a potential top-left corner
	 *            of a rectangle of '0's ending at (h,w).
	 */
	var n_x = new Array( H ).fill( 0 ).map( e => new Array( W ).fill( -1 ) );
	var n_y = new Array( H ).fill( 0 ).map( e => new Array( W ).fill( -1 ) );
	var dom = new Array( H ).fill( 0 ).map( e => new Array( W ).fill( [ ] ) );

	/* Iterate through each cell of the grid */
	for ( var h = 0 ; h < H ; h++ )
	{
		for ( var w = 0 ; w < W ; w++ )
		{
			var val = lines2[h][w]; // Current cell value (0 or 1)

			/*
			 * Calculate potential n_n_x (nearest '1' row from top)
			 * and n_n_y (nearest '1' col from left) based on previous cells.
			 * If h=0, n_n_x is -1 (no '1' above yet).
			 * If w=0, n_n_y is -1 (no '1' left yet).
			 */
			var n_n_x = h == 0 ? -1 : n_x[h-1][w];
			var n_n_y = w == 0 ? -1 : n_y[h][w-1];

			/*
			 * Retrieve dominant points from the diagonally upper-left cell.
			 * This forms the base for calculating new dominant points for the current cell.
			 * If h=0 or w=0, there's no diagonal predecessor, so start with an empty list.
			 */
			var _dom = h == 0 || w == 0 ? [ ] : dom[h-1][w-1];

			/* --- Logic for current cell value (val) --- */

			if ( val == 0 )
			{
				/* If the current cell is '0', it can extend a rectangle. */

				var x_c = [ n_n_x, w ]; // "x-coordinate constraint" point
				var y_c = [ h, n_n_y ]; // "y-coordinate constraint" point

				/*
				 * Transform dominant points from _dom based on current cell's constraints.
				 * Each dominant point 'e' from _dom is updated.
				 * If y_c is not "righter" than 'e', update 'e's column using n_n_y+1.
				 * If x_c is not "downer" than 'e', update 'e's row using n_n_x+1.
				 * This effectively "pushes" dominant points past the latest '1' encountered.
				 */
				var n_dom = _dom.map( e =>
				{
					if ( !isright( y_c, e ) )
					{
						return [ e[0], n_n_y + 1 ];
					}
					if ( !isdown( x_c, e ) )
					{
						return [ n_n_x + 1, e[1] ];
					}
					return e; // No change needed
				} );

				/* Add new dominant points derived from the current cell's position. */
				n_dom.push( get_right( y_c ) ); // Point to the right of the y-constraint
				n_dom.push( get_down( x_c ) );  // Point below the x-constraint

				/*
				 * Filter out subdominant points.
				 * A point is subdominant if another point in the list dominates it.
				 * This ensures we only keep truly "dominant" (top-leftmost) points.
				 */
				n_dom = n_dom.filter(
					e =>
					!exists_more_dominant( e, n_dom )
				);

				/*
				 * Filter out duplicate dominant points.
				 * This loop iterates and checks for equality with previously processed
				 * unique elements in the filtered array.
				 */
				n_dom = n_dom.filter( ( e, i ) =>
				{
					for ( var k = 0 ; k < i ; k++ )
					{
						var o = n_dom[k];
						if ( o[0] == e[0] && o[1] == e[1] )
						{
							return false; // Found a duplicate, remove 'e'
						}
						else
						{
							continue; // Not a duplicate yet, continue checking
						}
					}
					return true; // No duplicate found for 'e', keep it
				} );
			}
			else
			{
				/* If the current cell is '1', it breaks any continuous rectangle. */

				n_n_x = h; // Nearest '1' above is at current row 'h'
				n_n_y = w; // Nearest '1' left is at current column 'w'
				n_dom = [ ]; // No dominant points can end at a '1' cell
			}

			/* Update DP arrays for the current cell (h, w) */
			dom[h][w] = n_dom;
			n_x[h][w] = n_n_x;
			n_y[h][w] = n_n_y;

			/*
			 * Calculate potential rectangle areas ending at (h, w)
			 * using the newly computed dominant points.
			 */
			var maxs = [ -1 ]; // Initialize with -1 to handle empty n_dom or negative areas

			n_dom.forEach( e =>
			{
				var hei = h - e[0] + 1; // Height of rectangle from dominant point 'e' to (h,w)
				var wid = w - e[1] + 1; // Width of rectangle from dominant point 'e' to (h,w)
				maxs.push( hei * wid ); // Add calculated area
			} );

			/* Find the maximum area among candidates for the current cell */
			var m = Math.max.apply( this, maxs );

			/* Update overall maximum area if a larger one is found */
			if ( m > max )
			{
				max = m;
			}
		}
	}

	/* Output the final maximum area found */
	log( max );
}