var fileSystem = require('fs');
var rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.trim().split("\n");

function generateRepeatedString(count, unitString) {
    let resultAccumulator = '';
    for (let i = 0; i < count; i++) {
        resultAccumulator += unitString;
    }
    return resultAccumulator;
}

while (true) {
    var currentInputLine = inputLines.shift();

    if (currentInputLine === "0 0") {
        break;
    }

    var dimensionStrings = currentInputLine.split(" ");
    var parsedDimensions = [
        Number(dimensionStrings[0]),
        Number(dimensionStrings[1])
    ];

    var blockHeight = parsedDimensions[0];
    var blockWidth = parsedDimensions[1];

    const HASH_CHAR = "#";
    const NEWLINE_CHAR = "\n";

    let singleRowSegment = generateRepeatedString(blockWidth, HASH_CHAR);
    let completeRowWithTerminator = singleRowSegment + NEWLINE_CHAR;

    let finalOutputBlock = generateRepeatedString(blockHeight, completeRowWithTerminator);

    console.log(finalOutputBlock + NEWLINE_CHAR);
}
