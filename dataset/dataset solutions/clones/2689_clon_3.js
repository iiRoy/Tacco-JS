// Function to parse raw input string into structured numerical data.
// This handles splitting lines and converting string values to integers.
function parseInputString(rawInputString) {
    if (!rawInputString || rawInputString.trim() === '') {
        console.error("Error: Empty input string provided.");
        return null;
    }
    const lines = rawInputString.split("\n");
    const parsedLines = lines.map(line => {
        // Filter out empty strings that might result from extra newlines
        const values = line.split(" ").filter(s => s !== '');
        return values.map(val => parseInt(val, 10)); // Explicit radix for parseInt
    });
    return parsedLines;
}

// Helper to find the maximum numeric value within an array.
// Returns Number.MIN_SAFE_INTEGER for an empty array to handle edge cases gracefully.
function getArrayMaximum(valueCollection) {
    if (!valueCollection || valueCollection.length === 0) {
        return Number.MIN_SAFE_INTEGER; // Indicate no maximum found
    }
    // Using reduce to find the max, renaming accumulator and current value for clarity.
    return valueCollection.reduce((currentMaximum, elementValue) => Math.max(currentMaximum, elementValue));
}

// This function computes a "balance factor" from a sequence of numbers.
// The logic for summing indices (sumLeft += i) is peculiar but preserved from the original.
function computeBalanceFactor(inputSequence) {
    if (!inputSequence || inputSequence.length === 0) {
        return 0; // Or some other sensible default for an empty sequence
    }

    // Create a sorted copy to avoid modifying the original array.
    const sortedSequence = [...inputSequence].sort((a, b) => a - b);
    let currentLeftSum = 0;
    let currentRightSum = 0;
    let rightPtr = sortedSequence.length - 1; // Pointer for the right side
    
    // Initialize right sum with the largest element.
    currentRightSum = sortedSequence[rightPtr];

    // Iterating from the left, adjusting sums based on a specific logic.
    // Note: currentLeftSum accumulates indices, not values, as per original logic.
    for (let leftPtr = 0; leftPtr < rightPtr; leftPtr++) {
        currentLeftSum += leftPtr; // Accumulates the index 'leftPtr'
        if (currentLeftSum <= currentRightSum) {
            // If left sum is still less or equal, continue to next element.
            continue;
        } else {
            // If left sum exceeds right sum, adjust right sum by adding elements from the right end.
            rightPtr--; // Move right pointer inward
            while (currentRightSum < currentLeftSum && rightPtr >= leftPtr) { // Corrected boundary: rightPtr >= leftPtr
                if (rightPtr < 0) break; // Safety break for very small arrays
                currentRightSum += sortedSequence[rightPtr];
                rightPtr--;
            }
        }
    }
    // The result is the minimum of the final left and right sums.
    return Math.min(currentLeftSum, currentRightSum);
}

// Recursive helper function to explore combinations of deviations to balance costs
// within a given budget. This is a form of a subset sum or knapsack-like problem.
function exploreBalanceCombinations(deviationComponentPairs, currentPairIndex, accumulatedLeftDeviation, accumulatedRightDeviation, maxAllowedDeviation) {
    // Guard clause: If either deviation exceeds the budget, this path is invalid.
    if (accumulatedLeftDeviation > maxAllowedDeviation || accumulatedRightDeviation > maxAllowedDeviation) {
        return false;
    }

    // Base case: If all pairs have been processed, check if the deviations are balanced.
    if (currentPairIndex === deviationComponentPairs.length) {
        return accumulatedLeftDeviation === accumulatedRightDeviation;
    }

    const currentPair = deviationComponentPairs[currentPairIndex];
    const nextPairIndex = currentPairIndex + 1;

    // Explore two paths: adding the first component to left deviation or the second to right deviation.
    // The order of exploration might influence performance (e.g., if one path is more likely to fail early).
    // Prioritize the path that might keep sums closer.
    let pathResult = false;
    if (accumulatedLeftDeviation < accumulatedRightDeviation) {
        // Try adding to left first if left is smaller
        pathResult = attemptLeftAdjustment(deviationComponentPairs, nextPairIndex, accumulatedLeftDeviation + currentPair[0], accumulatedRightDeviation, maxAllowedDeviation);
        if (!pathResult) { // If left path failed, try right path
            pathResult = attemptRightAdjustment(deviationComponentPairs, nextPairIndex, accumulatedLeftDeviation, accumulatedRightDeviation + currentPair[1], maxAllowedDeviation);
        }
    } else {
        // Otherwise, try adding to right first
        pathResult = attemptRightAdjustment(deviationComponentPairs, nextPairIndex, accumulatedLeftDeviation, accumulatedRightDeviation + currentPair[1], maxAllowedDeviation);
        if (!pathResult) { // If right path failed, try left path
            pathResult = attemptLeftAdjustment(deviationComponentPairs, nextPairIndex, accumulatedLeftDeviation + currentPair[0], accumulatedRightDeviation, maxAllowedDeviation);
        }
    }
    return pathResult;
}

