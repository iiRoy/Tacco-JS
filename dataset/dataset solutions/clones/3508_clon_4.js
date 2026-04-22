'use strict';

function processNumericalInput(rawData) {
    let numericRepresentation = Number(rawData);

    const fixedIncrement = 111;

    if (numericRepresentation === 0) {
        return 0;
    }

    if (numericRepresentation > 0) {
        let currentSum = 0;
        while (currentSum < numericRepresentation) {
            currentSum += fixedIncrement;
        }
        return currentSum;
    } else { // numericRepresentation < 0
        let currentSum = 0;
        while (currentSum > numericRepresentation) {
            currentSum -= fixedIncrement;
        }

        // At this point, currentSum is the largest multiple of fixedIncrement that is <= numericRepresentation.
        // If numericRepresentation is a multiple of fixedIncrement, then numericRepresentation === currentSum.
        // Otherwise, numericRepresentation is not a multiple, and we need to add fixedIncrement to currentSum
        // to get the smallest multiple of fixedIncrement that is >= numericRepresentation.
        if (numericRepresentation === currentSum) {
            return currentSum;
        } else {
            return currentSum + fixedIncrement;
        }
    }
}

const fileSystemUtility = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

let contentFromInput = fileSystemUtility.readFileSync(standardInputPath, textEncoding);
let cleanedContent = contentFromInput.trim();

console.log(processNumericalInput(cleanedContent));