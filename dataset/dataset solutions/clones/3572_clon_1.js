'use strict'; // This directive enforces strict mode for better error handling and cleaner code.

const main = ( input ) => { // Define the primary function responsible for processing the given input.

    // Split the input string by a space character to separate the two numerical values.
    const nums = input . split ( ' ' ) ;

    // Parse the first part of the 'nums' array into an integer, representing 'N'.
    // The radix '10' is explicitly provided for safe parsing.
    const N = parseInt ( nums [ 0 ] , 10 ) ;

    // Parse the second part of the 'nums' array into an integer, representing 'K'.
    // Again, '10' is used as the radix for decimal conversion.
    const K = parseInt ( nums [ 1 ] , 10 ) ;

    /*
     * The original problem statement or a mathematical property:
     * If (a + b) is a multiple of K AND (a + c) is a multiple of K,
     * THEN it implies that (b - c) must also be a multiple of K.
     * Similarly, (a - b) and (a - c) would also be multiples of K.
     * This is a fundamental concept in modular arithmetic where if x % K == y % K,
     * then (x - y) % K == 0.
     * In this specific problem, it means b % K == c % K.
     */

    // Initialize an empty object to serve as a cache for 'numBC' values
    // when the condition '((minBC * 2) % K) == 0' is met.
    let numBCCache1 = { } ;

    // Initialize another empty object to serve as a cache for 'numBC' values
    // when the condition '((minBC * 2) % K) == 0' is NOT met.
    let numBCCache2 = { } ;

    // Initialize a counter variable to accumulate the total number of valid combinations.
    let count = 0 ;

    // Begin a loop that iterates through all possible integer values for 'a',
    // starting from 1 and going up to and including 'N'.
    for ( let a = 1 ; a <= N ; a ++ ) {

        // Calculate the remainder of 'a' when divided by 'K'. This is crucial for modular arithmetic.
        let m = a % K ;

        // Determine 'minBC', which represents the smallest positive 'bc' value
        // such that (a + bc) would be a multiple of K.
        // If m is 0, then K - 0 = K, which means bc should be K (or 0 if allowed).
        // The loop for bc starts at minBC, so K is an appropriate starting point if m is 0.
        let minBC = K - m ;

        // Evaluate a specific condition involving 'minBC' and 'K'. This condition
        // dictates which calculation path and cache to utilize.
        if ( ( ( minBC * 2 ) % K ) == 0 ) {

            // This block handles scenarios where 'bc' values satisfy a broader condition.
            // The Japanese comment 'bc が任意の組で満たす' indicates 'bc satisfies for any pair'.

            // Attempt to retrieve a pre-calculated 'numBC' value from the first cache.
            let numBC = numBCCache1 [ minBC ] ;

            // If 'numBC' is not found in the cache (i.e., it's 'undefined'),
            // then calculate it for the current 'minBC'.
            if ( typeof numBC === 'undefined' ) {

                numBC = 0 ; // Initialize the local count for 'bc' values.

                // Loop through possible 'bc' values, starting from 'minBC' and
                // incrementing by 'K' in each step, up to 'N'.
                for ( let bc = minBC ; bc <= N ; bc += K ) {

                    numBC ++ ; // Increment the count for each valid 'bc'.
                }
                // Store the newly calculated 'numBC' in the first cache for future lookups.
                numBCCache1 [ minBC ] = numBC ;
            }

            // Add the square of 'numBC' to the total count. This implies that
            // both 'b' and 'c' can independently take any of these 'numBC' values.
            count += numBC * numBC ;

        } else { // This 'else' block is executed when the condition '((minBC * 2) % K) == 0' is false.

            // The Japanese comment 'bc が任意の組で満たさない' means 'bc does not satisfy for any pair'.

            // Attempt to retrieve a pre-calculated 'numBC' value from the second cache.
            let numBC = numBCCache2 [ minBC ] ;

            // If 'numBC' is not found in this cache, calculate it.
            if ( typeof numBC === 'undefined' ) {

                numBC = 0 ; // Reset the local count for 'bc' values.

                // Loop through possible 'bc' values, similar to the 'if' block.
                for ( let bc = minBC ; bc <= N ; bc += K ) {

                    // Within this 'else' branch, an additional inner condition is applied.
                    // Only 'bc' values that satisfy '((bc * 2) % K) == 0' are counted.
                    if ( ( ( bc * 2 ) % K ) == 0 ) {

                        numBC ++ ; // Increment the count if the inner condition holds true.
                    }
                }
                // Store the calculated 'numBC' in the second cache.
                numBCCache2 [ minBC ] = numBC ;
            }

            // Add the calculated 'numBC' directly to the total count.
            // This differs from the 'if' branch, suggesting a different combinatorial interpretation.
            count += numBC ;
        }
    }

    // After iterating through all 'a' values, print the final accumulated count to the console.
    console . log ( count ) ;
} ; // End of the 'main' function definition.


// A boolean flag to control whether the script runs with test data or reads from standard input.
const isTest = false ;

// Conditional execution block based on the 'isTest' flag.
if ( isTest ) {

    // If 'isTest' is true, execute the 'main' function with several predefined test cases.
    main ( '3 2' ) ;
    main ( '5 3' ) ;
    main ( '31415 9265' ) ;
    main ( '35897 932' ) ;

} else { // If 'isTest' is false, read input from the standard input stream.

    // Use Node.js 'fs' module to synchronously read the entire content of '/dev/stdin'
    // and decode it as a 'utf8' string, then pass it to the 'main' function.
    main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
}