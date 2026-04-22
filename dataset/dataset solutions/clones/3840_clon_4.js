const inputAcquisition = require('readline');

const dataStream = inputAcquisition.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let capturedLines = [];

dataStream.on('line', (currentLine) => {
    capturedLines.push(currentLine);
});

dataStream.on('close', () => {
    const primaryText = capturedLines[0] ? capturedLines[0].toString().toLowerCase() : '';
    const desiredIndex = capturedLines[1] ? Number(capturedLines[1]) : NaN;

    const result = analyzeSubsequences(primaryText, desiredIndex);
    console.log(result);
    process.exit(0);
});

function analyzeSubsequences(sourceText, targetRank) {
    const textSpan = sourceText.length;

    if (textSpan < 1 || textSpan > 5000) {
        process.exit(0);
    }
    if (targetRank < 1 || targetRank > 5) {
        process.exit(0);
    }

    const generatedSegments = Array.from({ length: textSpan + 1 }, (_, startIdx) => {
        return Array.from({ length: textSpan - startIdx + 1 }, (_, relativeEndIdx) => {
            const endIdx = startIdx + relativeEndIdx;
            return sourceText.substring(startIdx, endIdx);
        });
    }).flat();

    const processedSegments = Array.from(new Set(
        generatedSegments.filter(segment => segment.length > 0 && !segment.includes('\n'))
    )).sort();

    return processedSegments[targetRank - 1];
}