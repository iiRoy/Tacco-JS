var receivedData = ''; // Initialize a string to accumulate incoming data.

// Resume the standard input stream to start listening for data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on stdin.
// Each time a chunk of data is received, append it to our accumulator.
process.stdin.on('data', function(dataSegment) {
    receivedData += dataSegment;
});

// Attach an event listener for the 'end' event on stdin.
// Once all input has been received, call the primary processing function.
process.stdin.on('end', function() {
    processInputData(receivedData);
});

/**
 * Main function to process the accumulated input data.
 * @param {string} fullInput - The complete string received from standard input.
 */
function processInputData(fullInput) {
    // Split the entire input string into an array of lines.
    var processedLines = fullInput.split('\n');

    // Transform each line: split it by space, then parse each part as an integer.
    processedLines = processedLines.map(function(lineContent) {
        // Split the current line by spaces to get individual number strings.
        lineContent = lineContent.split(' ')
                                 .map(function(numericString) {
                                     // Convert each numeric string to an integer.
                                     return parseInt(numericString, 10); // Base 10 for safety
                                 });
        // Return the array of two parsed numbers for this line.
        return lineContent;
    });

    // Iterate over each array of numbers and print their sum to the console.
    processedLines.forEach(function(numberPair) {
        // Log the sum of the first and second numbers in the pair.
        console.log(numberPair[0] + numberPair[1]);
    });
}
