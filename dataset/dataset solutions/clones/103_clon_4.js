const fsModule = require('node:fs');
const dataStream = fsModule.readFileSync(0).toString('utf8');

const extractNumericSequence = (textSegment) => {
    return textSegment.split(/\s+/).filter(Boolean).map(numericString => +numericString);
};

const determineMatchScores = (mainSequence, comparisonSequence) => {
    let positionalHits = 0;
    const mainRemainingCounts = new Map();
    const comparisonRemainingValues = [];

    for (let currentPos = 0; currentPos < 4; ++currentPos) {
        if (mainSequence[currentPos] === comparisonSequence[currentPos]) {
            positionalHits++;
        } else {
            mainRemainingCounts.set(mainSequence[currentPos], (mainRemainingCounts.get(mainSequence[currentPos]) || 0) + 1);
            comparisonRemainingValues.push(comparisonSequence[currentPos]);
        }
    }

    let valueOccurrences = 0;
    for (const targetVal of comparisonRemainingValues) {
        if (mainRemainingCounts.has(targetVal) && mainRemainingCounts.get(targetVal) > 0) {
            valueOccurrences++;
            mainRemainingCounts.set(targetVal, mainRemainingCounts.get(targetVal) - 1);
        }
    }

    return { exact: positionalHits, partial: valueOccurrences };
};

const processedResults = [];
const allInputLines = dataStream.trim().split('\n');
let currentLineIndex = 0;

while (currentLineIndex < allInputLines.length) {
    const primaryLine = allInputLines[currentLineIndex];
    const secondaryLine = allInputLines[currentLineIndex + 1];

    if (!primaryLine || !secondaryLine) break;

    const primaryNumbers = extractNumericSequence(primaryLine);
    const secondaryNumbers = extractNumericSequence(secondaryLine);

    const evaluationOutcome = determineMatchScores(primaryNumbers, secondaryNumbers);
    processedResults.push(`${evaluationOutcome.exact} ${evaluationOutcome.partial}`);

    currentLineIndex += 2;
}

process.stdout.write(processedResults.join('\n') + '\n');