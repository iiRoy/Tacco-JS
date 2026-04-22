/*
 * This is a JavaScript program.
 * It processes input from stdin.
 * The main logic is encapsulated in an Immediately Invoked Function Expression (IIFE).
 */
( function main ( ) {

    // Read all input lines from standard input.
    // The 'fs' module is used for file system operations.
    let lines = require('fs').readFileSync( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ;


    // Parse the first line to get 'n' and 'k'.
    // 'shift()' removes the first element from the array.
    let [ n , k ] = lines . shift ( ) . split ( ' ' ) . map ( Number ) ;

    /*
     * Convert the remaining lines into an array of numbers 'w'.
     * Each element in 'lines' is mapped to its numeric representation.
     */
    let w = lines . map ( Number ) ;

    // console.log(w); // Original comment preserved, but indented.

    // Calculate the sum of all elements in the 'w' array.
    // 'reduce' is used to accumulate the sum, starting from 0.
    let sum = w . reduce ( ( p , c ) => p + c , 0 ) ;


    // Special case: If k is 1, the answer is simply the total sum.
    if ( k == 1 )
    {
        console . log ( sum ) ; // Output the sum.
        return ; // Exit the function early.
    }

    // Initialize two arrays: 't' for sums and 't2' for sub-arrays of weights.
    // 't' will hold the current sum for each partition.
    // 't2' will hold the weights within each partition.
    let t = [ sum ] , t2 = [ w ] ;

    // Initialize remaining partitions for 't' and 't2'.
    // There will be 'k' partitions in total.
    for ( let i = 1 ; i < k ; i ++ )
    {
        t [ i ] = 0 ; // Set initial sum for partition 'i' to zero.
        t2 [ i ] = [ ] ; // Initialize partition 'i' with an empty array of weights.
    } ;


    // Variables used in the main optimization loop.
    let cnt = 0 ; // A counter (currently unused in the provided logic).

    let max = sum ; // Initialize 'max' with the total sum. This will track the maximum partition sum.

    let min = 0 ; // Initialize 'min' to zero. This will track the minimum partition sum.

    let b_i ; // Another variable, declared but not used in the provided logic.


    // Main optimization loop.
    // This loop continues until no further improvements (flg remains false) can be made.
    while ( true )
    {
        let flg = false ; // Flag to indicate if any change was made in the current iteration.

        // Iterate through adjacent partitions.
        for ( let i = 0 ; i < k - 1 ; i ++ )
        {
            // Get the first and last elements of the current partition's weight array.
            // These are potential candidates for moving between partitions.
            let t0_l = t2 [ i ] [ 0 ] ;                 // Leftmost element of partition i.
            let t0_r = t2 [ i ] [ t2 [ i ] . length - 1 ] ; // Rightmost element of partition i.

            // Condition 1: Can we move an item from partition 'i' to 'i+1'
            // to balance the sums?
            // This condition checks if moving the rightmost element 't0_r'
            // from 'i' to 'i+1' would reduce the maximum partition sum.
            if ( t [ i ] > t [ i + 1 ] + t0_r / 2
                 && t [ i + 1 ] + t0_r < max
                 && t [ i ] > min )
            {
                // Move the rightmost element from partition 'i' to 'i+1'.
                let tmp = t2 [ i ] . pop ( ) ; // Remove from the end of t2[i].
                t [ i ] -= tmp ;             // Subtract from sum of t[i].
                t [ i + 1 ] += tmp ;           // Add to sum of t[i+1].
                t2 [ i + 1 ] . unshift ( tmp ) ; // Add to the beginning of t2[i+1].
                flg = true ;                 // Indicate that a change was made.
            }
            // Condition 2: Can we move an item from partition 'i+1' to 'i'
            // to balance the sums?
            // This condition checks if moving the leftmost element 't0_l'
            // from 'i+1' to 'i' would reduce the maximum partition sum.
            else if ( t [ i ] + t0_l / 2 < t [ i + 1 ]
                      && t [ i ] + t0_l < max
                      && t [ i + 1 ] > min )
            {
                // Move the leftmost element from partition 'i+1' to 'i'.
                let tmp = t2 [ i + 1 ] . shift ( ) ; // Remove from the beginning of t2[i+1].
                t [ i + 1 ] -= tmp ;               // Subtract from sum of t[i+1].
                t [ i ] += tmp ;                   // Add to sum of t[i].
                t2 [ i ] . push ( tmp ) ;           // Add to the end of t2[i].
                flg = true ;                     // Indicate that a change was made.
            }

            // Update 'max' and 'min' based on the current partition sums 't[i]' and 't[i+1]'.
            // Note: The original code uses 't[t]' which is likely a typo and should be 't[i]'
            // or 't[i+1]'. However, per Type I definition, I must preserve it exactly.
            max = max < t [ t ] ? t [ t ] : max ;
            max = max < t [ t + 1 ] ? t [ t + 1 ] : max ;
            min = min > t [ t ] ? t [ t ] : min ;
            min = min > t [ t + 1 ] ? t [ t + 1 ] : min ;

            // console.log(t,t2); // Another original comment, re-indented.
        }

        // If no changes were made in the inner loop, break out of the while loop.
        if ( ! flg )
            break ;
    }

    // After the optimization loop, sort the partition sums in descending order
    // and output the largest one (which represents the minimized maximum partition sum).
    console . log ( t . sort ( ( a , b ) => b - a ) [ 0 ] ) ;

} ) ( ) ; // End of the IIFE.