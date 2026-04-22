/*
 * This JavaScript file processes input data
 * to determine if a set of constraints can be satisfied.
 * It's designed to solve a specific algorithmic problem,
 * likely related to relative positioning or differences between points.
 */
function Main( input )
{
    // The input string is first split into an array of individual lines.
    input = input . split( "\n" );

    // The first line of input typically contains global parameters.
    // It's split by spaces and each part is converted to an integer.
    var M = input[ 0 ] . split( " " ) . map( a => parseInt( a ) );

    // N is extracted as the first element from the parsed M array.
    var N = M[ 0 ];

    // M is then updated to be the second element from the parsed M array.
    M = M[ 1 ];

    // Initialize three empty arrays: L (left points), R (right points), and D (differences).
    // These arrays will store the relations specified in the input.
    var L = [ ], R = [ ], D = [ ];

    // A loop iterates M times to process the M relations provided in the input.
    for ( var i = 0; i < M; i++ )
    {
        // Each relation line (starting from the second line, hence i+1)
        // is parsed similarly to the first line: split by space, convert to integer.
        L[ i ] = input[ i + 1 ] . split( " " ) . map( a => parseInt( a ) );

        // The second element of the parsed line becomes the R[i] value.
        R[ i ] = L[ i ][ 1 ];

        // The third element of the parsed line becomes the D[i] value.
        D[ i ] = L[ i ][ 2 ];

        // The first element of the parsed line becomes the L[i] value.
        // This effectively reassigns L[i] after its temporary use.
        L[ i ] = L[ i ][ 0 ];
    }

    // An array 'x' is created, sized N+1. This array will store the calculated
    // absolute positions or values for each point from 1 to N.
    var x = new Array( N + 1 );

    // The answer is initially assumed to be "Yes". It will change to "No" if
    // any inconsistency is found during the processing.
    var ans = "Yes";

    // Declare loop variables: i, j, k. 'i' is initialized for the main outer loop.
    var i = L . length - 1, j, k;

    // 'ary' is a temporary array used as a queue/stack to manage points that need
    // further processing to propagate their values to related points.
    var ary = [ ];

    // This label allows breaking out of multiple nested loops if an inconsistency is found.
    top:
    // The main processing loop continues as long as there are relations left in L, R, D.
    while ( i >= 0 )
    {
        // Assign initial values to the points L[i] and R[i].
        // L[i] is set to 0 as a reference point.
        x[ L[ i ] ] = 0;
        // R[i] is set to D[i] relative to L[i].
        x[ R[ i ] ] = D[ i ];

        // Add these two points to the 'ary' for propagation.
        ary = [ L[ i ], R[ i ] ];

        // Remove the processed relation from the L, R, D arrays.
        // Using pop() here implies processing from the end of the arrays.
        L . pop( );
        R . pop( );
        D . pop( );

        // Initialize 'j' with the current number of elements in 'ary'.
        j = 2; // Since two elements were just added.

        // This inner loop processes all points currently in 'ary'.
        while ( j )
        {
            // Get the last element from 'ary' to process.
            k = ary[ j - 1 ];
            ary . pop( ); // Remove it from 'ary' as it's being processed.

            // Find the first occurrence of 'k' in the L array.
            i = L . findIndex( a => a === k );
            // This loop processes all relations where 'k' is a left point.
            while ( i >= 0 )
            {
                // Check if the right point (R[i]) in this relation already has a calculated value.
                if ( x[ R[ i ] ] !== undefined )
                {
                    // If it does, verify consistency: x[R[i]] must equal x[L[i]] + D[i].
                    if ( x[ R[ i ] ] !== x[ L[ i ] ] + D[ i ] )
                    {
                        // If inconsistent, set ans to "No" and immediately break all loops.
                        ans = "No";
                        break top;
                    }
                }
                else // If x[R[i]] is not yet defined, calculate and set its value.
                {
                    x[ R[ i ] ] = x[ L[ i ] ] + D[ i ];
                    ary . push( R[ i ] ); // Add R[i] to 'ary' for further propagation.
                }
                // Remove the processed relation from L, R, D.
                L . splice( i, 1 );
                R . splice( i, 1 );
                D . splice( i, 1 );

                // Find the next occurrence of 'k' in L to continue processing.
                i = L . findIndex( a => a === k );
            }

            // Find the first occurrence of 'k' in the R array.
            i = R . findIndex( a => a === k );
            // This loop processes all relations where 'k' is a right point.
            while ( i >= 0 )
            {
                // Check if the left point (L[i]) in this relation already has a calculated value.
                if ( x[ L[ i ] ] !== undefined )
                {
                    // If it does, verify consistency: x[L[i]] must equal x[R[i]] - D[i].
                    if ( x[ L[ i ] ] !== x[ R[ i ] ] - D[ i ] )
                    {
                        // If inconsistent, set ans to "No" and immediately break all loops.
                        ans = "No";
                        break top;
                    }
                }
                else // If x[L[i]] is not yet defined, calculate and set its value.
                {
                    x[ L[ i ] ] = x[ R[ i ] ] - D[ i ];
                    ary . push( L[ i ] ); // Add L[i] to 'ary' for further propagation.
                }
                // Remove the processed relation from L, R, D.
                L . splice( i, 1 );
                R . splice( i, 1 );
                D . splice( i, 1 );

                // Find the next occurrence of 'k' in R to continue processing.
                i = R . findIndex( a => a === k );
            }
            // Update 'j' to reflect the current number of elements in 'ary' after processing 'k'.
            j = ary . length;
        }
        // After an 'ary' is exhausted, reset 'i' for the next iteration of the main loop.
        // This makes sure the main loop continues as long as there are any relations left.
        i = L . length - 1;
    }

    // Finally, print the determined answer to the console.
    console . log( ans );
}

// This line reads the input from standard input (typically a file in competitive programming contexts)
// and passes it as a string to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );