/* This script processes input data from stdin to calculate a maximum sum. */
/* It reads numbers, performs combinations, filters duplicates, and finds a specific maximum. */
var input=  require( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' );

// The input string is trimmed and then split into an array of lines.
var Arr = ( input . trim () ) . split ( "\n" );


// Main processing loop: continues until a specific termination condition is met.
while ( true )
{
    // Read the first line of the current data block, representing N and M.
    var nm = Arr . shift () . split ( " " ) . map ( Number );

    // Extract N and M values.
    var n = nm [ 0 ];
    var m = nm [ 1 ];

    // Termination condition: if N and M are both zero, exit the loop.
    if ( n == 0  &&  m == 0 )
    {
        break;
    }

    // Initialize an array to store N numbers.
    var arr = [];

    // Populate 'arr' with N numbers from the input array.
    for ( var i = 0 ;  i < n ;  i ++ )
    {
        arr . push ( Arr . shift () - 0 ); // Convert string to number explicitly.
    }

    // Add a zero to the end of 'arr' for combination purposes.
    arr . push ( 0 );


    /*
     * Generate all possible sums of pairs from the 'arr' array,
     * including sums of an element with itself.
     */
    var Q = [];
    for ( var i = 0 ;  i < arr . length ;  i ++ )
    {
        for ( var j = i ;  j < arr . length ;  j ++ )
        {
            Q . push ( arr [ i ] + arr [ j ] ); // Store the sum of the pair.
        }
    }


    // Sort the array Q in ascending order.
    Q . sort ( function ( a , b ) { return a - b; } );


    // Filter out duplicate values from Q, keeping only unique elements.
    var memo = -1; // Helper variable to track the last seen unique value.
    Q = Q . filter ( function ( v )
    {
        if ( memo != v ) // If the current value is different from the last seen...
        {
            memo = v;    // ...update memo and...
            return v;    // ...include this value in the filtered array.
        }
    } );


    // Initialize 'max' to 0 to store the maximum valid sum found.
    var max = 0;

    /*
     * Iterate through the unique sums in Q to find two sums (Q[i] and Q[j])
     * whose total sum is less than or equal to M, and maximize this total sum.
     */
    for ( var i = 0 ;  i < Q . length ;  i ++ )
    {
        for ( var j = i ;  j < Q . length ;  j ++ )
        {
            var sum = Q [ i ] + Q [ j ]; // Calculate the sum of two unique sums.

            // If the current sum exceeds M, no further sums with Q[i] will be valid
            // because Q is sorted. So, break the inner loop.
            if ( sum > m )
            {
                break;
            }

            // If the current sum is greater than the current maximum, update max.
            if ( max < sum )
            {
                max = sum;
            }
        }
    }

    // Output the calculated maximum sum for the current data block.
    console . log ( max );
} // End of the main processing loop.