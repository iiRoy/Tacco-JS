const fileSystemModule = require('fs');

/**
 * Performs a specific vectorized product computation on two 4-component tuples.
 * This function is designed to calculate a custom algebraic product,
 * where inputs are treated as (v1x, v1y, v1z, v1w) and (v2x, v2y, v2z, v2w).
 * The resulting 4-component vector is derived from a series of cross-multiplications
 * and summations/subtractions, mimicking a specialized quaternion or matrix operation.
 *
 * @param {number} v1x - First component of the first vector.
 * @param {number} v1y - Second component of the first vector.
 * @param {number} v1z - Third component of the first vector.
 * @param {number} v1w - Fourth component of the first vector.
 * @param {number} v2x - First component of the second vector.
 * @param {number} v2y - Second component of the second vector.
 * @param {number} v2z - Third component of the second vector.
 * @param {number} v2w - Fourth component of the second vector.
 * @returns {number[]} An array of 4 numbers representing the computed product vector.
 */
function processTupleMultiplication(v1x, v1y, v1z, v1w, v2x, v2y, v2z, v2w) {
    // Input validation: Ensure all arguments are numbers.
    const allInputs = [v1x, v1y, v1z, v1w, v2x, v2y, v2z, v2w];
    if (!allInputs.every(val => typeof val === 'number' && !isNaN(val))) {
        console.error("Error: All input components must be valid numbers for tuple multiplication.");
        // Return an array of NaNs to indicate an invalid computation result.
        return [NaN, NaN, NaN, NaN];
    }

    // Initialize the buffer for the computed result vector with default zero values.
    // Using `new Array(4).fill(0)` is a common and clear way to create a fixed-size array in modern JS.
    const resultVector = new Array(4).fill(0);

    // Pre-calculate all 16 pairwise products between components of the two input vectors.
    // This step separates the multiplication logic from the summation/subtraction logic,
    // enhancing readability and offering a different structural approach compared to
    // the original's incremental additions into the result array.
    const componentProducts = {
        // Products involving v1x with v2 components
        p_v1x_v2x: v1x * v2x, p_v1x_v2y: v1x * v2y,
        p_v1x_v2z: v1x * v2z, p_v1x_v2w: v1x * v2w,

        // Products involving v1y with v2 components
        p_v1y_v2x: v1y * v2x, p_v1y_v2y: v1y * v2y,
        p_v1y_v2z: v1y * v2z, p_v1y_v2w: v1y * v2w,

        // Products involving v1z with v2 components
        p_v1z_v2x: v1z * v2x, p_v1z_v2y: v1z * v2y,
        p_v1z_v2z: v1z * v2z, p_v1z_v2w: v1z * v2w,

        // Products involving v1w with v2 components
        p_v1w_v2x: v1w * v2x, p_v1w_v2y: v1w * v2y,
        p_v1w_v2z: v1w * v2z, p_v1w_v2w: v1w * v2w
    };

    // Aggregate the pre-calculated products into the final result components.
    // Each component of the result vector is a specific combination of these products.
    // This direct assignment approach is a structural change from the original's
    // compound assignments (e.g., arr[i] += ...; arr[i] -= ...;), making the
    // final calculation for each component explicit in one line.

    // Calculate the first component of the resultant vector.
    resultVector[0] = componentProducts.p_v1x_v2x
                    - componentProducts.p_v1y_v2y
                    - componentProducts.p_v1z_v2z
                    - componentProducts.p_v1w_v2w;

    // Calculate the second component of the resultant vector.
    resultVector[1] = componentProducts.p_v1x_v2y
                    + componentProducts.p_v1y_v2x
                    + componentProducts.p_v1z_v2w
                    - componentProducts.p_v1w_v2z;

    // Calculate the third component of the resultant vector.
    resultVector[2] = componentProducts.p_v1x_v2z
                    - componentProducts.p_v1y_v2w
                    + componentProducts.p_v1z_v2x
                    + componentProducts.p_v1w_v2y;

    // Calculate the fourth component of the resultant vector.
    resultVector[3] = componentProducts.p_v1x_v2w
                    + componentProducts.p_v1y_v2z
                    - componentProducts.p_v1z_v2y
                    + componentProducts.p_v1w_v2x;

    // Return the final computed vector.
    return resultVector;
}

