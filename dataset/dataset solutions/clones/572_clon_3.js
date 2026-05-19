var accumulatedInputData = '';

function countPatternsInLine(lineContent) {
    const patternLength = 3;
    const currentLinePatternCounts = { JOI: 0, IOI: 0 };

    for (let charPosition = 0; charPosition <= lineContent.length - patternLength; charPosition++) {
        const segment = lineContent.substring(charPosition, charPosition + patternLength);
        if (currentLinePatternCounts.hasOwnProperty(segment)) {
            currentLinePatternCounts[segment]++;
        }
    }
    return currentLinePatternCounts;
}

function analyzeInputSequences() {
    const processedLines = accumulatedInputData.split('\n');

    for (let lineIdx = 0; lineIdx < processedLines.length; lineIdx++) {
        const currentSequence = processedLines[lineIdx];
        const patternOccurrences = countPatternsInLine(currentSequence);

        console.log(patternOccurrences.JOI);
        console.log(patternOccurrences.IOI);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(receivedDataChunk) {
    accumulatedInputData += receivedDataChunk;
});

process.stdin.on('end', function() {
    analyzeInputSequences();
});
