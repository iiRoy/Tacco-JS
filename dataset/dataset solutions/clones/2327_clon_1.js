// This program processes input data from standard input.
// It's designed to find the maximum value among a calculated 'ans', and the initial values 'aft' and 'bft'.

function Main( input )
{
    // The input parameter contains all the raw data received.
    // We first split the entire input string by newline characters
    // to process it line by line.
    input = input.split( "\n" ) ;


    // The first line of input (input[0]) is further split by spaces.
    // This assumes that the first line contains two space-separated integers.
    input[ 0 ] = input[ 0 ].split( " " ) ;

    // Parse the first integer from the first line of input.
    // The '10' indicates a base-10 conversion.
    var a = parseInt( input[ 0 ][ 0 ], 10 ) ;
    // Store the original value of 'a' for later comparison.
    var aft = a ;

    // Parse the second integer from the first line of input.
    var b = parseInt( input[ 0 ][ 1 ], 10 ) ;
    // Store the original value of 'b' for later comparison.
    var bft = b ;


    // Initialize two arrays, 'aso' and 'bso', with a large fixed size.
    // These arrays will be used to store prime factor counts for 'a' and 'b' respectively.
    var aso = new Array( 100000 ) ;
    var bso = new Array( 100000 ) ;

    // Initialize 'ans' which will accumulate the product of common/unique factors.
    var ans = 1 ;


    // Initialize the first two elements of 'aso' and 'bso' to zero.
    // Prime factorization typically starts from 2, so indices 0 and 1 are often unused or set to default.
    aso[ 0 ] = 0 ;
    aso[ 1 ] = 0 ;
    bso[ 0 ] = 0 ;
    bso[ 1 ] = 0 ;

    // This loop iterates through potential prime factors from 2 up to 100,000.
    for ( var i = 2 ; i <= 100000 ; i ++ )
    {
        // Initialize factor counts for the current 'i' to zero for both 'a' and 'b'.
        aso[ i ] = 0 ;
        bso[ i ] = 0 ;

        // Inner loop for prime factorization of 'a'.
        // It repeatedly divides 'a' by 'i' as long as 'i' is a factor.
        // The condition 'j < 1' and 'j = 1' is a peculiar way to implement a 'while' loop.
        for ( var j = 0 ; j < 1 ; j )
        {
            // Check if 'i' is a factor of 'a'.
            if ( a % i == 0 )
            {
                // If it is, divide 'a' by 'i' and increment the count for 'i' in 'aso'.
                a = a / i ;
                aso[ i ] += 1 ;
            }
            else
            {
                // If 'i' is no longer a factor, exit this inner loop.
                j = 1 ;
            }
        }

        // Inner loop for prime factorization of 'b', similar to 'a'.
        for ( var j = 0 ; j < 1 ; j )
        {
            // Check if 'i' is a factor of 'b'.
            if ( b % i == 0 )
            {
                // If it is, divide 'b' by 'i' and increment the count for 'i' in 'bso'.
                b = b / i ;
                bso[ i ] += 1 ;
            }
            else
            {
                // If 'i' is no longer a factor, exit this inner loop.
                j = 1 ;
            }
        }
    }


    // After factorizing 'a' and 'b', this loop reconstructs a value based on their factors.
    // It iterates through the same range of potential factors.
    for ( var i = 2 ; i <= 100000 ; i ++ )
    {
        // Case 1: 'i' is a common factor to both 'a' and 'b' (meaning original 'a' and 'b').
        if ( aso[ i ] != 0 && bso[ i ] != 0 )
        {
            // Multiply 'ans' by 'i' for the minimum number of times 'i' appeared in both factorizations.
            for ( var j = 0 ; j < Math.min( aso[ i ], bso[ i ] ) ; j ++ )
            {
                ans *= i ;
            }
        }
        // Case 2: 'i' is a factor only of 'a'.
        else if ( aso[ i ] != 0 )
        {
            // Multiply 'ans' by 'i' for all times 'i' appeared in 'a''s factorization.
            for ( var j = 0 ; j < aso[ i ] ; j ++ )
            {
                ans *= i ;
            }
        }
        // Case 3: 'i' is a factor only of 'b'.
        else if ( bso[ i ] != 0 )
        {
            // Multiply 'ans' by 'i' for all times 'i' appeared in 'b''s factorization.
            for ( var j = 0 ; j < bso[ i ] ; j ++ )
            {
                ans *= i ;
            }
        }
    }


    // Initialize 'max' to 0.
    var max = 0 ;

    // Compare 'max' with 'ans' and update if 'ans' is greater.
    if ( max < ans )
    {
        max = ans ;
    }

    // Compare 'max' with the original value of 'a' ('aft') and update if 'aft' is greater.
    if ( max < aft )
    {
        max = aft ;
    }

    // Compare 'max' with the original value of 'b' ('bft') and update if 'bft' is greater.
    if ( max < bft )
    {
        max = bft ;
    }

    // Output the final maximum value to the console.
    console.log( max ) ;
}

// Do not modify the following line. It handles reading input from standard input
// and invoking the Main function with the received data.
// This part is crucial for the execution environment.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;