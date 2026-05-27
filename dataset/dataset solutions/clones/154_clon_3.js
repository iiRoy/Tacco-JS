const fileSystemModule = require('fs');

function readStandardInputLines() {
    const standardInputDescriptor = process.stdin.fd;
    const inputDataStats = fileSystemModule.fstatSync(standardInputDescriptor);
    const totalInputSize = inputDataStats.size;

    const inputBuffer = Buffer.alloc(totalInputSize);
    const bytesReadCount = fileSystemModule.readSync(standardInputDescriptor, inputBuffer, 0, totalInputSize, 0);

    const rawInputString = inputBuffer.toString('utf8', 0, bytesReadCount);
    const trimmedInputString = rawInputString.trim();
    const inputLineArray = trimmedInputString.split('\n');

    return inputLineArray;
}

function parseAndSortCardValues(lineContent) {
    const trimmedLine = lineContent.trim();
    const stringValues = trimmedLine.split(',');
    const numericValues = stringValues.map(Number);

    // Sort in descending order
    const sortedNumericValues = numericValues.sort((valA, valB) => valB - valA);
    return sortedNumericValues;
}

function checkFourOfAKind(cardValues) {
    const firstFourMatch = (cardValues[0] === cardValues[1] && cardValues[1] === cardValues[2] && cardValues[2] === cardValues[3]);
    const lastFourMatch = (cardValues[1] === cardValues[2] && cardValues[2] === cardValues[3] && cardValues[3] === cardValues[4]);
    return firstFourMatch || lastFourMatch;
}

function checkFullHouse(cardValues) {
    const threeTwoPattern = (cardValues[0] === cardValues[1] && cardValues[1] === cardValues[2] && cardValues[3] === cardValues[4]);
    const twoThreePattern = (cardValues[0] === cardValues[1] && cardValues[2] === cardValues[3] && cardValues[3] === cardValues[4]);
    return threeTwoPattern || twoThreePattern;
}

function checkStraight(cardValues) {
    const isFirstFourConsecutive = (cardValues[0] === cardValues[1] + 1 &&
                                    cardValues[1] === cardValues[2] + 1 &&
                                    cardValues[2] === cardValues[3] + 1);

    const isFifthCardConsecutive = (cardValues[3] === cardValues[4] + 1);
    const isAceHighSpecialCase = (cardValues[0] === 13 && cardValues[4] === 1); // e.g., [13, 12, 11, 10, 1]

    return isFirstFourConsecutive && (isAceHighSpecialCase || isFifthCardConsecutive);
}

function processCardHands() {
    const allInputLines = readStandardInputLines();

    for (let lineIndex = 0; lineIndex < allInputLines.length; lineIndex++) {
        const currentHandValues = parseAndSortCardValues(allInputLines[lineIndex]);
        let detectedPattern = "null";

        if (checkFourOfAKind(currentHandValues)) {
            detectedPattern = "four card";
        } else if (checkFullHouse(currentHandValues)) {
            detectedPattern = "full house";
        } else if (checkStraight(currentHandValues)) {
            detectedPattern = "straight";
        }
        console.log(detectedPattern);
    }
}

processCardHands();
