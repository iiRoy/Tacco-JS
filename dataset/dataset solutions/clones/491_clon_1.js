/*
 * This is a Type I clone of an existing JavaScript program.
 * It demonstrates the exact same logic and structure,
 * but with extensive variations in whitespace and comments.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved precisely as in the original code.
 *
 * This version aims to be visually distinct while maintaining
 * byte-for-byte functional equivalence (excluding whitespace/comments).
 */


  var input  =  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' );

// Process the input string to get an array of lines
    var Arr = ( input . trim() ) . split ( "\n" ) ;

// Main processing loop: continues until a specific termination condition is met
while ( true ) {

    // Read the first number from the array, converting it to a numeric type.
    // The `-0` is a common JavaScript idiom for explicit numeric conversion.
    var N = Arr . shift() - 0 ;

    // Termination condition: If N is 0, exit the loop.
    if ( N == 0 ) {
       break ;
    }

    // Initialize a flag to "OK" for the current iteration's status.
    var flag = "OK" ;

    // Array to store the parsed 'mab' data for the current N.
    var mab = [ ] ;

    // Loop to read N lines of data and populate the 'mab' array.
    for ( var i = 0 ; i < N ; i ++ ) {
        // Each line is split by space and its parts are converted to numbers.
        var arr = ( Arr . shift() ) . split ( " " ) . map ( Number ) ;
        // Add the processed array to the 'mab' collection.
        mab . push ( arr ) ;
    }

    // Re-initialize the flag to "OK". This re-declaration is part of the original structure.
    var flag = "OK" ;

    // Second main loop: iterates through the 'mab' data to perform calculations.
    for ( var i = 0 ; i < N ; i ++ ) {

        // If the flag has already been set to "NG", no need to continue processing this N.
        if ( flag == "NG" ) {
           break ;
        }

        // Extract values W, A, B from the current 'mab' entry.
        var W = mab [ i ] [ 0 ] ; // Weight
        var A = mab [ i ] [ 1 ] ; // Start range
        var B = mab [ i ] [ 2 ] ; // End range

        // Inner loop: compares the current item (i) with all other items (j).
        for ( var j = 0 ; j < N ; j ++ ) {
            // Skip comparison if it's the same item.
            if ( i == j ) {
                continue ;
            }

            // Extract 'a' and 'b' from the other item (j).
            var a = mab [ j ] [ 1 ] ;
            var b = mab [ j ] [ 2 ] ;

            // Check for overlap condition and update W if there's an overlap.
            // If A (current start) is less than b (other end) AND B (current end) is greater than a (other start),
            // then there's an overlap.
            if ( A < b && B > a ) {
                W += mab [ j ] [ 0 ] ; // Add the weight of the overlapping item.
            }

            // Check if the accumulated weight W exceeds the threshold.
            if ( W > 150 ) {
                flag = "NG" ; // Set flag to "NG" if threshold is exceeded.
            }
        }
    }

    // Output the final status flag for the current set of N items.
    console . log ( flag ) ;
}

/* End of Type I cloned JavaScript file. */