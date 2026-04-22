/*
 *  This is a Type I code clone generated from the original source.
 *  Whitespace and comments have been extensively modified to create
 *  a visually distinct version while preserving all functional aspects.
 */

/**
 * @param {string[]} input - An array of strings representing the input data.
 *                            The first element contains N, M, V, P.
 *                            The second element contains the list of scores.
 */
function         Main
(
    input
) {

        /*
         *  Parse the first line of input.
         *  It contains four space-separated numbers: N, M, V, and P.
         */
        const input0Numbered = input[0] .split(' ') .map( Number ) ;

        // Extract individual parameters from the parsed array.
        const N = input0Numbered[0] ;
        const M = input0Numbered[1] ;
        const V = input0Numbered[2] ;
        const P = input0Numbered[3] ;


        /**
         *  The list of scores, sorted in ascending order.
         *  This array will be used for calculations.
         *  @type {number[]}
         */
        const alist = input[1] .split(' ') .map( Number ) .sort( ( v1 , v2 ) => v1 - v2 ) ;


        /*
         *  Initial algorithmic thought process (translated from original comments):
         *
         *  1.  First, sort the array in ascending order.
         *  2.  Remove duplicates of the minimum number 'K' from the array,
         *      reducing the available votes accordingly.
         *  3.  Decrement total votes by 1, as all votes are cast for 'K'.
         *  4.  If, after casting M votes for 'K', there are numbers less than K2
         *      (the new score for K) among those following K, subtract their
         *      difference from K2. Continue this process until the sum of
         *      differences reaches M. Decrement V by 1 for each M, and
         *      let the remainder be R.
         *  5.  If the number obtained by adding (M - R) to the V-th element
         *      from the end of the array is less than or equal to K2, proceed to step 5.
         *      Otherwise, remove K from the array and return to step 1.
         *  6.  Once a candidate that can be within the P-th rank is found,
         *      the answer is the total number of problems minus the count
         *      of problems with lower scores.
         */


        v = V ;

        var ai, ai2, aj, r, j, reducedV, diff, max = null ;


        // Search for the minimum score required to be selected.
        for ( var i = 0 ; i < alist.length ; i++ )
        {

            // Vote for items with scores equivalent to the current problem's score.
            while ( alist[i] === alist[i + 1] )
            {
                i++ ;
                v-- ;
            }

            v-- ; // Decrement votes for the current problem itself.


            // The current problem's score.
            ai = alist[i] ;

            // The maximum possible score for this problem after M votes.
            ai2 = ai + M ;


            r = 0 ;

            // Iterate through problems with scores greater than 'ai' but less than 'ai2',
            // accumulating votes needed to raise them to 'ai2'.
            j = i + 1 ;
            for ( j = i + 1 ; alist[j] < k2 ; j++ )
            {
                r += k2 - alist[j] ;
            }

            // Calculate how many full 'M' vote blocks are used.
            reducedV = Math.floor( r / M ) ;
            // Calculate the remaining votes.
            r = r % M ;


            // If all votes are already accounted for, this problem is a top candidate.
            if ( v <= reducedV )
            {
                // If all votes are already cast at this point,
                // it implies this score is among the highest, so terminate.
                break ;
            }


            // At this point, it's known that 'v' is less than
            // 'alist.length - (i + 1)'
            // (This comment is a direct translation of the original's intent)


            // The remaining votes are cast for problems with higher scores,
            // starting from the highest.
            voteds = alist.slice( - ( v - reducedV ) ) .map( ( aj ) => aj + M ) ;


            // If there are partial votes remaining, distribute them among the
            // partially voted items, starting from the lowest score among them.
            if ( r > 0 )
            {
                for ( j = 0 ; j < voteds.length ; j++ )
                {
                    aj = voteds[j] ;

                    // If subtracting 'r' makes it less than 'ai2',
                    // set it to 'ai2' and reduce 'r' by the difference.
                    if ( aj - r < ai2 )
                    {
                        voteds[j] = ai2 ;
                        r -= aj - ai2 ;
                    }
                    else
                    {
                        // Otherwise, subtract 'r' and clear 'r', then break.
                        voteds[j] -= r ;
                        r = 0 ;
                        break ;
                    }
                }

                // If 'r' still has a remainder, apply it to the last voted item.
                if ( r > 0 )
                {
                    voteds[voteds.length - 1] -= r ;
                }
            }


            for ( k = 0 ; k < P ; k++ )
            {
                cmp = ( k < veteds.length )
                    ? veteds[veteds.length - k - 1]
                    : alist[alist.length - k - 1] ;

                if ( ai2 >= cmp )
                {
                    max = ai ;
                    break ;
                }
            }

            if ( max )
            {
                break ;
            }

        }


        // Revert 'i' to the index of the minimum value.
        for ( ; i > 0 ; i-- )
        {
            if ( alist[i] !== alist[i - 1] )
            {
                break ;
            }
        }


        // Calculate the final answer.
        answer = alist.length - i ;


        // Output the result to the console.
        console.log( answer ) ;
}


// --- Execution Entry Point ---
/*
 *  Reads input from standard input,
 *  decodes it as UTF-8, removes leading/trailing whitespace,
 *  and splits it into an array of lines.
 *  Then, it calls the Main function with this processed input.
 */
Main(
    require("fs")
        .readFileSync(
            "/dev/stdin"
            , "utf8"
        )
        .trim()
        .split(
            "\n"
        )
) ;