function Main( input ) {
        // This is the main function that processes the input.

    var data  =  input.split( "\n" ) ; // Split the entire input string into an array of lines.
    var n   =  data[ 0 ] ; // The first line of input represents 'n'.
    var masu = data[ 1 ].split( " " ).map( ( n ) => parseInt( n, 10 ) ) ;
    // The second line is split by spaces and parsed into integers.

    var max  =  0 ; // Initialize maximum count.
    var t   =  0 ; // Initialize current count.

    for ( var i = ( n - 1 ) ; i >= 0 ; i-- ) {
        // Loop through the 'masu' array in reverse order.
        console.log( masu[ i ], masu[ i - 1 ] ) ; // For debugging: print current and previous element.

        if ( masu[ i ] <= masu[ i - 1 ] ) {
            // Check if the current element is less than or equal to the previous one.
            t++ ; // Increment current count if condition met.

            if ( t > max ) max = t ; // Update maximum if current count exceeds it.

        } else if ( masu[ i ] > masu[ i - 1 ] ) {
            // If the condition is not met (current > previous).
            t = 0 ; // Reset current count.
        }

    }
    // End of the main loop.
    console.log( max ) ; // Output the final maximum count.

}

/* This section handles reading input from stdin and calling the main function. */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;