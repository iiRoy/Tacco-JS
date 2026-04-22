let rawInputBuffer = "";
let inputLinesCollection = [];
let currentLinePointer = 0;

/**
 * Retrieves the next available line from the processed input collection.
 * Increments an internal pointer after each fetch.
 * @returns {string} The next line of input.
 */
const fetchNextLine = () => {
    // Return the line at the current pointer position and then advance the pointer.
    return inputLinesCollection[currentLinePointer++];
};

/**
 * Configures event listeners for standard input (stdin) to capture all incoming data.
 * Once the input stream ends or a termination signal (SIGINT) is received,
 * it processes the accumulated data and initiates the core problem-solving logic.
 */
const configureInputProcessing = () => {
    // Set the character encoding for the input stream. 'utf8' is generally more robust than 'ascii'.
    process.stdin.setEncoding('utf8');

    // Resume the stdin stream to begin listening for data.
    process.stdin.resume();

    // Event handler for 'data' chunks received from stdin.
    process.stdin.on('data', (inputChunk) => {
        // Append the received data chunk to our raw buffer.
        rawInputBuffer += inputChunk;
    });

    /**
     * A utility function to finalize the input reading process and trigger the main computation.
     * This is called when input ends or a termination signal is caught.
     */
    const finalizeAndExecute = () => {
        // Split the entire raw input buffer into individual lines.
        // Filter out any empty strings that might result from trailing newlines or multiple consecutive newlines.
        inputLinesCollection = rawInputBuffer.split('\n').filter(line => line.length > 0);

        // Implement a guard clause: check if any actual input lines were processed.
        if (inputLinesCollection.length === 0) {
            console.error("Error: No valid input data was received. Exiting.");
            process.exit(1); // Exit with a non-zero code to indicate an error.
        }

        // Execute the main function containing the solution logic.
        solveKnapsackProblem();

        // Terminate the Node.js process gracefully after execution.
        process.exit(0);
    };

    // Attach the 'finalizeAndExecute' function to the 'end' event of the stdin stream.
    process.stdin.on('end', finalizeAndExecute);

    // Attach 'finalizeAndExecute' to the 'SIGINT' signal (e.g., Ctrl+C).
    // This allows the program to process input and exit cleanly even if interrupted.
    process.on('SIGINT', finalizeAndExecute);
};

// --- End of Input Handling Configuration ---


// /////////////// Core Dynamic Programming Solution ////////////////////


/**
 * Helper function to map 2D coordinates (sumA, sumB) to a 1D array index.
 * This is crucial for simulating a 2D DP table with a flat array.
 * @param {number} currentSumA The value for the first dimension (e.g., accumulated 'A' property sum).
 * @param {number} currentSumB The value for the second dimension (e.g., accumulated 'B' property sum).
 * @param {number} widthOfTable The effective width of the conceptual 2D table (max possible sum B + 1).
 * @returns {number} The corresponding 1D index.
 */
const computeFlatIndex = (currentSumA, currentSumB, widthOfTable) => {
    // Uses row-major order: index = row * width + column.
    return currentSumA * widthOfTable + currentSumB;
};

/**
 * Implements a variation of the 0/1 knapsack problem using dynamic programming.
 * The goal is to find the minimum cost to achieve a state where the sum of
 * two properties (A and B) from selected items is a multiple of given target values (Ma, Mb).
 */
