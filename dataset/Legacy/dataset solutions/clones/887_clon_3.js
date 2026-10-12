const STD_IN_SOURCE = '/dev/stdin';
const fileContent = require('fs').readFileSync(STD_IN_SOURCE, 'utf8');

const processedLines = fileContent.trim().split('\n');

const firstLineData = processedLines.shift();
const [ignoredParam, effectiveLimit] = firstLineData.split(' ').map(Number);

const iterationCount = effectiveLimit;
const comparisonThreshold = effectiveLimit;

let finalOutputString = "kogakubu10gokan";

for (let lineIndex = 0; lineIndex < iterationCount; lineIndex++) {
    const currentLineSegments = processedLines[lineIndex].split(" ");
    const numericKey = Number(currentLineSegments[0]);

    if (numericKey <= comparisonThreshold) {
        finalOutputString = currentLineSegments[1];
    }
}

console.log(finalOutputString);
