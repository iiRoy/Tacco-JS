/*
 * This JavaScript code processes input from standard input (/dev/stdin).
 * It expects a series of comma-separated numbers, typically one per line,
 * and performs specific calculations and array manipulations for each line.
 *
 * The overall structure involves reading the file, trimming whitespace,
 * splitting it into individual data units, and then mapping each unit
 * through a complex function to derive a final result.
 */
require ( "fs" ) // Access the Node.js file system module
    . readFileSync ( "/dev/stdin" , // Specify the file path for standard input
                     'utf8'          // Define the encoding for reading the file
                   )
    . trim ( )                      // Remove any leading or trailing whitespace from the input string
    . split ( /\s/ )                // Split the input string into an array of substrings,
                                    // using any whitespace character as a delimiter.
                                    // This effectively separates each line or block of data.
    . map ( function ( i ) {        // For each substring 'i' (representing a line of data),
                                    // execute this anonymous function.
                                    // The return value of this function will form a new array.

        // Declare local variables used within this iteration of the map function.
        // These variables are scoped to this function call.
        var j ; // Will hold an array of numbers parsed from 'i'.
        var n ; // Used as an index/counter in loops.
        var m ; // Used as an index/counter in the first loop.
        var s ; // Used as a running sum or accumulator.

        // Step 1: Parse the input string 'i' into an array of numbers.
        // The string 'i' is expected to be comma-separated values.
        j = i . split ( ',' ) ; // Split 'i' by the comma character.

        // Step 2: Initialize loop counters and sum for the first processing phase.
        // All three variables 'n', 'm', and 's' are simultaneously initialized to 0.
        n = 0 ; // 'n' is initialized here but not used in the first loop.
        m = 0 ; // 'm' is the primary counter for the first loop.
        s = 0 ; // 's' will accumulate a sum/difference.

        // Step 3: First loop - Modify elements of 'j' and update 's'.
        // This loop runs exactly 10 times (for m from 0 to 9).
        for ( ; m < 10 ; m ++ ) {
            // In each iteration:
            // 1. Subtract j[m] from 's'.
            // 2. Assign the new value of 's' back to j[m].
            // This redefines j[m] based on a running sum calculation.
            j [ m ] = s -= j [ m ] ;
        }

        // Step 4: Perform a critical calculation to update 's'.
        // This calculation uses elements at indices 10 and 11 of array 'j'.
        // It's a compound assignment: s = s * (j[10] / (-j[10] - j[11]))
        s *= j [ 10 ] / ( - j [ 10 ] - j [ 11 ] ) ;

        // Step 5: Reset 'n' to 0 for the start of the second loop.
        // 'n' was initialized to 0 earlier and remained 0 as it wasn't used in the first loop.
        // This explicit reset ensures 'n' starts from 0 for the next phase.
        n = 0 ;

        // Step 6: Second loop - Find the first index 'n' that satisfies a condition.
        // This loop continues as long as the value j[n] is strictly greater than -s.
        // The loop body is empty (indicated by the semicolon after the for statement);
        // it only increments 'n' until the condition j[n] > -s becomes false.
        for ( ; j [ n ] > - s ; n ++ ) ; // Empty loop body

        // Step 7: Increment 'n' one last time and log the result to the console.
        // The pre-increment operator (++) means 'n' is incremented *before* its value is used
        // as an argument to console.log().
        // This effectively outputs the 1-based index (or 0-based index + 1) where the condition
        // j[n] > -s first failed.
        console . log ( ++ n ) ;

    } // End of the anonymous function passed to .map()
) ; // End of the chained method calls.