let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from the standard input stream.

let dataSegments = rawData.split('\n'); // Break down the raw input into an array of individual line segments.

// Commence an indefinite processing cycle for the input segments.
for (;;) {
    let currentSegment = dataSegments.shift(); // Retrieve the next available segment from the beginning of the array.

    // Examine the second token of the current segment to determine if it's the termination signal.
    if (currentSegment.split(' ')[1] === '?') {
        break; // If the termination signal is detected, exit the processing loop.
    }

    // Evaluate the mathematical expression contained within the current segment.
    // Then, calculate the floor of the resulting value and output it to the console.
    console.log(Math.floor(eval(currentSegment)));
}
