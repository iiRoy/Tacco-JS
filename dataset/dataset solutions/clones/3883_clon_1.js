/*
 * This JavaScript function processes input data to calculate a maximum value.
 * It's designed to solve a specific algorithmic problem, likely involving
 * optimization or dynamic programming principles.
 */
function Main(  input  )
{
    // The input string is first split into an array of lines.
    input = input . split ( "\n" ) ;

    // Parse N and C from the first line of the input.
    var   N   =   parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
    var   C   =   parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Initialize arrays 'x' and 'v' with size N.
    x = new   Array ( N ) ;
    v = new   Array ( N ) ;

    // 'half' variable will store an index related to C/2.
    var   half   =   0 ;

    // Loop through the input lines starting from the second line (index 1).
    for ( i = 0 ; i < N ; i++ )
    {
        // Split each line to get temporary values.
        tmp = input [ i + 1 ] . split ( " " ) ;

        // Store the first parsed integer into x[i].
        x [ i ] = parseInt ( tmp [ 0 ] ) ;

        // Check if x[i] is less than half of C.
        if ( x [ i ] < C / 2 )
        {
            half = i ; // Update 'half' if the condition is met.
        }

        // Store the second parsed integer into v[i].
        v [ i ] = parseInt ( tmp [ 1 ] ) ;
    }

    // Initialize 'ans' (answer) and 'sum' variables.
    var   ans   =   0 ;
    var   sum   =   0 ;

    // First loop: Calculate max sum going forward from the start.
    for ( i = 0 ; i < N ; i++ )
    {
        if ( i == 0 )
        {
            sum = sum + v [ i ] - x [ i ] ;
        }
        else
        {
            // Calculate sum considering the difference between x[i] and x[i-1].
            sum = sum + v [ i ] - ( x [ i ] - x [ i - 1 ] ) ;
        }
        // Update the maximum answer found so far.
        ans = Math . max ( ans , sum ) ;
    }

    // Second major loop: Iterating backwards from 'half' to 0.
    for ( i = half ; i >= 0 ; i-- )
    {
        sum = 0 ; // Reset sum for each iteration of the outer loop.
        // Inner loop: Calculate sum from 0 up to 'i'.
        for ( j = 0 ; j <= i ; j++ )
        {
            if ( j == 0 )
            {
                sum = sum + v [ j ] - x [ j ] ;
            }
            else
            {
                sum = sum + v [ j ] - ( x [ j ] - x [ j - 1 ] ) ;
            }
            ans = Math . max ( ans , sum ) ; // Update max answer.
        }

        // Subtract x[i] from the current sum.
        sum = sum - x [ i ] ;

        // Third nested loop: Iterate backwards from N-1 down to 'i+1'.
        for ( j = N - 1 ; j > i ; j-- )
        {
            if ( j == N - 1 )
            {
                sum = sum - ( C - x [ j ] ) + v [ j ] ;
            }
            else
            {
                sum = sum - ( x [ j + 1 ] - x [ j ] ) + v [ j ] ;
            }
            ans = Math . max ( ans , sum ) ; // Update max answer.
        }
    }

    // Third major loop: Iterating forwards from 'half + 1' to N-1.
    for ( i = half + 1 ; i < N ; i++ )
    {
        sum = 0 ; // Reset sum for each iteration of this outer loop.
        // Inner loop: Calculate sum from N-1 down to 'i'.
        for ( j = N - 1 ; j >= i ; j-- )
        {
            if ( j == N - 1 )
            {
                sum = sum + v [ j ] - ( C - x [ j ] ) ;
            }
            else
            {
                sum = sum - ( x [ j + 1 ] - x [ j ] ) + v [ j ] ;
            }
            ans = Math . max ( ans , sum ) ; // Update max answer.
        }

        // Subtract (C - x[i]) from the current sum.
        sum = sum - ( C - x [ i ] ) ;

        // Third nested loop: Iterate forwards from 0 up to 'i-1'.
        for ( j = 0 ; j < i ; j++ )
        {
            if ( j == 0 )
            {
                sum = sum + v [ j ] - x [ j ] ;
            }
            else
            {
                sum = sum + v [ j ] - ( x [ j ] - x [ j - 1 ] ) ;
            }
            ans = Math . max ( ans , sum ) ; // Update max answer.
        }
    }


    // Output the final calculated answer to the console.
    console . log ( '%s' , ans ) ;
}


// This function is typically used for debugging purposes in a browser environment.
function debug ( )
{
    var   input   =   document . getElementById ( "input" ) . value ;
    Main ( input ) ;
}

// This line reads input from standard input (e.g., for competitive programming environments).
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;