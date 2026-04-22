/*
 * This JavaScript file processes numerical input from stdin.
 * It reads a sequence of numbers, filters out zeros,
 * then calculates the sum of the minimums of two sub-arrays,
 * finally subtracting 50 from the result.
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

// Establish standard input stream readiness for continuous operation
process . stdin . resume ( ) ;


// Set the character encoding for the incoming data stream
process . stdin . setEncoding ( 'utf8' ) ;


// Register an event listener for 'data' chunks received via standard input
process
    . stdin
        . on (
            'data' ,
            function ( chunk )
            {
                /*
                 * Process the raw input chunk through a series of transformations:
                 * 1. Convert the Buffer/string 'chunk' into a standard string.
                 * 2. Split the string into an array of substrings using newline characters as delimiters.
                 * 3. Map each substring to its numerical representation.
                 * 4. Filter out any resulting numbers that are exactly zero.
                 */
                let n = chunk . toString ( ) /* First, convert the input chunk to its string equivalent */
                            . split ( "\n" ) /* Then, divide the string into individual lines based on newline characters */
                                . map ( x => Number ( x ) ) /* Subsequently, transform each line (string) into a numerical value */
                                    . filter ( x => x !== 0 ) ; /* Finally, remove all elements that are numerically equal to zero */

                // Define two distinct sub-arrays from the processed 'n' array
                const a = n . slice ( 0 , 3 ) ; // Extracts the initial three elements (indices 0, 1, 2)
                const b = n . slice ( 3 , 5 ) ; // Extracts elements from index 3 up to (but not including) index 5

                // Determine the minimum value within each of the previously defined sub-arrays
                const data1 = Math . min . apply ( null , a ) ; /* Computes the smallest number within array 'a' (e.g., 9) */
                const data2 = Math . min . apply ( null , b ) ; /* Computes the smallest number within array 'b' (e.g., 1) */


                // Perform the final arithmetic calculation using the two minimum values
                const ans = data1 + data2 - 50 ;

                // Output the calculated answer to the standard console output
                console . log ( ans ) ;

            }
        )
; // End of the 'data' event listener for process.stdin