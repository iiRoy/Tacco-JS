/*
 * This is an extensively modified Type I clone
 * of the original JavaScript code.
 *
 * It maintains exact structural and logical equivalence,
 * differing only in whitespace and comments.
 *
 * All identifiers, operators, and expressions are preserved exactly.
 */
"use strict" ; /* Enforce strict parsing and error handling in the script. */



function   Main ( input )
{
    // Declare and initialize 'lines' array by splitting the input string at newline characters.
    let   lines   =   input . split ( "\n" ) ;


    /*
     * Extract N and K values from the first line of input.
     * The line is shifted from the 'lines' array,
     * then split by any whitespace characters,
     * and finally, each resulting part is mapped to a number.
     */
    let   nk   =   lines . shift ( ) . split ( /\s/ ) . map ( ( v )   =>   v   -   0 ) ;


    // Destructure the 'nk' array into N (total count) and K (some limit/window size).
    let   N   =   nk [ 0 ] ,   K   =   nk [ 1 ] ;


    /*
     * Process the second line of input to get the main sequence 'S'.
     * It's shifted from 'lines', split by whitespace (taking only the first resulting part),
     * then split into individual characters, and each character
     * is converted into a number (presumably 0 or 1 based on context).
     */
    let   S   =   lines . shift ( ) . split ( /\s/ ) [ 0 ] . split ( "" ) . map ( ( v )   =>   v   -   0 ) ;



    // Initialize 'n' as a segment starting index and 'Z' as an array to store segment metadata.
    let   n   =   0 ,   Z   =   [ ] ;

    // Initialize 'p' for the inner loop's current position and 'b' with the value of the first element in 'S'.
    let   p ,   b   =   S [ 0 ] ;


    // Main loop: Iterates through the 'S' array to identify and segment contiguous blocks of identical values.
    while   ( n   <   N )
    {
        /*
         * Inner loop: Advances 'p' to find the end of the current segment.
         * It continues as long as 'p' is within bounds and the character at 'S[p]'
         * is equal to the current block value 'b'.
         */
        for   ( p   =   n ;   p   <   N   &&   S [ p ]   ==   b ;   p ++ )
        {
            // The body of this 'for' loop is intentionally empty; all logic is in the condition and increment.
        }

        // If 'p' has advanced beyond 'n' (meaning a segment was found) AND 'p' is not past the end of 'S'.
        if   ( p   <   N )
        {
            // Calculate the length of the identified segment.
            let   l   =   p   -   n ;

            // Push an object representing this segment (its kind, starting position, and length) into the 'Z' array.
            Z . push ( {   kind :   b ,   pos :   n ,   len :   l   } ) ;

            // Toggle 'b' to search for the alternating segment type (0 becomes 1, 1 becomes 0) in the next iteration.
            b   =   ( b   +   1 )   %   2 ;
        }

        // Update the segment starting point 'n' to the end of the just-processed segment, preparing for the next iteration.
        n   =   p ;
    }


    /*
     * Special handling for the very first segment in 'Z':
     * If the first segment identified is of 'kind' 0,
     * prepend a dummy segment of 'kind' 1 with zero length.
     * This might be a normalization step for subsequent calculations.
     */
    if   ( Z [ 0 ] . kind   ==   0 )
    {
        Z . unshift ( {   kind :   1 ,   pos :   0 ,   len :   0   } ) ;
    }


    // Calculate 'zs', the total count of segments of 'kind' 0 within the 'Z' array.
    let   zs   =   Z . reduce ( ( ac ,   v )   =>   ac   +   ( v . kind   ==   0   ?   1   :   0 ) ,   0 ) ;


    /*
     * Define a helper function 'f'. This function calculates the combined length
     * of a segment at index 'v' and its immediate preceding and succeeding neighbors (if they exist).
     * Note: This function 'f' is defined but not actually called in the provided code snippet.
     */
    const   f   =   ( v )   =>
    {
        let   result   =   Z [ v ] . len ; // Initialize 'result' with the length of the current segment.

        // If there is a preceding segment, add its length to 'result'.
        if   ( v   >   0 )
        {
            result   +=   Z [ v   -   1 ] . len ;
        }

        // If there is a succeeding segment, add its length to 'result'.
        if   ( v   <   Z . length   - 1 )
        {
            result   +=   Z [ v   +   1 ] . len ;
        }

        return   result ; // Return the total calculated length.
    }



    // Initialize 'ans' (the final answer variable) to zero.
    let   ans   =   0 ;


    /*
     * Loop to sum the lengths of the initial segments in 'Z'.
     * The loop iterates from index 0 up to K * 2 (inclusive).
     * This implies summing lengths of a specific number of alternating blocks.
     */
    for   ( let   n   =   0 ;   n   <=   K * 2 ;   n ++ )
    {
        ans   +=   Z [ n ] . len ; // Add the length of the current segment to 'ans'.
    }


    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}


/*
 * This conditional block determines the execution environment.
 * If 'window' is undefined (typical in Node.js environments),
 * it reads input from standard input (/dev/stdin) using Node's 'fs' module
 * and passes the content (as a UTF-8 string) to the 'Main' function.
 */
if   ( typeof   window   ==   "undefined" )
{
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
}