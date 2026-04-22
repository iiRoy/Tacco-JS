const fileSystem = require('fs');

/**
 * Parses a single line of space-separated numbers into a structured object.
 * This helper enhances readability and allows for potential input validation.
 * @param {string} lineContent - The input string line, expected format: "NUMBER1 NUMBER2"
 * @returns {{initialValue: number, usageLimit: number}} An object containing the parsed numeric values.
 */
function processDataLine(lineContent) {
    const numericParts = lineContent.split(' ').map(Number);
    // A basic check to ensure the line contains two valid numbers.
    // In competitive programming, input format is usually guaranteed, but this adds robustness.
    if (numericParts.length !== 2 || isNaN(numericParts[0]) || isNaN(numericParts[1])) {
        // For invalid lines, return a default or throw an error based on requirements.
        console.warn(`Warning: Invalid data line encountered "${lineContent}". Returning default values.`);
        return { initialValue: 0, usageLimit: 0 };
    }
    return { initialValue: numericParts[0], usageLimit: numericParts[1] };
}

// Entry point for the program logic.
try {
    // Define the path for standard input, common in Unix-like environments.
    const STANDARD_INPUT_PATH = '/dev/stdin';

    // Read all content from the specified input source as a UTF-8 string.
    const fullInputString = fileSystem.readFileSync(STANDARD_INPUT_PATH, 'utf8');

    // Split the input string into individual lines, removing leading/trailing whitespace
    // and filtering out any empty lines that might result from extra newlines.
    const allInputLines = fullInputString.trim().split('\n').filter(Boolean);

    // The very first line of input specifies the total number of subsequent data entries.
    // Use `parseInt` with a radix for explicit base-10 conversion.
    const totalNumberOfEntries = parseInt(allInputLines.shift(), 10);

    // Initialize a dynamic array to hold our processed data structures.
    let structuredDataCollection = [];

    // Iterate through the remaining input lines to parse each data entry.
    // A safety check `allInputLines.length > 0` prevents trying to shift from an empty array.
    for (let entryIndex = 0; entryIndex < totalNumberOfEntries && allInputLines.length > 0; ++entryIndex) {
        const currentRawLine = allInputLines.shift();
        const parsedDataItem = processDataLine(currentRawLine);
        structuredDataCollection.push(parsedDataItem);
    }

    // Sort the collected data points. The sorting criterion is the 'usageLimit' property
    // in descending order, which is critical for the algorithm's greedy approach.
    structuredDataCollection.sort((itemOne, itemTwo) => itemTwo.usageLimit - itemOne.usageLimit);

    // Variable to store the highest count achieved across all iterations.
    let overallMaximumCount = 0;

    // Define the upper boundary for the main iteration loop, as specified by problem constraints.
    const LOOP_UPPER_BOUND = 100001;

    // Begin the primary calculation loop. The loop's starting point (2) is specific to the problem.
    for (let currentEvaluationPoint = 2; currentEvaluationPoint <= LOOP_UPPER_BOUND; ++currentEvaluationPoint) {
        let currentEvaluationCount = 0; // Counter for the current evaluation point.

        // Iterate over each data item in our sorted collection.
        // Using a `for...of` loop is clean and efficient for iterating arrays.
        for (const dataElement of structuredDataCollection) {
            // Condition 1: Check if the item's initial value is less than or equal to the current evaluation point.
            const meetsInitialRequirement = dataElement.initialValue <= currentEvaluationPoint;

            // Condition 2: Check if incrementing the current count would still be within the item's usage limit.
            const hasRemainingCapacity = (currentEvaluationCount + 1) <= dataElement.usageLimit;

            // If both conditions are met, this data item can be 'selected' for the current evaluation point.
            if (meetsInitialRequirement && hasRemainingCapacity) {
                currentEvaluationCount++;
            }
        }

        // Update the overall maximum count if the current evaluation's count is higher.
        overallMaximumCount = Math.max(overallMaximumCount, currentEvaluationCount);
    }

    // The final result often requires an adjustment (e.g., subtracting 1) based on the specific problem.
    const finalCalculatedOutput = overallMaximumCount - 1;

    // Print the final computed result to standard output.
    console.log(finalCalculatedOutput);

} catch (processingError) {
    // Catch and report any errors that occur during file reading or data processing.
    console.error("An unhandled exception occurred during program execution:", processingError.message);
    // Indicate an abnormal exit status.
    process.exit(1);
}