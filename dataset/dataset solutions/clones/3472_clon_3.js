// A module-scoped array to hold our numeric data bins for processing.
let numericDataBins;

/**
 * Adjusts a value at a specified source index and transfers a calculated portion
 * of it to a target destination index within the global `numericDataBins` array.
 * This function ensures that the value at the source index is even before division,
 * and performs an integer division, adding the result to the target index.
 *
 * @param {number} sourceIndex - The zero-based index in `numericDataBins` from which to retrieve and modify a value.
 * @param {number} targetIndex - The zero-based index in `numericDataBins` to which the processed value will be added.
 */
function processValueTransfer(sourceIndex, targetIndex) {
    // Retrieve the current numeric value from the specified source bin.
    let currentValueAtSource = numericDataBins[sourceIndex];

    // Before dividing, ensure the value is even. If it's odd, decrement it by one.
    // This step is crucial for maintaining consistent integer division behavior.
    const isSourceValueOdd = (currentValueAtSource % 2 !== 0);
    if (isSourceValueOdd) {
        currentValueAtSource--; // Decrement to make it an even number.
    }

    // Perform an integer division by two on the (potentially adjusted) source value.
    // Math.floor is used to explicitly handle potential floating-point results,
    // ensuring the result is an integer, consistent with common integer arithmetic.
    const calculatedTransferAmount = Math.floor(currentValueAtSource / 2);

    // Update the source bin with its new, divided value.
    numericDataBins[sourceIndex] = calculatedTransferAmount;

    // Add the calculated transfer amount to the value currently stored in the target bin.
    numericDataBins[targetIndex] += calculatedTransferAmount;
}

/**
 * The primary execution function that orchestrates the simulation.
 * It parses the input string, initializes the data bins, and runs a
 * series of iterative value transfers based on the parsed parameters.
 *
 * @param {string} programInputString - The raw string input, typically read from stdin.
 *                                      Expected format: a single line of space-separated numbers.
 */
function runNumericSimulation(programInputString) {
    // --- Input Validation and Parsing ---

    // Validate that the input is a non-empty string.
    if (typeof programInputString !== 'string' || programInputString.trim().length === 0) {
        console.error("InputError: The provided program input string is invalid or empty. Exiting simulation.");
        return; // Terminate execution if input is bad.
    }

    // Extract the first line from the input string, as subsequent lines are ignored.
    const inputFirstLine = programInputString.split('\n')[0];

    // Split the first line by one or more whitespace characters to get string tokens.
    const rawStringTokens = inputFirstLine.split(/\s+/);

    // Convert each string token into an integer and populate the `numericDataBins` array.
    // Using `parseInt` with radix 10 ensures correct integer conversion.
    numericDataBins = rawStringTokens.map(token => parseInt(token, 10));

    // Validate that there are at least three initial numbers as expected by the logic.
    if (numericDataBins.length < 3) {
        console.error("InputError: Insufficient numeric values provided. At least three numbers are required. Exiting simulation.");
        return;
    }

    // The third element (at index 2) of `numericDataBins` specifies the total number of iterations.
    const totalSimulationCycles = numericDataBins[2];

    // Validate the `totalSimulationCycles` to ensure it's a valid non-negative number.
    if (isNaN(totalSimulationCycles) || totalSimulationCycles < 0) {
        console.error("InputError: The specified total simulation cycles is invalid. Must be a non-negative number. Exiting simulation.");
        return;
    }

    // --- Iterative Simulation Logic ---

    // Loop through the simulation for the specified number of cycles.
    // The loop counter starts at 1 and goes up to and including `totalSimulationCycles`.
    for (let currentCycleNumber = 1; currentCycleNumber <= totalSimulationCycles; currentCycleNumber++) {
        // Determine whether the current cycle number is odd or even.
        const isCurrentCycleOdd = (currentCycleNumber % 2 !== 0);

        // Based on the parity of the cycle number, call `processValueTransfer`
        // with different source and target indices.
        if (isCurrentCycleOdd) {
            // If the cycle is odd, transfer from bin 0 to bin 1.
            processValueTransfer(0, 1);
        } else {
            // If the cycle is even, transfer from bin 1 to bin 0.
            processValueTransfer(1, 0);
        }
    }

    // --- Output Final Results ---

    // Log the final computed values of the first two bins (`numericDataBins[0]` and `numericDataBins[1]`).
    // Using template literals for a clean and readable output format.
    console.log(`${numericDataBins[0]} ${numericDataBins[1]}`);
}

// --- Program Entry Point and Error Handling ---

// The program starts here. It attempts to read input from standard input
// and then executes the main simulation function.
try {
    // Dynamically require the 'fs' (file system) module for reading files.
    const fileSystemModule = require("fs");

    // Read the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
    const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Invoke the main simulation function with the content read from stdin.
    runNumericSimulation(stdinContent);
} catch (executionError) {
    // Catch any errors that occur during file reading or the simulation process.
    console.error("RuntimeError: An unexpected error occurred during program execution:", executionError.message);
    // Optionally, log the full error stack for debugging purposes.
    // console.error(executionError.stack);
}