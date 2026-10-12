'use strict';

// Helper function to parse input string parts into numbers
function parseInputValues(inputString) {
    const stringParts = inputString.split(" ");
    // Using map for conversion to Number
    return stringParts.map(Number);
}

function processCalculation(rawData) {
    // Parse all necessary input values at once
    const [totalSlots, redCount, blueCount, targetSum] = parseInputValues(rawData);

    // Calculate derived block sizes
    const greenBlockSize = redCount + blueCount;
    const largerColorBlock = Math.max(redCount, blueCount);
    // The 'smallerColorBlock' (original 'third') was calculated but not used in the original logic.
    // It has been removed as a non-essential deletion.

    let totalPatterns = 0;

    // Helper function for calculating permutations (nPr)
    // Renamed parameters for clarity
    function calculatePermutations(nItems, rSelected) {
        let currentProduct = 1;
        // Loop from 0 up to rSelected-1
        for (let kIndex = 0; kIndex < rSelected; kIndex++) {
            currentProduct = (currentProduct * (nItems - kIndex));
        }
        return currentProduct;
    }

    // Helper function for calculating combinations (nCr)
    // Renamed parameters for clarity
    function calculateCombinations(nItems, rChoose) {
        // Handle edge cases for combinations
        if (rChoose < 0 || rChoose > nItems) {
            return 0; // Invalid combination
        }
        if (rChoose === 0 || rChoose === nItems) {
            return 1; // C(n,0) = 1, C(n,n) = 1
        }

        // Optimization: C(n, r) = C(n, n-r)
        const effectiveR = Math.min(rChoose, nItems - rChoose);

        // Calculate nCr using permutations: nPr / r!
        const numeratorPermutation = calculatePermutations(nItems, effectiveR);
        const denominatorPermutation = calculatePermutations(effectiveR, effectiveR); // This is effectiveR!

        // Division by zero check, though denominatorPermutation should be 1 for effectiveR=0
        if (denominatorPermutation === 0) {
            // This case should not be reached for valid effectiveR values (>=0)
            return 0;
        }
        return numeratorPermutation / denominatorPermutation;
    }

    // Determine the maximum possible number of green blocks
    const maxGreenBlocks = Math.floor(targetSum / greenBlockSize);

    // Iterate through possible numbers of green blocks
    for (let numGreenBlocks = maxGreenBlocks; numGreenBlocks >= 0; numGreenBlocks--) {
        const greenContributionValue = numGreenBlocks * greenBlockSize;
        const remainingValueAfterGreen = targetSum - greenContributionValue;

        // Determine the maximum possible number of larger color blocks for the remaining value
        const maxLargerColorBlocks = Math.floor(remainingValueAfterGreen / largerColorBlock);

        // Iterate through possible numbers of larger color blocks
        for (let numLargerColorBlocks = maxLargerColorBlocks; numLargerColorBlocks >= 0; numLargerColorBlocks--) {
            const largerColorContributionValue = numLargerColorBlocks * largerColorBlock;
            const remainingValueAfterBoth = targetSum - greenContributionValue - largerColorContributionValue;

            // Calculate the total number of items placed for the current combination
            const currentTotalItemsPlaced = numGreenBlocks + numLargerColorBlocks + remainingValueAfterBoth;

            // Check if the total items placed do not exceed the total available slots
            if (currentTotalItemsPlaced <= totalSlots) {
                // This section calculates the specific pattern count based on the problem's formula.
                // Original: pat = pat + (combination(N, i+j+restgb) * combination(i+j+restgb,Math.max(i,j,restgb)));

                // First combination term: C(totalSlots, currentTotalItemsPlaced)
                const firstTermN = totalSlots;
                const firstTermR = currentTotalItemsPlaced;
                const firstCombinationResult = calculateCombinations(firstTermN, firstTermR);

                // Second combination term: C(currentTotalItemsPlaced, Math.max(numGreenBlocks, numLargerColorBlocks, remainingValueAfterBoth))
                const secondTermN = currentTotalItemsPlaced;
                const secondTermR = Math.max(numGreenBlocks, numLargerColorBlocks, remainingValueAfterBoth);
                const secondCombinationResult = calculateCombinations(secondTermN, secondTermR);

                // Add the product of the two combination terms to the total patterns
                totalPatterns += (firstCombinationResult * secondCombinationResult);
            }
        }
    }

    console.log(totalPatterns);
}

// Read input from stdin and trigger the main processing function
const inputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processCalculation(inputData);
