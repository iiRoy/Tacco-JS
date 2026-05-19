"use strict";
function main(inputString) {
    const rawInputLines = inputString.trim();
    const processedInputLines = rawInputLines.split("\n");

    const firstLineData = processedInputLines[0].split(" ");
    const maximumValue = Number(firstLineData[1]);

    const rawNumbersString = processedInputLines[1].split(" ");
    const parsedNumericValues = rawNumbersString.map(s => Number(s));

    // Sort in descending order
    parsedNumericValues.sort((valA, valB) => valB - valA);

    // Deduplicate using a Set for a different approach
    const uniqueValuesSet = new Set(parsedNumericValues);
    const uniqueSortedValues = Array.from(uniqueValuesSet);

    const primaryFactor = uniqueSortedValues.shift(); // This modifies uniqueSortedValues
    const secondaryFactors = uniqueSortedValues; // Renamed 'a' to 'secondaryFactors'

    let finalCount = 0;
    const HALF_INCREMENT = 0.5; // Introduced a constant

    // Helper function to encapsulate the inner loop logic
    const checkDivisibility = (currentTestProduct, divisorsArray) => {
        for (let k = 0; k < divisorsArray.length; k++) {
            const currentDivisor = divisorsArray[k];
            const intermediateResult = currentTestProduct / currentDivisor - HALF_INCREMENT;
            // Using modulo operator for integer check instead of Number.isInteger
            if (intermediateResult % 1 !== 0) {
                return false; // Not an integer, so this combination is invalid
            }
        }
        return true; // All checks passed, combination is valid
    };

    let currentMultiplier = 1;
    while (true) { // Rewriting the for loop as a while loop
        const multiplierTerm = currentMultiplier + HALF_INCREMENT; // Intermediate computation
        const currentTestProduct = primaryFactor * multiplierTerm;

        if (currentTestProduct > maximumValue) {
            break; // Exit loop if product exceeds maximum allowed value
        }

        if (checkDivisibility(currentTestProduct, secondaryFactors)) {
            finalCount++;
        }
        currentMultiplier++;
    }
    console.log(finalCount);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
