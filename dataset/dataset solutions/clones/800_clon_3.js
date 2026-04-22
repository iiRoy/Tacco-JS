var outputWriter = console.log;

// Default radix for integer parsing operations.
const PARSING_RADIX = 10;

/**
 * Initializes the input reading mechanism for a Node.js environment.
 * Accumulates data from standard input and passes the processed lines
 * to a provided callback function once the input stream ends.
 * Includes basic error handling for the input stream.
 * @param {Function} dataReadyCallback - The function to call with an array of processed lines.
 */
const setupEnvironmentInput = (dataReadyCallback) => {
    // Check if running in a Node.js-like environment with process and stdin available.
    if (typeof process !== "undefined" && process.stdin && typeof process.stdin.resume === 'function') {
        let incomingStreamBuffer = ""; // Buffer to store incoming data chunks.

        // Ensure the input stream is active.
        process.stdin.resume();
        // Set character encoding for the input stream.
        process.stdin.setEncoding('utf8');

        // Event listener for incoming data chunks.
        process.stdin.on('data', (dataSegment) => {
            incomingStreamBuffer += dataSegment;
        });

        // Event listener for the end of the input stream.
        process.stdin.on('end', () => {
            // Split the accumulated buffer into individual lines, filtering out any empty lines.
            const finalProcessedLines = incomingStreamBuffer
                                        .split("\n")
                                        .filter(lineContent => lineContent.trim().length > 0);
            dataReadyCallback(finalProcessedLines);
        });

        // Event listener for errors during input stream processing.
        process.stdin.on('error', (err) => {
            outputWriter(`Error in input stream: ${err.message}`);
            // Terminate the process gracefully on input errors.
            process.exit(1);
        });
    } else {
        // If not in a Node.js environment, log a warning and provide empty data.
        outputWriter("Warning: Standard input not available. Proceeding with no data.");
        dataReadyCallback([]); // Provide an empty array to the callback.
    }
};

/**
 * Parses a single line of input, converting its contents to numbers.
 * Supports lines with single numbers or space-separated numbers.
 * @param {string} lineString - The raw string line to parse.
 * @returns {number|number[]} - A single number or an array of numbers.
 */
const parseInputLineContents = (lineString) => {
    const segments = lineString.split(" ");
    if (segments.length > 1) {
        // If multiple segments, parse each as an integer.
        return segments.map(segment => parseInt(segment, PARSING_RADIX));
    } else {
        // Otherwise, parse the single segment as an integer.
        return parseInt(segments[0], PARSING_RADIX);
    }
};

// Main entry point for processing all datasets.
const orchestrateDataProcessing = (allInputLines) => {
    // Validate that input is an array and not empty.
    if (!Array.isArray(allInputLines) || allInputLines.length === 0) {
        outputWriter("No input data provided for processing.");
        return;
    }

    // Transform raw string lines into parsed numerical data.
    // This creates a queue of processed data units.
    const processedInputQueue = allInputLines.map(parseInputLineContents);

    let currentDatasetIndex = 0; // Counter for processed datasets.

    // Loop through the input queue until all datasets are processed or a termination signal is found.
    while (processedInputQueue.length > 0) {
        const currentConfigEntry = processedInputQueue.shift(); // Get the configuration for the current dataset.

        // Validate the configuration entry.
        if (!Array.isArray(currentConfigEntry) || currentConfigEntry.length < 2) {
            outputWriter(`Error: Invalid configuration entry at dataset ${currentDatasetIndex}. Skipping.`);
            continue;
        }

        const requiredRows = currentConfigEntry[0];
        const requiredCols = currentConfigEntry[1];

        // Check for the termination condition (N=0, M=0).
        if (requiredRows === 0 && requiredCols === 0) {
            // outputWriter(`Termination signal encountered at dataset ${currentDatasetIndex}.`);
            return; // Exit the processing loop.
        }

        // Validate dimensions.
        if (!Number.isInteger(requiredRows) || !Number.isInteger(requiredCols) || requiredRows < 0 || requiredCols < 0) {
            outputWriter(`Error: Invalid dimensions (${requiredRows}, ${requiredCols}) at dataset ${currentDatasetIndex}. Skipping.`);
            continue;
        }

        // Ensure there are enough lines remaining in the queue for the current dataset.
        if (processedInputQueue.length < requiredRows + requiredCols) {
            outputWriter(`Error: Insufficient data for dataset ${currentDatasetIndex} (expected ${requiredRows + requiredCols} lines, found ${processedInputQueue.length}). Terminating.`);
            return;
        }

        // Extract the data blocks for 'H' and 'W' segments using splice.
        const rowDataBlocks = processedInputQueue.splice(0, requiredRows);
        const colDataBlocks = processedInputQueue.splice(0, requiredCols);

        // Increment the dataset index for the next iteration.
        currentDatasetIndex++;

        // Process the extracted data blocks and display the result.
        processDatasetAnalysis(rowDataBlocks, colDataBlocks, currentDatasetIndex);
    }
};

