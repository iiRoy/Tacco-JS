"use strict";

const processInput = (inputString) => {
    // Acquire and parse input data lines
    const rawLines = inputString.trim().split('\n');

    // Computes the final answer based on provided data.

    const referenceValue = Number.parseInt(rawLines[0].split(' ')[0], 10);
    const excludedCount = Number.parseInt(rawLines[0].split(' ')[1], 10);

    if (excludedCount === 0) {
        console.log(referenceValue);
    } else {
        const disallowedNumbers = rawLines[1].split(' ').map(item => Number.parseInt(item, 10));

        // Create a sequence of integers from 0 to 100
        const fullIntegerRange = Array.from({
            length: 101
        }, (v, k) => k);

        const permittedValues = fullIntegerRange.filter(currentNum =>
            disallowedNumbers.indexOf(currentNum) === -1
        );

        const finalResult = permittedValues.reduce((bestSoFar, candidateNum) => {
            const bestDifference = Math.abs(referenceValue - bestSoFar);
            const candidateDifference = Math.abs(referenceValue - candidateNum);

            if (bestDifference === candidateDifference) {
                return Math.min(bestSoFar, candidateNum);
            } else if (bestDifference > candidateDifference) {
                return candidateNum;
            } else {
                return bestSoFar;
            }
        }, 101); // Initial value outside typical range to ensure first comparison is meaningful

        // Check if the found number is "worse" than -1 (based on absolute difference to referenceValue)
        if (Math.abs(referenceValue - finalResult) >= Math.abs(referenceValue - (-1))) {
            console.log(-1);
        } else {
            console.log(finalResult);
        }
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));