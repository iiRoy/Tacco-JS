/*
 * This file demonstrates reading from standard input,
 * processing the data, and writing to standard output.
 * It's a simple example of data manipulation in Node.js.
 */
/// <reference path="nodelib/node.js"/> // Original reference for IDEs/TypeScript.

// Start the standard input stream to listen for data.
process
    .stdin
        .resume(); // Explicitly call the 'resume' method to ensure the stream is flowing.


// Set the character encoding for the incoming data.
process
    .stdin
        .setEncoding( 'utf8' ); // All input will be treated as UTF-8 encoded text.


// Attach an event listener to the 'data' event of the standard input stream.
process
    .stdin
        .on (
            'data' , // The event type we are listening for.
            function ( chunk ) // The handler function, invoked with a 'chunk' of input data.
            {
                // Declare a variable 'a' to store the array of numbers.
                var a = chunk
                            .trim()        // Remove any leading or trailing whitespace from the received data chunk.
                            .split( " " ) ; // Split the cleaned string into an array using space as a delimiter.

                // Sort the array 'a' numerically in ascending order.
                // The comparison function (a - b) achieves this for numeric elements.
                a . sort (
                    function ( a , b ) // Anonymous function used for custom sort comparison.
                        {
                            return ( a - b ) ; // Standard numeric comparison: if a < b, returns negative; if a > b, returns positive.
                        }
                ) ; // End of the 'sort' method call.

                // Output the sorted array elements back to standard output, joined by spaces.
                console
                    .log (
                        a
                            .join( " " ) // Join the array elements into a single string, separated by spaces.
                    ) ; // End of the 'log' method call.
            }
        ) ; // End of the 'on' method call.