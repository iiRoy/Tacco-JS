/*
 * This JavaScript file processes input from standard input to solve a specific problem.
 * It calculates the maximum possible value based on a dynamic programming approach.
 *
 * Author: Clone Generator
 * Date: 2023-10-27 (Example Date)
 * Version: 1.0.0 (Type I Clone)
 */

//  Import the 'fs' (file system) module to handle file operations, specifically reading input.
const   input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ;

//  Split the entire input string received from stdin into an array of lines.
//  Each element in the 'lines' array will correspond to one line from the input.
const   lines   =   input . split ( '\n' ) ;

//  Parse the first line of the input.
//  It contains two space-separated numbers, N and K.
//  N: Represents the total number of subsequent data points to process.
//  K: A parameter used in range calculations within the main loop.
let     [ N ,   K ]     =   lines [ 0 ] . split ( ' ' ) . map ( Number ) ;

// Initialize a dynamic programming array (dp) with a fixed maximum size.
// The size (300001) is chosen based on problem constraints.
// All elements are initially filled with 0.
let     dp      =   Array ( 300001 ) . fill ( 0 ) ;

// Begin the main processing loop.
// This loop iterates from i = 1 up to N, processing each relevant line of input.
for ( let i = 1 ;   i <= N ;   i++ )
{
    // Extract the numerical value from the current line.
    // The `- 0` is a common JavaScript idiom to explicitly convert a string to a number.
    const   A   =   lines [ i ]   -   0 ;

    // Calculate the potential new maximum value for a specific range.
    // This value is derived from the current maximum at index A in the dp array, plus 1.
    const   val =   dp [ A ]    +   1 ;

    // Determine the lower bound for the range to update in the dp array.
    // It's the maximum of 0 (to ensure non-negative index) and (A - K).
    const   min =   Math . max ( 0 ,   A   -   K ) ;

    // Determine the upper bound for the range to update.
    // This is simply A + K.
    const   max =   A   +   K ;

    // Inner loop: Iterate through the determined range [min, max] (inclusive).
    // For each index 'j' within this range, update its value in the dp array.
    for   (   let   j   =   min   ;   j   <=   max   ;   j++   )
    {
        // Update dp[j] to be the maximum of its current value and the calculated 'val'.
        // This effectively propagates the maximum count across the specified range.
        dp [ j ]    =   Math . max ( val ,   dp [ j ] ) ;
    } // End of inner loop for updating dp array elements
} // End of outer loop for processing input lines

/*
 * After all input lines have been processed and the dp array has been populated,
 * find the overall maximum value present anywhere in the entire dp array.
 * The 'reduce' method is used here to efficiently iterate through the array
 * and identify the single largest element.
 */
console . log ( dp . reduce ( (   a ,   b   )   =>   a   >   b   ?   a   :   b   ) ) ;

// End of script execution.