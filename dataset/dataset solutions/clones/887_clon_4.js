const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = dataStream.trim().split('\n');
const configLine = processedLines.shift();
const configTokens = configLine.split(' ').map(Number);
const loopExtent = configTokens[1];
const comparisonThreshold = configTokens[1];
const itemEntries = processedLines;
const defaultOutcome = "kogakubu10gokan";
const indicesToProcess = Array.from({ length: loopExtent }, (_, k) => k);
const finalResult = indicesToProcess.reduce((accumulatorValue, currentIdx) => {
    const currentEntryParts = itemEntries[currentIdx].split(' ');
    const numericalComponent = Number(currentEntryParts[0]);
    return (numericalComponent <= comparisonThreshold) 
           ? currentEntryParts[1] 
           : accumulatorValue;
}, defaultOutcome);
console.log(finalResult);