r   =   require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) . split( "\n" ) ; // Read all lines from standard input

// Parse the number of data entries from the first line.
n   =   parseInt( r[0] , 10 ) ;

// Initialize an empty object 'v' to store the first set of processed data.
v   =   { } ;

/*
 *  Iterate 'n' times to process the subsequent 'n' lines of input.
 *  Each line contains two integer values that are stored in 'v'.
 */
for ( i = 0 ; i < n ; i ++ )
{
    // Split the current line (1-indexed relative to input array 'r') by space.
    tmp = r[ 1 + i ] . split( " " ) ;

    // Initialize an empty object for the current index 'i' in 'v'.
    v[ i ]   =   { } ;

    // Parse the first part of 'tmp' as an integer and store it at index 0 of v[i].
    v[ i ][ 0 ] = parseInt( tmp[ 0 ] , 10 ) ;

    // Parse the second part of 'tmp' as an integer and store it at index 1 of v[i].
    v[ i ][ 1 ] = parseInt( tmp[ 1 ] , 10 ) ;
}

// Parse the number of queries 'q'. Note the post-increment of 'i',
// which advances the input line pointer for subsequent reads.
q   =   parseInt( r[ i ++ ] ) ;

// Initialize another empty object 'v2' to store query parameters.
v2  =   { } ;

/*
 *  Loop 'n' times again to process the next 'n' lines of input.
 *  These lines contain parameters for the queries, stored in 'v2'.
 */
for ( j = 0 ; j < n ; j ++ )
{
    // Split the relevant input line (offset by 1 + the current value of 'i') by space.
    tmp = r[ 1 + i + j ] . split( " " ) ;

    // Initialize an empty object for the current index 'j' in 'v2'.
    v2[ j ] = { } ;

    // Parse the first part of 'tmp', subtract 1, and store it at index 0 of v2[j].
    v2[ j ][ 0 ] = parseInt( tmp[ 0 ] , 10 ) - 1 ;

    // Parse the second part of 'tmp' and store it at index 1 of v2[j].
    v2[ j ][ 1 ] = parseInt( tmp[ 1 ] , 10 ) ;
}

// This is the main loop for processing each of the 'q' queries.
for ( i = 0 ; i < q ; i ++ )
{
    // Extract the starting index 'x' for the current query from v2.
    x   =   v2[ i ][ 0 ] ;

    // Extract the limit 'L' for the current query from v2.
    L   =   v2[ i ][ 1 ] ;

    // Initialize a variable 'val' to accumulate the result for the current query.
    val = 0 ;

    /*
     *  This inner loop performs a calculation based on 'x' and 'L'.
     *  'w' accumulates a weight, and 'x' is continuously right-shifted (divided by 2).
     */
    for ( w = 0 ; w <= L ; x >>= 1 )
    {
        // Add the second component of v[x] to the accumulator 'w'.
        w += v[ x ][ 1 ] ;

        // If the accumulated weight 'w' is still within the limit 'L'...
        if ( w <= L )
        {
            // ...then add the first component of v[x] to 'val'.
            val += v[ x ][ 0 ] ;
        }

        // If 'x' becomes 0, it signifies the end of a traversal or a base condition.
        if ( x == 0 )
        {
            break ; // Exit the inner 'for' loop.
        }
    }
    // Print the final calculated value 'val' for the current query to standard output.
    console.log( val ) ;
}