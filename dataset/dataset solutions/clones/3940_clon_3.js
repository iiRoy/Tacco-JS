'use strict';

/**
 * Utility function to obtain raw input data from standard input.
 * Reads the entire content, decodes it as UTF-8, splits by
 * any sequence of whitespace characters, and filters out empty segments.
 * @returns {string[]} An array of string segments from the input.
 */
const inputSourceData = require('fs')
  .readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' })
  .split(/\s+/)
  .filter(segment => segment.length > 0);

/**
 * Determines the smaller of two numerical values.
 * This acts as a simple helper for comparison logic.
 * @param {number} val1 The first number to compare.
 * @param {number} val2 The second number to compare.
 * @returns {number} The minimum of the two input values.
 */
const selectMinimumValue = (val1, val2) => {
    return Math.min(val1, val2);
};

/**
 * Processes an array of raw string inputs to calculate the total minimum transportation expense.
 * It expects four numerical values representing two options for train fare and two for bus fare.
 * @param {string[]} rawInputSegments An array of string representations of numbers.
 */
const processTransportationLogic = (rawInputSegments) => {
    // Perform an initial validation check on the input data structure.
    if (!Array.isArray(rawInputSegments) || rawInputSegments.length < 4) {
        console.error("Critical Error: Insufficient data provided. Expected at least four numerical entries for cost calculation.");
        throw new Error("Invalid input data structure or insufficient length for processing.");
    }

    // Convert string segments to numbers, including validation for non-numeric entries.
    const parsedNumericValues = rawInputSegments.map(currentSegment => {
        const valueAsNumber = Number(currentSegment);
        if (isNaN(valueAsNumber)) {
            console.warn(`Warning: Detected non-numeric input "${currentSegment}". Defaulting its value to 0 to proceed.`);
            return 0; // Use a default value for robustness against bad input.
        }
        return valueAsNumber;
    });

    // Destructure the first four parsed values into descriptive cost variables.
    const [trainJourneyOptionA, trainJourneyOptionB, busJourneyOptionC, busJourneyOptionD] = parsedNumericValues;

    // Log the individual options being considered for transparency.
    console.log(`Debug Info: Evaluating train costs [${trainJourneyOptionA}, ${trainJourneyOptionB}] and bus costs [${busJourneyOptionC}, ${busJourneyOptionD}].`);

    // Calculate the most economical train fare using the helper function.
    const optimalTrainTariff = selectMinimumValue(trainJourneyOptionA, trainJourneyOptionB);

    // Calculate the most economical bus fare using the same helper.
    const optimalBusTariff = selectMinimumValue(busJourneyOptionC, busJourneyOptionD);

    // Sum the optimal tariffs for an intermediate total.
    const cumulativeTransportCost = optimalTrainTariff + optimalBusTariff;

    // Assign the final calculated sum to a result variable.
    const finalCalculatedExpense = cumulativeTransportCost;

    // Output the conclusive result with a descriptive message.
    console.log(`The total minimum travel expense for the combined journey is: ${finalCalculatedExpense}`);
};

// Execute the main processing logic within a robust error handling block.
try {
    processTransportationLogic(inputSourceData);
} catch (operationError) {
    console.error(`An unrecoverable exception occurred during the execution: ${operationError.message}`);
    // Terminate the process with an error code to indicate failure.
    process.exit(1);
}