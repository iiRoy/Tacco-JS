// This module provides a utility to compare two derived ceiling values from a set of numerical inputs.

/**
 * Processes a raw input string, extracts numerical components, performs calculations,
 * and outputs a comparison result.
 * @param {string} rawInputString - The space-separated string containing four numerical values.
 */
const processInputData = (rawInputString) => {
    // The input string is expected to contain four space-separated numerical values.
    // These values are first split into string components and then converted into a numerical array.
    const stringComponents = rawInputString.trim().split(' ');

    // Basic validation: Ensure we have exactly four components as expected.
    if (stringComponents.length !== 4) {
        console.error("Input processing error: Expected exactly four space-separated values, but received " + stringComponents.length + ".");
        return; // Terminate execution if input format is incorrect.
    }

    const parsedNumericalComponents = stringComponents.map(component => {
        const numericValue = Number(component);
        // Robustness check: Ensure each parsed component is a valid number.
        if (isNaN(numericValue)) {
            throw new Error(`Data parsing exception: Found non-numerical component '${component}' in the input string.`);
        }
        return numericValue;
    });

    // Extract individual components into more descriptive variables for improved readability.
    // These map to the original sp[0], sp[1], sp[2], sp[3].
    const valueA = parsedNumericalComponents[0];
    const valueB = parsedNumericalComponents[1];
    const valueC = parsedNumericalComponents[2];
    const valueD = parsedNumericalComponents[3];

    // Calculate the first ceiling-divided value.
    // This corresponds to the original 'a'.
    const intermediateDivisionResultOne = valueC / valueB;
    const firstDerivedCeilingValue = Math.ceil(intermediateDivisionResultOne);

    // Calculate the second ceiling-divided value.
    // This corresponds to the original 'b'.
    const intermediateDivisionResultTwo = valueA / valueD;
    const secondDerivedCeilingValue = Math.ceil(intermediateDivisionResultTwo);

    // The original 'resultA' and 'resultB' variables were not used in the final comparison,
    // so they have been removed to streamline the code, as per Type III cloning rules.

    // Determine the final comparison status and prepare the output message.
    let finalComparisonStatusMessage;
    if (firstDerivedCeilingValue === secondDerivedCeilingValue) {
        finalComparisonStatusMessage = 'Yes';
    } else {
        finalComparisonStatusMessage = 'No';
    }

    // Display the computed result to the standard output.
    console.log(finalComparisonStatusMessage);
};

// --- Application Entry Point and Input Handling ---

/**
 * Retrieves content from a specified file path.
 * This helper function encapsulates file system operations.
 * @param {string} sourcePath - The path to the file to be read.
 * @returns {string|null} The content of the file as a string, or null if an error occurs.
 */
const retrieveContentFromSource = (sourcePath) => {
    try {
        // Utilize Node.js 'fs' module to synchronously read the file.
        // Expecting UTF-8 encoding for text-based input.
        const fileContent = require('fs').readFileSync(sourcePath, 'utf8');
        return fileContent;
    } catch (fileReadError) {
        // Log an error if file reading fails and return null to indicate failure.
        console.error(`Input file access error: Could not read from '${sourcePath}'. Details: ${fileReadError.message}`);
        return null;
    }
};

// Define the standard input file path.
const systemInputFilePath = '/dev/stdin';

// Attempt to fetch the input data from the system's standard input.
const systemInputContent = retrieveContentFromSource(systemInputFilePath);

// Proceed with processing only if input content was successfully retrieved.
if (systemInputContent !== null) {
    processInputData(systemInputContent);
}

// --- Uncomment the following lines for testing with hardcoded values ---
// processInputData(`10 9 10 10`); // Example 1
// processInputData(`45 4 39 5`); // Example 2
// processInputData(`1 1 1 1`);   // Example 3
// processInputData(`10 3 10 3`); // Example 4: Expects 'Yes' (ceil(10/3)=4, ceil(10/3)=4)
// processInputData(`10 2 10 5`); // Example 5: Expects 'No' (ceil(10/2)=5, ceil(10/5)=2)