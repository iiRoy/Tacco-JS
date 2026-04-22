/* This is a Type I clone of the original JavaScript code.
 * It demonstrates changes only in whitespace and comments,
 * while maintaining the exact same functional logic and identifiers.
 */

// Declare the 'input' variable to accumulate all standard input data.
var input = "";



// Resume the standard input stream to allow data reception.
process.stdin.resume();


// Set the encoding for the incoming data from standard input to UTF-8.
process.stdin.setEncoding('utf-8');



// Attach an event listener for the 'data' event on the standard input stream.
// This function is called whenever new data (a 'chunk') is available.
process.stdin.on('data', function(chunk) {
    // Append the received data chunk to the 'input' string.
    input += chunk;
});



// Attach an event listener for the 'end' event on the standard input stream.
// This function executes once all input data has been received.
process.stdin.on('end', function() {

    // Split the accumulated input string by newline characters into an array of lines.
    input = input.split("\n");

    // Initialize an index 'i' to iterate through the lines of input.
    i = 0; // 'i' is an implicitly global variable, as per original.

    // Begin a loop to process each line of input.
    // The loop continues as long as the current line's value is not '0'.
    while (input[i] != 0) {

        // Split the current line by spaces to get an array of string components.
        arr = input[i].split(" "); // 'arr' is implicitly global.

        // Check for the specific termination condition:
        // if the first two components of the current line are both '0'.
        if (arr[0] == 0 && arr[1] == 0) {
            break; // Exit the while loop if the termination condition is met.
        }

        // Initialize a 'count' variable for the current iteration.
        // This variable will store the number of valid combinations found.
        count = 0; // 'count' is implicitly global.

        /*
         * Start of nested loops to find combinations of three distinct numbers (j, k, l).
         * The goal is to find combinations such that their sum equals arr[1].
         * Constraints: 1 <= j < k < l <= arr[0]
         */
        for (j = 1; j <= arr[0] - 2; j++) { // 'j' starts from 1. Max value is arr[0] - 2 to allow for k and l.
            for (k = j + 1; k <= arr[0] - 1; k++) { // 'k' starts from j+1. Max value is arr[0] - 1 to allow for l.
                for (l = k + 1; l <= arr[0]; l++) { // 'l' starts from k+1. Max value is arr[0].

                    // Check if the sum of the three chosen numbers equals the target value arr[1].
                    if (j + k + l == arr[1]) {
                        count++; // Increment the counter if a valid combination is found.
                    }
                } // End of innermost 'l' loop.
            } // End of middle 'k' loop.
        } // End of outermost 'j' loop.

        // After processing all combinations for the current line, print the total count.
        console.log(count);

        // Increment the line index to move to the next input line.
        i++;
    } // End of the 'while' loop.
}); // End of the 'end' event listener.