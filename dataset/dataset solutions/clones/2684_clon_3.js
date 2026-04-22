// This module processes a sequence of numerical values to determine if it can be made non-decreasing
// by applying a specific modification rule.
// The rule allows decrementing an element by one if it is exactly one greater than its right neighbor.
function EvaluateSequence(receivedPayload) {
    // --- Input Validation and Parsing ---

    // Ensure the input data is a valid string and not empty.
    if (typeof receivedPayload !== 'string' || receivedPayload.trim().length === 0) {
        // Log an error and terminate if the input is unusable.
        console.error("Input processing error: The provided payload is empty or not a valid string.");
        return;
    }

    // Divide the raw input string into individual lines.
    const dataLines = receivedPayload.split("\n");

    // We expect at least two lines: one for the count, one for the values.
    if (dataLines.length < 2) {
        console.error("Input processing error: Insufficient data lines. Expected at least two.");
        return;
    }

    // Parse the first line to get the expected number of elements in the sequence.
    // Using trim() to remove any leading/trailing whitespace before parsing.
    const anticipatedElementCount = parseInt(dataLines[0].trim(), 10);

    // Validate the parsed count. It must be a positive integer.
    if (isNaN(anticipatedElementCount) || anticipatedElementCount <= 0) {
        console.error("Input processing error: Invalid or non-positive element count detected.");
        return;
    }

    // Parse the second line, splitting it by spaces and converting each part to a number.
    // The .map(Number) ensures all elements are numeric for arithmetic operations.
    const numericSequence = dataLines[1].trim().split(" ").map(Number);

    // Optional: Cross-check if the actual number of elements matches the anticipated count.
    if (numericSequence.length !== anticipatedElementCount) {
        console.warn(`Data mismatch warning: Declared element count (${anticipatedElementCount}) does not match actual sequence length (${numericSequence.length}).`);
        // If the actual length is less than expected, it might indicate incomplete data.
        if (numericSequence.length < anticipatedElementCount) {
            console.error("Data processing error: Actual sequence length is less than the declared count. Aborting.");
            return;
        }
        // If actual length is more, we will proceed using the anticipated count as the loop boundary.
    }

    // --- Core Logic for Sequence Evaluation ---

    // Initialize a flag to track if the sequence can be made non-decreasing.
    // Assume it's feasible until a violation is found.
    let isTransformable = true;

    // Iterate through the sequence from right to left (second-to-last element down to the first).
    // This approach is crucial because modifying an element affects its comparison with the one to its left.
    for (let currentPositionIndex = anticipatedElementCount - 1; currentPositionIndex > 0; --currentPositionIndex) {
        // Retrieve the value at the current position and the value immediately preceding it.
        const rightwardValue = numericSequence[currentPositionIndex];
        let leftwardValue = numericSequence[currentPositionIndex - 1]; // Use 'let' as this value might be modified.

        // Perform basic validation for numeric values within the sequence.
        if (isNaN(rightwardValue) || isNaN(leftwardValue)) {
            console.error(`Runtime error: Non-numeric element found at index ${currentPositionIndex - 1} or ${currentPositionIndex}.`);
            isTransformable = false; // Mark as non-transformable due to bad data.
            break; // Exit the loop immediately.
        }

        // Calculate the difference between the leftward and rightward values.
        const valueDifference = leftwardValue - rightwardValue;

        // Condition 1: If the difference is greater than 1, the transformation is impossible.
        // We can only decrement by one, so a difference of 2 or more cannot be resolved.
        if (valueDifference > 1) {
            isTransformable = false; // Set the flag to false.
            break; // No need to continue checking, as the sequence is already invalid.
        }
        // Condition 2: If the difference is exactly 1, we must apply the allowed decrement.
        else if (valueDifference === 1) {
            // Decrement the leftward value by 1.
            // This modification is applied directly to the numericSequence array.
            numericSequence[currentPositionIndex - 1] = leftwardValue - 1;
        }
        // Condition 3: If the difference is 0 or negative (leftwardValue <= rightwardValue),
        // the sequence is already non-decreasing at this point, so no action is required.
        // The loop simply proceeds to the next pair of elements.
    }

    // --- Output Generation ---

    // Based on the final state of the 'isTransformable' flag,
    // determine the output string ('Yes' or 'No').
    const finalResultString = isTransformable ? 'Yes' : 'No';

    // Print the result to the console.
    console.log(finalResultString);
}

// --- Standard Input Handling (Do Not Edit Below This Line) ---
// This part is responsible for reading input from stdin and invoking the main processing function.
EvaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));