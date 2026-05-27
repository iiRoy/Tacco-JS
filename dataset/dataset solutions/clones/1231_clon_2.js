process.stdin.resume();
process.stdin.setEncoding('utf8');

// This variable will accumulate all the incoming data from standard input.
let inputBuffer = '';

// Set up an event listener to capture data chunks as they arrive.
process.stdin.on('data', function (dataChunk) {
    inputBuffer += dataChunk; // Append the current data chunk to our buffer.
});

// Once all input has been received (the 'end' event), process the accumulated data.
process.stdin.on('end', function () {
    // Split the entire input string into an array of individual lines.
    const inputLines = inputBuffer.split('\n');

    // Convert each line string into an integer, creating a new array of numbers.
    const numericValues = inputLines.map(function (lineStr) {
        return parseInt(lineStr, 10); // Parse string to integer, specifying base 10.
    });

    // Iterate through the array of numeric values.
    for (let currentIdx = 0; currentIdx < numericValues.length; currentIdx++) {
        // Construct the specific output string for the current case.
        const caseLabel = 'Case ' + (currentIdx + 1) + ': ';
        // Print the formatted output to the console.
        console.log(caseLabel + numericValues[currentIdx]);

        // If the current number is zero, stop further processing and exit.
        if (numericValues[currentIdx] === 0) {
            return; // Terminate the execution of this event handler.
        }
    }
});
