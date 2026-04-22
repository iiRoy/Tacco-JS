/*
 * This file contains JavaScript code.
 * It strictly enforces modern JavaScript features and error handling.
 */
"use strict" ;

/*
 * The main function processes input data to calculate a specific result.
 * It takes a string argument, which is expected to be raw input data.
 * @param {string} arg - The raw input string, typically from stdin.
 */
const    main   =   arg   =>   {
                                // Trim leading/trailing whitespace and split the input into lines.
    arg   =   arg . trim ( ) . split ( "\n" ) ;

                                // Parse N (number of points) from the first line.
    const   N   =   parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
                                // Parse D (dimensions) from the first line.
    const   D   =   parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;

    /*
     * Extract the point coordinates from the input.
     * These are lines from index 1 up to N (inclusive).
     */
    const   points   =   arg . slice ( 1 ,   N   +   1 ) ;

    let   answer   =   0 ; // Initialize a counter for points with integer distances.

    // Outer loop: Iterate through each point 'i' in the 'points' array.
    for   ( let   i   in   points )   {
                                    // Split the current point's coordinates and convert them to integers.
        let   temp   =   points [ i ] . split ( " " ) . map ( n => parseInt ( n ) ) ;
        let   nows   =   [ ] ;     // Array to store coordinates of the current point.

                                    // Populate 'nows' array with coordinates.
        for   ( let   j   in   temp )   {
            nows . push ( temp [ j ] ) ;
        }


                                    // Inner loop: Compare current point 'i' with subsequent points 'j'.
        for   ( let   j   =   parseInt ( i ) + 1 ;   j   <   N ;   j ++ )   {
                                        // Split the target point's coordinates and convert them to integers.
            let   temp   =   points [ j ] . split ( " " ) . map ( n => parseInt ( n ) ) ;
            let   targets   =   [ ] ; // Array to store coordinates of the target point.

                                        // Populate 'targets' array with coordinates.
            for   ( let   k   in   temp )   {
                targets . push ( temp [ k ] ) ;
            }

            let   distance   =   0 ;    // Initialize distance squared accumulator.

                                        // Calculate the squared Euclidean distance between 'nows' and 'targets'.
            for   ( let   k   in   targets )   {
                distance   +=   Math . abs ( Math . pow ( nows [ k ]   -   targets [ k ] ,   2 ) ) ;
            }

                                        // Take the square root to get the actual Euclidean distance.
            distance   =   Math . sqrt ( distance ) ;

                                        // Check if the distance is an integer (i.e., no fractional part).
            if   ( distance   %   1   ===   0 )   {
                answer ++ ; // Increment the counter if the distance is an integer.
            }
        }
    }

    // Output the final count.
    console . log ( answer ) ;
}

/*
 * This section reads input from standard input and passes it to the main function.
 * It's common practice in competitive programming environments.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;