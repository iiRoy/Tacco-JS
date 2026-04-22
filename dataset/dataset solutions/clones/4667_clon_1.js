function myout( text ) {
    console.log( text );
} /* This is a utility function for logging output to the console. */


/**
 * The main function that processes the input and produces the desired output.
 * @param {string} input - The raw input string, typically from stdin.
 */
function Main( input ) {

    // Parse the input string into an integer.
    input = parseInt( input );

    // Check for a specific base case where the input value is 1.
    if ( input == 1 ) {
        myout( "1" ); // Output "1" as per the problem logic for this case.
        return;       // Exit the function early.
    }

    // Get a sorted list of all divisors for the given input number.
    var list = getDivisorList( input );

    /* Initialize the output variable with a default or maximum possible value.
     * The problem implies we're looking for a minimum value, so starting high is appropriate. */
    var output = 20;

    // Iterate through half of the divisor list to find pairs (divisor, complement_divisor).
    // This optimization avoids redundant calculations as divisors come in pairs.
    for ( var i = 0; i < list.length / 2; i++ ) {
        var mae = list[ i ];                                // The current divisor from the beginning of the list.
        var ato = list[ list.length - ( i + 1 ) ];          // The corresponding divisor from the end of the list.

        // Calculate the maximum number of digits between the current pair of divisors.
        // Then, update the overall minimum output if this pair yields a smaller result.
        output = Math.min( output, getKeta( mae, ato ) );
    }

    // Output the final calculated minimum value.
    myout( output );
}


/**
 * Calculates the maximum number of digits between two given numeric values.
 * This is achieved by converting both numbers to strings and comparing their lengths.
 * @param {number} val1 - The first numeric value.
 * @param {number} val2 - The second numeric value.
 * @returns {number} The greater of the two digit counts.
 */
function getKeta( val1, val2 ) {
    return Math.max( val1.toString().length, val2.toString().length );
}


/*
 * This function efficiently generates a sorted list of all positive divisors for a given number.
 * It uses an optimized approach by checking integers up to the square root of the number.
 * If 'i' is a divisor, then 'val / i' is also a divisor.
 */
function getDivisorList( val ) {
    var list = []; // Initialize an empty array to store divisors.

    // Loop from 1 up to the square root of 'val'.
    for ( var i = 1; i * i <= val; i++ ) {
        // If 'i' divides 'val' evenly, then 'i' is a divisor.
        if ( val % i == 0 ) {
            list.push( i ); // Add 'i' to the list of divisors.

            // If 'i * i' is not equal to 'val', it means 'i' and 'val / i' are distinct divisors.
            // (e.g., for 12, i=2, val/i=6; for 9, i=3, val/i=3, so we only add 3 once).
            if ( i * i != val ) {
                list.push( val / i ); // Add the complementary divisor.
            }
        }
    }

    // Sort the collected divisors in ascending order numerically.
    list.sort( function( a, b ) {
        return a - b;
    } );

    return list; // Return the sorted list of divisors.
}

// Entry point: read input from stdin, process it, and call the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );