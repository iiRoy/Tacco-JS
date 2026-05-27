const fileSystemModule = require('fs');
const inputSourcePath = '/dev/stdin';

const rawInputString = fileSystemModule.readFileSync(inputSourcePath, 'utf8');
const processedLines = rawInputString.split('\n');

const totalProcessedLines = processedLines.length;
const outputCaseLabel = 'Case ';

for (let currentLineIndex = 0; currentLineIndex < totalProcessedLines; currentLineIndex++) {
    const displayCaseNumber = currentLineIndex + 1;
    const currentLineData = processedLines[currentLineIndex];
    console.log(outputCaseLabel + displayCaseNumber + ': ' + currentLineData);
}
