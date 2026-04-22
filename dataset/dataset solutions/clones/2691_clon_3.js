// This JavaScript program is designed to find the largest possible integer divisor 'g'
// for a given sequence of numbers, subject to certain adjustment constraints.
// The core logic involves parsing input, iterating through potential divisors,
// and recursively checking if a divisor satisfies the conditions.

// Main function to process the input string and orchestrate the calculation.
function processInputData(rawDataString) {
    // --- Input Validation and Pre-processing ---
    // Ensure the raw input is a valid non-empty string.
    if (typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error("Error: Input string is invalid or empty. Cannot proceed.");
        return -1; // Indicate an error or an invalid state.
    }

    // Parse the raw multi-line string into an array of arrays of numbers.
    // Each inner array represents a line from the input.
    // Using a more explicit parsing method to demonstrate structural alteration.
    const parsedLines = rawDataString.split("\n").reduce((accumulator, currentLine) => {
        const trimmedLine = currentLine.trim();
        // Skip any empty lines to prevent parsing errors.
        if (trimmedLine === '') {
            return accumulator;
        }

        // Convert string parts to integers. Filter out any non-numeric results.
        const lineNumericValues = trimmedLine.split(" ").map(stringValue => {
            const numericValue = parseInt(stringValue, 10);
            // Basic validation for each parsed number.
            if (isNaN(numericValue)) {
                console.warn(`Warning: Found non-numeric data '${stringValue}'. Skipping this value.`);
                return null; // Mark as invalid.
            }
            return numericValue;
        }).filter(value => value !== null); // Remove nulls (invalid numbers).

        // Only add lines that contain actual numeric data.
        if (lineNumericValues.length > 0) {
            accumulator.push(lineNumericValues);
        }
        return accumulator;
    }, []);

    // Verify that essential input lines are present.
    if (parsedLines.length < 2) {
        console.error("Error: Insufficient data lines in input. Expected at least two.");
        return -1;
    }

    // Extract the budget factor ('k' from the original problem) from the first line.
    // Assuming 'k' is the second element on the first line.
    const configurationValues = parsedLines[0];
    const adjustmentBudgetFactor = configurationValues[1];

    // Validate the extracted budget factor.
    if (typeof adjustmentBudgetFactor !== 'number' || isNaN(adjustmentBudgetFactor) || adjustmentBudgetFactor < 0) {
        console.error(`Error: Invalid or negative adjustment budget factor ('k'): ${adjustmentBudgetFactor}.`);
        return -1;
    }

    // Extract the main sequence of numbers from the second line.
    const numericSequence = parsedLines[1];

    // If the numeric sequence is empty, the smallest possible divisor is 1.
    if (!numericSequence || numericSequence.length === 0) {
        return 1;
    }

    // --- Core Logic Execution ---
    // Find the maximum value within the numeric sequence.
    const maximumSequenceValue = getMaximumValue(numericSequence);

    // Calculate the total sum of all numbers in the sequence.
    const totalSequenceSum = calculateTotalSum(numericSequence);

    // Determine the upper limit for our divisor search.
    // This bound is the minimum of (max_value + k) and the total sum.
    // Ensures we don't search unnecessarily large numbers.
    let searchUpperBoundary = Math.min(maximumSequenceValue + adjustmentBudgetFactor, totalSequenceSum);

    // The smallest possible divisor is 1. Ensure the boundary doesn't drop below it.
    if (searchUpperBoundary < 1) {
        searchUpperBoundary = 1;
    }

    // Iterate downwards from the calculated upper boundary to 1.
    // The goal is to find the largest 'g' that satisfies the condition.
    for (let currentDivisorCandidate = searchUpperBoundary; currentDivisorCandidate >= 1; currentDivisorCandidate--) {
        // Check if the current candidate divisor meets all criteria.
        if (checkDivisibilityCondition(currentDivisorCandidate, numericSequence, adjustmentBudgetFactor)) {
            // If a valid divisor is found, it's the largest one due to the descending loop.
            return currentDivisorCandidate;
        }
    }

    // As '1' should always be a valid divisor (unless k is negative, which is guarded),
    // this line should ideally only be reached if the loop started below 1 or other errors occurred.
    // It serves as a fallback, explicitly stating 1 as the smallest valid divisor.
    return 1;
}

