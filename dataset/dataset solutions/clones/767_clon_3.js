// This script processes financial data from standard input to find optimal spending.
// It identifies the highest possible sum of two distinct item costs that stays within a specified budget.

// Utilize the Node.js file system module to obtain raw text content from standard input.
const fileSystemModule = require('fs');
const rawInputDataContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process raw data: remove any leading/trailing whitespace from the entire input,
// then segment it into individual lines. Each line is then trimmed again to ensure
// cleanliness, and any purely empty lines are filtered out.
const inputSegments = rawInputDataContent
    .split('\n') // First, split by newline characters.
    .map(singleLineText => singleLineText.trim()) // Then, trim whitespace from each individual line.
    .filter(trimmedLine => trimmedLine.length > 0); // Finally, remove any lines that became empty after trimming.

/**
 * Determines the largest numeric value from a provided collection that does not exceed a specified upper boundary.
 * This function is designed to find the maximum *valid* item, not just the overall maximum.
 *
 * @param {number} upperBound The maximum permissible value for a candidate to be considered.
 * @param {Array<number>} candidateValues A list of numbers to be evaluated.
 * @returns {number} The highest value found within the `candidateValues` array that is also less than or equal to `upperBound`.
 *                   Returns 0 if no such value is found, or if the input array is empty or invalid.
 */
const findHighestValidValue = (upperBound, candidateValues) => {
    // Initialize the maximum found to a value that will be easily surpassed by any positive candidate.
    // Assuming candidate values are non-negative, 0 is a suitable starting point.
    let currentMaxFound = 0;

    // Guard clause: Early exit if no candidates are provided or if the input is not an array.
    if (!Array.isArray(candidateValues) || candidateValues.length === 0) {
        // console.warn("findHighestValidValue received an empty or invalid candidateValues array.");
        return currentMaxFound;
    }

    // Iterate through each potential candidate to find the highest valid one.
    for (const potentialCandidate of candidateValues) {
        // Basic validation: Ensure the candidate is a valid number before processing.
        if (typeof potentialCandidate !== 'number' || isNaN(potentialCandidate)) {
            // Optionally, log a warning or throw an error for invalid entries. Skipping is sufficient here.
            // console.warn(`Skipping invalid candidate value: ${potentialCandidate}`);
            continue;
        }

        // Only consider candidates that are strictly greater than the current maximum found.
        if (potentialCandidate > currentMaxFound) {
            // Additionally, ensure this candidate does not exceed the specified upper boundary (budget limit).
            if (potentialCandidate <= upperBound) {
                currentMaxFound = potentialCandidate; // Update the maximum if both conditions are met.
            }
            // If potentialCandidate is greater than currentMaxFound but also exceeds upperBound,
            // it is not a valid choice, so currentMaxFound remains unchanged.
        }
        // If potentialCandidate is less than or equal to currentMaxFound, it cannot be the new maximum,
        // so currentMaxFound remains unchanged.
    }

    return currentMaxFound;
};

/**
 * Computes the highest possible sum of two distinct item costs from a list that does not exceed a given budget.
 * This function ensures that the two items selected for the sum are not the same item (i.e., different indices).
 *
 * @param {number} spendingLimit The maximum budget allowed for the sum of two items.
 * @param {Array<number>} availableItemsCosts A collection of individual item prices.
 * @returns {number} The maximum sum found within the budget from any pair of distinct items, or 0 if no such sum exists.
 */
const calculateOptimalPairSum = (spendingLimit, availableItemsCosts) => {
    // Input validation: Ensure the spending limit is a valid non-negative number.
    if (typeof spendingLimit !== 'number' || isNaN(spendingLimit) || spendingLimit < 0) {
        console.error("Error: Invalid spending limit provided. Must be a non-negative number.");
        return 0;
    }
    // Input validation: Ensure the item costs list is an array and contains at least two items
    // to form a pair.
    if (!Array.isArray(availableItemsCosts) || availableItemsCosts.length < 2) {
        console.error("Error: Insufficient or invalid item costs list. At least two numeric items are required.");
        return 0;
    }

    // This array will temporarily store all valid sums of two distinct items.
    const possibleCombinations = [];

    // Outer loop: Iterate through the list to select the first item for a pair.
    for (let firstItemIdx = 0; firstItemIdx < availableItemsCosts.length; ++firstItemIdx) {
        const costOfFirstItem = availableItemsCosts[firstItemIdx];

        // Validate the cost of the first item.
        if (typeof costOfFirstItem !== 'number' || isNaN(costOfFirstItem) || costOfFirstItem < 0) {
            console.warn(`Warning: Skipping invalid cost for first item at index ${firstItemIdx}: ${costOfFirstItem}`);
            continue; // Skip to the next item if the current one is invalid.
        }

        // Inner loop: Iterate again to select the second item for the pair.
        for (let secondItemIdx = 0; secondItemIdx < availableItemsCosts.length; ++secondItemIdx) {
            // Crucial condition: Ensure the items are distinct (i.e., not the same item selected twice).
            if (firstItemIdx !== secondItemIdx) {
                const costOfSecondItem = availableItemsCosts[secondItemIdx];

                // Validate the cost of the second item.
                if (typeof costOfSecondItem !== 'number' || isNaN(costOfSecondItem) || costOfSecondItem < 0) {
                    console.warn(`Warning: Skipping invalid cost for second item at index ${secondItemIdx}: ${costOfSecondItem}`);
                    continue; // Skip to the next item if the current one is invalid.
                }

                // Calculate the sum of the two distinct items.
                const currentPairSum = costOfFirstItem + costOfSecondItem;
                possibleCombinations.push(currentPairSum);
            }
        }
    }

    // After generating all possible distinct pair sums, find the highest one that respects the spending limit.
    return findHighestValidValue(spendingLimit, possibleCombinations);
};

