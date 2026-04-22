const queryEngine = require('readline');

const dataInterface = queryEngine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let recordedLines = [];

dataInterface.on('line', (incomingSegment) => {
    recordedLines.push(incomingSegment);
});

dataInterface.on('close', () => {
    const mainContent = recordedLines[0];

    const calculateRepetitionsRecursive = (sourceText, candidatePattern, currentCount = 0, currentOffset = 0) => {
        if (sourceText.substring(currentOffset, currentOffset + candidatePattern.length) === candidatePattern) {
            return calculateRepetitionsRecursive(sourceText, candidatePattern, currentCount + 1, currentOffset + candidatePattern.length);
        }
        return currentCount;
    };

    const contentExtent = mainContent.length;
    const initialPatternExtent = contentExtent - (contentExtent >> 1);

    const possiblePatternExtents = Array.from(
        { length: initialPatternExtent - 1 },
        (_, idx) => initialPatternExtent - idx
    );

    const allScores = possiblePatternExtents.map(currentExtent => {
        const specificPattern = mainContent.substring(0, currentExtent);
        const repetitionFactor = calculateRepetitionsRecursive(mainContent, specificPattern);
        return currentExtent * repetitionFactor;
    });

    const highestAchievedScore = allScores.reduce((maximum, current) => (current > maximum ? current : maximum), 0);

    process.stdout.write(highestAchievedScore.toString() + '\n');
});