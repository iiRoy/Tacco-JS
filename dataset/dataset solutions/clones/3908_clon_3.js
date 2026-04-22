// This module is designed to process a numerical dataset provided via standard input.
// Its primary function is to identify specific median values within the dataset
// and then apply a conditional transformation to each original data point based on these medians.

/**
 * Orchestrates the entire data processing workflow.
 * It reads raw input, parses it, performs calculations, and outputs the transformed data.
 * @param {string} rawInputContent - The complete string content read from the input source.
 */
function ProcessInputData(rawInputContent) {
    // --- Input Validation and Initial Parsing ---

    // Ensure that the input content is not null, undefined, or an empty string.
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: No valid input content was provided. Please check the input source.");
        return; // Terminate execution if input is invalid.
    }

    // Split the entire input string into individual lines.
    // Using a consistent newline character for robustness across different OS.
    const dataLines = rawInputContent.split('\n');

    // Verify that there are at least two lines: one for count, one for data.
    if (dataLines.length < 2) {
        console.error("Error: Input data is incomplete. Expected at least two lines (count and values).");
        return;
    }

    // Attempt to parse the first line as the expected number of elements.
    // Using the unary plus operator for type conversion, which is concise.
    const expectedItemCount = +dataLines[0].trim();

    // Parse the second line, which contains space-separated numeric values.
    // Filter out any potential empty strings that might arise from multiple spaces.
    const rawValueStrings = dataLines[1].split(' ').filter(s => s.length > 0);

    // Convert all string representations of numbers into actual numerical values.
    // Implement basic error handling for non-numeric entries, though the original problem assumes valid numbers.
    const actualNumericValues = rawValueStrings.map(strVal => {
        const numericalForm = Number(strVal);
        if (isNaN(numericalForm)) {
            // In a production system, this might throw an error or log a warning.
            // For this clone, we'll silently skip or assume valid input as per original.
            return null; // Marking invalid entries for removal.
        }
        return numericalForm;
    }).filter(val => val !== null); // Remove any nulls (invalid numbers) from the array.

    // --- Data Integrity Check ---

    // Compare the parsed count with the declared count from the first line.
    const currentItemCount = actualNumericValues.length;
    if (currentItemCount === 0) {
        console.error("Error: No valid numeric items were parsed from the input data line.");
        return;
    }
    if (currentItemCount !== expectedItemCount) {
        console.warn(`Warning: Declared item count (${expectedItemCount}) does not match actual parsed count (${currentItemCount}). Proceeding with actual count.`);
        // We will prioritize the actual number of elements for array operations.
    }

    // A critical assumption for the median calculation in the original problem is an even number of elements.
    // If the count is odd, the median logic (N/2-1, N/2) would need adjustment or is invalid.
    if (currentItemCount % 2 !== 0) {
        console.error(`Error: The total number of elements (${currentItemCount}) is odd. Median calculation requires an even count for this specific problem structure.`);
        // For strict cloning, we'll exit if this condition is not met.
        return;
    }

    // --- Median Calculation ---

    // Create a sorted duplicate of the numeric values.
    // Using the spread syntax `...` ensures a shallow copy before sorting.
    const orderedNumericItems = [...actualNumericValues].sort((first, second) => first - second);

    // Determine the indices for the two central median values.
    // These indices are relevant for an array with an even number of elements.
    const lowerMedianIndex = (currentItemCount / 2) - 1;
    const upperMedianIndex = currentItemCount / 2;

    // Extract the actual values of the two medians.
    const firstCentralValue = orderedNumericItems[lowerMedianIndex];
    const secondCentralValue = orderedNumericItems[upperMedianIndex];

    // --- Transformation Logic ---

    // An array to accumulate the results of the transformation before printing.
    const transformationResults = [];

    // Iterate through each element in the original, unsorted array.
    // The transformation rule is applied based on the comparison with the lower median.
    for (const singleItem of actualNumericValues) {
        let resultantOutput; // Variable to hold the determined output for the current item.

        // If the current item is less than or equal to the first central value,
        // its transformed output becomes the second central value.
        if (singleItem <= firstCentralValue) {
            resultantOutput = secondCentralValue;
        } else {
            // Otherwise (if the item is greater than the first central value),
            // its transformed output becomes the first central value.
            resultantOutput = firstCentralValue;
        }
        transformationResults.push(resultantOutput);
    }

    // --- Output Generation ---

    // Join all the transformed results with newline characters and print them to console.
    console.log(transformationResults.join('\n'));
}

// --- Entry Point and Environment Hook ---

// This block ensures the script can read from standard input in a Node.js environment.
try {
    // Attempt to dynamically load the 'fs' module for file system operations.
    const nodeFileSystem = require('fs');
    // Read the entire content of the standard input as a UTF-8 string.
    const stdInContent = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');
    // Pass the read content to the main processing function.
    ProcessInputData(stdInContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or the main processing.
    console.error(`An unexpected error occurred during execution: ${executionError.message}`);
    // Optionally, log the full stack trace for debugging.
    // console.error(executionError.stack);
}