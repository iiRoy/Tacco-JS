const fileSystem = require('fs');

const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const sourceLines = rawContent.split('\n');

const zeroMarkerIndex = sourceLines.findIndex(currentSegment => currentSegment === '0');

const processableLines = zeroMarkerIndex === -1 ? sourceLines : sourceLines.slice(0, zeroMarkerIndex);

const calculatedSums = processableLines.map(lineText => {
    const digitArray = Array.from(lineText, Number);
    const digitSum = digitArray.reduce((accumulatorValue, currentDigit) => accumulatorValue + currentDigit, 0);
    return digitSum;
});

const finalOutput = calculatedSums.join('\n');

console.log(finalOutput.trim());
