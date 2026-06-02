'use strict';

function generateRepeatedCharString(length, charToRepeat) {
    let resultString = '';
    for (let k = 0; k < length; k++) {
        resultString += charToRepeat;
    }
    return resultString;
}

function processInputData(rawInputString) {
    const BORDER_SYMBOL = '#';

    const allInputLines = rawInputString.split('\n');

    const firstLineParts = allInputLines[0].split(' ').map(numericString => parseInt(numericString, 10));
    const gridHeight = firstLineParts[0];
    const gridWidth = firstLineParts[1];

    const fullBorderLength = gridWidth + 2;
    const horizontalBorderLine = generateRepeatedCharString(fullBorderLength, BORDER_SYMBOL);

    let outputLineCollection = [];

    outputLineCollection.push(horizontalBorderLine);

    for (let currentLineIdx = 1; currentLineIdx <= gridHeight; currentLineIdx++) {
        const contentSegment = allInputLines[currentLineIdx];
        const framedContentLine = BORDER_SYMBOL + contentSegment + BORDER_SYMBOL;
        outputLineCollection.push(framedContentLine);
    }

    outputLineCollection.push(horizontalBorderLine);

    const finalOutputContent = outputLineCollection.join('\n');

    console.log(finalOutputContent);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
