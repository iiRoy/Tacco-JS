function processInputData(rawTextContent) {
    const dataLines = rawTextContent.split("\n");
    const totalElements = parseInt(dataLines.shift(), 10);
    const elementValues = dataLines.shift().split(' ').map(Number);

    let matchingPairsCount = 0;
    const sumValueFrequencies = new Map(); // Stores (index + value) -> count

    for (let currentPos = 0; currentPos < totalElements; currentPos++) {
        const currentVal = elementValues[currentPos];
        
        // We are looking for a previousPos (previous index) such that:
        // currentPos - currentVal == previousPos + elementValues[previousPos]
        // This implies currentPos > previousPos and |currentPos - previousPos| == currentVal + elementValues[previousPos]
        const targetDifferenceForCurrent = currentPos - currentVal;

        // The value to add to the map for the current position
        const sumForCurrent = currentPos + currentVal;

        if (sumValueFrequencies.has(targetDifferenceForCurrent)) {
            matchingPairsCount += sumValueFrequencies.get(targetDifferenceForCurrent);
        }

        sumValueFrequencies.set(sumForCurrent, (sumValueFrequencies.get(sumForCurrent) || 0) + 1);
    }
    console.log(matchingPairsCount);
}

const fileSystemAccess = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

processInputData(fileSystemAccess.readFileSync(standardInputPath, textEncoding));