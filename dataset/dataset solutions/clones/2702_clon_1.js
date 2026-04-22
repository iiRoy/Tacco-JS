/*
 * This is the main function that processes the input.
 * It calculates a specific output based on numerical lists.
 */
function Main ( input ) {
    // Parse the first line of input to get N.
    // N is an integer, but its usage isn't apparent in the provided snippet.
    var N = parseInt( input.split( "\n" ) [ 0 ] );

    // Extract the second line of input and split it into an array of strings for Alist.
    var Alist = input.split( "\n" ) [ 1 ].split( " " );

    // Extract the third line of input and split it into an array of strings for Blist.
    var Blist = input.split( "\n" ) [ 2 ].split( " " );


    // Iterate through Alist to convert its elements to integers.
    // Also, convert elements of Blist to integers where applicable.
    for ( var i = 0; i < Alist.length; i++ ) {
        Alist[ i ] = parseInt( Alist[ i ] );

        // Ensure i is within bounds for Blist before parsing.
        if ( i < Blist.length ) {
            Blist[ i ] = parseInt( Blist[ i ] );
        }
    }


    // Initialize the output variable to store the final calculated sum.
    var output = 0;


    // Main loop to calculate the output based on elements of Blist and Alist.
    for ( var i = 0; i < Blist.length; i++ ) {
        // Get current and next elements from Alist, and current element from Blist.
        var tmpA1 = Alist[ i ];
        var tmpA2 = Alist[ i + 1 ];
        var tmpB = Blist[ i ];

        // The following line is commented out in the original, keeping it that way.
        // console.log("tmpA1:" + tmpA1 + ",tmpA2:" + tmpA2 + ":tmpB:" + tmpB);

        // Conditional logic to update 'output' and 'Alist[i + 1]' based on tmpB, tmpA1, and tmpA2.
        if ( tmpB <= tmpA1 ) {
            // Case 1: tmpB is less than or equal to tmpA1.
            output += tmpB;
            continue;
        } else if ( tmpB > tmpA1 && tmpB < tmpA2 ) {
            // Case 2: tmpB is greater than tmpA1 but less than tmpA2.
            output += tmpB;
            Alist[ i + 1 ] = tmpA2 - ( tmpB - tmpA1 );
            continue;
        } else if ( tmpB > tmpA1 && tmpB > tmpA2 && tmpB < tmpA1 + tmpA2 ) {
            // Case 3: tmpB is greater than both tmpA1 and tmpA2, but less than their sum.
            output += tmpB;
            Alist[ i + 1 ] = tmpA2 - ( tmpB - tmpA1 );
            continue;
        } else {
            // Case 4: tmpB is greater than or equal to tmpA1 + tmpA2.
            output += tmpA1 + tmpA2;
            Alist[ i + 1 ] = 0; // Reset the next element of Alist.
            continue;
        }
    }

    // Log the final calculated output to the console.
    console.log( output );
}

// Call the main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );