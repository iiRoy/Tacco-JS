let incomingDataChunks = []; // Stores raw input chunks
let processedTextLines = []; // Stores lines after splitting and cleaning

// Core function to analyze text for specific sequences
function processInputContent() {
    // If no lines were processed, exit early
    if (processedTextLines.length === 0) {
        return;
    }

    // Iterate through each line extracted from the input
    for (const currentLineEntry of processedTextLines) {
        // Skip lines that are too short to contain a 3-character sequence
        if (currentLineEntry.length < 3) {
            continue;
        }

        let foundJoiSequences = 0; // Counter for "JOI" occurrences
        let foundIoiSequences = 0; // Counter for "IOI" occurrences

        // Traverse the current line to find all possible 3-character segments
        for (let startPosition = 0; startPosition <= currentLineEntry.length - 3; startPosition++) {
            // Extract the 3-character segment
            const threeCharSegment = currentLineEntry.slice(startPosition, startPosition + 3);

            // Determine if the segment matches any target sequence
            switch (threeCharSegment) {
                case "JOI":
                    foundJoiSequences++;
                    break;
                case "IOI":
                    foundIoiSequences++;
                    break;
                // No action for other segments
            }
        }

        // Output the findings for the current line
        console.log(foundJoiSequences);
        console.log(foundIoiSequences);
    }
}

// Set up standard input stream processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for data reception
process.stdin.on('data', (receivedChunk) => {
    incomingDataChunks.push(receivedChunk); // Accumulate data chunks
});

// Event listener for end of input stream
process.stdin.on('end', () => {
    // Join all chunks, clean up whitespace, split into lines, and filter out empty lines
    processedTextLines = incomingDataChunks.join('').trim().split('\n').filter(line => line.length > 0);

    // Initiate the analysis process
    processInputContent();
});