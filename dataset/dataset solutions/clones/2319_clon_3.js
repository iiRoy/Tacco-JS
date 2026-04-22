const identifyUniqueNumber = (rawInputText) => {
    // This function processes raw string input to determine a unique number
    // based on predefined criteria.

    // Step 1: Normalize and parse the input data.
    // Ensure the input is treated as a string and remove any leading/trailing whitespace.
    const cleanedInputContent = String(rawInputText).trim();

    // Split the cleaned input into an array of lines.
    const contentLines = cleanedInputContent.split('\n');

    // Introduce a guard clause for input integrity.
    // Verify that at least two lines of input are present, as expected.
    if (contentLines.length < 2) {
        console.error("Data processing error: Insufficient input lines. Expected two numeric values.");
        // In a production scenario, this might throw an exception or return a specific error code.
        return;
    }

    // Step 2: Extract and convert the numeric values from the input lines.
    // Use the Number constructor for type coercion, which handles various string formats.
    const firstNumericInput = Number(contentLines[0]);
    const secondNumericInput = Number(contentLines[1]);

    // Define the static collection of candidate numbers.
    // This array represents the universe from which the unique number is to be found.
    const comparisonSet = [1, 2, 3];

    // Step 3: Initialize a variable to store the ultimate result.
    // Using `undefined` initially indicates no result has been found yet.
    let determinedUniqueValue = undefined;

    // Step 4: Iterate through the comparison set to find the desired element.
    // A traditional for-of loop is employed here for explicit control over iteration.
    for (const currentCandidateElement of comparisonSet) {
        // Check if the current candidate is distinct from both provided input numbers.
        // The strict inequality operator (`!==`) is used for robust type checking.
        const isNotFirst = (currentCandidateElement !== firstNumericInput);
        const isNotSecond = (currentCandidateElement !== secondNumericInput);

        if (isNotFirst && isNotSecond) {
            // If the current element is unique, assign it as the result and terminate the loop.
            determinedUniqueValue = currentCandidateElement;
            break; // Exit early as only one such value is expected.
        }
    }

    // Step 5: Output the final determined value.
    // A final check ensures a value was successfully identified before logging.
    if (determinedUniqueValue !== undefined) {
        console.log(determinedUniqueValue);
    } else {
        // This 'else' block serves as a fallback or warning for unexpected scenarios,
        // though given the problem constraints, it should theoretically not be reached.
        console.warn("Processing completed, but a unique value could not be unambiguously determined.");
    }
};

// Main execution entry point.
// Read data from standard input using Node.js 'fs' module and pipe it to the processing function.
try {
    // Explicitly require the 'fs' module for file system operations.
    const fileSystemHandler = require('fs');

    // Synchronously read the entire content from '/dev/stdin' as a UTF-8 string.
    const standardInputBuffer = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Invoke the primary processing function with the obtained input.
    identifyUniqueNumber(standardInputBuffer);
} catch (executionError) {
    // Catch and report any errors that occur during the input reading phase.
    console.error("Fatal error encountered during standard input acquisition:", executionError.message);
    // Indicate an abnormal termination of the script.
    process.exit(1);
}