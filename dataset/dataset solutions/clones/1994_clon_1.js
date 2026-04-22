(  v => {
 // This is a self-executing anonymous function (IIFE).
 // It takes the input string 'v' as an argument.

    // Extract the first number from the input string 'v'.
    // The '~~' operator is a fast way to perform a floor division (truncation).
    const   n =   ~~( v . split ( ' ' ) [0] )


    // Extract the second number from the input string 'v'.
    // Again, '~~' is used for truncation.
    const   k =   ~~( v . split ( ' ' ) [1] )


    // Define a Greatest Common Divisor (GCD) function using the Euclidean algorithm.
    const gcd =  ( x , y ) =>  {
        /*
         *   This is a recursive helper function 'f' that implements the Euclidean algorithm.
         *   If 'b' is not zero, it recursively calls itself with 'b' and the remainder of 'a' divided by 'b'.
         *   If 'b' is zero, 'a' is the GCD.
         */
        const f = ( a , b )  =>  b  ?  f ( b ,  a  %  b ) :  a

        // Call the helper function with the initial 'x' and 'y' values.
        return f ( x , y )
    }


    // Initialize an empty array to store pre-calculated values.
    // This array will hold data for transitions in the dynamic programming approach.
    const    pre    =    [ ]


    // Perform pre-calculations for the DP transitions.
    // This loop iterates 'k' times, representing one of the dimensions.
    for ( let i = 0 ; i < k ; ++ i ) {
        // Initialize an object to temporarily store counts of GCDs.
        const    preadd = { }

        // This nested loop also iterates 'k' times.
        for ( let j = 0 ; j < k ; ++ j ) {
            // Calculate the GCD of (i+1) and (j+1).
            // We use (i+1) and (j+1) because the problem often deals with 1-indexed numbers.
            const   g   =   gcd ( i + 1 , j + 1 )

            // If this GCD value 'g' has not been seen before, initialize its count to 0.
            if ( preadd [ g ]  ===  undefined )
                preadd [ g ]  =  0

            // Increment the count for the current GCD 'g'.
            preadd [ g ]  +=  1
        }

        // Initialize another array to store the pre-calculated data in a specific format.
        const    preadd2    =    [ ]

        // Iterate over the keys (GCD values) in the 'preadd' object.
        Object . keys ( preadd ) . forEach ( key => {
            // Push an array containing the GCD value (converted to number) and its count.
            // This transforms the object into an array of [GCD_value, count] pairs.
            preadd2 . push ( [ + key , preadd [ key ] ] )
        } , preadd ) // The 'preadd' here is the 'this' context, but not strictly needed for arrow function.

        // Add the processed pre-calculated array to the main 'pre' array.
        pre . push ( preadd2 )
    }


    // Initialize the dynamic programming table.
    // 'dp' will be an array of arrays.
    // The first row (dp[0]) is initialized with '1's, representing base cases.
    const dp = [ new Array ( k + 1 ) . fill ( 1 ) ]


    // Main dynamic programming loop.
    // This loop iterates 'n-1' times, building up the DP table.
    for ( let i = 1 ; i < n ; ++ i ) {
        // Add a new row to the DP table, initialized with zeros.
        dp . push ( new Array ( k + 1 ) . fill ( 0 ) )

        // Iterate through the columns of the previous DP row (dp[i-1]).
        for ( let j = 0 ; j < k ; ++ j ) {
            // Iterate through the pre-calculated elements for the current 'j'.
            // 'preelm' is an array like [GCD_value, count].
            for ( let preelm of pre [ j ] ) {
                // Update the current DP state:
                // dp[i][GCD_value - 1] += dp[i-1][j] * count
                // preelm[0] is the GCD_value, preelm[1] is its count.
                // We use (preelm[0] - 1) for 0-indexed array access.
                dp [ i ] [ preelm [ 0 ] - 1 ] += dp [ i - 1 ] [ j ] * preelm [ 1 ]

                // Apply modulo operation to prevent integer overflow.
                dp [ i ] [ preelm [ 0 ] - 1 ] %= 1e9 + 7
            }
        }
    }


    // Get the last row of the DP table, which contains the final results for 'n' iterations.
    const last_dp = dp . pop ( )

    // Initialize the result variable.
    let res = 0

    // Calculate the final answer from the last DP row.
    // Each element is multiplied by its (index + 1) and added to the total.
    for ( let i = 0 ; i < last_dp . length ; ++ i ) {
        res += ( i + 1 ) * last_dp [ i ]

        // Apply modulo operation to the result.
        res %= 1e9 + 7
    }

    // Print the final calculated result to the console.
    console . log ( res )

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) // Read input from standard input.