// A collection to hold all the parsed problem sets, each containing a budget and a list of prices.
const processedProblemSets = [];

// Temporary storage for the current problem set being assembled from two consecutive input lines.
let currentSetData = {};

// Keep track of the logical line number being processed (0-indexed) to determine if it's a budget or price list.
let logicalLineCounter = 0;

// Iterate through each segment of the input data (which are already trimmed and filtered lines).
for (let k = 0; k < inputSegments.length; ++k) {
    const currentInputLine = inputSegments[k];

    // Determine if the current line represents a budget (even logicalLineCounter) or a list of prices (odd logicalLineCounter).
    if (logicalLineCounter % 2 === 0) {
        // This line contains the budget information. It's expected format: "N BudgetValue". We need BudgetValue.
        const budgetTokens = currentInputLine.split(' ').map(val => Number(val));
        const extractedBudget = budgetTokens[1]; // The second number in the line is the actual budget.

        // Robust validation for the extracted budget value.
        if (typeof extractedBudget !== 'number' || isNaN(extractedBudget) || extractedBudget < 0) {
            console.error(`Error: Invalid budget value '${budgetTokens[1]}' on line ${k + 1}. Skipping this dataset.`);
            currentSetData = {}; // Clear currentSetData to prevent adding an incomplete set.
            logicalLineCounter++; // Still increment the counter to maintain line parity for subsequent reads.
            continue;
        }

        currentSetData.financialCap = extractedBudget; // Store the valid budget in the temporary object.
    } else {
        // This line contains the price list. Expected format: "N Price1 Price2 ...". We need Price1, Price2...
        // Use slice(1) to exclude the first number, which typically represents the count of items (N).
        const priceStringList = currentInputLine.split(' ').slice(1);
        const parsedPrices = priceStringList.map(val => Number(val));

        // Filter out any non-numeric or negative price entries to ensure data integrity.
        const validPrices = parsedPrices.filter(price => typeof price === 'number' && !isNaN(price) && price >= 0);

        // Check if there are enough valid prices to form a pair (minimum of two).
        if (validPrices.length < 2) {
            console.error(`Error: Insufficient or invalid prices on line ${k + 1}. At least two valid prices are needed. Skipping this dataset.`);
            currentSetData = {}; // Clear currentSetData.
            logicalLineCounter++;
            continue;
        }

        currentSetData.itemCosts = validPrices; // Store the validated prices in the temporary object.

        // If both financialCap and itemCosts are successfully parsed and present for the current set,
        // add the complete set to the main collection of problem sets.
        if (currentSetData.financialCap !== undefined && currentSetData.itemCosts !== undefined) {
            processedProblemSets.push({ ...currentSetData }); // Use spread syntax to create a new object instance.
        } else {
            // This case should ideally be caught by earlier 'continue' statements, but acts as a final safeguard.
            console.warn(`Warning: Incomplete dataset detected spanning lines ${k} and ${k + 1}. Skipping.`);
        }
        // Reset the temporary object to prepare for the next pair of input lines.
        currentSetData = {};
    }
    logicalLineCounter++; // Increment the logical line counter for the next iteration.
}

// Display the results for each processed problem set.
console.log("--- Optimal Pair Sum Calculation Results ---");

// Iterate over each complete problem set that was successfully parsed from the input.
for (const currentProblemSet of processedProblemSets) {
    // Destructure the budget (renamed to setBudget) and item costs (renamed to setPrices)
    // from the current problem set object for more readable access.
    const { financialCap: setBudget, itemCosts: setPrices } = currentProblemSet;

    // Perform the main calculation using the renamed function and store the result.
    const resultForThisSet = calculateOptimalPairSum(setBudget, setPrices);

    // Output the calculated optimal sum for the current problem set to standard output.
    console.log(resultForThisSet);
}

console.log("--- End of All Calculations ---");