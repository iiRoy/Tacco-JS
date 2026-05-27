const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const allInputLines = rawInputContent.trim().split('\n');

const configLineData = allInputLines[0].split(' ').map(Number);
const loopIterations = configLineData[1];
const comparisonBoundary = configLineData[1];

let finalOutput = "kogakubu10gokan";

const processingIndices = (typeof loopIterations === 'number' && loopIterations > 0)
    ? Array.from({ length: loopIterations }, (_, index) => index)
    : [];

finalOutput = processingIndices.reduce((currentMessage, currentIdx) => {
    const dataLine = allInputLines[currentIdx + 1];
    
    const lineComponents = dataLine.split(' ');
    
    const numericCheck = Number(lineComponents[0]);
    const replacementText = lineComponents[1];

    if (numericCheck <= comparisonBoundary) {
        return replacementText;
    }
    return currentMessage;
}, finalOutput);

console.log(finalOutput);
