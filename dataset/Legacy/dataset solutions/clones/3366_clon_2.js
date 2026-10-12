process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the character encoding for the standard input stream.

let accumulatedData = ''; // This variable will store all incoming data chunks from stdin.

// Attach an event listener for 'data' events on the standard input.
process.stdin.on('data', function(dataSegment) {
    // Each time a data chunk arrives, append it to our accumulator.
    accumulatedData += dataSegment;
});

// Attach an event listener for the 'end' event, which signifies no more input.
process.stdin.on('end', function() {
    // When the input stream closes, split the entire accumulated string by newlines
    // and pass the resulting array of lines to our primary processing function.
    processInputData(accumulatedData.split(/\r?\n/));
});

/**
 * Executes the core logic on the provided array of text lines.
 * @param {Array<string>} linesOfText - An array where each element represents a line from the input.
 */
function processInputData(linesOfText) {
    // First, convert the array of lines into a single string, then use a regular expression
    // to find all occurrences of the digit '2' globally.
    // The 'match' method returns an array of matches or null if none are found.
    let matchedTwos = (linesOfText + "").match(/2/g);

    // If no instances of '2' were found (i.e., 'match' returned null),
    // reassign 'matchedTwos' to an empty array to ensure consistent type for subsequent operations.
    if (matchedTwos === null) {
        matchedTwos = [];
    }

    // Print the array containing all found '2's to the console.
    console.log(matchedTwos);

    // Print the total number of '2's found (which is the length of the 'matchedTwos' array) to the console.
    console.log(matchedTwos.length);
}
