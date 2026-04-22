/*
 * This JavaScript code reads input from standard input,
 * processes each line (or segment separated by whitespace)
 * according to a specific algorithm, and outputs a calculated
 * integer result for each segment to the console.
 *
 * This implementation makes extensive use of method chaining
 * and compact loop structures.
 */

// Utilize the Node.js 'fs' module to interact with the file system.
require ( "fs" )

    // Synchronously read the entire content of '/dev/stdin' (standard input).
    // The input is expected to be encoded in UTF-8.
    . readFileSync (
        "/dev/stdin" , // Path to the input source
        'utf8'         // Character encoding for the input
    )

    // Remove any leading or trailing whitespace characters from the entire
    // string content that was read from standard input.
    . trim ( )

    // Split the cleaned input string into an array of substrings.
    // The splitting is performed using any whitespace character (/\s/) as a delimiter.
    . split (
        / \s / // Regular expression to match any whitespace character
    )

    // Iterate over each individual string element within the array produced
    // by the 'split' operation. For each element, a transformation function
    // is applied. The return value of this map operation is an array of
    // 'undefined' since the inner function primarily performs a side effect
    // (console.log) and doesn't explicitly return a value for the map.
    . map (

        /*
         * This anonymous function serves as the callback for the 'map' method.
         * It takes a single string argument 'i' (representing one segment
         * from the input) and performs a series of calculations.
         */
        function ( i ) {

            // Declare variable 'j' and assign it an array.
            // This array is formed by splitting the current input segment 'i'
            // using a comma (',') as the delimiter.
            j = i . split ( ',' ) ;


            // Initialize 's' (accumulator), 'm' (loop counter), and 'n' (index).
            // Both 'm' and 'n' are initially set to 10.
            // This loop iterates downwards from 10, updating elements of 'j'
            // based on a running sum/difference.
            for (
                s = 0 , // Initialize sum 's' to zero
                m = n = 10 ; // Initialize both 'm' and 'n' to 10
                m -- ;       // Loop condition: decrement 'm' after each iteration; continue while 'm' is non-negative
            ) {
                // In-place calculation:
                // 1. Subtract j[m] from 's' and assign the result back to 's'.
                // 2. Assign the new value of 's' to j[m].
                // This effectively computes a reverse cumulative difference.
                j [ m ] = s -= j [ m ] ;
            }


            // Initialize 'a' and perform a calculation on 's'.
            // This second 'for' loop then finds a specific index 'n'
            // by decrementing 'n' until a certain condition is met.
            for (
                a = - j [ 11 ] ,                         // Initialize 'a' with the negative of j[11]
                s *= a / ( a - j [ n ] ) ;               // Update 's' based on 'a' and j[n]
                j [ -- n ] >= s ;                        // Loop condition: Decrement 'n' BEFORE evaluation; continue if j[new_n] is greater than or equal to 's'
            ) {
                // The body of this for loop is intentionally empty.
                // All the logic (initialization, condition, and iteration step)
                // is contained within the 'for' statement itself.
                ;
            }

            // Increment 'n' by one, and then print the final value of 'n'
            // to the standard output (console).
            console . log ( ++ n ) ;
        }
    )
; // End of the chained method calls.