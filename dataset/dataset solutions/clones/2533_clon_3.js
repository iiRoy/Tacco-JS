const InputProcessor = (function () {
    // A utility function for parsing values, made internal to this module's scope.
    // It attempts to convert a string to a number; if not a valid number, it returns the original string.
    function coerceToNumericOrString(val) {
        const numericVal = Number(val);
        // Check if the conversion resulted in a valid number (i.e., not NaN)
        return (numericVal === numericVal) ? numericVal : val;
    }

    // Class responsible for handling and parsing lines of input data.
    class DataLineHandler {
        #lineData; // Private field to store the input lines as an array of strings.

        // Constructor takes a raw input string, trims it, and splits it into individual lines.
        constructor(inputString) {
            this.#lineData = inputString.trim().split("\n");
        }

        // Retrieves a specific line by its index as its raw string content.
        getLineText(lineNumber) {
            return this.#lineData[lineNumber];
        }

        // Retrieves a specific line by its index, splits it by space, and parses each element.
        getParsedLine(lineNumber) {
            const lineContent = this.#lineData[lineNumber];
            // Return an empty array if the line content is undefined (e.g., out of bounds).
            if (lineContent === undefined) {
                return [];
            }
            return this.#parseLineToElements(lineContent);
        }

        // Extracts a range of lines starting from `startIndex` for `countLimit` lines,
        // and parses each of these lines into an array of coerced values.
        extractParsedRange(startIndex, countLimit) {
            // Determine the effective end index for slicing.
            // If countLimit is not a valid number, it defaults to reading all remaining lines.
            const effectiveLimit = (typeof countLimit === 'number' && !isNaN(countLimit))
                                 ? countLimit
                                 : this.#lineData.length - startIndex;
            const endIndex = startIndex + effectiveLimit;

            // Slice the internal array and map each string line to its parsed elements.
            return this.#lineData.slice(startIndex, endIndex).map(line => this.#parseLineToElements(line));
        }

        // Private helper method to split a string line by space and apply the coercion function to each element.
        #parseLineToElements(lineString) {
            // Handle cases where the line string is invalid or empty.
            if (typeof lineString !== 'string' || lineString.trim() === '') {
                return [];
            }
            return lineString.split(" ").map(element => coerceToNumericOrString(element));
        }
    }

    // The public factory function that creates and returns an instance of DataLineHandler.
    function createProcessor(inputStr) {
        return new DataLineHandler(inputStr);
    }

    return createProcessor;
})();

// Initialize the input data handler by reading from standard input.
const inputDataHandler = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing logic and print the result to console.
console.log(processInputAndSolve());

/**
 * Recursively calculates all achievable costs for combinations that meet the target bitmask.
 * This function explores combinations in a specific, potentially overlapping manner,
 * as defined by the original code's `keys.slice(1)` behavior.
 *
 * @param {number} targetMaskValue The bitmask that represents all required items.
 * @param {Array<Object>} availableItems An array of objects, where each object has `itemCost` and `itemMask`.
 * @param {Object} [currentAccumulatedState] The current accumulated state { cost: number, combo: number }.
 * @returns {Array<number>} An array of costs for all combinations that achieve the target mask.
 */
