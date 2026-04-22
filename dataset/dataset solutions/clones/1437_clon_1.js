/*
 * This JavaScript code snippet is designed to process
 * input received via standard input (stdin).
 * It calculates a specific mathematical expression
 * based on numerical values extracted from the input
 * and prints the result to standard output.
 */

process
    .   stdin                                   // Access the standard input stream
    .   on  (
            "data"  ,                           /* Event listener: Triggers when data is available */

            // Anonymous function to handle the incoming data chunk.
            // 'c' is the data chunk (Buffer), 's' will be used for processed data.
            function    (   c   ,   s   )       {

                // Convert the incoming Buffer 'c' to a string,
                // remove leading/trailing whitespace,
                // and then split the string by spaces into an array 's'.
                s   =   (   c   +   ""  )   .   trim    (   )   .   split   (   " " )   ;

                // Perform a mathematical calculation:
                // Calculate sqrt((s[0]+s[2])^2 + (s[1]+s[3])^2).
                // This seems to be a variation of Euclidean distance where coordinates are summed instead of differenced.
                // The result is then formatted to 8 decimal places.
                console
                    .   log (
                                Math
                                    .   sqrt    (                               // Calculate the square root
                                                    Math
                                                        .   pow (   s   [   0   ]   +   s   [   2   ]   ,   2   )   +   // (s[0]+s[2]) squared
                                                    Math
                                                        .   pow (   s   [   1   ]   +   s   [   3   ]   ,   2   )     // (s[1]+s[3]) squared
                                                )
                                    .   toFixed (   8   )                       // Format to 8 decimal places
                        )   ;

            }
        )
    .   resume  (   )                           /* Keeps the Node.js process running, waiting for more input */
    ;   // End of the method chaining for process.stdin