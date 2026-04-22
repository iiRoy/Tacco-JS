fileUtility = require('fs'); // Obtain the necessary file system module.
sourceData = fileUtility.readFileSync('/dev/stdin', 'utf-8'); // Read input data from standard input.
lineSegments = sourceData.split('\n'); // Split the input into an array of lines.

numCases = parseInt(lineSegments[0], 10); // The first line indicates the total number of test cases.

// Iterate through each individual test case provided in the input.
for (let caseIterator = 1; caseIterator <= numCases; caseIterator++) {
    let currentCaseParams = lineSegments[caseIterator].split(' '); // Split the current line into its constituent parameters.

    let targetNumber = parseInt(currentCaseParams[0], 10); // The primary number to process.
    let costForTwo = parseInt(currentCaseParams[1], 10); // Cost associated with operations involving factor 2.
    let costForThree = parseInt(currentCaseParams[2], 10); // Cost associated with operations involving factor 3.
    let costForFive = parseInt(currentCaseParams[3], 10); // Cost associated with operations involving factor 5 (currently unused in logic).
    let unitCost = parseInt(currentCaseParams[4], 10); // Base cost for individual unit operations.

    finalMinimum = 0; // Initialize the global minimum cost for the current test case.
    evaluateCostRecursive(targetNumber, 0, costForTwo, costForThree, costForFive, unitCost); // Begin the recursive cost evaluation.

    console.log(finalMinimum); // Output the calculated minimum cost for this test case.
}

/**
 * Recursively calculates the minimum cost to reduce a number to 1 using division and subtraction operations.
 *
 * @param {number} currentValue The current number being processed.
 * @param {number} accumulatedCost The cost accumulated so far to reach `currentValue`.
 * @param {number} cst2 The cost multiplier for operations involving factor 2.
 * @param {number} cst3 The cost multiplier for operations involving factor 3.
 * @param {number} cst5 The cost multiplier for operations involving factor 5.
 * @param {number} cstUnit The cost for a single unit operation (subtraction).
 */
function evaluateCostRecursive(currentValue, accumulatedCost, cst2, cst3, cst5, cstUnit) {

    // Evaluate operations involving factor 2
    if (currentValue >= 2) {
        let remainderPart = currentValue % 2;
        let quotientPart = (currentValue - remainderPart) / 2;

        if (remainderPart === 0 || quotientPart === 1) { // Direct application of factor 2 is possible or quotient is 1
            let calculatedAttempt = accumulatedCost + cst2 * quotientPart + cstUnit * remainderPart;
            if (finalMinimum === 0 || finalMinimum > calculatedAttempt) {
                finalMinimum = calculatedAttempt; // Update global minimum if a lower cost is found.
            }
        } else { // Recursive step for factor 2
            evaluateCostRecursive(quotientPart, accumulatedCost + cst2 + cstUnit * remainderPart, cst2, cst3, cst5, cstUnit);

            quotientPart = quotientPart + 1; // Consider an alternative path by increasing quotient and adjusting remainder
            remainderPart = currentValue - quotientPart * 2;

            if (remainderPart === 0) { // If new remainder is zero, calculate cost
                let calculatedAttempt = accumulatedCost + cst2 * quotientPart + cstUnit;
                if (finalMinimum === 0 || finalMinimum > calculatedAttempt) {
                    finalMinimum = calculatedAttempt;
                }
            } else { // Another recursive call with the adjusted values
                evaluateCostRecursive(quotientPart, accumulatedCost + cst2 + cstUnit * remainderPart, cst2, cst3, cst5, cstUnit);
            }
        }
    }


    // Evaluate operations involving factor 3
    if (currentValue >= 3) {
        let remainderPart = currentValue % 3;
        let quotientPart = (currentValue - remainderPart) / 3;

        if (remainderPart === 0 || quotientPart === 1) { // Direct application of factor 3 is possible
            let calculatedAttempt = accumulatedCost + cst3 * quotientPart + cstUnit * remainderPart;
            if (finalMinimum === 0 || finalMinimum > calculatedAttempt) {
                finalMinimum = calculatedAttempt; // Update global minimum if a lower cost is found.
            }
        } else { // Recursive step for factor 3
            evaluateCostRecursive(quotientPart, accumulatedCost + cst3 + cstUnit * remainderPart, cst2, cst3, cst5, cstUnit);

            quotientPart = quotientPart + 1; // Explore alternative with increased quotient
            remainderPart = currentValue - quotientPart * 3;

            if (remainderPart === 0) { // If adjusted remainder is zero
                let calculatedAttempt = accumulatedCost + cst3 * quotientPart + cstUnit;
                if (finalMinimum === 0 || finalMinimum > calculatedAttempt) {
                    finalMinimum = calculatedAttempt;
                }
            } else { // Another recursive call with adjusted values
                evaluateCostRecursive(quotientPart, accumulatedCost + cst3 + cstUnit * remainderPart, cst2, cst3, cst5, cstUnit);
            }
        }
    }

    /*
     * This block would handle operations involving factor 5, if it were enabled.
     * It follows a similar pattern to the factor 2 and factor 3 blocks.
     * Currently, it is commented out and thus not executed in the program's flow.
     *
    if (currentValue >= 5) {
        let remainderPart = currentValue % 5;
        let quotientPart = (currentValue - remainderPart) / 5;

        if (remainderPart === 0 || quotientPart === 1) {
            let calculatedAttempt = accumulatedCost + cst5 * quotientPart + cstUnit * remainderPart;
            if (finalMinimum === 0 || finalMinimum > calculatedAttempt) {
                finalMinimum = calculatedAttempt;
            }
        } else {
            evaluateCostRecursive(quotientPart, accumulatedCost + cst5 + cstUnit * remainderPart, cst2, cst3, cst5, cstUnit);
            quotientPart = quotientPart + 1;
            remainderPart = currentValue - quotientPart * 5;
            if (remainderPart === 0) {
                let calculatedAttempt = accumulatedCost + cst5 * quotientPart + cstUnit;
                if (finalMinimum === 0 || finalMinimum > calculatedAttempt) finalMinimum = calculatedAttempt;
            } else evaluateCostRecursive(quotientPart, accumulatedCost + cst5 + cstUnit * remainderPart, cst2, cst3, cst5, cstUnit);
        }
    }
    */
}