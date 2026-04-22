/* This is a Type I clone of an original JavaScript program.
 * The purpose is to demonstrate variations in whitespace and comments
 * while keeping the core logic and structure absolutely identical.
 * All variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original source.
 */

'use strict'; // Enforce strict mode for cleaner code practices


/**
 * The main function that processes the input and calculates the result.
 * @param {string} input - The input string containing space-separated numbers.
 */
function Main(  input )
{
    // Parse the initial input values from the string.
    // The input string is expected to be like "N red blue K".

    const N     =   Number( input.split(" ")[0] );     // Total capacity N
    const red   =   Number( input.split(" ")[1] );     // Value for 'red' item
    const blue  =   Number( input.split(" ")[2] );     // Value for 'blue' item

    const green = red + blue;  // 'green' is the sum of 'red' and 'blue' values

    const K     =   Number( input.split(" ")[3] );     // Target sum K

    // Determine 'second' and 'third' based on 'red' and 'blue' for later calculations.
    const second    =   Math.max( red, blue );  // The larger of red/blue
    const third     =   Math.min( red, blue );  // The smaller of red/blue

    let pat =   0;  // Initialize a counter for patterns (combinations)


    /**
     * Calculates the permutation P(n, r).
     * @param {number} n - The total number of items.
     * @param {number} r - The number of items to choose.
     * @returns {number} The permutation value.
     */
    function permutation(  n , r  )
    {
        let res = 1;

        // Loop 'r' times to multiply (n), (n-1), ..., (n-r+1)
        for ( let k = 0 ; k < r ; k++ )
        {
            res = ( res * ( n - k ) );
        }

        return res;
    }


    /**
     * Calculates the combination C(n, r).
     * This uses the formula C(n, r) = P(n, r) / P(r, r).
     * Optimizes by choosing min(r, n-r) for 'r' to reduce calculations.
     * @param {number} n - The total number of items.
     * @param {number} r - The number of items to choose.
     * @returns {number} The combination value.
     */
    function combination(  n , r  )
    {
        // Choose the smaller value between r and (n-r) for efficiency
        let rr  =   Math.min( r , n - r );

        // Calculate combination using permutations
        return permutation( n , rr ) / permutation( rr , rr );
    }


    // Calculate the maximum possible number of 'green' items that can fit into K.
    const greenmax  =   Math.floor( K / green );


    // Outer loop: Iterate through possible counts of 'green' items.
    // Start from the maximum possible 'green' items down to zero.
    for ( let i = greenmax ; i >= 0 ; i-- )
    {
        // Calculate the remaining value after accounting for 'green' items.
        let restg   =   K - ( i * green );

        // Calculate the maximum possible number of 'second' items that can fit into the remaining value.
        let secondmax   =   Math.floor( restg / second );

        // Inner loop: Iterate through possible counts of 'second' items.
        // Start from the maximum possible 'second' items down to zero.
        for ( let j = secondmax ; j >= 0 ; j-- )
        {
            // Calculate the remaining value after accounting for 'green' and 'second' items.
            let restgb  =   K - ( i * green ) - ( j * second );

            // Check if the total count of items (green_count + second_count + third_count)
            // does not exceed the total capacity N.
            if (  i + j + restgb <= N  )
            {
                // If valid, calculate the number of combinations for this specific distribution
                // and add it to the total pattern count.
                // The multiplication of two combinations here implies choosing N items,
                // then from those chosen, selecting specific groups.
                pat = pat + ( combination( N , i + j + restgb ) * combination( i + j + restgb , Math.max( i , j , restgb ) ) );
            }
        }

    } // End of outer loop


    // Output the final calculated number of patterns.
    console.log( pat );

} // End of Main function


// This part handles reading input from standard input and passing it to the Main function.
// It's a common pattern in competitive programming for Node.js.
Main( require("fs").readFileSync("/dev/stdin", "utf8").trim() );