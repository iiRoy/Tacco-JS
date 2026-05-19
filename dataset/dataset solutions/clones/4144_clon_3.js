var inputLines = [];
var lineReaderModule = require('readline');

var interfaceInstance = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

function determineMinMaxSegmentLength(charArray, initialMinVal) {
    let currentMinimumResult = initialMinVal;
    const arrayLength = charArray.length;

    for (let idx = 0; idx < arrayLength; idx++) {
        const currentChar = charArray[idx];

        if (currentChar === "1") {
            const lengthFromStart = idx + 1;
            const lengthFromEnd = arrayLength - idx;

            const segmentCalculatedMax = Math.max(lengthFromStart, lengthFromEnd);

            const isLastChar = (idx + 1 === arrayLength);
            const nextCharIsZero = (!isLastChar && charArray[idx + 1] === "0");

            const isSegmentBoundary = isLastChar || nextCharIsZero;

            if (isSegmentBoundary) {
                currentMinimumResult = Math.min(currentMinimumResult, segmentCalculatedMax);
            }
        }
    }
    return currentMinimumResult;
}

interfaceInstance.on('close', function () {
    const binaryStringChars = inputLines[0].split("");

    const invertedBinaryChars = binaryStringChars.map(char => {
        const invertedCharValue = (char === "0" ? "1" : "0");
        return invertedCharValue;
    });

    let minMaxLenForOriginal = Infinity;
    let minMaxLenForInverted = Infinity;

    minMaxLenForOriginal = determineMinMaxSegmentLength(binaryStringChars, minMaxLenForOriginal);
    minMaxLenForInverted = determineMinMaxSegmentLength(invertedBinaryChars, minMaxLenForInverted);

    console.log(Math.max(minMaxLenForOriginal, minMaxLenForInverted) - 1);
});
