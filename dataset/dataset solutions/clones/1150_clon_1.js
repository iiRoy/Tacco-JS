try
{
    // Initialize a global logger for output operations.
    var log = console.log;

    // Check if the 'process' object is defined, indicating a Node.js environment.
    if ( typeof process != "undefined" )
    {
        // Variable to accumulate input data from stdin.
        var input = "";

        // Resume stdin to start listening for data.
        process.stdin.resume( );

        // Set the encoding for incoming data to UTF-8.
        process.stdin.setEncoding( 'utf8' );

        // Event listener for incoming data chunks.
        process.stdin.on( 'data', function ( chunk )
        {
            // Append the received chunk to the input string.
            input += chunk;
        } );

        // Event listener for the end of input stream.
        process.stdin.on( 'end', function ( )
        {
            // Split the accumulated input string into an array of lines.
            var lines = input.split( "\n" );

            // Call the main processing function with the parsed lines.
            main( lines );
        } );
    }



    /**
     * Determines if coordinate 'b' is "righter" than coordinate 'a'.
     * 'Righter' is defined by a smaller column index.
     * @param {Array<number>} a - The first coordinate [row, column].
     * @param {Array<number>} b - The second coordinate [row, column].
     * @returns {boolean} True if b's column is less than a's column.
     */
    function isright ( a, b )
    {
        // Returns true if the second element (column index) of b is less than that of a.
        return a[ 1 ] < b[ 1 ];
    }



    /**
     * Determines if coordinate 'b' is "downer" than coordinate 'a'.
     * 'Downer' is defined by a smaller row index.
     * @param {Array<number>} a - The first coordinate [row, column].
     * @param {Array<number>} b - The second coordinate [row, column].
     * @returns {boolean} True if b's row is less than a's row.
     */
    function isdown ( a, b )
    {
        // Returns true if the first element (row index) of b is less than that of a.
        return a[ 0 ] < b[ 0 ];
    }



    /**
     * Calculates the coordinate to the right of the given coordinate.
     * @param {Array<number>} a - The original coordinate [row, column].
     * @returns {Array<number>} A new coordinate [row, column + 1].
     */
    function get_right ( a )
    {
        // Returns a new array representing the coordinate to the immediate right.
        return [ a[ 0 ], a[ 1 ] + 1 ];
    }



    /**
     * Calculates the coordinate below the given coordinate.
     * @param {Array<number>} a - The original coordinate [row, column].
     * @returns {Array<number>} A new coordinate [row + 1, column].
     */
    function get_down ( a )
    {
        // Returns a new array representing the coordinate immediately below.
        return [ a[ 0 ] + 1, a[ 1 ] ];
    }



    /**
     * Checks if a given coordinate 'a' is "subdominant" within a list of "dominant" coordinates.
     * A coordinate is subdominant if there exists a dominant coordinate 'c' such that 'a' is
     * either "downer" than 'c' (if columns are equal) or "righter" than 'c' (if rows are equal).
     * @param {Array<number>} a - The coordinate to check for subdominance.
     * @param {Array<Array<number>>} dominants - A list of dominant coordinates.
     * @returns {boolean} True if 'a' is subdominant, false otherwise.
     */
    function exists_more_dominant ( a, dominants )
    {
        // This function temporarily modifies the dominants array by unshifting/shifting.
        // It determines if 'a' is dominated by any element in 'dominants'.
        var alpha = dominants.unshift( false ); // Add a dummy element to prevent empty array issues with reduce, though it's removed later.

        var ret = dominants.reduce( function ( p, c )
        {
            // If a dominant has already been found, propagate the true value.
            if ( p )
            {
                return p;
            }
            else
            {
                // Check for dominance if columns are equal.
                if ( a[ 1 ] == c[ 1 ] )
                {
                    return isdown( c, a ); // 'c' is downer than 'a' means 'a' is subdominant to 'c' in the same column.
                }

                // Check for dominance if rows are equal.
                if ( a[ 0 ] == c[ 0 ] )
                {
                    return isright( c, a ); // 'c' is righter than 'a' means 'a' is subdominant to 'c' in the same row.
                }

                return p; // No dominance found yet, continue reducing.
            }
        } );

        dominants.shift( ); // Remove the dummy element added earlier.
        return ret;        // Return the final dominance status.
    }



    /**
     * The main function responsible for processing input lines and calculating the maximum area.
     * @param {Array<string>} lines - An array of strings, each representing a line of input.
     */
    function main ( lines )
    {
        // Parse input lines into a 2D array of numbers.
        var lines2 = lines.map( function ( e )
        {
            return e.split( " " ).map( function ( f )
            {
                return Number( f );
            } );
        } );

        // Extract the first line which contains grid dimensions.
        var top_line = lines2.shift( );
        var H        = top_line[ 0 ]; // Height of the grid.
        var W        = top_line[ 1 ]; // Width of the grid.

        var max = -1; // Variable to store the maximum area found, initialized to -1.

        // Initialize a 2D array to store 'n_x' values (rightmost x-coordinate of contiguous 0s).
        var n_x = new Array( H ).fill( 0 ).map( function ( e )
        {
            return new Array( W ).fill( -1 );
        } );

        // Initialize a 2D array to store 'n_y' values (bottommost y-coordinate of contiguous 0s).
        var n_y = new Array( H ).fill( 0 ).map( function ( e )
        {
            return new Array( W ).fill( -1 );
        } );

        // Initialize a 2D array to store 'dom' lists (dominant coordinates for rectangles ending at [h,w]).
        var dom = new Array( H ).fill( 0 ).map( function ( e )
        {
            return new Array( W ).fill( [ ] );
        } );

        // Iterate through each cell of the grid.
        for ( var h = 0; h < H; h ++ )
        {
            for ( var w = 0; w < W; w ++ )
            {
                var val = lines2[ h ][ w ]; // Get the value of the current cell.

                // Determine previous n_x and n_y values from adjacent cells.
                // If at the top edge (h=0), n_n_x is -1. Otherwise, it's from the cell above.
                n_n_x = h == 0 ? -1 : n_x[ h - 1 ][ w ];
                // If at the left edge (w=0), n_n_y is -1. Otherwise, it's from the cell to the left.
                n_n_y = w == 0 ? -1 : n_y[ h ][ w - 1 ];

                // Retrieve the dominant list from the top-left diagonal cell.
                // If at the top or left edge, _dom is an empty array.
                _dom = h == 0 || w == 0 ? [ ] : dom[ h - 1 ][ w - 1 ];

                // Logic based on the cell's value.
                if ( val == 0 )
                {
                    // If the current cell is 0, it can extend a rectangle of 0s.
                    var x_c = [ n_n_x, w ]; // Candidate coordinate for 'x'
                    var y_c = [ h, n_n_y ]; // Candidate coordinate for 'y'

                    // Map the previous dominant coordinates based on current cell's position.
                    n_dom = _dom.map( function ( e )
                    {
                        if ( ! isright( y_c, e ) )
                        {
                            return [ e[ 0 ], n_n_y + 1 ];
                        }
                        if ( ! isdown( x_c, e ) )
                        {
                            return [ n_n_x + 1, e[ 1 ] ];
                        }
                        return e;
                    } );

                    // Add new dominant candidates from current cell.
                    n_dom.push( get_right( y_c ) );
                    n_dom.push( get_down( x_c ) );

                    // Filter out subdominant coordinates from the list.
                    n_dom = n_dom.filter( function ( e )
                    {
                        return ! exists_more_dominant( e, n_dom );
                    } );

                    // Filter out duplicate dominant coordinates.
                    n_dom = n_dom.filter( function ( e, i )
                    {
                        for ( var k = 0; k < i; k ++ )
                        {
                            var o = n_dom[ k ];
                            if ( o[ 0 ] == e[ 0 ] && o[ 1 ] == e[ 1 ] )
                            {
                                return false; // This is a duplicate, filter it out.
                            }
                            else
                            {
                                continue; // Not a duplicate of 'o', continue checking others.
                            }
                        }
                        return true; // No duplicates found for 'e' up to index 'i-1'.
                    } );
                }
                else
                {
                    // If 'val' is 1, it marks the end of any contiguous 0s.
                    // Reset n_n_x, n_n_y to current cell coordinates, and clear n_dom.
                    n_n_x = h;
                    n_n_y = w;
                    n_dom = [ ];
                }

                // Update the grid state for the current cell.
                dom[ h ][ w ] = n_dom;
                n_x[ h ][ w ] = n_n_x;
                n_y[ h ][ w ] = n_n_y;

                // Calculate the maximum area ending at the current cell.
                var maxs = [ -1 ]; // Initialize with -1 to handle empty n_dom gracefully with Math.max.
                n_dom.forEach( function ( e )
                {
                    // Calculate height and width of the rectangle.
                    var hei = h - e[ 0 ] + 1;
                    var wid = w - e[ 1 ] + 1;
                    maxs.push( hei * wid ); // Add the area to the list of possible areas.
                } );

                // Find the maximum area among those ending at this cell.
                var m = Math.max.apply( this, maxs );

                // Update the global maximum area if a larger one is found.
                if ( m > max )
                {
                    max = m;
                }
            }
        }

        // Output the final maximum area found across the entire grid.
        log( max );
    }
}
catch ( e )
{
    // Catch and log any errors that occur during execution.
    log( e );
}