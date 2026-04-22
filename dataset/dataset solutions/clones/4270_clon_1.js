// This script initializes Node.js standard input handling,
// reads data, processes it, and then outputs a calculated result.
// It's a fundamental example of console-based application logic.

// --- Input Stream Initialization ---

// Resumes the standard input stream. This is necessary if it was paused
// or if it's the first time accessing it in a non-blocking manner.
process.stdin.resume();

// Sets the character encoding for the standard input stream.
// 'utf8' is a common and robust choice for text data.
process.stdin.setEncoding('utf8');


// --- Global Data Accumulation ---

// A global variable to store all incoming data chunks from stdin.
// It starts as an empty string and will be appended to.
var g_input = '';


// --- Event Listener for Incoming Data ---

// Attaches an event handler function to the 'data' event of stdin.
// This function executes whenever a new piece of data becomes available.
process.stdin.on('data', function (chunk) {
    // Appends the received 'chunk' of data to the global input string.
    g_input += chunk; // Concatenates the new data.
});


// --- Event Listener for End of Input ---

// Attaches an event handler to the 'end' event of stdin.
// This function is triggered once the input stream has completely finished.
process.stdin.on('end', function () {
    // When all input is received, split the accumulated string into an array of lines.
    // The regex `/\r?\n/` handles both Windows (`\r\n`) and Unix (`\n`) style newlines.
    // The resulting array is then passed to the main processing function.
    Main(g_input.split(/\r?\n/));
});


// --- Main Application Logic Function ---

/**
 * The core function responsible for parsing input, performing calculations,
 * and displaying the final result.
 *
 * @param {Array<string>} input - An array where each element is a line of input.
 * @returns {number} Returns 0 typically indicating successful execution.
 */
function Main(input) {

    // Parse the first line of input as an integer.
    // `input[0]` refers to the first line. `10` specifies base-10 parsing.
    var r = parseInt(input[0], 10);

    // Parse the second line of input as an integer.
    // `input[1]` refers to the second line. `10` specifies base-10 parsing.
    var g = parseInt(input[1], 10);


    // Perform the specified arithmetic calculation: (2 * g) - r.
    // The result is stored in the 'ans' variable.
    var ans = 2 * g - r;

    // Output the calculated answer to the standard console.
    console.log(ans);

    // Return 0 to signify that the program completed without errors.
    return 0;
}