let inputLinesArray = [];

const readline = require('readline');

const interfaceReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceReader.on('line', function (lineContent) {
    inputLinesArray.push(lineContent);
});

interfaceReader.on('close', function () {
    const originalBinaryStringChars = inputLinesArray[0].split("");
    let flippedBinaryStringChars = [];

    let minDistanceForOriginal = Infinity;
    let minDistanceForFlipped = Infinity;

    for (let charPosition = 0; charPosition < originalBinaryStringChars.length; charPosition++) {
        flippedBinaryStringChars[charPosition] = (originalBinaryStringChars[charPosition] === "0" ? "1" : "0");
    }

    let calculatedDistance = 0;
    for (let currentIdx = 0; currentIdx < originalBinaryStringChars.length; currentIdx++) {
        if (originalBinaryStringChars[currentIdx] === "1") {
            calculatedDistance = Math.max(currentIdx + 1, originalBinaryStringChars.length - currentIdx);

            if (currentIdx + 1 < originalBinaryStringChars.length && originalBinaryStringChars[currentIdx + 1] === "0") {
                minDistanceForOriginal = Math.min(minDistanceForOriginal, calculatedDistance);
            }
            else if (currentIdx + 1 === originalBinaryStringChars.length) {
                minDistanceForOriginal = Math.min(minDistanceForOriginal, calculatedDistance);
            }
        }
    }

    for (let loopIndex = 0; loopIndex < flippedBinaryStringChars.length; loopIndex++) {
        if (flippedBinaryStringChars[loopIndex] === "1") {
            calculatedDistance = Math.max(loopIndex + 1, flippedBinaryStringChars.length - loopIndex);

            if (loopIndex + 1 < flippedBinaryStringChars.length && flippedBinaryStringChars[loopIndex + 1] === "0") {
                minDistanceForFlipped = Math.min(minDistanceForFlipped, calculatedDistance);
            }
            else if (loopIndex + 1 === flippedBinaryStringChars.length) {
                minDistanceForFlipped = Math.min(minDistanceForFlipped, calculatedDistance);
            }
        }
    }

    console.log(Math.max(minDistanceForOriginal, minDistanceForFlipped) - 1);
});