// Finds the largest number in a given collection.
// Replaces the original 'max' function.
function getMaximumValue(valueCollection) {
    // Validate input array.
    if (!Array.isArray(valueCollection) || valueCollection.length === 0) {
        // Return negative infinity for an empty array, as per common mathematical practice
        // when finding the maximum of an empty set.
        console.warn("Warning: Attempted to find maximum of an empty or invalid collection. Returning -Infinity.");
        return -Infinity;
    }

    let currentHighest = valueCollection[0]; // Initialize with the first element.
    // Iterate from the second element to compare and update the maximum.
    for (let i = 1; i < valueCollection.length; i++) {
        const item = valueCollection[i];
        // Ensure the item is a valid number before comparison.
        if (typeof item === 'number' && !isNaN(item)) {
            if (item > currentHighest) {
                currentHighest = item;
            }
        } else {
            console.warn(`Warning: Non-numeric value '${item}' encountered in getMaximumValue. Skipping.`);
        }
    }
    return currentHighest;
}

// Calculates the sum of all numeric values in a list.
// Replaces the original 'sum' function.
function calculateTotalSum(numberList) {
    // Validate input.
    if (!Array.isArray(numberList)) {
        console.error("Error: Input for calculateTotalSum must be an array.");
        return 0;
    }

    let accumulatedSum = 0;
    // Iterate using a 'for...of' loop for a different structural approach.
    for (const numberItem of numberList) {
        // Only add if the item is a valid number.
        if (typeof numberItem === 'number' && !isNaN(numberItem)) {
            accumulatedSum += numberItem;
        } else {
            console.warn(`Warning: Non-numeric item '${numberItem}' found in calculateTotalSum. Ignoring.`);
        }
    }
    return accumulatedSum;
}

// Determines if a potential divisor meets the specific divisibility and budget criteria.
// This function replaces the original 'isG'.
function checkDivisibilityCondition(potentialDivisor, inputNumbers, adjustmentBudget) {
    // --- Initial Parameter Validation ---
    if (potentialDivisor <= 0 || !Array.isArray(inputNumbers) || adjustmentBudget < 0) {
        console.error("Invalid parameters for checkDivisibilityCondition.");
        return false;
    }

    // The total available budget for adjustments across all numbers.
    // The original problem implies a total budget of 2*k.
    let remainingTotalBudget = adjustmentBudget * 2;

    // An array to store the remainder pairs for numbers not perfectly divisible.
    // Storing as objects { val1, val2 } instead of arrays [val1, val2] for clarity and type change.
    const nonDivisibleCostPairs = [];

    // --- Process Each Number in the Input Sequence ---
    for (let index = 0; index < inputNumbers.length; index++) {
        const currentNumber = inputNumbers[index];

        // Ensure the current number is valid.
        if (typeof currentNumber !== 'number' || isNaN(currentNumber) || currentNumber < 0) {
            console.warn(`Warning: Invalid number '${currentNumber}' at index ${index}. Aborting check.`);
            return false;
        }

        // Calculate the first remainder (how much to subtract to reach previous multiple).
        const firstRemainder = currentNumber % potentialDivisor;

        // If the number is perfectly divisible by 'potentialDivisor', no cost is incurred for it.
        if (firstRemainder === 0) {
            continue; // Move to the next number.
        }

        // Calculate the second remainder (how much to add to reach next multiple).
        const secondRemainder = potentialDivisor - firstRemainder;

        // The minimum cost to make 'currentNumber' divisible by 'potentialDivisor'.
        const minimumAdjustmentForCurrentNumber = Math.min(firstRemainder, secondRemainder);

        // --- Budget Checks ---
        // If the minimum adjustment for a single number exceeds the individual budget factor 'k',
        // then this 'potentialDivisor' is not valid.
        if (adjustmentBudget < minimumAdjustmentForCurrentNumber) {
            return false;
        }

        // Deduct the cost from the total remaining budget.
        remainingTotalBudget -= minimumAdjustmentForCurrentNumber;

        // If the total budget runs out, this 'potentialDivisor' is not valid.
        if (remainingTotalBudget < 0) {
            return false;
        }

        // Store the pair of remainders for subsequent recursive processing.
        nonDivisibleCostPairs.push({ optionA: firstRemainder, optionB: secondRemainder });
    }

    // --- Recursive Path Exploration ---
    // If all numbers were processed and the budget wasn't exceeded,
    // proceed to a recursive check to balance the remainder costs.
    // This function attempts to find if the remaining costs can be balanced within the budget.
    return exploreCostBalancingPaths(nonDivisibleCostPairs, 0, 0, 0, adjustmentBudget);
}

