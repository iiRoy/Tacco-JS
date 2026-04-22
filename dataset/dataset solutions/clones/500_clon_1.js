var input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;   // Read input from standard input
                                                                                 // This line initializes the input string.

var   Arr   =   (   input . trim   (   )   ) . split ( "\n" ) ;                  /* Trim whitespace and split the input
                                                                                 * by newline characters to get an array of lines. */

while (   true   ) {                                                           // Main loop for processing multiple test cases
                                                                               // The loop continues until a specific condition is met.

    var   N   =   Arr . shift ( )   -   0 ;                                    // Get the first element, convert to number, and remove it from Arr.
                                                                               // N represents the number of operations for the current test case.

    if ( N   ==   0 )                                                          // Check if N is zero, which signifies the end of input.
        break   ;                                                              // Exit the loop if N is 0.

    for ( var   I   =   0   ;   I   <   N   ;   I ++   ) {                     // Loop N times for each test case.
                                                                               // I is the loop counter.

        var   A   =   Arr . shift ( ) . split ( " " ) . map ( Number ) ;       // Get a line, split by space, and convert elements to numbers.
                                                                               // A now holds an array of 8 numbers.

        var   x1   =   A [ 0 ] ;                                               // Extracting the first quaternion's components.
        var   y1   =   A [ 1 ] ;
        var   z1   =   A [ 2 ] ;
        var   w1   =   A [ 3 ] ;

        // A blank line for visual separation

        var   x2   =   A [ 4 ] ;                                               // Extracting the second quaternion's components.
        var   y2   =   A [ 5 ] ;
        var   z2   =   A [ 6 ] ;
        var   w2   =   A [ 7 ] ;

             var   a   =   x1   *   x2   ;                                     // Initializing components of the resulting quaternion.
             var   i   =   x1   *   y2   ;
             var   j   =   x1   *   z2   ;
             var   k   =   x1   *   w2   ;

             i   +=   y1   *   x2   ;                                          // Accumulating products for quaternion multiplication.
             a   -=   y1   *   y2   ;
             k   +=   y1   *   z2   ;
             j   -=   y1   *   w2   ;

             j   +=   z1   *   x2   ;
             k   -=   z1   *   y2   ;
             a   -=   z1   *   z2   ;
             i   +=   z1   *   w2   ;

             k   +=   w1   *   x2   ;
             j   +=   w1   *   y2   ;
             i   -=   w1   *   z2   ;
             a   -=   w1   *   w2   ;

        console . log ( a   +   " "   +   i   +   " "   +   j   +   " "   +   k ) ; // Output the resulting quaternion components.
                                                                                   // The output format is space-separated numbers.

    }                                                                          // End of the inner loop (for I < N)

}                                                                              // End of the main loop (while true)