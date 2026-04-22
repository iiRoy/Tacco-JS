const process = require('process');
const fileSystem = require('fs');

/**
 * Reads all input data from the standard input stream.
 * @returns {string} The raw content of the input.
 */
function acquireDataFromStdin() {
    try {
        return fileSystem.readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        console.error("Error reading from stdin:", error.message);
        // In a production environment, you might want to exit or handle this more gracefully.
        return '';
    }
}

/**
 * Parses a numeric value, ensuring it's a valid integer.
 * @param {string} valueString - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function parseNumericValue(valueString) {
    const parsed = Number(valueString); // Using Number() for explicit conversion
    if (isNaN(parsed)) {
        console.warn(`Warning: Could not parse "${valueString}" as a number. Defaulting to 0.`);
        return 0;
    }
    return parsed;
}

/**
 * Represents an item with its properties.
 * @typedef {object} InventoryItem
 * @property {string} identifier - The unique name/identifier of the item.
 * @property {number} worth - The value or weight associated with the item.
 * @property {number} constraint - A capacity or limit constraint for this item.
 */

/**
 * Processes a single test case from the input lines.
 * Finds the optimal sequence of items based on a specific weighted average metric.
 * @param {string[]} dataLines - An array of input lines for the current test case.
 * @returns {string | null} The formatted result for the test case, or null if it's the termination signal.
 */
function handleSingleTestScenario(dataLines) {
    // Attempt to extract the number of items for this scenario
    const rawItemCount = dataLines.shift();
    if (!rawItemCount) {
        // If there are no more lines, it might be an unexpected end of input.
        return null;
    }

    const currentItemCount = parseNumericValue(rawItemCount);

    // A value of 0 signals the end of all test cases.
    if (currentItemCount === 0) {
        return null;
    }

    // Prepare the list of items for the current scenario.
    /** @type {InventoryItem[]} */
    const availableInventory = [];
    for (let currentIdx = 0; currentIdx < currentItemCount; currentIdx++) {
        const itemLine = dataLines.shift();
        if (!itemLine) {
            console.error(`Error: Expected ${currentItemCount} item lines but ran out of input.`);
            // Handle error: perhaps return an empty result or throw.
            return "Error: Incomplete item data.";
        }
        const itemParts = itemLine.split(" ");
        if (itemParts.length < 3) {
            console.warn(`Warning: Malformed item line "${itemLine}". Skipping.`);
            continue;
        }
        availableInventory.push({
            identifier: itemParts[0],
            worth: parseNumericValue(itemParts[1]),
            constraint: parseNumericValue(itemParts[2]),
        });
    }

    // Sort items by their 'worth' in descending order.
    // This pre-sorting might help in some cases, but doesn't guarantee optimality for this recursive problem.
    availableInventory.sort((itemA, itemB) => itemB.worth - itemA.worth);

    // Variables to store the best result found during the exploration.
    let maximalRatioFound = -Infinity; // Initialize with a very small number to ensure any valid ratio is greater.
    let optimalItemSequence = []; // Stores indices of items in the best sequence.

    /**
     * Recursive function to explore all valid combinations of items.
     * @param {number[]} currentPathIndices - Array of indices representing the current sequence of selected items.
     * @param {number[]} remainingItemIndices - Array of indices of items yet to be considered for the current path.
     * @param {number} currentAccumulatedWorth - The sum of 'worth' values of items in the currentPathIndices.
     * @param {number} currentWeightedGoodness - The calculated 'goodness' metric for the currentPathIndices.
     */
    const exploreCombinations = (currentPathIndices, remainingItemIndices, currentAccumulatedWorth, currentWeightedGoodness) => {
        // Base case: If there are no more items left to consider for addition to the current path.
        if (remainingItemIndices.length === 0) {
            // Only update if a valid path (non-zero accumulated worth) is found.
            // Division by zero guard.
            if (currentAccumulatedWorth > 0) {
                const currentRatio = currentWeightedGoodness / currentAccumulatedWorth;
                if (currentRatio > maximalRatioFound) {
                    maximalRatioFound = currentRatio;
                    // Deep copy the path to store the optimal sequence.
                    optimalItemSequence = [...currentPathIndices];
                }
            }
            return; // End of this recursive branch.
        }

        // Iterate through each available item to potentially add it to the current path.
        for (let i = 0; i < remainingItemIndices.length; i++) {
            const itemIndexToConsider = remainingItemIndices[i];
            const selectedItem = availableInventory[itemIndexToConsider];

            // Apply the specific constraint:
            // The current total worth must not exceed the 'constraint' value of the item being added.
            // This is a crucial and somewhat unusual condition from the original logic.
            if (currentAccumulatedWorth <= selectedItem.constraint) {
                const nextAccumulatedWorth = currentAccumulatedWorth + selectedItem.worth;
                // The 'goodness' metric is weighted by the position in the sequence (currentPathIndices.length + 1).
                const nextWeightedGoodness = currentWeightedGoodness + selectedItem.worth * (currentPathIndices.length + 1);

                // Create a new path with the selected item appended.
                const nextPath = [...currentPathIndices, itemIndexToConsider];
                // Create a new array of remaining items, excluding the one just selected.
                const updatedRemainingItems = remainingItemIndices.filter(idx => idx !== itemIndexToConsider);

                // Recursively call for the next combination.
                exploreCombinations(nextPath, updatedRemainingItems, nextAccumulatedWorth, nextWeightedGoodness);
            }
        }
    };

    // Initialize the set of all item indices for the first call.
    const initialItemIndices = Array.from({ length: availableInventory.length }, (_, k) => k);

    // Start the recursive exploration process.
    exploreCombinations([], initialItemIndices, 0, 0);

    // Format the final output:
    // 1. Map the optimal item indices back to their original identifiers.
    // 2. Reverse the order of the sequence as per the problem's output requirement.
    // 3. Join them with newlines.
    const formattedResult = optimalItemSequence
        .map(idx => availableInventory[idx].identifier)
        .reverse()
        .join('\n');

    return formattedResult;
}

/**
 * Main execution function for the program.
 * Reads input, processes test cases, and prints results.
 */
function main() {
    // Read all input data at once.
    const rawInputData = acquireDataFromStdin();

    // If no input, exit.
    if (!rawInputData) {
        // console.error("No input data received.");
        process.exit(1);
    }

    // Split input into individual lines, removing any leading/trailing whitespace.
    // Filter out empty lines that might result from extra newlines.
    const allInputLines = rawInputData.trim().split('\n').filter(line => line.length > 0);

    // Process test cases one by one until a termination signal (n=0) is encountered.
    while (true) {
        const scenarioResult = handleSingleTestScenario(allInputLines);

        // If handleSingleTestScenario returns null, it means the termination condition (n=0) was met.
        if (scenarioResult === null) {
            break;
        }

        // Print the result for the current test case to standard output.
        console.log(scenarioResult);
    }
}

// Execute the main function when the script runs.
main();