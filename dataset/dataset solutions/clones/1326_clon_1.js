/*
 * This JavaScript code reads input from standard input, processes it,
 * and then prints the result to standard output.
 * It's designed to solve a specific card-shuffling problem where
 * card strings are repeatedly cut and rejoined based on input parameters.
 */

// Initialize a variable to accumulate all incoming data from stdin.
var input = '';


// Get a reference to the standard input stream object.
var readable = process.stdin;


// Ensure the stdin stream is in flowing mode to receive data events.
readable.resume();


// Set the character encoding for the incoming data to UTF-8.
readable.setEncoding('utf-8');


// Attach an event listener for when data chunks are received from stdin.
readable.on('data', function (chunk) {
    // Append the received chunk of data to the 'input' string.
    input += chunk;
});


// Attach an event listener for when the input stream has ended (EOF).
readable.on('end', function () {

    // Split the accumulated input string into an array of lines, using newline as delimiter.
    var data = input.split("\n");

    // Initialize an array to store the processed output card strings.
    var output = [];

    // Initialize an index for iterating through the 'data' array.
    var i = 0;

    /*
     * Loop through the input data until a line containing only a hyphen '-' is encountered.
     * This hyphen acts as a sentinel value to indicate the end of the input sets.
     */
    while ('-' != data[i]) {
        // The current line contains the initial card string.
        var cards = data[i++];

        // The next line contains the number of shuffle operations (m) to perform for this card set.
        var m = data[i++];

        // Loop 'm' times to perform each specified shuffle operation.
        for (var j = 0; j < m; j++) {
            // Each shuffle operation specifies a cut point 'h'.
            var h = data[i++];

            // Perform the card shuffle:
            // Take the substring from 'h' to the end, and concatenate it with
            // the substring from the beginning up to 'h'. This effectively moves
            // the first 'h' characters to the end of the string.
            cards = cards.substr(h) + cards.substr(0, h);
        }

        // After all shuffles for the current card set are complete,
        // add the resulting card string to the 'output' array.
        output.push(cards);
    }

    // After processing all card sets, print the accumulated output to stdout.
    // Each processed card set will be joined by a newline character.
    console.log(output.join('\n'));
});