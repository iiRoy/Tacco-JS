/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered significantly.
 */
"use strict"
; /*
   * Strict mode enabled for the entire script.
   */


// Define the main function to process the input
const   main    =   (   arg   )   =>
{
    // Process the raw input string
    const   inputList   =   arg.trim() .   split ( "\n" )    ;

    /*
     * This section parses the input values X and N.
     * X is the target number.
     * N is the count of numbers to avoid.
     */
    const   X   =   parseInt (   inputList [ 0 ] .   split ( " " )   [ 0 ]   )   ;
    const   N   =   parseInt (   inputList [ 0 ] .   split ( " " )   [ 1 ]   )   ;

    // Check if N is zero, a special case
    if   (   N   ==   0   )
    {
        // If N is 0, then X itself is the answer as there are no forbidden numbers.
        console.log   (   X   )   ;
    }
    else
    {
        /*
         * Parse the list of forbidden numbers (PList).
         * These are numbers that cannot be the result.
         */
        const   PList   =   inputList [ 1 ] .   split ( " " ) .   map (   ele   =>   parseInt (   ele   )   )   ;


        // Generate a list of numbers from 1 to 100, then add 0 at the beginning.
        const   hundred   =   [   ...   Array (   100   ) .   keys (   )   ] .   map (   i   =>   ++   i   )   ;
        hundred.unshift   (   0   )   ; /*
                                       * Adding 0 to the beginning of the list.
                                       */

        /*
         * Filter out numbers that are present in PList from our generated 'hundred' list.
         * This gives us a list of numbers that are not forbidden.
         */
        const   notExistPList   =   hundred .   filter (   ele   =>   PList .   indexOf (   ele   )   ==   -1   )   ;


        /*
         * Use reduce to find the number in notExistPList that is closest to X.
         * If two numbers have the same absolute difference, choose the smaller one.
         * Initial accumulator value is 101, which is outside the typical range [0, 100],
         * ensuring the first comparison correctly initializes.
         */
        const   result   =   notExistPList .   reduce (   (   acc   ,   cur   )   =>
        {
            // Calculate absolute difference for accumulator and current element
            const   accDif   =   Math.abs (   X   -   acc   )   ;
            const   curDif   =   Math.abs (   X   -   cur   )   ;

            // Compare differences
            if   (   accDif   ==   curDif   )
            {
                // If differences are equal, return the smaller number
                return   Math.min (   acc   ,   cur   )   ;
            }
            else   if   (   accDif   >   curDif   )
            {
                // If current number is closer, return current
                return   cur   ;
            }
            else
            {
                // If accumulator is closer, return accumulator
                return   acc   ;
            }
        }   ,   101   )   ; // Initial value for the reduction


        /*
         * Final check: The problem statement implies that if no valid number is found,
         * or if the closest valid number is still "far" compared to some implicit
         * boundary, then -1 might be the answer.
         * The condition `Math.abs(X - result) >= Math.abs(X - (-1))` seems to be a
         * specific way to handle a problem constraint or a fallback.
         * Note: Math.abs(X - (-1)) simplifies to Math.abs(X + 1).
         * This condition usually means if the closest valid number is further or
         * equally far as -1 is from X, then -1 is the answer.
         */
        if   (   Math.abs (   X   -   result   )   >=   Math.abs (   X   -   (   -1   )   )   )
        {
            console.log   (   -1   )   ; // Output -1 if the condition is met.
        }
        else
        {
            console.log   (   result   )   ; // Otherwise, output the calculated closest number.
        }
    }
}
;

// Read input from standard input and pass it to the main function.
main (   require ( 'fs' ) .   readFileSync ( '/dev/stdin'   ,   'utf8'   )   )   ;