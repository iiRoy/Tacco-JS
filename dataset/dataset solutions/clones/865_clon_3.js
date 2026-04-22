const fileSystemUtility = require('fs');

const STANDARD_INPUT_DESCRIPTOR = process.stdin.fd;
const FIXED_DP_CALCULATION_CAPACITY = 393; // A constant representing the maximum capacity for the DP table pre-calculation.

/**
 * Reads all lines from standard input synchronously.
 * This utility function abstracts the details of interacting with the file system.
 * @returns {string[]} An array of strings, where each string is a line from the input.
 * @throws {Error} If there's an issue reading from stdin (e.g., fstat or read failure).
 */
function readInputLines() {
    try {
        // Retrieve file status information to determine the size of the input stream.
        const inputDataStats = fileSystemUtility.fstatSync(STANDARD_INPUT_DESCRIPTOR);
        const inputDataSize = inputDataStats.size;

        // If the input stream is empty, there's nothing to process.
        if (inputDataSize === 0) {
            return [];
        }

        // Allocate a buffer to store the raw bytes read from standard input.
        // Using Buffer.alloc is a safer and recommended way to create buffers.
        const rawInputBuffer = Buffer.alloc(inputDataSize);

        // Read the content from standard input into the buffer.
        // The '0' for position indicates reading from the beginning of the buffer/file.
        const actualBytesRead = fileSystemUtility.readSync(STANDARD_INPUT_DESCRIPTOR, rawInputBuffer, 0, inputDataSize, 0);

        // Convert the buffer's content to a UTF-8 string, considering only the bytes actually read.
        // Then, split the string by newline characters to get an array of individual lines.
        const inputContentString = rawInputBuffer.toString('utf8', 0, actualBytesRead);
        return inputContentString.split('\n');
    } catch (error) {
        console.error("Critical error encountered while reading standard input:", error.message);
        throw error; // Propagate the error to the caller.
    }
}

/**
 * Creates and initializes a two-dimensional array (matrix) with a specified default value.
 * This function serves as a generic matrix constructor.
 * @param {number} rowsCount - The desired number of rows for the matrix.
 * @param {number} colsCount - The desired number of columns for each row in the matrix.
 * @param {*} initialValue - The value to populate every cell of the new matrix.
 * @returns {Array<Array<*>>} A newly created 2D array.
 * @throws {Error} If the provided dimensions are negative.
 */
function initializeTwoDArray(rowsCount, colsCount, initialValue) {
    // Validate input dimensions to prevent illogical array creation.
    if (rowsCount < 0 || colsCount < 0) {
        throw new Error(`Invalid dimensions for 2D array: rows=${rowsCount}, cols=${colsCount}. Both must be non-negative.`);
    }

    // Handle edge cases where one or both dimensions are zero.
    if (rowsCount === 0 || colsCount === 0) {
        return []; // An empty array represents a matrix with zero rows or columns.
    }

    // Utilize modern JavaScript array creation methods for efficiency and readability.
    // Array.from creates an array of 'rowsCount' elements, then maps each to a new array
    // filled with 'initialValue' for 'colsCount' times.
    return Array.from({ length: rowsCount }, () => new Array(colsCount).fill(initialValue));
}

/**
 * Computes the maximum possible total profit (or score) using a dynamic programming approach.
 * This function models a variation of the unbounded knapsack problem, where each item (phrase)
 * has a cost, a duration-related constraint, and a profit. The goal is to maximize profit
 * within a given total capacity.
 *
 * @param {number} maximumCapacity - The total capacity constraint (e.g., maximum melody duration) for the problem.
 * @param {Array<Array<number>>} itemConfigurations - A list of available items, where each item
 *   is represented as an array: `[itemCost, itemDuration, itemValue]`.
 * @returns {Array<Array<number>>} A 2D table (`profitTable`) where `profitTable[i][j]`
 *   stores the maximum profit achievable using the first `i` items with a capacity of `j`.
 * @throws {Error} If `maximumCapacity` is negative.
 */
