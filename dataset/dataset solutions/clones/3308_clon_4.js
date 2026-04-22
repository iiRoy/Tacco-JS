'use strict';

// A custom class to encapsulate item properties, promoting divergent syntax
class ItemAttribute {
    constructor(weightParam, valueParam) {
        this.wt = weightParam;
        this.val = valueParam;
    }
}

// These variables are declared globally to be accessible by the recursive function
// without explicit passing, a common pattern in competitive programming for recursion.
let availableItemsData; // Stores an array of ItemAttribute objects
let maxPossibleValueLimit; // Corresponds to the 'maxv' constant in the original problem
let memoizedWeightResults; // The 2D array for memoization, storing minimum weights for (itemIndex, value) pairs

/**
 * Recursively calculates the minimum total weight required to achieve a specific
 * desired value, considering items up to a given index.
 * This function uses memoization to avoid redundant computations.
 *
 * @param {number} currentArticleIndex The 0-based index of the current item being considered.
 * @param {number} desiredValueTarget The target value we are trying to achieve.
 * @returns {number} The minimum weight to achieve `desiredValueTarget` using items
 *                   from index 0 up to `currentArticleIndex`, or Infinity if impossible.
 */
function determineMinimumWeight(currentArticleIndex, desiredValueTarget) {
    // Base case 1: If no value is desired, no weight is needed.
    if (desiredValueTarget === 0) {
        return 0;
    }
    // Base case 2: If no items are left to consider but a positive value is desired,
    // it's impossible to achieve that value.
    if (currentArticleIndex < 0) {
        return Infinity;
    }

    // Check if this specific subproblem (itemIndex, valueTarget) has already been computed.
    // If so, return the stored result to avoid re-calculation (memoization).
    if (memoizedWeightResults[currentArticleIndex][desiredValueTarget] !== undefined) {
        return memoizedWeightResults[currentArticleIndex][desiredValueTarget];
    }

    const currentItem = availableItemsData[currentArticleIndex];

    // Option A: Exclude the current item from the selection.
    // In this case, we try to achieve the `desiredValueTarget` using only the items
    // before the current one (i.e., up to `currentArticleIndex - 1`).
    let weightExcludingCurrent = determineMinimumWeight(currentArticleIndex - 1, desiredValueTarget);

    // Option B: Include the current item in the selection.
    // This is only possible if the `desiredValueTarget` is at least as large as the
    // current item's value.
    let weightIncludingCurrent = Infinity;
    if (desiredValueTarget >= currentItem.val) {
        // If we include the current item, we need to achieve the remaining value
        // (`desiredValueTarget - currentItem.val`) using items before the current one.
        // Then, we add the current item's weight to that result.
        let resultFromPreviousItems = determineMinimumWeight(currentArticleIndex - 1, desiredValueTarget - currentItem.val);
        
        // Ensure that the remaining value was achievable before adding current item's weight.
        if (resultFromPreviousItems !== Infinity) {
            weightIncludingCurrent = resultFromPreviousItems + currentItem.wt;
        }
    }

    // The minimum weight for the current state is the smaller of the two options.
    const finalCalculatedWeight = Math.min(weightExcludingCurrent, weightIncludingCurrent);
    
    // Store this result in the memoization table before returning, so it can be reused.
    memoizedWeightResults[currentArticleIndex][desiredValueTarget] = finalCalculatedWeight;
    return finalCalculatedWeight;
}

/**
 * The primary function that parses the input, sets up the problem, and initiates
 * the recursive dynamic programming solution.
 *
 * @param {string} rawInputContent The complete input string read from stdin.
 */
const solveKnapsackProblem = (rawInputContent) => {
    // Split the input into individual lines for parsing.
    const dataLines = rawInputContent.split('\n');
    
    // Parse the first line to get the total number of items and the maximum permissible weight.
    const firstLineNumeric = dataLines[0].split(' ').map(Number);
    const totalNumberOfItems = firstLineNumeric[0];
    const maximumPermissibleWeight = firstLineNumeric[1];

    // Populate the `availableItemsData` array with ItemAttribute objects.
    availableItemsData = [];
    for (let k = 0; k < totalNumberOfItems; k++) {
        const itemDetails = dataLines[k + 1].split(' ').map(Number);
        availableItemsData.push(new ItemAttribute(itemDetails[0], itemDetails[1]));
    }

    // Set the maximum value constraint, matching the 'maxv' constant from the original problem.
    maxPossibleValueLimit = 100000; 

    // Initialize the memoization table. It's a 2D array where `memoizedWeightResults[i][j]`
    // stores the minimum weight for value `j` using items up to index `i`.
    // We fill with `undefined` to distinguish uncomputed states from actual `0` weight.
    memoizedWeightResults = Array(totalNumberOfItems)
        .fill(null) // Fill with null to ensure each inner array is a distinct object
        .map(() => Array(maxPossibleValueLimit + 1).fill(undefined));

    let highestValueWithinCapacity = 0;
    // Iterate downwards from the maximum possible value to find the largest value
    // that can be achieved without exceeding the `maximumPermissibleWeight`.
    // We start from `maxPossibleValueLimit` because we want the *highest* value.
    for (let currentDesiredValue = maxPossibleValueLimit; currentDesiredValue >= 0; currentDesiredValue--) {
        // Call the recursive function to find the minimum weight required for `currentDesiredValue`
        // considering all available items (from index 0 to `totalNumberOfItems - 1`).
        const requiredTotalWeight = determineMinimumWeight(totalNumberOfItems - 1, currentDesiredValue);
        
        // If the required weight is within the `maximumPermissibleWeight`,
        // then `currentDesiredValue` is the highest value we can achieve.
        if (requiredTotalWeight <= maximumPermissibleWeight) {
            highestValueWithinCapacity = currentDesiredValue;
            break; // Found the answer, no need to check smaller values.
        }
    }
    // Output the result to the console.
    console.log(highestValueWithinCapacity);
};

// Read input from standard input and pass it to the solver function.
solveKnapsackProblem(require("fs").readFileSync("/dev/stdin", "utf8").trim());