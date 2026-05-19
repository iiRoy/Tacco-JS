const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceData.trim().split("\n");

function* generateProcessedGroups(allLines) {
    let currentSumAccumulator = [];
    let currentLineIndex = 0;

    while (currentLineIndex < allLines.length) {
        const currentLineContent = allLines[currentLineIndex];

        if (currentSumAccumulator.length === 0 && currentLineContent === "0 0") {
            break;
        }

        const numberComponents = currentLineContent.split(" ").map(Number);
        const lineSum = numberComponents[0] + numberComponents[1];
        currentSumAccumulator.push(lineSum);

        if (currentSumAccumulator.length === 4) {
            yield currentSumAccumulator;
            currentSumAccumulator = [];
        }
        currentLineIndex++;
    }
}

const characterLabels = ['A', 'B', 'C', 'D'];

for (const groupOfSums of generateProcessedGroups(lineSegments)) {
    const peakValue = groupOfSums.reduce((a, b) => Math.max(a, b));
    const peakIndex = groupOfSums.indexOf(peakValue);
    const resultLabel = characterLabels[peakIndex];
    console.log(`${resultLabel} ${peakValue}`);
}
