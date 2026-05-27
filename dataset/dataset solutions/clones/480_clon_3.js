var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = rawInputContent.trim().split("\n");

const parseLineToNumbers = (lineString) => {
    const stringParts = lineString.split(" ");
    return [parseInt(stringParts[0], 10), parseInt(stringParts[1], 10)];
};

while (true) {
    const currentLineFromBuffer = processedLines.shift();
    const currentNumericPair = parseLineToNumbers(currentLineFromBuffer);
    
    const firstValue = currentNumericPair[0];
    const secondValue = currentNumericPair[1];

    if (firstValue === 0 && secondValue === 0) {
        break;
    }

    const linesToSkipCount = secondValue;
    for (let lineSkipIndex = 0; lineSkipIndex < linesToSkipCount; lineSkipIndex++) {
        processedLines.shift();
    }
}
