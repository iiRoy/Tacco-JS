/**
 * This file contains a JavaScript program.
 * Original creation date: 2013-10-06.
 * It reads input from stdin, processes character codes,
 * and outputs a Brainf***-like string.
 * This is a Type I clone, preserving all logic and identifiers.
 */

// Core Node.js 'fs' module for file system operations.
var fs         = require('fs'),

    // Determine the size of the standard input stream.
    length = fs.fstatSync( process.stdin.fd ).size,

    // Allocate a buffer to hold the input data.
    buffer     = new Buffer(length),

    // Read bytes from stdin into the buffer.
    bytesRead  = fs.readSync( process.stdin.fd, buffer, 0, length, 0),

    // Convert the buffer to a UTF-8 string and split by newlines.
    input      = buffer.toString( 'utf8', 0, bytesRead ).split('\n');


// Call the main function to start program execution.
main();


/**
 * The primary function where the core logic resides.
 * Processes the input string and generates the output.
 */
function main() {

    // Retrieve the first line of input.
    var str = input[0],

        // Initialize the answer string.
        ans = '',

        // Declare loop counters and temporary variables.
        i, len, j, diff, sqr, pmchar,

        // Store the previous character code, initialized to 0.
        prev = 0,

        // A threshold value used in the logic.
        N = 16,

        // An array to store character codes.
        charCodeList = [];


    // First loop: Populate charCodeList with character codes from the input string.
    for (i = 0, len = str.length; i < len; i++) {
        // Get the character code at the current index.
        charCodeList[i] = str.charCodeAt(i);
    }


    // Second loop: Iterate through character codes to build the output string.
    // The 'prev' variable is updated at the end of each iteration.
    for (i = 0; i < len; prev = charCodeList[i], i++) {

        // Calculate the difference between current and previous character codes.
        diff = charCodeList[i] - prev;

        // If the difference is zero, append a '.' and move to the next character.
        if (diff === 0) {
            ans += '.';
            continue;
        }

        // Determine if the difference is positive or negative.
        pmchar = diff > 0 ? '+' : '-';

        // Get the absolute value of the difference.
        diff = Math.abs(diff);

        // Check if the absolute difference is less than N.
        if (diff < N) {

            // If small, simply append 'pmchar' 'diff' times.
            for (j = diff; j > 0; j--) {
                ans += pmchar;
            }
        } else {
            // If large, use a more complex Brainf***-like sequence.

            // Calculate the integer square root of 'diff'.
            sqr = ~~Math.sqrt(diff);

            // Move pointer to a new cell.
            ans += '>';

            // Increment/decrement the new cell 'sqr' times.
            for (j = sqr; j > 0; j--) {
                ans += '+';
            }

            // Start a loop: decrement current cell, move left,
            // apply 'pmchar' 'sqr' times, move right.
            ans += '[<';
            for (j = sqr; j > 0; j--) {
                ans += pmchar;
            }
            ans += '>-]<';

            // Handle the remainder (diff - sqr * sqr).
            for (j = diff - sqr * sqr; j > 0; j--) {
                ans += pmchar;
            }

        }

        // Append a '.' after processing each character.
        ans += '.';
    }

    // Output the final generated string to the console.
    console.log(ans);
}