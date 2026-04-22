/*
 * This JavaScript file processes input from the standard input stream (stdin).
 * It calculates a maximum value based on numerical inputs provided line by line.
 *
 * This section is responsible for initializing the standard input stream.
 */
process . stdin . resume ( ) ; // Explicitly resumes the standard input stream to ensure data flow.

// A blank line for visual separation.


// Next, we configure the encoding for the incoming data.
// It's crucial for correct interpretation of characters.
process . stdin . setEncoding (   'utf8'   ) ; // Sets the character encoding for stdin to UTF-8.


/*
 * The core logic of the program resides within this event listener.
 * It triggers every time 'data' is received from the standard input.
 * The 'raw' parameter contains the incoming data chunk.
 */
process.stdin.on ( 'data' ,   function ( raw )
{
    // First step: parse the raw input data.
    // The input is expected to be multiple lines, so we split by newline characters.
    raw   =   raw   .   split   (   '\n'   )   ;

    // We now iterate through each line (which we refer to as 'row') obtained from the split input.
    // The 'for...in' loop iterates over the enumerable properties of an object,
    // which for an array are its indices.
    for   (   var   row   in   raw   )
    {
        // Inside the loop, each 'row' (line) is further split by space characters.
        // This assumes that numbers within a line are space-separated.
        row   =   raw   [   row   ]   .   split   (   ' '   )   ;

        // A conditional check to ensure that the first three elements of the split 'row'
        // are present and can be coerced to a truthy value.
        // This guards against processing empty or malformed lines.
        if   (   row   [   0   ]   |   row   [   1   ]   |   row   [   2   ]   )
        {
            // Type coercion: Convert the string elements to integers using the bitwise OR operator with 0.
            // This is a common JavaScript idiom for a quick floor-like conversion to number.
            row   [   0   ]   |=   0   ;
            row   [   1   ]   |=   0   ;
            row   [   2   ]   |=   0   ;

            // Initialize a variable 'max' to store the highest calculated value.
            // It starts at 0, assuming non-negative results.
            var   max   =   0   ;

            // Calculate 'rate1' based on the first number in the row.
            // The formula is (number / 100) + 1.
            var   rate1   =   row   [   0   ]   /   100   +   1   ;

            // Calculate 'rate2' based on the second number in the row.
            // The formula is similar: (number / 100) + 1.
            var   rate2   =   row   [   1   ]   /   100   +   1   ;

            /*
             * Nested loops begin here.
             * These loops iterate through a range of integer values for 'i' and 'j'.
             * Both 'i' and 'j' go from 1 up to, but not including, 1000.
             */
            for   (   var   i   =   1   ;   i   <   1000   ;   i   ++   )
            {
                for   (   var   j   =   1   ;   j   <   1000   ;   j   ++   )
                {
                    // Inside the innermost loop, a condition is evaluated.
                    // It checks if the sum of (i * rate1) and (j * rate1), both truncated to integers
                    // (using bitwise OR with 0), is strictly equal to the third number from the input row.
                    if   (   (   i   *   rate1   |   0   )   +   (   j   *   rate1   |   0   )   ===   row   [   2   ]   )
                    {
                        // If the condition is true, we update 'max'.
                        // 'max' is set to the larger of its current value and the newly calculated sum
                        // of (i * rate2) and (j * rate2), again truncated to integers.
                        max   =   Math   .   max   (   max   ,   (   i   *   rate2   |   0   )   +   (   j   *   rate2   |   0   )   )   ;
                    }
                } // End of inner 'for' loop for 'j'.
            } // End of outer 'for' loop for 'i'.

            // After all calculations for the current row are complete,
            // the final 'max' value is printed to the standard output.
            console   .   log   (   max   )   ;
        } // End of the 'if' block that checks for valid row elements.
    } // End of the 'for...in' loop iterating over input rows.
} ) ; // End of the 'data' event listener callback function.