/**
 * Analyzes a given dataset (H and W blocks) to find common subarray sum products.
 * @param {number[]} rowDataBlocks - Array representing the 'H' data segments.
 * @param {number[]} colDataBlocks - Array representing the 'W' data segments.
 * @param {number} datasetIdentifier - An identifier for the current dataset.
 */
const processDatasetAnalysis = (rowDataBlocks, colDataBlocks, datasetIdentifier) => {
    // Guard clause for empty data blocks.
    if (!Array.isArray(rowDataBlocks) || !Array.isArray(colDataBlocks) || rowDataBlocks.length === 0 || colDataBlocks.length === 0) {
        outputWriter(`Dataset ${datasetIdentifier}: Cannot process empty data blocks.`);
        return;
    }

    // Generate frequency maps of all possible subarray sums for both data blocks.
    const rowSumFrequencies = generateSubarraySumCounts(rowDataBlocks);
    const colSumFrequencies = generateSubarraySumCounts(colDataBlocks);

    // Calculate the final result by finding matching sums and multiplying their frequencies.
    const finalIntersectionCount = calculateMatchingSumProducts(rowSumFrequencies, colSumFrequencies);

    // Output the result for the current dataset.
    outputWriter(finalIntersectionCount);
};

/**
 * Computes the frequencies of all possible contiguous subarray sums within an array.
 * @param {number[]} sourceArray - The array of numbers to analyze.
 * @returns {Map<number, number>} A Map where keys are subarray sums and values are their frequencies.
 */
const generateSubarraySumCounts = (sourceArray) => {
    const sumCountMap = new Map(); // Using Map for potentially better performance and key flexibility.
    const arraySize = sourceArray.length;

    // Early exit if the array is empty.
    if (arraySize === 0) {
        return sumCountMap;
    }

    // Iterate through all possible starting indices for subarrays.
    for (let startIdx = 0; startIdx < arraySize; ++startIdx) {
        let currentAccumulatedSum = 0; // Accumulator for the current subarray sum.
        // Iterate through all possible ending indices for subarrays starting from startIdx.
        for (let endIdx = startIdx; endIdx < arraySize; ++endIdx) {
            currentAccumulatedSum += sourceArray[endIdx]; // Add the next element to the sum.
            // Increment the count for this specific sum in the map.
            sumCountMap.set(currentAccumulatedSum, (sumCountMap.get(currentAccumulatedSum) || 0) + 1);
        }
    }
    return sumCountMap;
};

/**
 * Calculates the sum of products of frequencies for common keys (sums) between two frequency maps.
 * @param {Map<number, number>} firstFreqMap - The first frequency map.
 * @param {Map<number, number>} secondFreqMap - The second frequency map.
 * @returns {number} The total sum of products for intersecting sums.
 */
const calculateMatchingSumProducts = (firstFreqMap, secondFreqMap) => {
    let totalProductSum = 0; // Accumulator for the final result.

    // Guard clauses for empty maps.
    if (firstFreqMap.size === 0 || secondFreqMap.size === 0) {
        return 0;
    }

    // Iterate over the entries of the first frequency map.
    for (const [sumValue, countInFirst] of firstFreqMap.entries()) {
        // Check if the current sum also exists in the second frequency map.
        if (secondFreqMap.has(sumValue)) {
            const countInSecond = secondFreqMap.get(sumValue);
            // Add the product of their frequencies to the total.
            totalProductSum += countInFirst * countInSecond;
        }
    }
    return totalProductSum;
};

// Initiate the input processing sequence.
setupEnvironmentInput(orchestrateDataProcessing);