function computeOptimalScore(maximumCapacity, itemConfigurations) {
    if (maximumCapacity < 0) {
        throw new Error("The maximum capacity for optimal score computation cannot be negative.");
    }

    // If there are no items to choose from, the maximum profit for any capacity is zero.
    if (!Array.isArray(itemConfigurations) || itemConfigurations.length === 0) {
        return initializeTwoDArray(1, maximumCapacity + 1, 0);
    }

    const numConfigurations = itemConfigurations.length;
    // The DP table will have (numConfigurations + 1) rows (for items from 0 to numConfigurations)
    // and (maximumCapacity + 1) columns (for capacities from 0 to maximumCapacity).
    const profitTable = initializeTwoDArray(numConfigurations + 1, maximumCapacity + 1, 0);

    // Iterate through each item configuration available.
    for (let itemIndex = 0; itemIndex < numConfigurations; itemIndex++) {
        const currentItemDetails = itemConfigurations[itemIndex];
        const itemCost = currentItemDetails[0];       // 's' in original code, cost to "use" this item
        const itemDuration = currentItemDetails[1];   // 'l' in original code, a duration/length constraint
        const itemValue = currentItemDetails[2];      // 'p' in original code, profit gained

        // Iterate through all possible capacities, from smallest to largest.
        for (let currentCapacity = 0; currentCapacity <= maximumCapacity; currentCapacity++) {
            // Case 1: The current item is NOT included.
            // The profit is simply carried over from the previous item's row for the same capacity.
            const profitExcludingCurrentItem = profitTable[itemIndex][currentCapacity];

            let profitIncludingCurrentItem = 0; // Initialize profit if current item is included.

            // Case 2: Consider INCLUDING the current item.
            // This is only possible if the current capacity is at least equal to the item's cost.
            if (itemCost <= currentCapacity) {
                let maxPreviousStateProfitForCurrentItem = 0;

                // Determine the valid range of previous capacities (prevCapacityIndex)
                // to look into *within the current row* (itemIndex + 1).
                // This is characteristic of an unbounded knapsack problem where an item
                // can be used multiple times, and its effect propagates within the same row calculation.
                // The 'itemDuration' acts as a lower bound for the previous state capacity.
                const minPreviousCapacityRequired = Math.max(0, currentCapacity - itemDuration);
                const maxPreviousCapacityAllowed = currentCapacity - itemCost;

                // Iterate through this specific range of previous capacities to find the highest profit.
                // This complex range implies a specific problem interpretation where the 'duration' (l)
                // affects the minimum capacity needed from previous states.
                if (maxPreviousCapacityAllowed >= minPreviousCapacityRequired) {
                    for (let prevCapacityIndex = minPreviousCapacityRequired; prevCapacityIndex <= maxPreviousCapacityAllowed; prevCapacityIndex++) {
                        if (profitTable[itemIndex + 1][prevCapacityIndex] > maxPreviousStateProfitForCurrentItem) {
                            maxPreviousStateProfitForCurrentItem = profitTable[itemIndex + 1][prevCapacityIndex];
                        }
                    }
                }
                // If the item is included, its value is added to the best previous state profit found.
                profitIncludingCurrentItem = maxPreviousStateProfitForCurrentItem + itemValue;
            }

            // The optimal profit for the current (itemIndex+1) and currentCapacity
            // is the maximum of the two cases: excluding the item or including it.
            profitTable[itemIndex + 1][currentCapacity] = Math.max(profitExcludingCurrentItem, profitIncludingCurrentItem);
        }
    }
    return profitTable;
}

/**
 * The main execution entry point for the program.
 * It orchestrates input reading, dynamic programming calculation, and result output.
 */
