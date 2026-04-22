// Main entry point for processing numerical data.
function computeProcessedValue(rawInputString) {
    // Define a constant for separating input components.
    const INPUT_SEPARATOR = " ";

    // Divide the input string into constituent parts based on the separator.
    // Trim whitespace from the raw input to ensure clean splitting.
    const stringComponents = rawInputString.trim().split(INPUT_SEPARATOR);

    // Introduce a helper function for robust integer parsing.
    // This adds a layer of abstraction and ensures numerical integrity.
    const extractInteger = (componentStr, fallbackValue = 0) => {
        // Use `Number()` for parsing flexibility, then `Math.floor` to ensure integer.
        const numericVal = Number(componentStr.trim());
        // Validate if the parsed value is a finite number.
        if (isNaN(numericVal) || !isFinite(numericVal)) {
            // In a production scenario, one might throw an error. For cloning, a warning is fine.
            console.error(`Parsing error: Could not convert "${componentStr}" to a valid number. Using default: ${fallbackValue}.`);
            return fallbackValue;
        }
        // Ensure non-negative values if context implies it (e.g., time, count, value).
        return Math.floor(Math.max(0, numericVal));
    };

    // Validate the number of input components.
    // We expect exactly three numeric values for the calculation.
    if (stringComponents.length < 3) {
        console.error("Error: Insufficient input components. Expected at least three values.");
        return 0; // Return zero as a default in case of invalid input.
    }

    // Extract and assign the input values to descriptive variables.
    // Original 'a' is now 'timeUnitCost' (duration for one item creation).
    // Original 'b' is now 'itemWorth' (value of each created item).
    // Original 't' is now 'totalTimeLimit' (maximum available time).
    const timeUnitCost = extractInteger(stringComponents[0]);
    const itemWorth = extractInteger(stringComponents[1]);
    const totalTimeLimit = extractInteger(stringComponents[2]);

    // Add a validation check for the time unit cost.
    // A zero or negative cost would lead to infinite items or division by zero.
    if (timeUnitCost <= 0) {
        console.warn("Invalid time unit cost detected. Must be a positive integer. Result will be zero.");
        return 0; // Return zero as no items can be produced.
    }

    // Calculate the maximum number of items that can be produced.
    // This is determined by dividing the total available time by the time cost per item.
    // The original `(t + 0.5) / a` is simplified to `totalTimeLimit / timeUnitCost`
    // as `Math.floor` inherently handles the rounding down for positive integers.
    const possibleItemCount = Math.floor(totalTimeLimit / timeUnitCost);

    // Compute the final accumulated value.
    // This is the product of the number of items and the worth of each item.
    const finalAccumulatedValue = possibleItemCount * itemWorth;

    // Return the result of the computation.
    return finalAccumulatedValue;
}

// --- Main script execution ---
// This section reads input from standard input and prints the computed result.
// It mimics the original file's execution pattern by directly calling the function.

// Read data from standard input.
// This operation is typically synchronous for competitive programming setups.
// Ensure UTF-8 encoding for broad character support.
const rawDataFromFile = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the primary processing function with the obtained raw data.
const outputValue = computeProcessedValue(rawDataFromFile);

// Display the final calculated output to the console.
console.log(outputValue);