// Recursively explores paths to balance the accumulated left and right costs.
// This function replaces the original 'traver'.
// It tries to make currentLeftSum equal to currentRightSum, within maxAllowedCost.
function exploreCostBalancingPaths(costDataPairs, currentProcessingLevel, currentLeftSum, currentRightSum, maxAllowedCost) {
    // --- Guard Clauses for Invalid States ---
    if (!Array.isArray(costDataPairs) || currentProcessingLevel < 0 || currentLeftSum < 0 || currentRightSum < 0 || maxAllowedCost < 0) {
        console.error("Error: Invalid input parameters for exploreCostBalancingPaths.");
        return false;
    }

    // --- Base Case 1: Budget Exceeded ---
    // If either accumulated sum exceeds the maximum allowed cost, this path is invalid.
    if (currentLeftSum > maxAllowedCost || currentRightSum > maxAllowedCost) {
        return false;
    }

    // --- Base Case 2: All Pairs Processed ---
    // If we have processed all cost pairs, check if the sums are balanced.
    if (currentProcessingLevel === costDataPairs.length) {
        return currentLeftSum === currentRightSum;
    }

    // --- Recursive Step: Explore Branches ---
    const currentCostPair = costDataPairs[currentProcessingLevel];
    // Using object destructuring for cleaner access to properties.
    const { optionA: leftOptionCost, optionB: rightOptionCost } = currentCostPair;

    // Attempt the first branch: Add 'leftOptionCost' to the left sum.
    // This call is equivalent to the original 'testLeftPath'.
    const resultFromLeftBranch = attemptLeftCostAllocation(
        costDataPairs,
        currentProcessingLevel + 1,
        currentLeftSum + leftOptionCost,
        currentRightSum,
        maxAllowedCost
    );

    // If the left branch leads to a valid solution, no need to explore further.
    if (resultFromLeftBranch) {
        return true;
    }

    // If the left branch didn't work, attempt the second branch: Add 'rightOptionCost' to the right sum.
    // This call is equivalent to the original 'testRightPath'.
    const resultFromRightBranch = attemptRightCostAllocation(
        costDataPairs,
        currentProcessingLevel + 1,
        currentLeftSum,
        currentRightSum + rightOptionCost,
        maxAllowedCost
    );

    // Return the result of the right branch exploration.
    return resultFromRightBranch;
}

// Helper function to recursively explore adding a cost to the left sum.
// This function replaces the original 'testLeftPath'.
function attemptLeftCostAllocation(costDataPairs, nextLevel, newLeftSum, currentRightSum, maxAllowedCost) {
    return exploreCostBalancingPaths(costDataPairs, nextLevel, newLeftSum, currentRightSum, maxAllowedCost);
}

// Helper function to recursively explore adding a cost to the right sum.
// This function replaces the original 'testRightPath'.
function attemptRightCostAllocation(costDataPairs, nextLevel, currentLeftSum, newRightSum, maxAllowedCost) {
    return exploreCostBalancingPaths(costDataPairs, nextLevel, currentLeftSum, newRightSum, maxAllowedCost);
}

// --- Program Execution ---
// Read input from standard input, process it, and print the final result.
try {
    const fileSystem = require('fs');
    const inputString = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const finalCalculatedResult = processInputData(inputString);
    console.log(finalCalculatedResult);
} catch (error) {
    console.error(`An unexpected error occurred during execution: ${error.message}`);
    // Exit with a non-zero code to indicate failure in a CLI environment.
    process.exit(1);
}