let collectedInputLines = []; // Array to store all input lines read from stdin.

const inputModule = require('readline'); // Importing the readline module for input handling.

const inputOutputHandler = inputModule.createInterface({ // Setting up an interface to read input line by line.
    input: process.stdin,  // Standard input stream.
    output: process.stdout, // Standard output stream (not used for writing here, but required by interface).
});

inputOutputHandler.on('line', function (currentInputLine) { // Event listener for each line of input received.
    collectedInputLines.push(currentInputLine); // Adding the current line to our collection.
});

inputOutputHandler.on('close', function () { // Event listener for when the input stream is closed.

    // Parse the first line to get the total number of elements and the segment size.
    const dimensions = collectedInputLines[0].split(" ");
    let totalElementsCount = parseInt(dimensions[0], 10); // Total count of items.
    let desiredSegmentLength = parseInt(dimensions[1], 10); // Length of the segment to consider.

    // Parse the second line to get the sequence of numbers.
    const numberSequence = collectedInputLines[1].split(" ").map(valStr => parseInt(valStr, 10)); // Convert string elements to integers.

    let shortestTraversalTime = Infinity; // Initialize the minimum time with a very large value.

    // Iterate through all possible starting positions for the segment.
    for (let currentStartIdx = 0; currentStartIdx + desiredSegmentLength - 1 < totalElementsCount; currentStartIdx++) {

        // Determine the start and end indices of the current segment.
        let segmentBeginIndex = currentStartIdx;
        let segmentEndIndex = currentStartIdx + desiredSegmentLength - 1;

        // Calculate the cost for the first path: go to segmentBeginIndex, then to segmentEndIndex.
        // This corresponds to 0 -> numberSequence[segmentBeginIndex] -> numberSequence[segmentEndIndex].
        let costPathA = Math.abs(numberSequence[segmentBeginIndex]) + Math.abs(numberSequence[segmentEndIndex] - numberSequence[segmentBeginIndex]);

        // Calculate the cost for the second path: go to segmentEndIndex, then to segmentBeginIndex.
        // This corresponds to 0 -> numberSequence[segmentEndIndex] -> numberSequence[segmentBeginIndex].
        let costPathB = Math.abs(numberSequence[segmentEndIndex]) + Math.abs(numberSequence[segmentEndIndex] - numberSequence[segmentBeginIndex]);

        // Update the shortest traversal time if either of the current paths is shorter.
        shortestTraversalTime = Math.min(shortestTraversalTime, costPathA, costPathB);
    }

    // Output the final calculated minimum traversal time.
    console.log(shortestTraversalTime);
});