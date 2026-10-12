// This JavaScript module is designed to read numerical data from standard input,
// process the last line of numbers, sort them, and then print the sorted sequence.

// Establish a convenient alias for the console logging function.
const outputFunc = console.log;

// Check if the current execution environment provides a 'process' object,
// indicating a Node.js-like context where standard input can be accessed.
if (typeof process !== 'undefined') {
    let receivedData = ''; // A string buffer to accumulate all incoming data chunks.

    // Activate the standard input stream to begin receiving data.
    process.stdin.resume();
    // Configure the encoding for the incoming data to UTF-8.
    process.stdin.setEncoding('utf8');

    // Attach an event listener for 'data' events, which fire when input is available.
    process.stdin.on('data', function (dataSegment) {
        // Append each received data segment to the accumulator.
        receivedData += dataSegment;
    });

    // Attach an event listener for the 'end' event, signaling that all input has been received.
    process.stdin.on('end', function () {
        // Once all input is gathered, pass it to the primary processing function.
        processInputData(receivedData);
    });
}

/**
 * Handles the initial parsing and preparation of the raw input string.
 * This function takes the complete input, splits it into individual lines,
 * and performs some cleanup before passing it to the core logic.
 *
 * @param {string} rawData - The entire string of data received from standard input.
 */
function processInputData(rawData) {
    // Divide the raw input string into an array of strings, using newline characters as delimiters.
    let parsedLines = rawData.split('\n');

    // Remove the very first line from the array. This is often a metadata line
    // (e.g., count of subsequent lines) that is not needed for this specific task.
    parsedLines.shift();

    // Remove the very last line from the array. This often corresponds to an empty string
    // resulting from a trailing newline character in the input.
    parsedLines.pop();

    // Invoke the main execution function with the now-cleaned array of input lines.
    executeCoreLogic(parsedLines);
}

/**
 * Contains the central algorithm for processing the cleaned input lines.
 * It extracts the last line, converts its elements to numbers, sorts them,
 * and then prints the sorted numbers.
 *
 * @param {string[]} processedStrings - An array of strings, where each string represents a meaningful line of input.
 */
function executeCoreLogic(processedStrings) {
    // Retrieve the last string from the array of processed lines.
    // Then, split this string by spaces to get individual number-strings.
    // Finally, use the map function to convert each number-string into an actual Number type.
    const finalNumbers = processedStrings.pop().split(' ').map(function (elementValue) {
        return Number(elementValue); // Explicitly convert the string part to a numeric value.
    });

    // Sort the array of numbers in ascending order using a standard comparison function.
    // After sorting, join the numbers back into a single string, separated by spaces.
    // The resulting string is then outputted to the console.
    outputFunc(finalNumbers.sort(function (firstVal, secondVal) {
        return firstVal - secondVal; // Numeric comparison for ascending order.
    }).join(' '));
}