// Helper function for exploreBalanceCombinations: tries adding the left component of the current pair.
function attemptLeftAdjustment(pairData, nextIndex, currentLeftSum, currentRightSum, budgetLimit) {
    // Recursively call the main exploration function with updated left sum.
    return exploreBalanceCombinations(pairData, nextIndex, currentLeftSum, currentRightSum, budgetLimit);
}

// Helper function for exploreBalanceCombinations: tries adding the right component of the current pair.
function attemptRightAdjustment(pairData, nextIndex, currentLeftSum, currentRightSum, budgetLimit) {
    // Recursively call the main exploration function with updated right sum.
    return exploreBalanceCombinations(pairData, nextIndex, currentLeftSum, currentRightSum, budgetLimit);
}

// This function checks if a proposed divisor 'g' satisfies certain conditions
// related to deviations and an allowed deviation budget 'k'.
function testDivisorValidity(proposedDivisor, originalValues, allowedDeviation) {
    // Input validation: Divisor must be positive.
    if (proposedDivisor <= 0) {
        return false;
    }
    if (!originalValues || originalValues.length === 0) {
        // If there are no values, it's vacuously true if budget is non-negative.
        // Or false if we require actual processing. Let's assume false if no numbers to divide.
        return false;
    }

    const deviationPairs = [];
    let remainingDeviationBudget = allowedDeviation * 2; // Initial budget is 2*k as per original logic.

    // Iterate through each value to calculate deviations.
    for (const currentValue of originalValues) {
        const rem1 = currentValue % proposedDivisor;
        
        // If there's no remainder, this number is perfectly divisible, so no deviation cost.
        if (rem1 === 0) {
            continue;
        }
        
        const rem2 = proposedDivisor - rem1; // The other possible deviation.
        const minDeviation = Math.min(rem1, rem2);

        // If the minimum deviation for a single number exceeds the allowedDeviation 'k',
        // then this proposedDivisor is immediately invalid.
        if (allowedDeviation < minDeviation) {
            return false;
        }

        // Subtract the minimum deviation from the total budget.
        remainingDeviationBudget -= minDeviation;
        
        // If the budget drops below zero, this path is invalid.
        if (remainingDeviationBudget < 0) {
            return false;
        }
        
        // Store the pair of deviations for further balancing.
        deviationPairs.push([rem1, rem2]);
    }
    
    // After processing all numbers, use recursion to check if the remaining deviations
    // can be balanced within the initial 'k' budget.
    return exploreBalanceCombinations(deviationPairs, 0, 0, 0, allowedDeviation);
}

// The main processing function that orchestrates the solution.
function executeSolution(rawInputString) {
    const parsedNumericLines = parseInputString(rawInputString);
    
    // Early exit if input parsing failed or was empty.
    if (!parsedNumericLines || parsedNumericLines.length < 2) {
        console.error("Invalid input format: Expected at least two lines of data.");
        return 0; // Return a default value or throw error
    }

    // Extract problem parameters and data.
    const costLimitK = parsedNumericLines[0][1]; // k is the second element of the first line.
    const targetNumbers = parsedNumericLines[1]; // The array of numbers is the second line.

    // Validate extracted data.
    if (costLimitK === undefined || !Array.isArray(targetNumbers) || targetNumbers.length === 0) {
        console.error("Invalid input data: Missing k or target numbers array.");
        return 0;
    }
    
    // Determine the maximum value in the dataset.
    const datasetMaximum = getArrayMaximum(targetNumbers);

    // Calculate an upper bound for the divisor search.
    // This bound is based on the maximum value in the dataset and a balance factor.
    const balanceFactor = computeBalanceFactor(targetNumbers);
    const upperDivisorCandidate = Math.min(datasetMaximum + costLimitK, datasetMaximum + balanceFactor);

    let optimalDivisorFound = 1; // Default to 1 if no other suitable divisor is found.

    // Iterate downwards from the calculated upper bound to 1 to find the largest suitable divisor.
    for (let currentCandidate = upperDivisorCandidate; currentCandidate >= 1; currentCandidate--) {
        // Check if the current candidate divisor satisfies the complex divisibility condition.
        if (testDivisorValidity(currentCandidate, targetNumbers, costLimitK)) {
            optimalDivisorFound = currentCandidate;
            break; // Found the largest valid divisor, so we can stop.
        }
    }
    
    return optimalDivisorFound;
}

// --- Program Execution ---
// This immediately invoked function expression (IIFE) handles reading input and calling the main solution.
(function() {
    let inputData = '';
    try {
        // Attempt to read input from standard input, common in competitive programming.
        inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        console.error("Failed to read input from /dev/stdin:", error.message);
        // For actual production, you might want to exit or throw.
        // For demonstration, an example input is provided if stdin fails.
        inputData = "2 3\n10 20 30"; 
    }
    
    // Execute the main solution logic and print the result.
    const finalResult = executeSolution(inputData);
    console.log(finalResult);
})();