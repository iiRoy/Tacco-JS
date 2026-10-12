process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the character encoding for input stream

var globalDataBuffer = ''; // Buffer to accumulate all incoming data chunks

process.stdin.on('data', function(incomingChunk) {
    // Append each received data chunk to our global buffer
    globalDataBuffer += incomingChunk;
});

process.stdin.on('end', function() {
    // When the input stream ends, process the accumulated data
    // Split the buffer into an array of lines, handling both Windows and Unix line endings
    ProcessInputData(globalDataBuffer.split(/\r?\n/));
});

/**
 * Core function to handle and compute results from the parsed input lines.
 * @param {string[]} dataLines - An array where each element is a line from the standard input.
 * @returns {number} - Returns 0 upon successful execution, indicating no errors.
 */
function ProcessInputData(dataLines) {

    // Parse the first line of input as an integer, assuming base 10
    var redComponentValue = parseInt(dataLines[0], 10);

    // Parse the second line of input as an integer, also assuming base 10
    var greenComponentValue = parseInt(dataLines[1], 10);

    // Perform the calculation as specified by the problem: 2 * green - red
    var calculatedResult = 2 * greenComponentValue - redComponentValue;

    // Output the final calculated result to the console
    console.log(calculatedResult);

    // Return a success code
    return 0;
}
