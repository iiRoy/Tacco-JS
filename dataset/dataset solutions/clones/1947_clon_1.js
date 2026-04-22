// This script processes input from standard input.
// First, ensure the stdin stream is active.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


// Initialize an empty array to store input lines.
var lines = [];

/*
 * Create a readline interface to handle input line by line.
 * This interface reads from stdin and writes to stdout (though output is not used in this specific example for prompting).
 */
var reader = require('readline').createInterface(
    {
        input:  process.stdin, // The input stream source.
        output: process.stdout // The output stream destination (not actively used for prompts here).
    }
);


// Event listener: when a line of input is received.
reader.on(
    'line',
    (line) => {
        // Add the received line to our 'lines' array.
        lines.push(line);
    }
);


// Event listener: when the input stream 'close' event is emitted.
reader.on(
    'close',
    () => {
        /*
         * Once all input is received and the stream closes,
         * process the collected lines.
         */

        // The first line (lines[0]) is expected to be a number 'n'.
        var n = Number(lines[0]);

        // Create a new Set to store unique stock items.
        // Sets automatically handle uniqueness.
        var stock = new Set();

        // Loop from the second line (index 1) up to 'n' lines.
        // Each of these lines represents a stock item.
        for ( i = 1;  i <= n;  i++ ) {
            // Add the current line (stock item) to the Set.
            stock.add(lines[i]);
        }

        // Output the total number of unique stock items.
        console.log(stock.size);


    } /* End of 'close' event handler function */
); // End of reader.on('close') call