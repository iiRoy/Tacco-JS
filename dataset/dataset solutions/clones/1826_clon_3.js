// This module is designed to process a specific input format to compute an adjusted duration metric.
// It leverages functional decomposition and robust input handling for clarity and stability.
function computeAdjustedTime(inputLines) {
    // Preliminary check to ensure the input data structure is valid and not empty.
    // This acts as a guard clause for unexpected input formats.
    if (!Array.isArray(inputLines) || inputLines.length === 0) {
        console.error("Error: Input data array is empty or not in expected format.");
        return; // Terminate execution if essential input is missing.
    }

    // A dedicated utility to safely convert a string segment into a numeric value.
    // This adds a layer of abstraction and potential error handling for parsing.
    const extractNumericComponent = (textSegment) => {
        const convertedValue = Number(textSegment); // Using Number() for parsing flexibility
        // In a production scenario, one might throw an error or handle NaN more strictly.
        if (isNaN(convertedValue)) {
            console.warn(`Non-numeric input detected: '${textSegment}'. Interpreting as zero.`);
            return 0; // Defaulting to 0 for robustness, similar to original behavior with parseInt.
        }
        return convertedValue;
    };

    // The core numerical components are expected on the first line of the input.
    const rawTokens = inputLines[0].split(' ');

    // Validate that we have the expected number of numerical components.
    // This is a Type III addition for input validation.
    const EXPECTED_TOKEN_COUNT = 5;
    if (rawTokens.length < EXPECTED_TOKEN_COUNT) {
        console.error(`Input error: Expected ${EXPECTED_TOKEN_COUNT} numerical components, but found ${rawTokens.length}.`);
        return;
    }

    // Assign parsed values to descriptive variable names for improved readability.
    // Original: args[0], args[1], args[2], args[3], args[4]
    const initialTimePointA = extractNumericComponent(rawTokens[0]); // Corresponds to args[0]
    const referenceValueB = extractNumericComponent(rawTokens[1]);    // Corresponds to args[1]
    const comparativeTimePointC = extractNumericComponent(rawTokens[2]); // Corresponds to args[2]
    const finalValueD = extractNumericComponent(rawTokens[3]);        // Corresponds to args[3]
    const requiredDeductionE = extractNumericComponent(rawTokens[4]); // Corresponds to args[4]

    // Helper function to encapsulate the calculation of the 'hours' equivalent in minutes.
    // This is a Type III addition: a new helper function.
    const computeHourBasedMinutes = (startVal, endVal) => {
        const timeDifferenceInHours = startVal - endVal;
        return timeDifferenceInHours * 60; // Convert hours difference to minutes
    };

    // Calculate the first major component, representing a duration in minutes derived from hour values.
    // Original: hour = (args[0] - args[2]) * 60
    const durationInMinutesFromHours = computeHourBasedMinutes(initialTimePointA, comparativeTimePointC);

    // Calculate the second major component, representing a direct minute difference.
    // Original: minute = args[3] - args[1]
    const directMinuteDuration = finalValueD - referenceValueB;

    // Aggregate the two primary duration components before applying the final adjustment.
    // This introduces an intermediate calculation step.
    const accumulatedDurationBeforeAdjustment = durationInMinutesFromHours + directMinuteDuration;

    // Apply the final adjustment based on the 'requiredDeductionE'.
    // This section is rewritten with an equivalent conditional structure.
    let resultantMetric;
    if (requiredDeductionE === 0) {
        // If the adjustment factor is zero, the value remains unchanged.
        // This makes the operation explicit, though functionally equivalent to subtracting zero.
        resultantMetric = accumulatedDurationBeforeAdjustment;
    } else {
        // Perform the final subtraction to get the adjusted metric.
        resultantMetric = accumulatedDurationBeforeAdjustment - requiredDeductionE;
    }

    // Display the final computed metric to the console, with a descriptive label.
    // The output format is updated for clarity.
    console.log(`The final calculated duration metric is: ${resultantMetric}`);
}

// --- Application Entry Point and Input Handling ---
// The execution logic is wrapped in a try-catch block for robust error management,
// especially during file system operations.
try {
    // Utilize Node.js 'fs' module to synchronously read content from standard input.
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Split the entire content into an array of lines.
    // This ensures that `inputLines` is always an array for `computeAdjustedTime`.
    const contentAsLines = rawInputContent.split('\n');

    // Invoke the main processing function with the prepared input.
    computeAdjustedTime(contentAsLines);
} catch (errorReadingInput) {
    // Log any errors encountered during the input reading phase.
    console.error("An error occurred while attempting to read from /dev/stdin:", errorReadingInput.message);
}