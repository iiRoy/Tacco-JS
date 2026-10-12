function findFirstGreaterThan(collection, startIndex, endIndex, thresholdValue) {
    let lowPointer = startIndex;
    let highPointer = endIndex;
    let resultIndex = endIndex + 1;

    while (lowPointer <= highPointer) {
        const midPointer = Math.floor((lowPointer + highPointer) / 2);
        if (collection[midPointer] > thresholdValue) {
            resultIndex = midPointer;
            highPointer = midPointer - 1;
        } else {
            lowPointer = midPointer + 1;
        }
    }
    return resultIndex;
}

class LineStreamHandler {
    constructor(sourceContent) {
        this.contentLines = sourceContent.trim().split("\n");
        this.currentLineIndex = 0;
    }

    retrieveNextLine() {
        if (this.currentLineIndex < this.contentLines.length) {
            return this.contentLines[this.currentLineIndex++];
        }
        return null;
    }

    retrieveNextNumericValue() {
        return Number(this.retrieveNextLine());
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLineStream = new LineStreamHandler(rawInputData);

while (true) {
    const configurationLine = inputLineStream.retrieveNextLine();
    const configurationParts = configurationLine.split(" ").map(Number);
    const elementCount = configurationParts[0];
    const sumThreshold = configurationParts[1];

    if (elementCount === 0 && sumThreshold === 0) {
        break;
    }

    const numericValues = [];
    for (let k = 0; k < elementCount; k++) {
        numericValues.push(inputLineStream.retrieveNextNumericValue());
    }

    numericValues.sort((valA, valB) => valA - valB);

    let totalValidPairCount = 0;
    for (let primaryIndex = 0; primaryIndex < elementCount - 1; primaryIndex++) {
        const primaryValue = numericValues[primaryIndex];
        const minimumSecondaryValue = sumThreshold - primaryValue;

        const firstValidSecondaryIndex = findFirstGreaterThan(
            numericValues,
            primaryIndex + 1,
            elementCount - 1,
            minimumSecondaryValue
        );

        if (firstValidSecondaryIndex <= elementCount - 1) {
            totalValidPairCount += (elementCount - 1) - firstValidSecondaryIndex + 1;
        }
    }
    console.log(totalValidPairCount);
}
