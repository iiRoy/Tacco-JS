/*
 * This file contains the main logic for processing input data
 * and calculating a specific result based on circular dependencies
 * and scoring. It is designed to run in a Node.js environment.
 *
 * Author: A highly skilled JavaScript developer.
 * Date: 2023-10-27
 * Version: 1.0.0
 *
 * The goal is to maximize the score by traversing a path of length K
 * within a set of interconnected items, which form cycles.
 *
 */
function Main ( input )
{
    // Process the raw input string: trim, split by newlines, then split each line by spaces.
    input = input
              .trim()
                .split ( "\n" )
                  .map ( function ( x ) { return x .split ( " " ) } ) ;


    // Parse N (number of items) and K (path length) from the first line of input.
    let N = parseInt ( input [ 0 ] [ 0 ] , 10 ) ;
    let K = parseInt ( input [ 0 ] [ 1 ] , 10 ) ;

    // Parse v_P (parent/next item pointers) from the second line.
    // Each element is an integer representing the next item in the sequence.
    let v_P = input [ 1 ] .map ( e => parseInt ( e , 10 ) ) ;

    // Parse v_C (scores/costs for each item) from the third line.
    // Each element is an integer representing the score obtained when visiting the item.
    let v_C = input [ 2 ] .map ( e => parseInt ( e , 10 ) ) ;

    // Array to keep track of visited items to identify distinct cycles.
    let doneOrNot = Array
                      .from ( { length : N } , ( ) => false ) ;

    // This array will store discovered cycles, each cycle being a list of [item_id, score].
    let circle = [ ] ;

    // Declare several temporary variables used in the loops.
    let start, tmp, tmp2, tmp3, circleSum ;

    // Initialize the maximum answer found so far to negative infinity.
    let ans = -1 * Infinity ;

    // Main loop: Iterate through all items to find and process each distinct cycle.
    for ( let i = 0 ; i < N ; i++ )
    {
        // If the current item 'i' has not yet been processed (i.e., not part of a found cycle).
        if ( ! doneOrNot [ i ] )
        {
            // console.log("i", i); // Debugging line, commented out.

            // Start a new circle. The first element is the current item 'i' and its score.
            circle.push( [ [ i + 1, v_C [ i ] ] ] ) ;
            circleSum = v_C [ i ] ; // Initialize the sum of scores for this new circle.
            start = i + 1 ;         // The starting item of the current cycle (1-indexed).
            tmp = i + 1 ;           // Current item in the cycle traversal (1-indexed).

            // Traverse the cycle until we return to the starting item.
            while ( true )
            {
                doneOrNot [ tmp - 1 ] = true ; // Mark the current item as visited.
                tmp2 = v_P [ tmp - 1 ] ;       // Get the next item in the sequence.

                if ( start === tmp2 ) break ;  // If we've returned to the start, the cycle is complete.

                tmp = tmp2 ;                   // Move to the next item.
                circleSum += v_C [ tmp - 1 ] ; // Add its score to the circle's total sum.
                circle [ circle.length - 1 ] .push ( [ tmp, v_C [ tmp - 1 ] ] ) ; // Add item to the current circle.
            }


            // Create a temporary copy of the last discovered circle for calculations.
            let tmpCircle = circle [ circle.length - 1 ] .slice ( ) ;
            let MAXremain = -1 * Infinity ; // Initialize max score for remaining steps within K.

            // Determine 'nRemain', the number of steps to consider within the current circle.
            let nRemain ;

            // If K is less than or equal to the circle's length, we simply take K steps.
            if ( K <= tmpCircle .length )
            {
                nRemain = K ;
            }
            // If K is larger than the circle's length and the circle has a positive sum,
            // we can potentially go around the circle multiple times.
            else if ( circleSum > 0 )
            {
                // Calculate the remainder steps after full cycles.
                nRemain = K % tmpCircle .length ;
                // If remainder is 0, it means K is a multiple of circle length,
                // so we consider a full circle for the "remainder" part.
                if ( nRemain === 0 ) nRemain = tmpCircle .length ;
            }
            // If K is larger but the circle sum is not positive (zero or negative),
            // we only consider one full circle traversal at most, as more would reduce or not improve score.
            else
            {
                nRemain = tmpCircle .length ;
            }
            // console.log("nRemain", nRemain, "l", tmpCircle.length); // Another debug line.

            // Calculate the maximum score achievable within 'nRemain' steps, starting at any point in the circle.
            for ( let j = 0 ; j < tmpCircle .length ; j++ )
            {
                tmp3 = 0 ; // Accumulator for the current path segment score.
                for ( let k = j ; k < j + nRemain ; k++ )
                {
                    let k2 = k % tmpCircle .length ; // Handle circular indexing.
                    tmp3 += tmpCircle [ k2 ] [ 1 ] ; // Add score of the current item in the segment.
                    // console.log(tmp3); // Debugging score accumulation.
                    MAXremain = Math .max ( MAXremain, tmp3 ) ; // Update max score for this segment.
                }
                // console.log("here", MAXremain, circleSum); // Debugging after inner loop.
            }


            // console.log("see this", i, tmpCircle); // Debugging circle content.

            // Update the global maximum answer.
            // The total score is MAXremain + (score from full cycles).
            // Full cycles only contribute positively if circleSum > 0.
            ans = Math .max ( ans , MAXremain + Math .max ( 0 , circleSum ) * ( ( K - nRemain ) / tmpCircle .length ) ) ;
            // console.log("ans", ans, Math.max(0, circleSum), Math.floor(K / tmpCircle.length)); // Final debug for ans update.
        } // End of 'if (!doneOrNot[i])' block.


    } // End of main 'for' loop.


    // Output the final maximum answer to the console.
    console .log ( ans ) ;

} // End of Main function definition.


// Read input from standard input, decode as UTF-8, and pass to the Main function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;