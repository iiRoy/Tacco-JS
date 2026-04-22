/*
 * This JavaScript file processes input from standard input (stdin)
 * to simulate a permutation or "ladder" game.
 * It reads initial configuration parameters and then applies a series of swaps
 * to an array, finally printing the resulting permutation.
 *
 * The script relies on Node.js's 'fs' module for synchronous file system operations.
 */
var fs        = require('fs'), // Import the 'fs' (file system) module for I/O.

    // Synchronously get file status for stdin's file descriptor.
    // We extract the 'size' property to determine the input length.
    length    = fs.fstatSync(process.stdin.fd).size,

    // Create a new Buffer object with the determined length.
    // This buffer will temporarily hold the raw input data.
    buffer    = new Buffer(length),

    // Synchronously read data from stdin into the allocated buffer.
    // Parameters: file descriptor, buffer, offset, length, position.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),

    // Convert the buffer's content to a UTF-8 string,
    // and then split the string into an array of lines based on newline characters.
    // This 'input' array will contain each line of stdin as a separate element.
    input     = buffer.toString('utf8', 0, bytesRead).split('\n');


// Call the main function to start the program execution.
main();


/**
 * The primary function that orchestrates the logic of the program.
 * It parses initial parameters, initializes the tracking array,
 * processes swap operations, and outputs the final state.
 */
function main() {
    // Parse the first line of input to get the width 'w'.
    // This 'w' typically represents the total number of items or positions.
    var w = parseInt(input[0], 10);

    // Parse the second line of input to get the number of operations 'n'.
    // 'n' indicates how many swap operations will follow.
    var n = parseInt(input[1], 10);


    // Declare and initialize a 'goto' array using Int8Array for efficiency.
    // This array will keep track of the current "destination" for each starting position.
    var goto = new Int8Array(w);

    // Initialize the 'goto' array.
    // Initially, each element is at its own position (i.e., goto[i] = i).
    for (var i = 0, len = goto.length; i < len; i++) {
        goto[i] = i; // Assign the current index as the value.
    }


    // Loop through the input lines that describe the swap operations.
    // These lines start from index 2 (after 'w' and 'n').
    for (var i = 2; i < n + 2; i++) {
        // Split the current input line by a comma to get the two indices involved in the swap.
        // Example: "1,2" will produce an array ["1", "2"].
        var c = input[i].split(",");

        // Parse the 'from' index, converting it to an integer.
        // We subtract 1 because the input is 1-based, but arrays are 0-based.
        var from = parseInt(c[0], 10) - 1;

        // Parse the 'to' index, similarly adjusting for 0-based indexing.
        var to = parseInt(c[1], 10) - 1;

        // Perform an XOR swap on the elements at 'from' and 'to' positions in the 'goto' array.
        // This is a classic method to swap two values without needing a temporary variable.
        // It relies on the properties of the bitwise XOR operator.
        goto[from] ^= goto[to]; // Step 1 of XOR swap
        goto[to]   ^= goto[from]; // Step 2 of XOR swap
        goto[from] ^= goto[to]; // Step 3 of XOR swap
    }


    // After all swap operations have been applied,
    // iterate through the final 'goto' array and print each element.
    for (var i = 0; i < len; i++) {
        // Print the value, adding 1 to convert it back to 1-based indexing for the output.
        console.log(goto[i] + 1);
    }
}