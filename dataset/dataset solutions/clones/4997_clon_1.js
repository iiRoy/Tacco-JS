/*
 * This file contains the implementation of the Main function,
 * which processes input data according to specific logic.
 * It calculates a 'count' based on conditions involving 'N', 'A', and 'data' array.
 */

function Main ( input )
{
    // Split the input string by newline characters to get individual lines.
    input = input . split ( "\n" ) ;

    // Parse N from the first line of input.
    const N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] , 10 ) ;
    // Parse A from the first line of input.
    const A = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] , 10 ) ;

    // Parse the 'data' array from the second line of input.
    // Each element is split by space and then converted to an integer.
    const data = input [ 1 ] . split ( " " ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

    // Declare a variable 'sum', although it's not used later in the provided logic.
    var sum ;

    // Initialize 'count' to zero. This variable will store the final result.
    var count = 0 ;

    // --- First loop: Check for direct matches with 'A' ---

    // Iterate through the 'data' array from index 0 up to N-1.
    for ( var i = 0 ; i < N ; ++ i )
    {
        // If the current element of 'data' is strictly equal to 'A',
        if ( A === data [ i ] )
        {
            // Increment the 'count'.
            count ++ ;
        }
    }


    // Declare a variable 'mean', also not used in the provided logic.
    var mean ;


    // --- Nested loops: More complex condition checks ---

    // Outer loop iterates 'i' from 0 to N-1.
    for ( var i = 0 ; i < N ; i ++ )
    {
        // Middle loop iterates 'j' from 0 to N-1.
        for ( var j = 0 ; j < N ; j ++ )
        {
            // Inner loop iterates 'k' from 0 to N-1.
            for ( var k = 0 ; k < N ; k ++ )
            {
                // This is a commented-out line, possibly from a previous version or exploration.
                // sum[i][j + 1][k] = (data[k] + data[j]) * (i + 1);

                // Check a complex condition involving 'A', 'data[k]', 'data[j]', and loop variable 'i'.
                if ( ( i + 2 ) * A === ( data [ k ] + data [ j ] ) * ( i + 1 ) )
                {
                    // If the condition is met, increment 'count'.
                    count ++ ;
                }
            }
        }
    }

    // Output the final calculated 'count' to the console.
    console . log ( count ) ;
}

// Call the Main function, reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;