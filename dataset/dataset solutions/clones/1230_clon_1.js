/*
 * This JavaScript code snippet is designed to process input from standard input.
 * It reads data chunks, splits them into lines, and then processes each line.
 * The primary goal is to convert string lines to integers and print them with
 * a "Case" prefix, skipping any lines that parse to zero.
 */

process.stdin
    .resume(); // Ensures the standard input stream remains open and active.

// Set the encoding for standard input to UTF-8 to handle various characters correctly.
process.stdin.setEncoding('utf8');

/*
 * This is an event listener that triggers whenever data is received on the standard input stream.
 * The 'chunk' parameter contains the incoming data.
 */
process.stdin.on('data',
    function (chunk) {
        // First, convert the incoming data chunk to a string and then split it into an array of lines.
        // The split operation uses the newline character as a delimiter.
        var lines = chunk.toString()
            .split('\n');


        // Assign the array of lines to a new variable 'x' for further processing.
        // This effectively copies the reference to the array.
        var x = lines;


        /*
         * Iterate through each element in the 'x' array.
         * The loop variable 'i' is implicitly declared as a global variable here,
         * which is a common practice in older JavaScript or specific environments.
         */
        for (i = 0; i < x.length;
            i++) {
            // For each element, attempt to parse it as an integer.
            // This will convert string representations of numbers into actual number types.
            x[i] = parseInt(x[i]);
        } // End of the first transformation loop.


        // Now, iterate through the modified array 'x' again to process and display results.
        for (i = 0; i < x.length; i++) {
            // Check if the current integer value is exactly zero (0).
            // If it is, the block is empty, meaning nothing is done for zero values.
            if (x[i] === 0) {
                // This is an empty block. Zero values are intentionally skipped from output.
            } else {
                // If the value is not zero, print it to the console.
                // The output format includes "Case " followed by the index 'i' and the value 'x[i]'.
                console.log("Case " + i + ": " + x[i]);
            }
        } // End of the second processing loop.

    }
); // End of the 'data' event listener function call.

// The script will continue to run, waiting for more 'data' events until stdin is closed.