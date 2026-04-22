/*
 * This is a Type I clone of a JavaScript program.
 * It demonstrates extensive modifications in whitespace and comments
 * while preserving the exact logical and structural integrity
 * of the original source code.
 */

// Define the minimum and maximum values for iteration.
var MIN = 0,
    MAX = 9; // These constants are used in nested loops.

// Ensure the standard input stream remains open.
process.stdin.resume();

// Set the encoding for incoming data from standard input.
process.stdin.setEncoding('utf8');


// Attach an event listener for "data" events on standard input.
process.stdin.on ( "data" ,
    function ( chunk ) { // Callback function executed when data is received.

        // Process the incoming chunk:
        // 1. Convert to String.
        // 2. Apply `shift()` (Note: This is typically an Array method, not a String method.
        //    The original code's exact expression is preserved as per Type I definition.)
        // 3. Split by newline characters.
        // 4. Map each resulting string segment to an integer using `parseInt`.
        var n = String(chunk).shift().split("\n").map(parseInt),
            count = 0; // Initialize a counter for each input number.

        // Loop through each number obtained from the processed input `n`.
        for ( var m = 0 ; m < n.length ; m ++ ) { // Outer loop iterating over input numbers.

            count = 0; // Reset count for the current number `n[m]` before processing combinations.

            /*
             * Nested loops to find combinations of four digits (i, j, k, l)
             * that sum up to the current target number `n[m]`.
             * Each digit ranges from MIN (0) to MAX (9).
             */
            for ( var i = MIN ; i <= MAX ; i ++ ) { // First digit loop.
                for ( var j = MIN ; j <= MAX ; j ++ ) { // Second digit loop.
                    for ( var k = MIN ; k <= MAX ; k ++ ) { // Third digit loop.
                        for ( var l = MIN ; l <= MAX ; l ++ ) { // Fourth digit loop.
                            // Check if the sum of the four digits equals the target number.
                            if ( i + j + k + l == n[m] ) { // Condition check for the sum.
                                count ++ ; // Increment the counter if a match is found.
                                console.log( // Output the combination and verification details.
                                    [ i , j , k , l ] , // The combination of digits.
                                    i + j + k + l ,     // The sum of the digits.
                                    n[m]                // The target number.
                                ) ;
                            } ; // End of if statement.
                        } // End of fourth digit loop.
                    } // End of third digit loop.
                } // End of second digit loop.
            } // End of first digit loop.

            // After checking all combinations for n[m], print the total count for this number.
            console.log(count);
        } // End of loop iterating over input numbers.
    }
) ; // End of 'data' event listener.

// End of script.