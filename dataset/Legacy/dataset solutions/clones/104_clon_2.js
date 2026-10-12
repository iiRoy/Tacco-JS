var fileSystemModule = require('fs'),
    dataSize = fileSystemModule.fstatSync(process.stdin.fd).size,
    dataBuffer = new Buffer(dataSize),
    readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0),
    processedLines = dataBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Begin the primary execution flow.
processGameRounds();

/**
 * Orchestrates the processing of game rounds from the input data.
 * Each round involves comparing two sets of numbers.
 */
function processGameRounds() {
    // Iterate through the input, handling two lines per game round.
    for (var roundIndex = 0, totalLineCount = processedLines.length; roundIndex < totalLineCount; roundIndex += 2) {
        var exactMatches = 0; // Counts numbers that match both value and position.
        var partialMatches = 0; // Counts numbers that match value but not position.

        // Extract and parse the first player's sequence for the current round.
        var playerOneSequence = processedLines[roundIndex].trim().split(' ');
        // Extract and parse the second player's sequence for the current round.
        var playerTwoSequence = processedLines[roundIndex + 1].trim().split(' ');

        // Compare elements within the sequences.
        for (var currentDigitIdx = 0, sequenceLength = playerOneSequence.length; currentDigitIdx < sequenceLength; currentDigitIdx++) {
            // Check for an exact match at the current position.
            if (playerOneSequence[currentDigitIdx] == playerTwoSequence[currentDigitIdx]) {
                exactMatches++;
            }

            // Check for partial matches with subsequent elements in the second sequence.
            for (var subsequentDigitIdx = currentDigitIdx + 1, otherSequenceLength = playerOneSequence.length; subsequentDigitIdx < otherSequenceLength; subsequentDigitIdx++) {
                if (playerOneSequence[currentDigitIdx] == playerTwoSequence[subsequentDigitIdx]) {
                    partialMatches++;
                }
            }
        }
        // Display the results for the current game round.
        console.log(exactMatches, partialMatches);
    }
}
