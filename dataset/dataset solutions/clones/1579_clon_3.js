// This module encapsulates a specific data processing logic to calculate cumulative adjustments.
// It aims to determine the total "overhang" or "excess" that needs to be compensated for
// across a sequence of numbers, based on a non-decreasing principle.

/**
 * Processes a raw input string containing numeric data, performing calculations
 * to find the sum of required non-negative adjustments.
 *
 * The input is expected to be multi-line:
 * - The first line contains an integer 'N', representing the number of elements in the sequence.
 * - The second line contains 'N' space-separated integers, which are the sequence elements.
 *
 * @param {string} rawInputPayload The raw string data received for processing.
 */
function computeSequenceAdjustments(rawInputPayload) {
    // Perform initial validation on the input payload.
    // If the input is not a string or is effectively empty, log an error and terminate.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Error: The provided input payload is either not a string or is empty.");
        return; // Abort execution if input is invalid.
    }

    // Split the entire payload into individual lines for easier parsing.
    // Using `const` for variables that won't be reassigned.
    const inputLines = rawInputPayload.split('\n');

    // Basic structural check: We need at least two lines of data.
    // One for the count, and one for the actual numbers.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient number of lines in the input payload. Expected at least 2.");
        return;
    }

    /**
     * Helper function to safely parse a string into an integer.
     * Handles potential non-numeric inputs by returning 0 and logging a warning.
     * @param {string} strValue The string to parse.
     * @returns {number} The parsed integer, or 0 if parsing fails.
     */
    const getIntegerFromString = (strValue) => {
        const parsedNumber = Number.parseInt(strValue.trim(), 10);
        if (Number.isNaN(parsedNumber)) {
            console.warn(`Warning: Could not convert "${strValue.trim()}" to an integer. Using 0 instead.`);
            return 0;
        }
        return parsedNumber;
    };

    // Extract the total count of numbers from the first line of the input.
    const totalItemCount = getIntegerFromString(inputLines[0]);

    // If the count is zero or negative, there's nothing to process, so the sum is 0.
    if (totalItemCount <= 0) {
        console.log(0);
        return;
    }

    // Parse the sequence of numbers from the second line.
    // We use `map` for a more functional and concise way to convert all string parts to integers.
    let numberSequence = inputLines[1].split(' ').map(getIntegerFromString);

    // Validate if the number of parsed elements matches the declared totalItemCount.
    // If there are fewer elements, pad with zeros to match the expected count.
    while (numberSequence.length < totalItemCount) {
        numberSequence.push(0);
        console.warn(`Warning: Input sequence shorter than declared count. Padded with 0.`);
    }
    // If there are more elements, truncate the excess to match the expected count.
    if (numberSequence.length > totalItemCount) {
        numberSequence = numberSequence.slice(0, totalItemCount);
        console.warn(`Warning: Input sequence longer than declared count. Truncated excess elements.`);
    }

    // Initialize an array to store the calculated adjustment values for each position.
    // Using `let` as this array will be populated in the loop.
    let requiredCompensations = new Array(totalItemCount);

    // The first element in the compensation array is always zero, as there's no preceding element to compare against.
    requiredCompensations[0] = 0;

    // Iterate through the sequence starting from the second element (index 1).
    // The goal is to calculate how much each element `numberSequence[k]` needs to be "reduced"
    // so that it is less than or equal to the *modified* previous element (`numberSequence[k-1] + requiredCompensations[k-1]`).
    // The compensation itself can never be negative.
    for (let k = 1; k < totalItemCount; ++k) {
        // Calculate the effective value of the previous element, considering any prior compensation.
        const currentEffectivePreviousValue = numberSequence[k - 1] + requiredCompensations[k - 1];

        // Determine the raw difference between the effective previous value and the current element.
        // A positive difference means the current element is "too small" relative to the effective previous.
        // A negative difference means the current element is "too large" and needs reduction.
        const rawDifference = currentEffectivePreviousValue - numberSequence[k];

        // The compensation required for the current element is the maximum of zero and this raw difference.
        // This ensures compensation is never negative (i.e., we only account for reductions needed, not additions).
        requiredCompensations[k] = Math.max(0, rawDifference);
    }

    // Sum up all the calculated compensation values.
    // The `reduce` method provides a clean and functional way to achieve this.
    const overallTotalCompensation = requiredCompensations.reduce((accumulator, currentValue) => {
        // Log intermediate steps if debugging is enabled
        // console.log(`Accumulator: ${accumulator}, Current Value: ${currentValue}`);
        return accumulator + currentValue;
    }, 0); // Initialize accumulator to 0.

    // Output the final calculated sum of all compensations.
    console.log(overallTotalCompensation);
}

// Entry point for execution in a Node.js environment.
// This block reads the input from standard input and passes it to the main processing function.
try {
    // Ensure the 'fs' module is available for file system operations.
    const fileSystem = require("fs");
    // Read the entire content of standard input synchronously, decoded as UTF-8.
    const stdInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Invoke our primary function with the collected input.
    computeSequenceAdjustments(stdInputData);
} catch (errorReadingInput) {
    // Catch any errors that occur during the file reading process.
    console.error("Failed to read input from /dev/stdin:", errorReadingInput.message);
    // In a production environment, you might want to exit the process with a non-zero code.
    // process.exit(1);
}