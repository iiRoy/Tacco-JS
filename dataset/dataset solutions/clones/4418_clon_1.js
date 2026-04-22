/*
 * This JavaScript module defines a function to calculate the length
 * of the intersection of two one-dimensional intervals.
 * It strictly adheres to "use strict" mode for robust code execution.
 */

"use strict" ; // Enforce strict parsing and error handling for the entire script.


const   Main   =   (   input   )   =>   {

    // Step 1: Process the raw input string.
    // Trim any leading/trailing whitespace, split by spaces, and convert each part to an integer.
    let   xs   =   input.trim ( ) .split ( ' ' ) .map ( v   =>   parseInt ( v ,   10 ) ) ;

    // Step 2: Extract the four boundary values from the parsed array.
    // These represent the start (A, C) and end (B, D) points of two intervals.
    let   A   =   xs [ 0 ] ; // Start point of the first interval.
    let   B   =   xs [ 1 ] ; // End point of the first interval.
    let   C   =   xs [ 2 ] ; // Start point of the second interval.
    let   D   =   xs [ 3 ] ; // End point of the second interval.

    // Step 3: Calculate the left boundary (L) of the potential intersection.
    // The intersection's start is the maximum of the two individual start points.
    let   L   =   Math.max ( A ,   C ) ;

    // Step 4: Calculate the right boundary (R) of the potential intersection.
    // The intersection's end is the minimum of the two individual end points.
    let   R   =   Math.min ( B ,   D ) ;


    // Step 5: Determine the length of the intersection.
    // If the right boundary is greater than or equal to the left boundary, an overlap exists.
    if   (   R   -   L   >=   0   )   {
        // Output the calculated length of the overlap.
        console.log ( R   -   L ) ;
    }   else   if   (   R   -   L   <   0   )   {
        // If R < L, the intervals do not overlap, or they touch at a single point (length 0).
        // In this case, the length of the intersection is 0.
        console.log ( 0 )
    }

} ; // End of the Main function definition.


// This line executes the Main function by reading input from standard input.
// It uses Node.js 'fs' module to synchronously read the entire file content as UTF-8.
Main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;