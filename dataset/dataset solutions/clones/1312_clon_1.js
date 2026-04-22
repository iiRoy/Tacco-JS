/*
 * This JavaScript code snippet is designed to read multiple lines of
 * numerical input from standard input (stdin).
 *
 * For each line, it calculates the sum of its individual digits.
 * Finally, it prints these sums to standard output (stdout),
 * with each sum appearing on a new line.
 */

// Declare and initialize a variable to store the entire input content.
// It will accumulate all data chunks received from stdin.
let content = ''; // An empty string, ready to be populated.


// The 'process.stdin' object is a standard Node.js stream for input.
// Calling 'resume()' ensures that the stdin stream is flowing and
// emitting 'data' events.
process.stdin.resume();


// Set the character encoding for the standard input stream.
// 'utf8' is a common and robust encoding for text data.
process.stdin.setEncoding(
  'utf8' // Specify UTF-8 encoding for incoming data.
);


// Attach an event listener for the 'data' event.
// This event fires whenever a new chunk of data is available from stdin.
process.stdin.on(
  'data', // The event name: 'data'.
  buf => { // The callback function, receiving a buffer 'buf'.

    // Append the received data chunk to the 'content' variable.
    // This effectively builds up the complete input string.
    content += buf; // Concatenate 'buf' to 'content'.

  } // End of the 'data' event handler function.
);


// Attach an event listener for the 'end' event.
// This event fires when the standard input stream has completely finished.
// This is where the accumulated content will be processed.
process.stdin.on(
  'end', // The event name: 'end'.
  () => { // The callback function, executed when input ends.

    /*
     * Process the accumulated 'content' string:
     * 1. Remove any leading or trailing whitespace.
     * 2. Split the string into an array of individual lines.
     * 3. Remove the last element, which is often an empty string
     *    due to a trailing newline character in the input.
     */
    const lines = content // Start with the full accumulated content.

      .trim() // Remove whitespace from both ends.

      .split(
        '\n' // Split the string into an array of substrings based on the newline delimiter.
      )

      .slice(
        0, // Start the slice from the beginning of the array.
        -1 // End the slice before the last element, effectively excluding it.
      );


    /*
     * For each line (which is expected to be a string of digits),
     * calculate the sum of its digits.
     * The 'map' method transforms each line into its corresponding digit sum.
     */
    const result = lines
      .map(
        num => // 'num' represents a single line string (e.g., "123").

          num // Take the current line string.

            .split(
              '' // Split the string into an array of individual character digits (e.g., ["1", "2", "3"]).
            )

            .map(
              n => // 'n' represents a single digit character (e.g., "1").

                parseInt(n, // Convert the character digit to an integer.
                  10 // Specify radix 10 for decimal conversion.
                )
            )

            .reduce(
              (
                prev, // The accumulator, holding the sum so far.
                cur // The current digit (integer) to add.
              ) =>
                prev + cur // Add the current digit to the running total.
            )
      );


    // Finally, print the 'result' array to standard output.
    // The 'join('\n')' method concatenates the elements of the 'result' array
    // back into a single string, with each sum separated by a newline character.
    console.log(
      result.join(
        '\n' // Use newline as the separator for joining the array elements.
      )
    );

  } // End of the 'end' event handler function.
);