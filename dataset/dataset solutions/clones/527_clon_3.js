// This module performs a specialized calculation based on numerical input from standard input.
// It's designed to process a sequence of numbers, filter them, and then compute a weighted minimum
// value by iterating through the processed dataset.

// Utilize the Node.js file system module to interact with file descriptors, specifically standard input.
const fileSystemAccess = require('fs');

/**
 * Executes the primary logic: reads input, parses data, performs calculations, and outputs the result.
 * This function encapsulates the entire workflow for better organization and reusability.
 */
function initiateDataProcessingAndOutput() {
    let rawContentFromStdin;
    try {
        // Attempt to synchronously read all data from the standard input stream.
        // It's crucial that the input is UTF-8 encoded for proper string handling.
        rawContentFromStdin = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        // In a production environment, this error would likely be logged more thoroughly,
        // and the process might exit with a non-zero status code.
        console.error("Failed to acquire input from standard device:", ioError.message);
        return; // Terminate execution if input cannot be read.
    }

    // Clean up the raw input: remove leading/trailing whitespace and segment into an array of lines.
    const inputLinesArray = rawContentFromStdin.trim().split("\n");

    // Implement a basic validation check: ensure there's at least one line for configuration.
    if (inputLinesArray.length === 0) {
        console.error("Processing aborted: No input lines were detected.");
        return;
    }

    // Extract the initial configuration parameters from the very first line of input.
    // Each parameter is converted to an integer using parseInt with a radix for explicit base-10 conversion.
    const primaryConfigurationValues = inputLinesArray.shift().split(" ").map(strValue => parseInt(strValue, 10));

    // Assign the parsed configuration values to descriptively renamed variables.
    // 'adjustedN' corresponds to the original 'n', 'dataPointCount' to 'm', and 'focusPointP' to 'p'.
    const adjustedN = primaryConfigurationValues[0] - 1;
    const dataPointCount = primaryConfigurationValues[1];
    const focusPointP = primaryConfigurationValues[2];

    // Initialize an array that will hold the filtered and relevant numerical data points.
    let filteredNumericData = [];

    // Iterate through the subsequent input lines, processing 'm' data points.
    // A 'while' loop is used here as an alternative to the original 'for' loop structure.
    let currentInputItemIndex = 0;
    while (currentInputItemIndex < dataPointCount && inputLinesArray.length > 0) {
        // Parse each line as an integer.
        const currentNumericalDatum = parseInt(inputLinesArray.shift(), 10);

        // A key filtering step: only include data points that are not equal to 'focusPointP'.
        // This prevents 'focusPointP' from being duplicated in the initial filtering phase.
        if (currentNumericalDatum !== focusPointP) {
            filteredNumericData.push(currentNumericalDatum);
        }
        currentInputItemIndex++;
    }

    // After filtering, explicitly add 'focusPointP' to the collection.
    // This ensures 'focusPointP' is always present in the dataset for subsequent calculations.
    filteredNumericData.push(focusPointP);

    // Sort the entire collection of data points in ascending numerical order.
    // An arrow function provides a concise syntax for the sort comparison.
    filteredNumericData.sort((valA, valB) => valA - valB);

    // Initialize the variable that will store the lowest calculated value.
    // Using Number.POSITIVE_INFINITY ensures any valid calculated value will be smaller.
    let overallCalculatedMinimum = Number.POSITIVE_INFINITY;

    // Define a small helper function to update the minimum value.
    // This is an example of adding a new code fragment (a utility function).
    const updateMinimum = (currentMin, candidateValue) => Math.min(currentMin, candidateValue);

    const totalDataPoints = filteredNumericData.length;

    // Iterate through each element of the sorted data array to perform the core calculation logic.
    // A traditional 'for' loop is used here to demonstrate structural variation from `forEach`.
    for (let currentElementIndex = 0; currentElementIndex < totalDataPoints; currentElementIndex++) {
        const observedCurrentValue = filteredNumericData[currentElementIndex];

        // --- Calculation Logic Branch 1: When the observed value is less than the focus point (v < p) ---
        if (observedCurrentValue < focusPointP) {
            // This specific calculation is only relevant if the observed value is not the very first element.
            if (currentElementIndex !== 0) {
                const previousValueInArray = filteredNumericData[currentElementIndex - 1];
                // Break down the complex expression into intermediate, named parts for readability.
                const componentOne = (focusPointP - observedCurrentValue) * 2;
                const componentTwo = (adjustedN - focusPointP + 1);
                const componentThree = previousValueInArray;
                overallCalculatedMinimum = updateMinimum(overallCalculatedMinimum, componentOne + componentTwo + componentThree);
            }
        }
        // --- Calculation Logic Branch 2: When the observed value is equal to the focus point (v == p) ---
        else if (observedCurrentValue === focusPointP) {
            // Introduce a common sub-expression as a constant for clarity within this block.
            const N_MINUS_P_PLUS_ONE_TERM = adjustedN - focusPointP + 1;

            // Scenario 2a: If 'focusPointP' is the first element in the sorted array.
            if (currentElementIndex === 0) {
                overallCalculatedMinimum = updateMinimum(overallCalculatedMinimum, filteredNumericData[totalDataPoints - 1] - observedCurrentValue);
            }

            // Scenario 2b: If 'focusPointP' is the last element in the sorted array.
            if (currentElementIndex === totalDataPoints - 1) {
                overallCalculatedMinimum = updateMinimum(overallCalculatedMinimum, observedCurrentValue - filteredNumericData[0]);
            }

            // Scenario 2c: If 'focusPointP' is not the last element.
            if (currentElementIndex !== totalDataPoints - 1) {
                const nextValueInArray = filteredNumericData[currentElementIndex + 1];
                overallCalculatedMinimum = updateMinimum(overallCalculatedMinimum, focusPointP + adjustedN - nextValueInArray + 1);
            }

            // Scenario 2d: If 'focusPointP' is not the first element.
            if (currentElementIndex !== 0) {
                const previousValueInArray = filteredNumericData[currentElementIndex - 1];
                overallCalculatedMinimum = updateMinimum(overallCalculatedMinimum, N_MINUS_P_PLUS_ONE_TERM + previousValueInArray);
            }
        }
        // --- Calculation Logic Branch 3: When the observed value is greater than the focus point (v > p) ---
        else { // This 'else' implicitly covers observedCurrentValue > focusPointP
            // This calculation is only relevant if the observed value is not the very last element.
            if (currentElementIndex !== totalDataPoints - 1) {
                const nextValueInArray = filteredNumericData[currentElementIndex + 1];
                // Again, breaking down for improved readability.
                const partAlpha = (observedCurrentValue - focusPointP) * 2;
                const partBeta = focusPointP;
                const partGamma = (adjustedN - nextValueInArray + 1);
                overallCalculatedMinimum = updateMinimum(overallCalculatedMinimum, partAlpha + partBeta + partGamma);
            }
        }
    }

    // A final validation step: if the minimum remains at its initial infinite value,
    // it indicates an issue or an edge case not handled by the calculation logic.
    if (overallCalculatedMinimum === Number.POSITIVE_INFINITY) {
        console.error("Warning: The minimum calculation did not yield a finite result. Review input constraints or algorithm.");
    }

    // Output the final calculated minimum, scaled by a factor of 100.
    // Using `process.stdout.write` for a different I/O method compared to `console.log`.
    process.stdout.write(String(overallCalculatedMinimum * 100) + '\n');
}

// Invoke the main processing function to start the application.
initiateDataProcessingAndOutput();