function executeProgram() {
    let inputContentLines;
    try {
        inputContentLines = readInputLines();
    } catch (e) {
        // If input reading fails critically, just output -1 and exit.
        console.log("-1");
        return;
    }

    // Basic validation for minimum input lines.
    if (inputContentLines.length < 2) {
        console.error("Insufficient input: Expected at least 2 lines (number of items, number of queries).");
        console.log("-1");
        return;
    }

    // Parse the total number of item configurations.
    const numberOfItems = parseInt(inputContentLines.shift(), 10);
    if (isNaN(numberOfItems) || numberOfItems < 0) {
        console.error("Invalid input for number of items. Must be a non-negative integer.");
        console.log("-1");
        return;
    }

    const itemDetailsCollection = [];
    // Read and parse each item configuration line.
    for (let i = 0; i < numberOfItems; i++) {
        if (inputContentLines.length === 0) {
            console.error(`Input error: Expected ${numberOfItems} item configurations but found fewer.`);
            console.log("-1");
            return;
        }
        const itemLine = inputContentLines.shift();
        const itemData = itemLine.split(' ').map(Number);

        // Validate the format of each item configuration.
        if (itemData.length !== 3 || itemData.some(isNaN) || itemData.some(val => val < 0)) {
             console.error(`Invalid item configuration format on line ${i+2}. Expected 3 non-negative numbers.`);
             console.log("-1");
             return;
        }
        itemDetailsCollection.push(itemData);
    }

    // Parse the total number of queries for melody durations.
    const numberOfQueries = parseInt(inputContentLines.shift(), 10);
    if (isNaN(numberOfQueries) || numberOfQueries < 0) {
        console.error("Invalid input for number of queries. Must be a non-negative integer.");
        console.log("-1");
        return;
    }

    const queryDurations = [];
    // Read and parse each query duration line.
    for (let i = 0; i < numberOfQueries; i++) {
        if (inputContentLines.length === 0) {
            console.error(`Input error: Expected ${numberOfQueries} query durations but found fewer.`);
            console.log("-1");
            return;
        }
        const currentDuration = Number(inputContentLines.shift());

        // Validate each query duration.
        if (isNaN(currentDuration) || currentDuration < 0) {
            console.error(`Invalid query duration on line ${numberOfItems + i + 3}. Must be a non-negative number.`);
            console.log("-1");
            return;
        }
        queryDurations.push(currentDuration);
    }

    let computedProfitTable;
    try {
        // Pre-compute the DP table for all items up to a fixed maximum capacity.
        computedProfitTable = computeOptimalScore(FIXED_DP_CALCULATION_CAPACITY, itemDetailsCollection);
    } catch (error) {
        console.error("An error occurred during the optimal score calculation:", error.message);
        console.log("-1");
        return;
    }

    const collectedResultsForQueries = [];
    let hasAnyZeroResult = false; // Flag to track if any query yields a zero profit.

    // Process each query using the pre-computed DP table.
    for (const currentQueryDuration of queryDurations) {
        let queryProfit = 0;

        // Ensure the query duration is within the bounds of the pre-computed table.
        if (currentQueryDuration > FIXED_DP_CALCULATION_CAPACITY) {
            // If query duration exceeds the pre-calculated capacity, it implies no solution
            // can be found within the pre-calculated range, effectively a zero profit.
            console.warn(`Warning: Query duration ${currentQueryDuration} exceeds fixed DP calculation capacity ${FIXED_DP_CALCULATION_CAPACITY}. Resulting profit will be 0.`);
            queryProfit = 0;
        } else {
            // Retrieve the profit from the DP table: last row (all items), specific capacity column.
            queryProfit = computedProfitTable[numberOfItems][currentQueryDuration];
        }

        if (queryProfit === 0) {
            hasAnyZeroResult = true; // Mark if any query results in zero profit.
        }
        collectedResultsForQueries.push(queryProfit);
    }

    // Final output logic: If any query resulted in zero profit, print -1.
    // Otherwise, print all collected non-zero profits.
    if (hasAnyZeroResult) {
        console.log("-1");
    } else {
        // Use for...of for cleaner iteration over array elements.
        for (const profit of collectedResultsForQueries) {
            console.log(profit);
        }
    }
}

// Initiate the program execution.
executeProgram();