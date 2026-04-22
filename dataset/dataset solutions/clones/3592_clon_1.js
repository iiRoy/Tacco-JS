/*
 * This is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the definition where only whitespace and comments
 * are allowed to be modified.
 * All identifiers, operators, and expressions are kept identical.
 */
"use strict" ; // Enforce strict mode for better error handling and cleaner code.


const   main  =   arg   =>    {
    // The input argument 'arg' is a single string.
    // It is split by newline characters to get an array of lines.
    arg   =   arg . split ( "\n" ) ;

    // Parse the first line to extract N and K.
    // The first element of the first line (index 0) is N.
    const   N   =   parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
    // The second element of the first line (index 1) is K.
    const   K   =   parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;


    // The second line (index 1) contains space-separated numbers.
    // These are converted to an array of integers 'x'.
    const   x   =   arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ;


    // Initialize an empty list to store calculated minimum distances.
    const   list   =   [ ] ;


    /*
     * Iterate through possible starting positions for a segment of length K.
     * The loop runs from i = 0 up to N - K.
     * Each iteration considers a segment x[i] to x[i + K - 1].
     */
    for ( let   i = 0 ;   i <= N - K ;   i ++ )
    {
        // 'left' represents the leftmost coordinate of the current segment.
        let   left    =   x [ i ] ;
        // 'right' represents the rightmost coordinate of the current segment.
        // The '~~' operator is a fast way to perform a floor division (truncation).
        let   right   =   x [ ~~i + K - 1 ] ;

        // Determine the minimum travel distance for the current segment.
        // This involves checking two scenarios:
        // 1. Go to 'left' first, then to 'right'.
        // 2. Go to 'right' first, then to 'left'.
        // The total distance is |start| + |end - start|, where start is the first point visited.

        // Scenario: The absolute value of 'left' is smaller than 'right'.
        // This implies it's potentially shorter to go left first.
        if ( Math . abs ( left )   <   Math . abs ( right ) )
        {
            // Calculate distance: |left| (to left) + |right - left| (from left to right).
            list . push ( Math . abs ( left )   +   Math . abs ( right - left ) ) ;
        }
        // Scenario: The absolute value of 'right' is smaller than or equal to 'left'.
        // This implies it's potentially shorter to go right first.
        else
        {
            // Calculate distance: |right| (to right) + |right - left| (from right to left).
            // Note that |right - left| is the same as |left - right|, so the order doesn't matter here.
            list . push ( Math . abs ( right )   +   Math . abs ( right - left ) ) ;
        }

        // A commented-out line, potentially for debugging purposes.
        // console.log(list); // This line is intentionally commented out.
    }


    // After processing all segments, find the minimum value in the 'list'.
    // The spread operator (...) expands the array elements as arguments to Math.min.
    console . log ( Math . min ( ... list ) ) ;
}

// The main function is invoked with input read from standard input.
// 'require('fs').readFileSync('/dev/stdin', 'utf8')' reads the entire content
// of the standard input file as a UTF-8 encoded string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;