function calculateMinCost(targetMaskValue, availableItems, currentAccumulatedState) {
    // Initialize the state for the current branch of recursion.
    // If no state is provided (e.g., initial call), start with zero cost and combo.
    const branchState = currentAccumulatedState || { cost: 0, combo: 0 };
    const foundCosts = []; // Collects costs from this branch and its sub-branches.

    // Base case: If there are no items left to consider, return the accumulated costs (which will be empty here).
    if (!availableItems || availableItems.length === 0) {
        return foundCosts;
    }

    // Iterate through each available item option in the current `availableItems` array.
    for (let i = 0; i < availableItems.length; i++) {
        const itemOption = availableItems[i]; // The item option currently being considered.
        
        // Compute the next state by adding the current item's cost and combining its mask.
        const nextCombinedState = {
            cost: branchState.cost + itemOption.itemCost,
            combo: branchState.combo | itemOption.itemMask
        };

        // If the combined bitmask matches the target, a valid combination is found.
        if (nextCombinedState.combo === targetMaskValue) {
            foundCosts.push(nextCombinedState.cost);
        }

        // --- Critical recursive step: ---
        // Recursively call `calculateMinCost` with a subset of `availableItems`.
        // The `availableItems.slice(1)` ensures that the *first* element of the `availableItems`
        // array from the *current* function call is excluded from further recursive consideration
        // in this specific branch, regardless of which `itemOption` (at index `i`) was picked.
        // This behavior is a direct replication of the original code's logic.
        const remainingItemsForRecursion = availableItems.slice(1);
        const recursiveResults = calculateMinCost(targetMaskValue, remainingItemsForRecursion, nextCombinedState);
        
        // Add all results from the recursive call to the current branch's found costs.
        foundCosts.push(...recursiveResults); // Using spread syntax for concatenation.
    }

    return foundCosts;
}

/**
 * Main function to orchestrate reading input, processing data, and solving the problem.
 * It determines the minimum cost to achieve a target combination of items.
 *
 * @returns {number} The minimum cost to achieve the target combination, or -1 if no solution is found.
 */
function processInputAndSolve() {
    // Read the first line of input, which contains N (total items) and M (number of options).
    const initialConfig = inputDataHandler.getParsedLine(0);
    const totalItems = initialConfig[0];
    const numOptions = initialConfig[1];

    // Basic validation for input parameters to prevent errors or illogical calculations.
    if (totalItems <= 0 || numOptions < 0 || isNaN(totalItems) || isNaN(numOptions)) {
        return -1; // Indicate invalid input.
    }

    // Calculate the target bitmask. This mask represents all items from 1 to `totalItems` being selected.
    // E.g., if totalItems=3, targetBitmask = (1<<1) | (1<<2) | (1<<3) = 2 | 4 | 8 = 14 (binary 1110)
    let targetBitmask = 0;
    for (let bitIndex = 1; bitIndex <= totalItems; bitIndex++) {
        targetBitmask |= (1 << bitIndex);
    }
    // An alternative, more concise way to calculate the target bitmask for 1 to N: (1 << (totalItems + 1)) - 2;

    // Read all subsequent lines from the input, which contain the details for each option.
    const optionRawData = inputDataHandler.extractParsedRange(1);

    const itemCombinationOptions = [];
    // Process the raw data to structure it into an array of item option objects.
    // Each option consists of a cost and a bitmask representing the items it provides.
    for (let currentIdx = 0; currentIdx < numOptions * 2; currentIdx += 2) {
        // The first element of line `currentIdx` is the cost for this option.
        const [optionCost] = optionRawData[currentIdx];
        // Line `currentIdx + 1` contains the indices of items provided by this option.
        const itemIndices = optionRawData[currentIdx + 1];

        let currentItemMask = 0;
        // Build a bitmask by setting bits corresponding to each item index.
        for (const itemIdx of itemIndices) {
            currentItemMask |= (1 << itemIdx);
        }

        // Add the structured option to our collection.
        itemCombinationOptions.push({
            itemCost: optionCost,
            itemMask: currentItemMask
        });
    }

    // Invoke the recursive solver to find all possible costs that achieve the target mask.
    const allAchievableCosts = calculateMinCost(targetBitmask, itemCombinationOptions, null);

    // If no combinations were found that achieve the target mask, return -1.
    if (!allAchievableCosts.length) {
        return -1;
    }

    // Sort the found costs in ascending order to easily find the minimum.
    const minimizedCosts = allAchievableCosts.sort((a, b) => a - b);

    // Return the smallest cost.
    return minimizedCosts[0];
}