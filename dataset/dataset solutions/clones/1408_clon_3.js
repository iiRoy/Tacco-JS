var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var trimmedContent = fileContent.trim();
var inputLines = trimmedContent.split("\n");

var resultString = "";

function generateRepeatedString(charToRepeat, count) {
    const actualCount = Math.max(0, Math.floor(count));
    return Array(actualCount + 1).join(charToRepeat);
}

let currentLineIndex = 0;
while (true) {
    const currentInput = inputLines[currentLineIndex];
    currentLineIndex++;

    if (currentInput === "0 0") {
        break;
    }

    const dimensionStrings = currentInput.split(" ");
    const firstDimension = Number(dimensionStrings[0]);
    const secondDimension = Number(dimensionStrings[1]);

    const numRows = firstDimension;
    const numCols = secondDimension;

    const rowPattern = generateRepeatedString("#", numCols);

    let blockSegment = "";
    for (let i = 0; i < numRows; i++) {
        blockSegment += rowPattern + "\n";
    }

    resultString += blockSegment;
    resultString += "\n";
}

console.log(resultString);