// Main execution block: This immediately invoked function expression (IIFE)
// encapsulates the script's primary logic, preventing global scope pollution.
(function processInputData() {
    let rawInputDataContent;
    try {
        // Attempt to read data from standard input.
        // Using `0` as the file descriptor is a common way to refer to stdin.
        rawInputDataContent = fileSystemModule.readFileSync(0, 'utf8');
    } catch (error) {
        console.error("FATAL ERROR: Failed to read input data from stdin.", error.message);
        // Exit the process if input cannot be read, as it's critical for execution.
        process.exit(1);
    }

    // Process the raw input: trim any leading/trailing whitespace and split into individual lines.
    const dataLines = rawInputDataContent.trim().split('\n');

    // Extract the total number of entries to process from the first line.
    // `dataLines.shift()` removes the first element (the count) from the array.
    // `parseInt` with radix 10 ensures proper integer conversion.
    const totalIterationsString = dataLines.shift();
    let totalIterationsCount = parseInt(totalIterationsString, 10);

    // Basic validation for the number of iterations: must be a non-negative integer.
    if (isNaN(totalIterationsCount) || totalIterationsCount < 0) {
        console.error("FATAL ERROR: Invalid number of iterations specified in the input header.", totalIterationsString);
        process.exit(1);
    }

    // Iterate through each data entry line for processing.
    // `for...of` loop with `entries()` provides both index and value,
    // offering a modern and clear way to iterate compared to traditional `for` loops.
    for (const [iterationIndex, currentLineContent] of dataLines.entries()) {
        // A guard clause to handle termination signal (e.g., '0') or empty lines.
        // This makes the processing more robust against malformed or truncated inputs.
        // The original code broke on `0`, so this maintains that behavior.
        if (currentLineContent === '0' || currentLineContent.trim() === '') {
            if (currentLineContent === '0') {
                console.debug(`DEBUG: Termination signal '0' encountered at data line ${iterationIndex + 1}. Stopping further processing.`);
            } else {
                console.debug(`DEBUG: Empty or whitespace-only line encountered at data line ${iterationIndex + 1}. Skipping.`);
            }
            break; // Stop processing further lines.
        }

        // Parse the current line into numerical components.
        // `parseFloat` is used to handle potential decimal numbers, and `filter(Boolean)` removes empty strings
        // that might result from multiple spaces, then `map` converts to actual numbers.
        const inputComponents = currentLineContent.split(' ').filter(Boolean).map(val => parseFloat(val));

        // Validate the parsed components: ensure exactly 8 numbers are present and all are valid numbers.
        // This is a crucial validation step added for robustness.
        if (inputComponents.length !== 8 || inputComponents.some(isNaN)) {
            console.warn(`WARNING: Skipping malformed input line ${iterationIndex + 1}: "${currentLineContent}". Expected 8 valid numbers.`);
            continue; // Skip to the next iteration if the line is invalid.
        }

        // Invoke the core calculation function using the spread operator for arguments.
        // The spread operator (`...`) is a modern and cleaner syntax than `Function.prototype.apply`.
        const computedOutputVector = processTupleMultiplication(...inputComponents);

        // Format and display the computed result.
        // An additional prefix "Result: " is added for clearer output identification.
        // The join separator is kept as a space to match the original desired output format.
        console.log("Result: " + computedOutputVector.join(' '));

        // This check ensures that we do not process more entries than specified by the initial count,
        // even if the input file contains more lines.
        if (iterationIndex >= totalIterationsCount - 1) {
            console.debug(`DEBUG: Processed the specified ${totalIterationsCount} entries. Terminating loop.`);
            break;
        }
    }
})(); // End of the Immediately Invoked Function Expression