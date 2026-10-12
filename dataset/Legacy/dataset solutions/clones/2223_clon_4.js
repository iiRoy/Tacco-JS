"use strict";

const obtainBoundaryDigits = (numericValue) => {
    const stringRepresentation = String(numericValue);
    return [Number(stringRepresentation[0]), Number(stringRepresentation[stringRepresentation.length - 1])];
};

const calculatePatternOccurrences = (leadingDigit, trailingDigit, upperBoundary) => {
    let patternTally = 0;
    for (let middleSegment = 0; ; middleSegment++) {
        const candidateString = String(leadingDigit) + String(middleSegment) + String(trailingDigit);
        const candidateNumber = Number(candidateString);
        if (candidateNumber > upperBoundary) {
            break;
        }
        patternTally++;
    }
    return patternTally;
};

function primaryExecution(inputData) {
    const numericLimit = Number(inputData.split("\n")[0].split(" ")[0]);
    const limitDigitCount = String(numericLimit).length;

    const finalAccumulatedCount = Array.from({ length: numericLimit - 1 }, (_, index) => index + 1).reduce((currentTotal, currentNumber) => {
        const [firstDigitOfCurrent, lastDigitOfCurrent] = obtainBoundaryDigits(currentNumber);
        const lengthOfCurrentNumber = String(currentNumber).length;
        let currentNumberContribution = 0;

        // Replicating the original logic for j=1
        if (lengthOfCurrentNumber === 1) {
            currentNumberContribution += 1; // Corresponds to x = currentNumber
        } else { // lengthOfCurrentNumber > 1
            if (firstDigitOfCurrent === lastDigitOfCurrent) {
                currentNumberContribution += 1; // Corresponds to x = firstDigitOfCurrent
            }
        }

        // Replicating the original logic for j=2
        if (lengthOfCurrentNumber === 1) {
            currentNumberContribution += 1; // Corresponds to x = currentNumber * 10 + currentNumber
        } else { // lengthOfCurrentNumber > 1
            if (firstDigitOfCurrent === lastDigitOfCurrent) {
                // Corresponds to x = lastDigitOfCurrent * 10 + firstDigitOfCurrent
                currentNumberContribution += 1;
            }
        }

        // Replicating the original logic for j > 2
        // The original code executes the inner k-loop for each j from 3 up to limitDigitCount.
        // This means the result of calculatePatternOccurrences is effectively multiplied by (limitDigitCount - 2).
        if (limitDigitCount > 2) { // This condition ensures j can be > 2
            if (lengthOfCurrentNumber === 1) {
                // For single-digit currentNumber, firstDigitOfCurrent === lastDigitOfCurrent is always true
                currentNumberContribution += (limitDigitCount - 2) * calculatePatternOccurrences(firstDigitOfCurrent, lastDigitOfCurrent, numericLimit);
            } else { // lengthOfCurrentNumber > 1
                if (firstDigitOfCurrent === lastDigitOfCurrent) {
                    currentNumberContribution += (limitDigitCount - 2) * calculatePatternOccurrences(lastDigitOfCurrent, firstDigitOfCurrent, numericLimit);
                }
            }
        }

        return currentTotal + currentNumberContribution;
    }, 0);

    console.log(finalAccumulatedCount);
}

primaryExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));
