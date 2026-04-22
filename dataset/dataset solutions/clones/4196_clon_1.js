/*
 * This JavaScript file implements a solution for a specific problem.
 * It reads numerical data from standard input, performs complex calculations
 * involving binary representations and array manipulations, and
 * finally outputs a single maximum value to standard output.
 */

// The entire script is enclosed within an Immediately Invoked Function Expression (IIFE)
// to prevent global variable pollution and create a private scope for its variables.
( function ( ) {

    'use strict' ; // Enables strict mode, which helps catch common coding errors and improves performance.

    // Declare an array to store all lines read from the standard input.
    var lines = [ ] ;

    // Set up the readline interface to asynchronously process input line by line.
    require ( 'readline' )
        . createInterface ( {
            input  :  process . stdin  ,  // Specifies standard input as the source.
            output :  process . stdout   // Specifies standard output (though it's not used for direct output here).
        } )
        . on ( 'line' ,
            function ( line ) {
            // This callback function is executed every time a new line of input is received.
            lines . push ( line ) ; // Adds the current line to the 'lines' array.
        } ) ;

    // Attach an event listener for the 'end' event of the standard input stream.
    // This function will be executed once all input has been read.
    process . stdin . on ( 'end' ,  function ( ) {

        /*
         * The following block of code was originally commented out.
         * It appears to be an alternative or debugging snippet that iterates
         * through the lines and processes them into numbers.
         *
         // lines.forEach(function(line) {
         // var tokens = line.split(' ').map(Number);
         // console.log(tokens[0] + ' ' + tokens[1]);
         // }
         // )
         */
        ; // An empty statement, possibly for formatting or a placeholder.


        // --- Main problem-solving logic begins here ---

        // Parse the first element of the first line to get the value of N.
        // It's assumed lines[0] contains a space-separated number.
        var N = parseInt ( lines [ 0 ] . split ( " " ) ) ;

        // Initialize two empty arrays, F and P, which will store parsed data.
        var F = [ ] ;
        var P = [ ] ;

        // Loop to populate array F from input lines.
        // F[i] will store an array of strings, split from lines[i].
        for ( var i = 1 ; i <= N ; i ++ ) {
            F [ i ] = lines [ i ] . split ( " " ) ;
        }

        // Loop to populate array P from subsequent input lines.
        // The index (i + N) suggests P's data immediately follows F's data in the input.
        for ( var i = 1 ; i <= N ; i ++ ) {
            P [ i ] = ( lines [ i + N ] ) . split ( " " ) ;
        }

        // Initialize 'maxuriage' to a very low number.
        // This ensures that the first calculated 'uriage' will always be greater
        // and correctly set as the initial maximum.
        var maxuriage = -9999999999999 ;

        // The core loop iterates through possible "plans".
        // There are 2^10 (1024) possible plans, represented by integers from 1 to 1023.
        for ( i = 1 ; i < Math . pow ( 2 , 10 ) ; i ++ ) {

            // Convert the current integer 'i' into a 10-character binary string 'plan'.
            var plan = dump_int ( i ) ;

            // Initialize 'uriage' for the current plan to zero.
            var uriage = 0 ;

            // Inner loop: calculate the 'uriage' for the current 'plan' across all 'N' entries.
            for ( var t = 1 ; t < N + 1 ; t ++ ) {
                // Add the parsed integer from P, using the result of matchNum as the index.
                uriage += parseInt ( P [ t ] [ matchNum ( plan , F [ t ] ) ] ) ;
            }

            // Compare the calculated 'uriage' with the current 'maxuriage'.
            if ( uriage > maxuriage ) {
                maxuriage = uriage ; // If greater, update 'maxuriage'.

                /*
                 * These console log statements were commented out in the original code,
                 * likely used for debugging the plan and uriage values.
                 *
                 // console.log("plan:" + plan)
                 // console.log("uriage:" + maxuriage)
                 */

            } // End of if-condition for updating maxuriage.

        } // End of main loop iterating through plans.


        // After checking all possible plans, output the highest 'uriage' found.
        console . log ( maxuriage ) ;

        /*
         * Another commented-out console log from the original.
         * This one seems to be an unrelated calculation.
         *
         // console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1]) )
         */

        // --- End of main problem-solving logic ---

    } ) ; // End of the 'end' event handler for process.stdin.


} ) ( ) ; // End of the IIFE.


/**
 * Helper function: Converts an integer to a 10-character binary string.
 * It pads with leading zeros if the binary representation is shorter than 10 bits.
 *
 * @param {number} i - The integer to convert.
 * @returns {string} - A 10-character binary string.
 */
function dump_int ( i ) {
    var s = "" ; // String to build the binary representation.
    while ( i ) {
        s = ( i & 1 ) + s ; // Prepend the least significant bit (0 or 1).
        i >>>= 1 ;          // Unsigned right shift 'i' to process the next bit.
    }
    // Pad with leading zeros to ensure a length of 10, then slice from the end.
    return ( '0000000000' + s ) . slice ( -10 ) ;
}


/**
 * Helper function: Counts the number of positions where both input strings 'a' and 'b'
 * have a '1' at the same index.
 * It assumes 'a' and 'b' are binary strings of at least length 10.
 *
 * @param {string} a - The first binary string.
 * @param {string} b - The second binary string.
 * @returns {number} - The count of matching '1's.
 */
function matchNum ( a , b ) {
    var tlen = 10 ; // The target length for comparison.
    var mnum = 0 ;  // Counter for matching '1's.

    // Iterate up to the target length.
    for ( var i = 0 ; i < tlen ; i ++ ) {
        // Check if both strings have '1' at the current position.
        if ( a [ i ] == b [ i ] && a [ i ] == "1" ) {
            mnum ++ ; // Increment the counter if they match.
        }
    }
    return mnum ; // Return the final count.
}