function solveKnapsackProblem() {
    // Define a constant to represent an unreachable state or an infinitely high cost.
    // This value should be larger than any possible valid sum of costs.
    const IMPOSSIBLE_VALUE = 1_000_000_007; // A large prime number often used as 'infinity' in competitive programming.

    // A constant representing the maximum possible value for a single item's 'A' or 'B' property.
    // This is typically derived from problem constraints (e.g., if max item value is 10).
    const MAX_SINGLE_ITEM_PROPERTY_VAL = 10;

    // Read the first line of input which contains global parameters:
    // N (total number of items), targetA (desired multiple for property A), targetB (desired multiple for property B).
    const parsedInitialParameters = fetchNextLine().split(' ').map(Number);

    // Destructure the parsed parameters for better readability.
    const numberOfItems = parsedInitialParameters[0];
    const targetA = parsedInitialParameters[1];
    const targetB = parsedInitialParameters[2];

    // Robust input validation for the main parameters.
    // If any parameter is invalid (NaN, negative), output -1 and terminate.
    if (isNaN(numberOfItems) || numberOfItems < 0 ||
        isNaN(targetA) || targetA < 0 ||
        isNaN(targetB) || targetB < 0) {
        console.log("-1");
        return;
    }

    // Initialize an array to store details of each item.
    // Each item will be stored as an object with its properties and cost.
    const itemDetailsCollection = [];

    // Loop through the input to read and store each item's properties.
    for (let currentItemIndex = 0; currentItemIndex < numberOfItems; currentItemIndex++) {
        const itemPropertyString = fetchNextLine();
        const itemPropertyValues = itemPropertyString.split(' ').map(Number);

        // Destructure item properties for clarity.
        const propAValue = itemPropertyValues[0];
        const propBValue = itemPropertyValues[1];
        const itemAssociatedCost = itemPropertyValues[2];

        // Input validation for individual item properties.
        if (isNaN(propAValue) || propAValue < 0 ||
            isNaN(propBValue) || propBValue < 0 ||
            isNaN(itemAssociatedCost) || itemAssociatedCost < 0) {
            console.log("-1"); // Indicate invalid item data.
            return;
        }

        // Add the item as an object to our collection.
        itemDetailsCollection.push({
            propertyA: propAValue,
            propertyB: propBValue,
            cost: itemAssociatedCost
        });
    }

    // Determine the maximum possible sum for properties A and B across all items.
    // This defines the dimensions of our dynamic programming table.
    // For N items, each with max property value MAX_SINGLE_ITEM_PROPERTY_VAL,
    // the max sum is N * MAX_SINGLE_ITEM_PROPERTY_VAL.
    const maxTotalSumA = numberOfItems * MAX_SINGLE_ITEM_PROPERTY_VAL;
    const maxTotalSumB = numberOfItems * MAX_SINGLE_ITEM_PROPERTY_VAL;

    // Calculate the width of our conceptual 2D DP table.
    // This is (maxTotalSumB + 1) because sums range from 0 to maxTotalSumB inclusive.
    const dpTableWidth = maxTotalSumB + 1;

    // Initialize the 1D dynamic programming table.
    // Its size is (maxTotalSumA + 1) * (maxTotalSumB + 1).
    // All cells are initially set to IMPOSSIBLE_VALUE, indicating an unreachable state.
    const dpTableSize = (maxTotalSumA + 1) * dpTableWidth;
    const minimumCostsTable = new Array(dpTableSize).fill(IMPOSSIBLE_VALUE);

    // Base case: achieving a sum of (0, 0) for properties A and B costs 0.
    minimumCostsTable[computeFlatIndex(0, 0, dpTableWidth)] = 0;

    // Main dynamic programming loop: iterate through each item.
    for (let itemIdx = 0; itemIdx < numberOfItems; itemIdx++) {
        const currentItem = itemDetailsCollection[itemIdx];
        const itemA = currentItem.propertyA;
        const itemB = currentItem.propertyB;
        const itemCost = currentItem.cost;

        // Iterate through the DP table states in reverse order for both dimensions.
        // This 'reverse iteration' is crucial for 0/1 knapsack problems to ensure
        // each item is considered only once per state calculation.
        for (let currentSumA = maxTotalSumA; currentSumA >= itemA; currentSumA--) {
            for (let currentSumB = maxTotalSumB; currentSumB >= itemB; currentSumB--) {

                // Calculate the 1D index for the current state (currentSumA, currentSumB).
                const currentTableFlatIndex = computeFlatIndex(currentSumA, currentSumB, dpTableWidth);

                // Calculate the sums for the state *before* potentially adding the current item.
                // This is (currentSumA - itemA, currentSumB - itemB).
                const previousSumAWithoutItem = currentSumA - itemA;
                const previousSumBWithoutItem = currentSumB - itemB;

                // Calculate the 1D index for this previous state.
                const previousTableFlatIndex = computeFlatIndex(previousSumAWithoutItem, previousSumBWithoutItem, dpTableWidth);

                // Check if the previous state (before adding the current item) was reachable.
                if (minimumCostsTable[previousTableFlatIndex] !== IMPOSSIBLE_VALUE) {
                    // If reachable, calculate the total cost if we include the current item.
                    const costIfItemIncluded = minimumCostsTable[previousTableFlatIndex] + itemCost;

                    // Update the current state's minimum cost.
                    // Choose the minimum between the current known cost for this state
                    // (which implies not taking the current item) and the cost if we take the current item.
                    minimumCostsTable[currentTableFlatIndex] = Math.min(
                        minimumCostsTable[currentTableFlatIndex],
                        costIfItemIncluded
                    );
                }
            }
        }
    }

    // After filling the DP table, determine the lowest achievable cost.
    let minimumAchievedCost = IMPOSSIBLE_VALUE;

    // Calculate the maximum possible multiplier for target A and B values.
    // This ensures we don't check beyond the bounds of our DP table.
    // Handle division by zero for targetA/B if they are 0.
    const maxMultiplierForA = (targetA === 0) ? IMPOSSIBLE_VALUE : Math.floor(maxTotalSumA / targetA);
    const maxMultiplierForB = (targetB === 0) ? IMPOSSIBLE_VALUE : Math.floor(maxTotalSumB / targetB);
    const overallMaxMultiplier = Math.min(maxMultiplierForA, maxMultiplierForB);

    // Iterate through possible multiples of the target values (Ma * k, Mb * k).
    // The problem implies 'k' starts from 1.
    for (let multiplier = 1; multiplier <= overallMaxMultiplier; multiplier++) {
        const currentTargetSumA = targetA * multiplier;
        const currentTargetSumB = targetB * multiplier;

        // Ensure the calculated target sums are within the bounds of our DP table.
        // This check is mostly redundant due to `overallMaxMultiplier` but adds robustness.
        if (currentTargetSumA <= maxTotalSumA && currentTargetSumB <= maxTotalSumB) {
            const lookupIndex = computeFlatIndex(currentTargetSumA, currentTargetSumB, dpTableWidth);
            // Update the minimum cost found so far if the current state is reachable and cheaper.
            minimumAchievedCost = Math.min(minimumAchievedCost, minimumCostsTable[lookupIndex]);
        }
    }

    // Output the final result.
    if (minimumAchievedCost === IMPOSSIBLE_VALUE) {
        console.log("-1"); // No combination of items could achieve a multiple of the target values.
    } else {
        // Output the lowest cost found, explicitly converting to string.
        console.log(minimumAchievedCost.toString());
    }
}

// Initiate the input processing and problem-solving workflow.
configureInputProcessing();