function Main ( input ) {
    var tmp = input[ 0 ].split( " " ); // Split the first line of input values.
    var N   = tmp[ 0 ];                  // Assign the first value to N.
    var K   = tmp[ 1 ];                  // Assign the second value to K.

    var A   = input[ 1 ].split( " " ); // Split the second line into array A.
    var F   = input[ 2 ].split( " " ); // Split the third line into array F.


    // Original debug output (commented out):
    // console.log( "N:%s K:%s", N, K );


    // Sort array A in descending order.
    // This custom sort function ensures elements are arranged from largest to smallest.
    A.sort( function ( a, b ) {
        if ( a > b ) {
            return -1; // a should come before b
        }
        if ( a < b ) {
            return 1;  // b should come before a
        }
        return 0;      // a and b are considered equal
    } );


    // Sort array F in ascending order.
    // This custom sort function ensures elements are arranged from smallest to largest.
    F.sort( function ( a, b ) {
        if ( a > b ) {
            return 1;  // b should come before a
        }
        if ( a < b ) {
            return -1; // a should come before b
        }
        return 0;      // a and b are considered equal
    } );


    // Initialize variables for a binary search-like iterative process.
    // 't' represents an upper bound, 'd' represents a lower bound.
    var t = 1000000;
    var d = 0;


    // Continue iterating while the lower bound 'd' plus one is less than the upper bound 't'.
    while ( d + 1 < t ) {
        // Calculate the midpoint 'c' between 'd' and 't'.
        c = ( d + t ) / 2;

        // Initialize a sum variable 's' for the current iteration.
        var s = 0;

        // Loop through the 'N' elements.
        for ( var i = 0; i < N; i++ ) {
            // Add the maximum of two values to 's':
            // 1. A[i] minus (c divided by F[i])
            // 2. Zero
            // This ensures 's' does not decrease due to negative results.
            s += max( A[ i ] - c / F[ i ], 0 );
        }

        // Check if the accumulated sum 's' is less than or equal to K.
        if ( s <= K ) {
            // If true, update the upper bound 't' to 'c'.
            // This means the solution might be 'c' or lower.
            t = c;
        } else {
            // If false, update the lower bound 'd' to 'c'.
            // This means the solution must be higher than 'c'.
            d = c;
        }
    }


    // Output the final values of 'd' and 't' after the loop terminates.
    console.log( "d:%s t:%s", d, t );
}


// Call the Main function with input read from standard input.
Main(
    require( "fs" ) // Access the Node.js file system module.
        .readFileSync( "/dev/stdin", "utf8" ) // Read the entire content of stdin as a UTF-8 string.
        .split( "\n" ) // Split the read content by newline characters into an array of strings.
);