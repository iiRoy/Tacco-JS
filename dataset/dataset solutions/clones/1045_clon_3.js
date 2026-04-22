(function processInputData() {
    // Define the standard path for reading input on Unix-like systems.
    const SYSTEM_INPUT_STREAM_PATH = '/dev/stdin';
    // Specify the character encoding for file operations.
    const FILE_ENCODING_STANDARD = 'utf8';

    /**
     * Safely retrieves and preprocesses raw input data from a specified file path.
     * @param {string} filePath - The path to the input file.
     * @param {string} encoding - The character encoding to use.
     * @returns {string[]} An array of cleaned input lines, or an empty array on error.
     */
    const fetchAndSplitInputContent = (filePath, encoding) => {
        try {
            // Dynamically import the 'fs' (file system) module.
            const fileSystemHandler = require('fs');
            // Read the file synchronously, remove extraneous whitespace, and split into individual rows.
            return fileSystemHandler.readFileSync(filePath, encoding).trim().split('\n');
        } catch (ioError) {
            // Log any errors encountered during file reading.
            console.error("Input data acquisition failed:", ioError.message);
            // Return an empty collection to ensure downstream operations don't throw immediate errors.
            return [];
        }
    };

    /**
     * Parses a space-separated string into an array of numeric values.
     * @param {string} rowString - The string containing space-separated numbers.
     * @returns {number[]} An array of numbers.
     */
    const convertRowToNumericArray = (rowString) => rowString.split(' ').map(Number);

    /**
     * Determines the maximum value between two given numbers.
     * Encapsulated for potential future custom logic or logging.
     * @param {number} valueA - First number.
     * @param {number} valueB - Second number.
     * @returns {number} The larger of the two numbers.
     */
    const evaluateMaxOfTwo = (valueA, valueB) => Math.max(valueA, valueB);

    /**
     * Calculates a dynamic average threshold, handling division by zero similar to native JS behavior.
     * This average is used as a heuristic for partitioning decisions.
     * @param {number} currentTotalRemaining - The sum of items yet to be distributed.
     * @param {number} partitionsRemaining - The count of partitions still available for allocation.
     * @returns {number} The calculated average, Infinity, NaN, or -Infinity.
     */
    const computeGreedyAverageThreshold = (currentTotalRemaining, partitionsRemaining) => {
        if (partitionsRemaining <= 0) {
            // Emulate standard JavaScript division by zero behavior:
            // Positive Infinity if numerator is positive, NaN if numerator is zero,
            // Negative Infinity if numerator is negative.
            return currentTotalRemaining > 0 ? Infinity : (currentTotalRemaining === 0 ? NaN : -Infinity);
        }
        return currentTotalRemaining / partitionsRemaining;
    };

    // Begin the primary execution flow.
    let rawInputLinesCollection = fetchAndSplitInputContent(SYSTEM_INPUT_STREAM_PATH, FILE_ENCODING_STANDARD);

    // Guard clause: Ensure input was successfully read.
    if (rawInputLinesCollection.length === 0) {
        console.log("No input data available for processing. Terminating.");
        return;
    }

    // Extract the first line, which typically contains global configuration parameters.
    const [totalItemsExpected, numberOfDesiredPartitions] = convertRowToNumericArray(rawInputLinesCollection.shift());

    // Input validation for critical parameters.
    if (isNaN(totalItemsExpected) || isNaN(numberOfDesiredPartitions) || totalItemsExpected < 0 || numberOfDesiredPartitions <= 0) {
        console.error("Error: Invalid item count or partition count provided. Aborting.");
        return;
    }

    // Transform the remaining lines into an array of item weights (numeric values).
    const individualItemWeights = rawInputLinesCollection.map(Number);

    // Optional validation: Cross-check declared item count against actual read count.
    if (individualItemWeights.length !== totalItemsExpected) {
        console.warn(`Warning: Declared total items (${totalItemsExpected}) differs from actual items read (${individualItemWeights.length}). Processing with actual data.`);
        // No modification needed, as `individualItemWeights` is used directly.
    }

    // Calculate the initial aggregate weight of all items.
    let totalUnallocatedWeight = individualItemWeights.reduce((accumulator, currentItem) => accumulator + currentItem, 0);

    // Optimized path for the trivial case of a single partition.
    if (numberOfDesiredPartitions === 1) {
        console.log(totalUnallocatedWeight); // All items go into one partition.
        return; // Exit early.
    }

    // Initialize data structures for partitioning:
    // `partitionLoads` stores the sum of weights for each partition.
    let partitionLoads = new Array(numberOfDesiredPartitions).fill(0);
    // `partitionContents` stores the actual items for each partition (for detailed tracking, though not strictly needed for the final answer).
    let partitionContents = new Array(numberOfDesiredPartitions).fill(null).map(() => []);

    // `currentPartitionCursor` points to the partition currently being filled (0-indexed).
    let currentPartitionCursor = 0;
    // `peakPartitionLoad` tracks the highest load encountered across all partitions.
    let peakPartitionLoad = 0;

    // Initialize the dynamic average threshold using the total sum and total partitions.
    let dynamicAverageThreshold = computeGreedyAverageThreshold(totalUnallocatedWeight, numberOfDesiredPartitions);

    // Iterate through each item weight to assign it to a partition.
    individualItemWeights.forEach((currentItemWeight) => {
        const currentPartitionTotal = partitionLoads[currentPartitionCursor];
        // The core decision condition, rephrased from the original.
        // It checks if adding the current item would keep the current partition's load "sufficiently" below
        // the calculated dynamic average, considering the current item's weight.
        const decisionMetric = dynamicAverageThreshold - (2 * currentPartitionTotal + currentItemWeight) / 2;

        // If the decision metric is not positive, it indicates that adding the current item
        // would make the current partition "too heavy" relative to the target average,
        // suggesting a new partition should be started.
        if (decisionMetric <= 0) {
            // Check if we can actually start a new partition.
            // This implicitly handles the case where dynamicAverageThreshold is Infinity (for the last bin)
            // as Infinity - X will always be positive, making `decisionMetric > 0` always true,
            // thus ensuring items are added to the last bin without trying to create a new one.
            if (currentPartitionCursor < numberOfDesiredPartitions - 1) {
                // Finalize the current partition's load and update the overall maximum.
                peakPartitionLoad = evaluateMaxOfTwo(peakPartitionLoad, currentPartitionTotal);
                // Move to the next partition slot.
                currentPartitionCursor++;

                // Recalculate the dynamic average threshold, reflecting that a partition has just been "closed"
                // and a new one opened. This average is for the *remaining* available partitions.
                // The denominator `numberOfDesiredPartitions - currentPartitionCursor - 1` refers to
                // the count of partitions *after* the newly active one.
                dynamicAverageThreshold = computeGreedyAverageThreshold(
                    totalUnallocatedWeight,
                    numberOfDesiredPartitions - currentPartitionCursor - 1
                );
            }
            // If currentPartitionCursor is already the last one, items *must* be added to it,
            // so the decisionMetric will have been positive (due to Infinity average),
            // and this `else` block would not have been entered in the first place.
        }

        // Unconditionally update the dynamic average threshold for the *next* iteration's decision.
        // This is crucial for matching the original algorithm's behavior.
        // It uses the `totalUnallocatedWeight` *before* the current `currentItemWeight` is subtracted.
        dynamicAverageThreshold = computeGreedyAverageThreshold(
            totalUnallocatedWeight,
            numberOfDesiredPartitions - currentPartitionCursor - 1
        );

        // Add the current item to the currently active partition.
        partitionLoads[currentPartitionCursor] += currentItemWeight;
        partitionContents[currentPartitionCursor].push(currentItemWeight);
        // Deduct the current item's weight from the total unallocated weight.
        totalUnallocatedWeight -= currentItemWeight;
    });

    // After all items are processed, ensure the load of the very last partition is also considered
    // for the overall maximum, as its closure might not have triggered the `if` block.
    peakPartitionLoad = evaluateMaxOfTwo(peakPartitionLoad, partitionLoads[currentPartitionCursor]);

    // Output the final computed maximum load found among all partitions.
    console.log(peakPartitionLoad);

})();