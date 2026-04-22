// This JavaScript code snippet is designed to process numerical input from the standard input stream.
// Its primary function is to identify the two smallest numbers within a space-separated sequence
// provided on a single line, and subsequently output their sum to the console.
// The implementation relies on Node.js's built-in 'readline' module for handling asynchronous input.

// ----------------------------------------------------------------------------------------------------
// SECTION 1: Standard Input Stream Configuration
// ----------------------------------------------------------------------------------------------------

// Ensure that the standard input stream is active and ready to receive data.
// This command prevents the process from exiting prematurely if input is expected.
process.stdin.resume();


// Configure the character encoding for the standard input stream.
// UTF-8 is a widely accepted and robust encoding, ensuring proper interpretation of various characters.
process.stdin.setEncoding('utf8');


// ----------------------------------------------------------------------------------------------------
// SECTION 2: Data Storage and Readline Interface Initialization
// ----------------------------------------------------------------------------------------------------

// Declare a mutable array to store the lines of input received from standard input.
// For this particular problem, it is anticipated that all relevant data will reside on a single line.
var lines = [];


// Initialize an instance of the 'readline' interface.
// This interface provides a convenient way to read input from a stream,
// typically standard input, on a line-by-line basis.
var reader = require('readline').createInterface({
    // Assign the standard input stream as the source from which lines will be read.
    input: process.stdin,

    // Assign the standard output stream as the destination for any internal readline messages or prompts.
    // While not directly utilized for the problem's solution output, it is a standard configuration.
    output: process.stdout
});


// ----------------------------------------------------------------------------------------------------
// SECTION 3: Event Listeners for Input Handling
// ----------------------------------------------------------------------------------------------------

// Attach an event handler to the 'line' event of the readline interface.
// This callback function is invoked every time a complete line of input is detected and parsed.
reader.on('line', (line) => {
    // Append the newly read line of text to the 'lines' array.
    // In scenarios where only one line of input is expected, this array will contain a single element.
    lines.push(line)
});


// Attach an event handler to the 'close' event of the readline interface.
// This callback function is triggered when the input stream signifies its end (e.g., End-of-File, or process termination).
// The core computational logic for finding and summing the smallest numbers is encapsulated within this block.
reader.on('close', () => {

    // Retrieve the first (and presumed only) line of input from the 'lines' array.
    // This string is then split into an array of substrings using a space character (' ') as the delimiter.
    // Each substring is expected to represent a numerical value.
    lines = lines[0].split(' ')

    // Convert the array of stringified numbers into actual numerical values and determine the absolute minimum.
    // The spread syntax (`...`) is used to expand the 'lines' array elements as individual arguments to `Math.min()`.
    var min = Math.min(...lines)

    // Filter the current 'lines' array to produce a new array that excludes all occurrences of the first minimum value found.
    // This step is crucial for correctly identifying the second smallest number, especially in cases where duplicates exist.
    lines = lines.filter(x => x != min)

    // With the initial minimum value(s) removed, determine the minimum value among the remaining elements.
    // This value, by definition, represents the second smallest unique number from the original input set.
    var minSecond = Math.min(...lines)
    
    // Compute the sum of the first and second smallest numbers.
    // Then, output this calculated sum to the standard output stream (console).
    console.log(min + minSecond)

}); // End of the 'close' event handler function.

// ----------------------------------------------------------------------------------------------------
// END OF SCRIPT: The program will remain active, awaiting input, until the 'close' event is triggered.
// Upon the 'close' event, the final computation is performed, and the script's execution concludes.
// ----------------------------------------------------------------------------------------------------