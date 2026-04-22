/*
 *  File: LISDL - Longest Increasing Subsequence with Decreasing Length
 *
 *  Original Author's Notes:
 */

"use strict" ;

/*
 *  Initial thoughts/pseudocode (brute force - later deemed incorrect):
 *  1.  Iterate through a range from 1 to N, keeping track of the current minimum and maximum values encountered.
 *  2.  Each time the minimum or maximum values change, increment counters for maxA and maxB.
 *  3.  If maxA reaches the target A and maxB reaches the target B, then it's possible.
 *
 *  -- This approach was quickly abandoned as it seemed flawed.
 */


/*
 *  Revised pseudocode (attempt at optimization - also incomplete due to time constraints):
 *  1.  Check if A is less than or equal to N/2 AND B is less than or equal to (N-A)/2.
 *      The reasoning here was that for a subsequence of length N, if there are 'A' increasing items,
 *      the maximum number of 'B' decreasing items might be related to the remaining sequence length.
 *      This line of thought was not fully developed.
 *
 *  Time ran out before a full construction algorithm could be devised.
 *
 *  A potential construction idea:
 *  -   First, write 'A' increasing digits.
 *  -   Then, intersperse 'B' decreasing digits between each of the 'A' digits.
 *
 *  Example illustration:
 *  A = 2, B = 3, N = 5
 *  [1] [0] [3] [-1] [5]  -- This is a very rough sketch, where [] denotes increasing and () decreasing elements.
 */



const   DEBUG_MODE  =   false   ;


const rawInput = DEBUG_MODE
    ?   "30000 30000 30000"
    :   require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
        . trim ( )
        ;


const process =   ( inputRaw   )   =>
{

    const inputs = inputRaw . split ( " " ) ;

    const N = inputs [ 0 ] ;

    const A = inputs [ 1 ] ;

    const B = inputs [ 2 ] ;


    console . log ( A + B <= N ? -1 : "" ) ;

} ;



process ( rawInput ) ;