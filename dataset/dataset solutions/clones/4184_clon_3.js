/*
 * This script is designed to process textual input data, specifically to analyze item frequencies.
 * It identifies unique items, counts their occurrences, and then calculates a cumulative sum
 * of the frequencies of the least common items, based on a provided exclusion criterion.
 *
 * The file includes core logic for data processing, along with a few general-purpose utility functions
 * for input parsing, numerical aggregation, and optional verbose logging.
 */

// Global flag to enable or disable detailed informational messages during execution.
const VERBOSE_DEBUG_OUTPUT_ACTIVE = false;

/**
 * Provides conditional logging functionality. Messages are only printed if
 * VERBOSE_DEBUG_OUTPUT_ACTIVE is set to true.
 * @param {string | any} diagnosticMessage - The message or data to be logged.
 */
const emitDebugLog = (diagnosticMessage) => {
    if (VERBOSE_DEBUG_OUTPUT_ACTIVE) {
        console.log("[DIAG]:", diagnosticMessage);
    }
};

/**
 * Splits a multi-line string into an array of individual lines.
 * Handles potential leading/trailing whitespace and empty input.
 * @param {string} rawTextContent - The complete string content to be parsed.
 * @returns {string[]} An array where each element is a line from the input.
 */
const segmentIntoLines = (rawTextContent) => {
    // Robustness check for input type and content.
    if (typeof rawTextContent !== 'string' || rawTextContent.trim().length === 0) {
        emitDebugLog("Input for line segmentation was empty or invalid. Returning an empty array.");
        return [];
    }
    // Trim and split by newline characters.
    return rawTextContent.trim().split("\n");
};

/**
 * Calculates the sum of all numeric values within a given array.
 * Non-numeric elements are gracefully skipped with a warning.
 * @param {Array<number | string>} collectionOfNumbers - An array containing values that can be converted to numbers.
 * @returns {number} The aggregate sum of the numeric elements.
 */
const aggregateNumericValues = (collectionOfNumbers) => {
    // Basic validation to ensure the input is an array.
    if (!Array.isArray(collectionOfNumbers)) {
        emitDebugLog("Error: Non-array argument passed to aggregateNumericValues. Returning 0.");
        return 0;
    }

    let totalSum = 0;
    // Iterate over each item, convert it to a number, and add to the sum if valid.
    for (const itemValue of collectionOfNumbers) {
        const parsedValue = Number(itemValue); // Attempt explicit conversion.
        if (!isNaN(parsedValue)) { // Check if the conversion resulted in a valid number.
            totalSum += parsedValue;
        } else {
            emitDebugLog(`Warning: Encountered non-numeric item '${itemValue}' during aggregation. Skipping.`);
        }
    }
    return totalSum;
};

/**
 * The primary function responsible for executing the data analysis workflow.
 * It reads configuration, processes item identifiers, and outputs a specific frequency sum.
 * @param {string} incomingInputPayload - The raw string input from the source (e.g., standard input).
 */
function initiateDataAnalysis(incomingInputPayload) {
    emitDebugLog("Initiating data analysis process...");

    // First, break down the complete input payload into individual lines.
    const separatedLines = segmentIntoLines(incomingInputPayload);

    // Critical check: Ensure we have enough lines for configuration and item data.
    if (separatedLines.length < 2) {
        console.error("Fatal Error: Input payload contains insufficient lines for processing. Expected at least 2.");
        return; // Terminate execution gracefully.
    }

    // Process the first line to extract operational parameters.
    // Each parameter is expected to be an integer. Robust parsing is applied.
    const operationParameters = separatedLines[0].split(" ").map(strParam => {
        const numericParam = parseInt(strParam, 10); // Use radix for explicit base 10 conversion.
        if (isNaN(numericParam)) {
            emitDebugLog(`Warning: Configuration parameter '${strParam}' is not a valid number. Defaulting to 0.`);
            return 0; // Provide a fallback for invalid numeric inputs.
        }
        return numericParam;
    });

    // The second parameter dictates how many most-frequent items to disregard.
    const exclusionCriterion = operationParameters[1];
    emitDebugLog(`Identified exclusion criterion: ${exclusionCriterion}`);

    // The second line contains the list of item identifiers, treated as strings.
    const designatedItemLabels = separatedLines[1].split(" ");

    // A Map is used to efficiently track the occurrence count for each unique item label.
    const labelFrequencyCounter = new Map();

    // Iterate through all item labels to build up the frequency map.
    for (const label of designatedItemLabels) {
        // Increment the count for the current label, or initialize it to 1 if first encounter.
        labelFrequencyCounter.set(label, (labelFrequencyCounter.get(label) || 0) + 1);
    }
    emitDebugLog("Completed populating label frequency counter.");
    emitDebugLog(labelFrequencyCounter);

    // Extract all the frequency counts into a standard array.
    const unsortedCounts = Array.from(labelFrequencyCounter.values());

    // Sort these counts in ascending order to easily identify the least frequent items.
    unsortedCounts.sort((countA, countB) => countA - countB);
    emitDebugLog("Frequencies sorted in ascending order.");
    emitDebugLog(unsortedCounts);

    // Calculate how many of the smallest frequencies need to be summed.
    // This is the total number of unique items minus the exclusion criterion.
    const countOfItemsToInclude = unsortedCounts.length - exclusionCriterion;

    // Decision point: If the exclusion criterion covers all or more items than available,
    // the resulting sum is zero.
    if (countOfItemsToInclude <= 0) {
        console.log(0); // Output 0 as per problem specification.
        emitDebugLog("All unique items are excluded or there are not enough items. Outputting 0.");
    } else {
        // Slice the sorted array to get only the frequencies that are part of the sum.
        // These are the 'countOfItemsToInclude' smallest frequencies.
        const frequenciesForAggregation = unsortedCounts.slice(0, countOfItemsToInclude);

        // Compute the final sum using our dedicated aggregation helper.
        const finalResultingSum = aggregateNumericValues(frequenciesForAggregation);
        console.log(finalResultingSum); // Output the calculated sum.
        emitDebugLog(`Final computed sum of selected frequencies: ${finalResultingSum}`);
    }
    emitDebugLog("Data analysis process concluded.");
}

// --- Application Entry Point ---
// This block is responsible for reading input from the standard input stream
// and initiating the main data analysis workflow. It also includes error handling.
try {
    const fileSystemHandler = require("fs"); // Dynamically require Node.js 'fs' module.
    // Read the entire content from standard input, decode as UTF-8, and trim whitespace.
    const stdinRawContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8").trim();
    initiateDataAnalysis(stdinRawContent); // Invoke the main processing function.
} catch (executionError) {
    // Catch and log any errors that occur during file reading or initial processing.
    console.error("A critical error prevented successful execution:");
    console.error(executionError.message);
    // In a real application, more sophisticated error recovery or reporting might be implemented here.
}