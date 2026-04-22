// This JavaScript code processes input from standard input.
// It reads data to perform some calculations.

r = require("fs") . readFileSync(
    "/dev/stdin" ,  // Path to the input file
    "utf8"         // Encoding for reading the file
) . split( "\n" ) ; // Split the content by newline characters

// Initialize variables for processing the input.
n = parseInt( r[0] , 10 ) ; // Parse the first line as an integer, base 10.

v = { } ; // Create an empty object to store data for 'v'.

// Loop 'n' times to populate the 'v' object.
for ( i = 0 ; i < n ; i ++ )
{
    // Retrieve the current line and split it by space.
    tmp = r[ 1 + i ] . split ( " " ) ;

    // Initialize an empty object for v[i].
    v [ i ] = { } ;

    // Store the first part of the split line as an integer in v[i][0].
    v [ i ] [ 0 ] = parseInt ( tmp [ 0 ] , 10 ) ;
    // Store the second part of the split line as an integer in v[i][1].
    v [ i ] [ 1 ] = parseInt ( tmp [ 1 ] , 10 ) ;
}

// Increment 'i' and parse the next line as an integer 'q'.
q = parseInt ( r[ ++ i ] ) ;

// Create another empty object to store data for 'v2'.
v2 = { } ;

// Loop 'q' times to populate the 'v2' object.
for ( j = 0 ; j < q ; j ++ )
{
    // Retrieve the current line from input and split it by space.
    tmp = r [ 1 + i + j ] . split ( " " ) ;

    // Initialize an empty object for v2[j].
    v2 [ j ] = { } ;

    // Store the first part of the split line (minus 1) as an integer in v2[j][0].
    v2 [ j ] [ 0 ] = parseInt ( tmp [ 0 ] , 10 ) - 1 ;
    // Store the second part of the split line as an integer in v2[j][1].
    v2 [ j ] [ 1 ] = parseInt ( tmp [ 1 ] , 10 ) ;
}

// Main processing loop for each query.
for ( i = 0 ; i < q ; i ++ )
{
    // Get the initial 'x' value from v2.
    x = v2 [ i ] [ 0 ] ;
    // Get the limit 'L' value from v2.
    L = v2 [ i ] [ 1 ] ;

    // Initialize 'val' for the current query.
    val = 0 ;

    // Inner loop for calculation.
    // 'w' accumulates values, 'x' is right-shifted in each iteration.
    for ( w = 0 ; w <= L ; x >>= 1 )
    {
        // Add v[x][1] to 'w'.
        w += v [ x ] [ 1 ] ;

        // If 'w' is still within the limit 'L', add v[x][0] to 'val'.
        if ( w <= L )
        {
            val += v [ x ] [ 0 ] ;
        }

        // If 'x' becomes 0, break out of this inner loop.
        if ( x == 0 )
        {
            break ;
        }
    }

    // Output the calculated 'val' for the current query.
    console . log ( val ) ;
}

// End of script.