// This script is designed to solve multiple instances of the 0/1 knapsack problem.
// It reads problem specifications from standard input, computes the optimal
// value and the minimum weight required to achieve it for each scenario,
// and then prints the results to standard output.

// Import the Node.js file system module for synchronous I/O operations.
const fileSystem = require('node:fs');

// --- Input Data Acquisition ---
// Determine the total size of the incoming data from standard input.
const standardInputByteSize = fileSystem.fstatSync(process.stdin.fd).size;

// Initialize a buffer to hold the raw bytes read from stdin.
const inputDataBuffer = Buffer.alloc(standardInputByteSize);

// Perform a synchronous read operation to fill the buffer with data.
const actualBytesRead = fileSystem.readSync(process.stdin.fd, inputDataBuffer, 0, standardInputByteSize, 0);

// Implement a basic guard clause for empty input.
if (actualBytesRead === 0) {
    console.error("Fatal Error: Standard input stream is empty. No data to process. Exiting.");
    process.exit(1); // Terminate the process with an error code.
}

// Convert the buffered data to a UTF-8 string and split it into an array of lines.
const linesFromInput = inputDataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// --- Main Program Execution Flow ---
// Invoke the primary function to begin processing the knapsack scenarios.
executeKnapsackSolver();

/**
 * Orchestrates the processing of all knapsack problem test cases provided in the input.
 * Iterates through `linesFromInput`, extracts problem parameters, performs DP calculation,
 * and prints the final outcomes for each scenario.
 */
function executeKnapsackSolver() {
    let currentInputLinePointer = 0; // Index to track the current line being read from `linesFromInput`.
    let caseNumberIdentifier = 1;     // Sequential counter for the test cases.

    // A `do...while` loop ensures at least one iteration, useful for processing the first case
    // and then continuously checking for more data or a termination condition.
    do {
        // Attempt to parse the knapsack's maximum weight capacity for the current problem.
        const currentKnapsackCapacity = Number(linesFromInput[currentInputLinePointer++]);

        // The problem specification indicates that a capacity of 0 signals the end of input.
        if (currentKnapsackCapacity === 0) {
            break; // Exit the loop when the termination sentinel is found.
        }

        // Input validation for the knapsack capacity.
        if (isNaN(currentKnapsackCapacity) || currentKnapsackCapacity < 0) {
            console.error(`Validation Error: Invalid knapsack capacity '${linesFromInput[currentInputLinePointer - 1]}' detected for Case ${caseNumberIdentifier}. Skipping this scenario.`);
            continue; // Skip to the next potential scenario in the input.
        }

        // Parse the total count of items available for selection in this scenario.
        const totalAvailableItems = Number(linesFromInput[currentInputLinePointer++]);

        // Input validation for the number of items.
        if (isNaN(totalAvailableItems) || totalAvailableItems < 0) {
            console.error(`Validation Error: Invalid item count '${linesFromInput[currentInputLinePointer - 1]}' detected for Case ${caseNumberIdentifier}. Skipping this scenario.`);
            continue;
        }

        // Create a temporary array to store all item objects, each with its value and weight.
        const itemObjectsCollection = [];
        for (let itemIndex = 0; itemIndex < totalAvailableItems; ++itemIndex) {
            const itemStringDetails = linesFromInput[currentInputLinePointer++].split(',');
            const itemValue = Number(itemStringDetails[0]);
            const itemWeight = Number(itemStringDetails[1]);

            // Validate individual item's value and weight.
            if (isNaN(itemValue) || isNaN(itemWeight) || itemValue < 0 || itemWeight < 0) {
                console.warn(`Warning: Malformed item data ('${itemStringDetails.join(',')}') found for Case ${caseNumberIdentifier}. This item will be ignored.`);
                // Decide whether to `continue` (skip this item) or `break` (abort scenario).
                // For a robust Type III clone, skipping the malformed item is a reasonable addition.
                continue;
            }
            itemObjectsCollection.push({ itemValue: itemValue, itemWeight: itemWeight });
        }

        // --- Dynamic Programming Core Logic ---
        // `maxPossibleValues` array: `maxPossibleValues[w]` will store the highest value
        // that can be obtained with a total weight exactly `w`.
        // Initialized with zeros, meaning no items yield zero value.
        // Using a standard JavaScript Array for flexibility, rather than a TypedArray.
        const maxPossibleValues = Array(currentKnapsackCapacity + 1).fill(0);

        // Iterate through each item that has been parsed and validated.
        for (const singleItem of itemObjectsCollection) {
            const currentItemValue = singleItem.itemValue;
            const currentItemWeight = singleItem.itemWeight;

            // Iterate downwards through the possible weights for the knapsack.
            // This reverse iteration is crucial for the 0/1 knapsack problem
            // to ensure each item is considered only once per capacity update.
            for (let currentKnapsackWeight = currentKnapsackCapacity; currentKnapsackWeight >= currentItemWeight; --currentKnapsackWeight) {
                // Calculate the value if the current item is included:
                // Value from the remaining capacity (`currentKnapsackWeight - currentItemWeight`)
                // plus the value of the `currentItem`.
                const valueIfIncluded = maxPossibleValues[currentKnapsackWeight - currentItemWeight] + currentItemValue;

                // Update `maxPossibleValues[currentKnapsackWeight]` to be the maximum
                // of its current value (if the item is not included) and `valueIfIncluded`.
                maxPossibleValues[currentKnapsackWeight] = obtainMaximum(
                    valueIfIncluded,
                    maxPossibleValues[currentKnapsackWeight]
                );
            }
        }

        // --- Result Aggregation ---
        let highestAchievedValue = 0; // Stores the overall maximum value found in the DP table.
        let lightestWeightForHighestValue = 0; // Stores the smallest weight that yields `highestAchievedValue`.

        // Scan the `maxPossibleValues` array to find the optimal result.
        for (let weightIterator = 0; weightIterator <= currentKnapsackCapacity; ++weightIterator) {
            const valueAtCurrentWeight = maxPossibleValues[weightIterator];

            // If a new strictly greater value is found, update both the highest value
            // and the corresponding weight. This ensures we prioritize higher values.
            if (valueAtCurrentWeight > highestAchievedValue) {
                highestAchievedValue = valueAtCurrentWeight;
                lightestWeightForHighestValue = weightIterator;
            }
            // Note: If `valueAtCurrentWeight === highestAchievedValue`, we do not update
            // `lightestWeightForHighestValue`. This correctly finds the *minimum* weight
            // for the maximum value, as required by typical knapsack problem output.
        }

        // --- Output Generation for Current Scenario ---
        console.log(
            `Case ${caseNumberIdentifier++}:\n` +
            `${highestAchievedValue}\n` +
            `${lightestWeightForHighestValue}`
        );

    } while (currentInputLinePointer < linesFromInput.length); // Continue as long as there are lines remaining in the input.
}

/**
 * A utility function to determine the larger of two given numbers.
 * This function replaces the original bitwise `max` implementation with a
 * more conventional and readable `Math.max` call, demonstrating a Type III change.
 *
 * @param {number} valueOne - The first number for comparison.
 * @param {number} valueTwo - The second number for comparison.
 * @returns {number} The greater of the two input numbers.
 */
function obtainMaximum(valueOne, valueTwo) {
    return Math.max(valueOne, valueTwo);
}