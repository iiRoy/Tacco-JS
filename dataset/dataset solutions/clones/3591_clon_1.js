/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

function Main (  input  )

{

    // Pre-processing the input string
    input = input . split ( "\n" ) ;

    /*
     * Parse the first line of input to get N and K.
     * N represents the number of elements, K is a window size.
     */
    var   n   =   parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
    var   k   =   parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Initialize an array 'x' of size 'n' with zeros.
    x   =   new   Array ( n ) . fill ( 0 ) ;

    // Split the second line of input into temporary array 'tmp'.
    tmp =   input [ 1 ] . split ( " " ) ;

    /*
     * Initialize counters for positive and negative numbers.
     * These will be used to track the distribution of numbers in 'x'.
     */
    var   plus  =  0 ;
    var   minus =  0 ;

    // Loop through the 'tmp' array to populate 'x' and count positives/negatives.
    for ( i = 0 ;   i < n ;   i ++ )
    {
        x [ i ]   =   parseInt ( tmp [ i ] ) ; // Convert string to integer.

        // Check if the current element is positive or negative.
        if ( x [ i ] > 0 )
        {
            plus ++ ; // Increment positive counter.
        }
        else if ( x [ i ] < 0 )
        {
            minus ++ ; // Increment negative counter.
        }
    }


    /*
     * Initialize the answer with a large value.
     * This value represents infinity for finding minimums.
     */
    var   ans   =   Math . pow ( 10 , 9 ) + 7 ;


    // Check if the array 'x' contains zero.
    if ( x . indexOf ( 0 ) != -1 )
    {
        // If zero is present, adjust N and K, and remove zero from 'x'.
        n -= 1 ;
        k -= 1 ;
        x . splice ( x . indexOf ( 0 ) , 1 ) ;
    }

    // Special case: if 'x' becomes empty after removing zeros.
    if ( x . length == 0 )
    {
        ans = 0 ;
    }
    // Another special case: if 'n' is not 2.
    else if ( n != 2 )
    {
        /*
         * Iterate through possible windows of size 'k'.
         * The loop runs from the first element up to 'n-k+1' to ensure a full window.
         */
        for ( i = 0 ;   i < n - k + 1 ;   i ++ )
        {
            // Case 1: Window spans across zero (contains both negative and positive numbers).
            if ( x [ i ] < 0   &&   x [ i + k - 1 ] > 0 )
            {
                /*
                 * Calculate two possible costs for this window:
                 * 1. Go left to x[i], then right past x[i+k-1].
                 * 2. Go right to x[i+k-1], then left past x[i].
                 * Take the minimum of these and update 'ans'.
                 */
                ans = Math . min ( ans , Math . abs ( x [ i ] ) * 2 + x [ i + k - 1 ] , Math . abs ( x [ i ] ) + x [ i + k - 1 ] * 2 ) ;
            }
            // Case 2: Window contains only negative numbers or ends exactly at the last negative.
            else if ( i == minus - k )
            {
                // The cost is just the absolute value of the leftmost element in the window.
                ans = Math . min ( ans , Math . abs ( x [ i ] ) ) ;
            }
            // Case 3: Window contains only positive numbers or starts exactly at the first positive.
            else if ( i == minus )
            {
                // The cost is just the value of the rightmost element in the window.
                ans = Math . min ( ans , x [ i + k - 1 ] ) ;
            }
        }
    }
    // Final special case: if 'n' is exactly 2.
    else
    {
        // The answer is the minimum of the absolute value of the first element and the value of the second.
        ans = Math . min ( Math . abs ( x [ 0 ] ) , x [ 1 ] ) ;
    }

    // Output the final calculated answer.
    console . log ( '%s' , ans ) ;
}


// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;