var rawDataBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataSegment) => {
    rawDataBuffer += dataSegment;
});

process.stdin.on('end', () => {
    let firstLine = rawDataBuffer.split('\n')[0];
    let processedLine = firstLine.slice(0, -1);

    let lineLength = processedLine.length;
    let halfLengthFloor = Math.floor(lineLength / 2);
    let currentPrefix = processedLine.slice(0, -halfLengthFloor);

    let matchCounts = [];
    let prefixStrings = [];

    // The loop continues as long as the prefix's length is not exactly 2.
    // It stops when currentPrefix.length becomes 2, without processing it.
    while (currentPrefix.length !== 2) {
        let currentMatchCount = calculatePatternOccurrences(processedLine, currentPrefix);
        matchCounts.push(currentMatchCount);
        prefixStrings.push(currentPrefix);
        currentPrefix = currentPrefix.slice(0, -1); // Shorten the prefix by one character
    }

    let maxMatchCount = Math.max(...matchCounts);
    let indexOfMaxMatch = matchCounts.indexOf(maxMatchCount);
    let bestMatchingPrefix = prefixStrings[indexOfMaxMatch];

    let finalProduct = bestMatchingPrefix.length * maxMatchCount;
    console.log(finalProduct);
});

// Helper function to count non-overlapping occurrences of a pattern at the beginning of a string
function calculatePatternOccurrences(sourceString, patternSegment) {
    let occurrenceCounter = 0;
    let segmentLength = patternSegment.length;

    // Guard clause: if pattern is empty, it cannot match.
    // In this specific problem, patternSegment length will always be >= 3 due to main loop condition.
    if (segmentLength === 0) {
        return 0;
    }

    while (true) {
        let currentSliceStart = occurrenceCounter * segmentLength;
        let currentSliceEnd = currentSliceStart + segmentLength;
        
        // Check if the potential slice is within the bounds of the source string
        // and if it matches the pattern segment.
        if (currentSliceEnd <= sourceString.length && sourceString.slice(currentSliceStart, currentSliceEnd) === patternSegment) {
            occurrenceCounter++;
        } else {
            // If no match or out of bounds, stop counting.
            break; 
        }
    }
    return occurrenceCounter;
}
