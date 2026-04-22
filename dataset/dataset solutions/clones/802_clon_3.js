// File system operations library for synchronous input reading.
const fileSystemModule = require('fs');

// Read the entire content of the standard input stream.
// The content is assumed to be UTF-8 encoded.
// After reading, trim any leading or trailing whitespace from the whole input block.
const rawInputContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();

// Split the raw input into an array of individual lines.
// Each line is then filtered to ensure it's not an empty string,
// which helps in robust parsing, especially with varying newline conventions.
let inputLineSegments = rawInputContentBuffer.split('\n').filter(segment => segment.length > 0);

// A control flag to manage the execution of the main processing loop.
// It will be set to 'false' when a specific termination condition is met.
let executionFlowActive = true;

/**
 * Determines if a given array of numerical parameters represents a termination request.
 * The termination condition is when all three parameters are strictly zero.
 * @param {number[]} parameterSet - An array of three numerical parameters.
 * @returns {boolean} - True if the condition for termination is met, false otherwise.
 */
const shouldTerminateProcessing = (parameterSet) => {
    // Check if the array has exactly three elements and all of them are zero.
    return parameterSet.length === 3 && parameterSet.every(val => val === 0);
};

// Begin the primary loop for processing multiple sets of data.
// This loop continues as long as the 'executionFlowActive' flag is true.
while (executionFlowActive) {
    // Before attempting to shift a line, ensure there are lines available in the input buffer.
    if (inputLineSegments.length === 0) {
        // If no more input is available, log a warning and halt processing.
        console.error("Warning: Input data exhausted unexpectedly. Terminating processing.");
        executionFlowActive = false; // Signal to exit the loop.
        continue; // Skip to the next loop iteration (which will now exit).
    }

    // Extract the next configuration line and parse its components into numbers.
    const currentConfigurationString = inputLineSegments.shift();
    const parsedConfigurationDetails = currentConfigurationString.split(' ').map(Number);

    // Validate the parsed configuration: it must contain exactly three numbers and none should be NaN.
    if (parsedConfigurationDetails.length !== 3 || parsedConfigurationDetails.some(isNaN)) {
        console.error(`Error: Malformed configuration line encountered: "${currentConfigurationString}". Skipping this block.`);
        // If configuration is invalid, skip the rest of this iteration and proceed to the next.
        continue;
    }

    // Check if the current set of parameters indicates a graceful termination request.
    if (shouldTerminateProcessing(parsedConfigurationDetails)) {
        executionFlowActive = false; // Set the flag to terminate the loop.
        continue; // Exit this iteration; the loop condition will be false next.
    }

    // Assign meaningful names to the configuration parameters for clarity.
    const totalDataPointsToRead = parsedConfigurationDetails[0]; // 'N' from original problem
    // Adjust the target index to be zero-based for array access.
    const referenceDataItemIndex = parsedConfigurationDetails[1] - 1; // 'M' from original problem
    const percentageDeductionValue = parsedConfigurationDetails[2]; // 'P' from original problem

    // Initialize structures for accumulating data and a running total.
    const historicDataValues = []; // Stores the 'N' data points read subsequently.
    let cumulativeProductSum = 0; // Accumulates (value * 100) for each data point.

    // Loop to read and process the 'N' data points specified by 'totalDataPointsToRead'.
    for (let dataPointIterator = 0; dataPointIterator < totalDataPointsToRead; dataPointIterator++) {
        // Ensure there are enough lines remaining for the expected data points.
        if (inputLineSegments.length === 0) {
            console.error("Error: Insufficient data lines provided for the declared 'N'. Aborting current block.");
            executionFlowActive = false; // Critical error, stop all further processing.
            break; // Exit the inner data point reading loop.
        }

        const currentDataValueString = inputLineSegments.shift();
        const numericDataValue = Number(currentDataValueString);

        // Validate that the parsed data value is indeed a number.
        if (isNaN(numericDataValue)) {
            console.warn(`Warning: Non-numeric data value found: "${currentDataValueString}". Skipping this specific entry.`);
            continue; // Skip the current data point and move to the next iteration of the inner loop.
        }

        // Store the validated numeric value and update the cumulative sum.
        historicDataValues.push(numericDataValue);
        cumulativeProductSum += (numericDataValue * 100);
    }

    // If the inner loop was prematurely exited due to an error, skip calculation for this block.
    if (!executionFlowActive) {
        continue;
    }

    // Calculate the multiplier based on the deduction percentage.
    // E.g., if deduction is 10%, multiplier is (100-10)/100 = 0.9.
    const adjustedMultiplier = (100 - percentageDeductionValue) / 100;
    // Apply the deduction to the cumulative sum.
    cumulativeProductSum *= adjustedMultiplier;

    let finalComputedOutcome = 0; // Default outcome, especially if division is not possible.

    // Perform validation checks before attempting division.
    // 1. Ensure the reference index is within the bounds of the collected data.
    // 2. Ensure the value at the reference index is not zero to prevent division by zero errors.
    if (referenceDataItemIndex >= 0 && referenceDataItemIndex < historicDataValues.length) {
        const divisorCandidate = historicDataValues[referenceDataItemIndex];

        if (divisorCandidate !== 0) {
            // If valid, calculate the final result by dividing the adjusted sum by the divisor.
            // Math.trunc is used to explicitly discard any fractional part, yielding an integer.
            finalComputedOutcome = Math.trunc(cumulativeProductSum / divisorCandidate);
        } else {
            // Optional: A specific message if the divisor is zero, though the result remains 0.
            // console.info(`Information: Divisor at target index ${referenceDataItemIndex} is zero. Result defaults to 0.`);
        }
    } else {
        // Optional: A specific message if the index is out of bounds.
        // console.info(`Information: Target index ${referenceDataItemIndex} is out of bounds for collected data (length ${historicDataValues.length}). Result defaults to 0.`);
    }

    // Output the calculated result for the current data block.
    console.log(finalComputedOutcome);
}

// Script execution concludes here.