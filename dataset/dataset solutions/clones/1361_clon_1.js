/*
 * This JavaScript program processes input lines from stdin.
 * It reads each line, splits it into numbers, sorts them numerically,
 * and then prints the sorted numbers back to stdout, space-separated.
 */

// Set up an event listener for incoming data on the standard input stream.
process.
    stdin.
        on(
            'data', // The event name for incoming data.
            function(
                line // The incoming data, typically a buffer or string.
            ) {
                // Convert the data buffer to a string, if it isn't already.
                // Then process the string.
                console.
                    log(
                        line.
                            split(
                                ' ' // Delimiter to split the string into an array of substrings.
                            ).
                            sort(
                                // Custom comparison function for numeric sorting.
                                function(
                                    a, // First element for comparison.
                                    b  // Second element for comparison.
                                ) {
                                    // Perform a numeric comparison.
                                    // If a < b, returns a negative number.
                                    // If a > b, returns a positive number.
                                    // If a == b, returns zero.
                                    return a - b;
                                }
                            ).
                            join(
                                ' ' // Delimiter to join the array elements back into a string.
                            )
                    );
            }
        ); // End of the 'on' method call.

// The program will continue to listen for 'data' events until stdin closes.