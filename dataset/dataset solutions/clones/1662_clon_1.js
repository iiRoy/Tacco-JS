function       Main( input )
 {
    // This is the main function that processes the input data.

    input = input
        .trim() // Remove leading/trailing whitespace from the input string.
        .split( "\n" ) // Split the input string into an array of lines.
        .map( function( x ) { /* Map each line to an array of strings split by space. */ return x.split( " " ) } ) ;


    // Parse the number of entries from the first line.
    let N = parseInt( input[ 0 ][ 0 ], 10 ) ;

    // Initialize an array to store the parsed X, Y coordinates and direction.
    let arr_XYU = [ ] ;

    // Loop through the input lines to populate arr_XYU.
    for ( let i = 0 ; i < N ; i++ )
    {
        /*
         * Each entry consists of X, Y coordinates and a direction character.
         * The coordinates are parsed as integers.
         */
        arr_XYU.push( [
            parseInt( input[ i + 1 ][ 0 ], 10 ), // X coordinate
            parseInt( input[ i + 1 ][ 1 ], 10 ), // Y coordinate
            input[ i + 1 ][ 2 ]                  // Direction (U, D, L, R)
        ] ) ;
    }



    // --- First sorting and processing block ---
    // Sort arr_XYU based on (X + Y) sum, then by X coordinate.
    arr_XYU.sort( function( a, b )
    {
        // Compare sums (a[0] + a[1]) vs (b[0] + b[1])
        if ( ( a[ 0 ] + a[ 1 ] ) < ( b[ 0 ] + b[ 1 ] ) )
            return -1 ; // a comes before b
        if ( ( a[ 0 ] + a[ 1 ] ) > ( b[ 0 ] + b[ 1 ] ) )
            return 1 ;  // b comes before a

        // If sums are equal, compare X coordinates
        if ( a[ 0 ] < b[ 0 ] )
            return -1 ;
        if ( a[ 0 ] > b[ 0 ] )
            return 1 ;

        return 0 ; // Elements are considered equal
    } ) ;


    // Initialize temporary variables for the first pass.
    let tmp1 = -1 ;          // Stores the current (X+Y) sum or similar grouping value.
    let tmp2 ;               // Stores a coordinate for distance calculation.
    let tmp3 = Infinity ;    // Stores the minimum distance found, initialized to infinity.
    let tmpAngle = 'U' ;     // Stores a directional state.

    // Iterate through the sorted array for the first set of collision checks.
    for ( let i = 0 ; i < arr_XYU.length ; i++ )
    {
        // Check if the current (X+Y) sum is the same as the previous one.
        if ( tmp1 === ( arr_XYU[ i ][ 0 ] + arr_XYU[ i ][ 1 ] ) )
        {
            // If the angle state is 'R'
            if ( tmpAngle === 'R' )
            {
                // If current direction is 'U'
                if ( arr_XYU[ i ][ 2 ] === 'U' )
                {
                    tmpAngle = 'U' ; // Change state
                    // Calculate and update minimum distance (multiplied by 10).
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[ i ][ 0 ] - tmp2 ) * 10 ) ;
                }
                // If current direction is 'R'
                else if ( arr_XYU[ i ][ 2 ] === 'R' )
                {
                    tmp2 = arr_XYU[ i ][ 0 ] ; // Update coordinate.
                }
            }
            // If the angle state is not 'R'
            else
            {
                // If current direction is 'R'
                if ( arr_XYU[ i ][ 2 ] === 'R' )
                {
                    tmpAngle = 'R' ; // Change state
                    tmp2 = arr_XYU[ i ][ 0 ] ; // Update coordinate.
                }
            }
        }
        // If the current (X+Y) sum is different from the previous one.
        else
        {
            tmp1 = arr_XYU[ i ][ 0 ] + arr_XYU[ i ][ 1 ] ; // Update the grouping value.

            // Set initial state based on current direction.
            if ( arr_XYU[ i ][ 2 ] === 'R' )
            {
                tmpAngle = 'R' ;
                tmp2 = arr_XYU[ i ][ 0 ] ;
            }
            else
            {
                tmpAngle = 'U' ;
            }
        }
    }
    // console.log( arr_XYU, tmp3 ); // Debugging output, commented out.



    // --- Second processing block (similar to first, but with different angles) ---
    // Re-initialize temporary variables for the second pass.
    tmp1 = -1 ;
    tmpAngle = 'L' ; // Different initial angle state.

    // Iterate through the already sorted array (by (X+Y), then X).
    for ( let i = 0 ; i < arr_XYU.length ; i++ )
    {
        if ( tmp1 === ( arr_XYU[ i ][ 0 ] + arr_XYU[ i ][ 1 ] ) )
        {
            if ( tmpAngle === 'D' )
            {
                if ( arr_XYU[ i ][ 2 ] === 'L' )
                {
                    tmpAngle = 'L' ;
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[ i ][ 0 ] - tmp2 ) * 10 ) ;
                }
                else if ( arr_XYU[ i ][ 2 ] === 'D' )
                {
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
            else
            {
                if ( arr_XYU[ i ][ 2 ] === 'D' )
                {
                    tmpAngle = 'D' ;
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[ i ][ 0 ] + arr_XYU[ i ][ 1 ] ;
            if ( arr_XYU[ i ][ 2 ] === 'D' )
            {
                tmpAngle = 'D' ;
                tmp2 = arr_XYU[ i ][ 0 ] ;
            }
            else
            {
                tmpAngle = 'L' ;
            }
        }
    }
    // console.log( arr_XYU, tmp3 ); // Another debugging output.



    // --- Third sorting and processing block ---
    // Sort arr_XYU based on (Y - X) difference, then by X coordinate.
    arr_XYU.sort( function( a, b )
    {
        // Compare differences (a[1] - a[0]) vs (b[1] - b[0])
        if ( ( a[ 1 ] - a[ 0 ] ) < ( b[ 1 ] - b[ 0 ] ) )
            return -1 ;
        if ( ( a[ 1 ] - a[ 0 ] ) > ( b[ 1 ] - b[ 0 ] ) )
            return 1 ;

        // If differences are equal, compare X coordinates
        if ( a[ 0 ] < b[ 0 ] )
            return -1 ;
        if ( a[ 0 ] > b[ 0 ] )
            return 1 ;

        return 0 ;
    } ) ;

    // Re-initialize temporary variables for the third pass.
    tmp1 = Infinity ; // Initial value is Infinity for this pass.
    tmpAngle = 'D' ;

    // Iterate through the newly sorted array.
    for ( let i = 0 ; i < arr_XYU.length ; i++ )
    {
        // Check if the current (Y-X) difference is the same.
        if ( tmp1 === ( arr_XYU[ i ][ 1 ] - arr_XYU[ i ][ 0 ] ) )
        {
            if ( tmpAngle === 'R' )
            {
                if ( arr_XYU[ i ][ 2 ] === 'D' )
                {
                    tmpAngle = 'D' ;
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[ i ][ 0 ] - tmp2 ) * 10 ) ;
                }
                else if ( arr_XYU[ i ][ 2 ] === 'R' )
                {
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
            else
            {
                if ( arr_XYU[ i ][ 2 ] === 'R' )
                {
                    tmpAngle = 'R' ;
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[ i ][ 1 ] - arr_XYU[ i ][ 0 ] ;

            if ( arr_XYU[ i ][ 2 ] === 'R' )
            {
                tmpAngle = 'R' ;
                tmp2 = arr_XYU[ i ][ 0 ] ;
            }
            else
            {
                tmpAngle = 'D' ;
            }
        }
    }
    // console.log( arr_XYU, tmp3 ); // Another debugging point.



    // --- Fourth processing block (similar to third, different angles) ---
    // Re-initialize temporary variables for the fourth pass.
    tmp1 = Infinity ;
    tmpAngle = 'L' ;

    // Iterate through the array (still sorted by (Y-X), then X).
    for ( let i = 0 ; i < arr_XYU.length ; i++ )
    {
        if ( tmp1 === ( arr_XYU[ i ][ 1 ] - arr_XYU[ i ][ 0 ] ) )
        {
            if ( tmpAngle === 'U' )
            {
                if ( arr_XYU[ i ][ 2 ] === 'L' )
                {
                    tmpAngle = 'L' ;
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[ i ][ 0 ] - tmp2 ) * 10 ) ;
                }
                else if ( arr_XYU[ i ][ 2 ] === 'U' )
                {
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
            else
            {
                if ( arr_XYU[ i ][ 2 ] === 'U' )
                {
                    tmpAngle = 'U' ;
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[ i ][ 1 ] - arr_XYU[ i ][ 0 ] ;
            if ( arr_XYU[ i ][ 2 ] === 'U' )
            {
                tmpAngle = 'U' ;
                tmp2 = arr_XYU[ i ][ 0 ] ;
            }
            else
            {
                tmpAngle = 'L' ;
            }
        }
    }
    // console.log( arr_XYU, tmp3 ); // Debugging.



    // --- Fifth sorting and processing block ---
    // Sort arr_XYU primarily by X coordinate, then by Y coordinate.
    arr_XYU.sort( function( a, b )
    {
        // Compare X coordinates first.
        if ( a[ 0 ] < b[ 0 ] )
            return -1 ;
        if ( a[ 0 ] > b[ 0 ] )
            return 1 ;

        // If X coordinates are equal, compare Y coordinates.
        if ( a[ 1 ] < b[ 1 ] )
            return -1 ;
        if ( a[ 1 ] > b[ 1 ] )
            return 1 ;

        return 0 ;
    } ) ;

    // Re-initialize temporary variables for the fifth pass.
    tmp1 = -1 ;
    tmpAngle = 'D' ;

    // Iterate through the array sorted by X, then Y.
    for ( let i = 0 ; i < arr_XYU.length ; i++ )
    {
        // Check if the current X coordinate is the same.
        if ( tmp1 === ( arr_XYU[ i ][ 0 ] ) )
        {
            if ( tmpAngle === 'U' )
            {
                if ( arr_XYU[ i ][ 2 ] === 'D' )
                {
                    tmpAngle = 'D' ;
                    // Distance calculation (multiplied by 5).
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[ i ][ 1 ] - tmp2 ) * 5 ) ;
                }
                else if ( arr_XYU[ i ][ 2 ] === 'U' )
                {
                    tmp2 = arr_XYU[ i ][ 1 ] ;
                }
            }
            else
            {
                if ( arr_XYU[ i ][ 2 ] === 'U' )
                {
                    tmpAngle = 'U' ;
                    tmp2 = arr_XYU[ i ][ 1 ] ;
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[ i ][ 0 ] ;

            if ( arr_XYU[ i ][ 2 ] === 'U' )
            {
                tmpAngle = 'U' ;
                tmp2 = arr_XYU[ i ][ 1 ] ;
            }
            else
            {
                tmpAngle = 'D' ;
            }
        }
    }
    // console.log( arr_XYU, tmp3 ); // Debugging output for this section.



    // --- Sixth sorting and processing block ---
    // Sort arr_XYU primarily by Y coordinate, then by X coordinate.
    arr_XYU.sort( function( a, b )
    {
        // Compare Y coordinates first.
        if ( a[ 1 ] < b[ 1 ] )
            return -1 ;
        if ( a[ 1 ] > b[ 1 ] )
            return 1 ;

        // If Y coordinates are equal, compare X coordinates.
        if ( a[ 0 ] < b[ 0 ] )
            return -1 ;
        if ( a[ 0 ] > b[ 0 ] )
            return 1 ;

        return 0 ;
    } ) ;

    // Re-initialize temporary variables for the sixth and final pass.
    tmp1 = -1 ;
    tmpAngle = 'L' ;

    // Iterate through the array sorted by Y, then X.
    for ( let i = 0 ; i < arr_XYU.length ; i++ )
    {
        // Check if the current Y coordinate is the same.
        if ( tmp1 === ( arr_XYU[ i ][ 1 ] ) )
        {
            if ( tmpAngle === 'R' )
            {
                if ( arr_XYU[ i ][ 2 ] === 'L' )
                {
                    tmpAngle = 'L' ;
                    // Distance calculation (multiplied by 5).
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[ i ][ 0 ] - tmp2 ) * 5 ) ;
                }
                else if ( arr_XYU[ i ][ 2 ] === 'R' )
                {
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
            else
            {
                if ( arr_XYU[ i ][ 2 ] === 'R' )
                {
                    tmpAngle = 'R' ;
                    tmp2 = arr_XYU[ i ][ 0 ] ;
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[ i ][ 0 ] ; // Note: This assigns arr_XYU[i][0] to tmp1, not arr_XYU[i][1] as in the if condition. This might be a subtle bug or intentional based on context.

            if ( arr_XYU[ i ][ 2 ] === 'R' )
            {
                tmpAngle = 'R' ;
                tmp2 = arr_XYU[ i ][ 0 ] ;
            }
            else
            {
                tmpAngle = 'L' ;
            }
        }
    }
    // Determine the final answer. If tmp3 is still Infinity, no collision was found.
    let ans = tmp3 === Infinity ? "SAFE" : tmp3 ;
    console.log( ans ) ; // Output the result.
}


// Read input from stdin and call the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;