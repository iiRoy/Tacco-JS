require ( "fs" ) // Access the Node.js 'fs' (file system) module.
    . readFileSync (
        /*
         * Specify the file path for reading.
         * "/dev/stdin" is a common Unix-like path for standard input on POSIX systems.
         */
        "/dev/stdin" ,
        /*
         * Define the character encoding for the input file.
         * "utf8" is a widely used and robust character encoding.
         */
        "utf8"
    )
    . split (
        /*
         * Split the entire input content (read as a single string)
         * into an array of strings. Each element in the array
         * will correspond to a single line from the input,
         * delimited by the newline character.
         */
        '\n'
    )
    . map (
        /*
         * Iterate over each element (line string) in the array using the 'map' method.
         * The anonymous function provided here will be executed for each line.
         * 'i' represents the current line string being processed.
         */
        function ( i ) {
            // Declare and initialize two variables, 'j' and 's', within the function's scope.
            // These are implicitly declared if not in strict mode, or become properties of 'window' in browser.
            // 'j' will hold the numeric value of the current input line.
            // 's' will accumulate the sum for the calculation.
            j = + i , // Convert the string 'i' to a number using the unary plus operator.
            s =   0 ; // Initialize 's' (the sum) to zero.

            /*
             * Ternary operator:
             * This checks if the value of 'j' is truthy.
             * In JavaScript, 0, null, undefined, NaN, and an empty string are falsy.
             * Any other value is truthy.
             */
            j
                ? (
                    // If 'j' is truthy (i.e., a non-zero number), execute this block.
                    /*
                     * This 'while' loop calculates the number of trailing zeros
                     * in the factorial of 'j'. It does this by repeatedly dividing 'j' by 5
                     * (integer division) and summing up the results.
                     * This is based on Legendre's formula.
                     */
                    while (
                        /*
                         * Loop condition and assignment:
                         * 'j' is reassigned to the integer part of 'j' divided by 5.
                         * The '~~' operator performs a double bitwise NOT, which effectively
                         * truncates the decimal part (like Math.floor() for positive numbers).
                         * The loop continues as long as this new value of 'j' is non-zero.
                         */
                        j = ~~ ( j / 5 )
                    )
                        // Add the current (floor-divided) value of 'j' to the sum 's'.
                        // This counts the multiples of 5, then 25, then 125, and so on.
                        s += j
                    ; // Semicolon to separate the while loop from the next statement.

                    // After the while loop has completed, print the final calculated sum 's'
                    // to the standard output (console).
                    console . log ( s )
                )
                : // If 'j' is falsy (e.g., the input line was empty or "0"),
                // The '0' here serves as the result for the 'false' branch of the ternary operator.
                // In this context, it effectively means "do nothing" for falsy inputs.
                0
        }
    )
; // Semicolon terminating the entire chained expression.