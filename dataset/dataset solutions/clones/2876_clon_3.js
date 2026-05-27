var inputLines = [];
var lineReaderModule = require('readline');

var interfaceInstance = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceInstance.on('close', function () {
    const parseNumericValue = (partsArray, index) => Number(partsArray[index]);

    var firstLineParts = inputLines[0].split(" ");
    var totalLength = parseNumericValue(firstLineParts, 0); // N is parsed but not used, mirroring original
    var startA = parseNumericValue(firstLineParts, 1);
    var startB = parseNumericValue(firstLineParts, 2);
    var endC = parseNumericValue(firstLineParts, 3);
    var endD = parseNumericValue(firstLineParts, 4);

    var charArray = inputLines[1].split("");

    var canPassThrough = false;

    const maxCDValue = Math.max(endC, endD);

    for (var idx = 0; idx < charArray.length; idx++) {
        const isCurrentDoubleHash = charArray[idx] === "#" && charArray[idx + 1] === "#";
        const isDoubleHashWithinRange = startA <= idx && (idx + 1) <= maxCDValue;

        if (isCurrentDoubleHash && isDoubleHashWithinRange) {
            console.log("No");
            return;
        }

        const isCurrentTripleDot = charArray[idx] === "." && charArray[idx + 1] === "." && charArray[idx + 2] === ".";
        const isTripleDotWithinRange = startB <= (idx + 1) && (idx + 1) <= endD;

        if (isCurrentTripleDot && isTripleDotWithinRange) {
            canPassThrough = true;
        }
    }

    const isDestinationBeforeOrigin = endD < endC;
    const isPathBlockedBySpecificHashes = (
        charArray[startB - 2] === "#" ||
        charArray[startB] === "#" ||
        charArray[endD - 2] === "#" ||
        charArray[endD] === "#"
    );

    if (isDestinationBeforeOrigin && isPathBlockedBySpecificHashes && !canPassThrough) {
        console.log("No");
    } else {
        console.log("Yes");
    }
});
