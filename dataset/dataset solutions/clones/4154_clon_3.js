function processLexicographicalComparison(inputDataBuffer) {
    // Helper function for consistent lexicographical string comparison in ascending order.
    // This ensures sorting behavior is clearly defined and reusable.
    const compareStringsAscending = (strA, strB) => strA.localeCompare(strB);

    // Step 1: Parse the raw input.
    // The input is expected to be a string containing multiple lines.
    const rawInputLines = String(inputDataBuffer).split('\n');

    // Step 2: Input validation.
    // Ensure that there are at least two lines of input for processing.
    // If not, log an error and return a default 'No' result.
    if (rawInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two distinct strings.");
        console.log('No'); // Default to 'No' for invalid input scenarios.
        return;
    }

    // Step 3: Extract and store the original input strings.
    // These are kept separate for a specific comparison condition later.
    const firstOriginalString = rawInputLines[0];
    const secondOriginalString = rawInputLines[1];

    // Step 4: Prepare character arrays for transformation.
    // Using the spread operator to create new arrays, preventing mutation of original string objects
    // if direct string manipulation were to be added.
    let primaryCharacterSegments = [...firstOriginalString];
    let secondaryCharacterSegments = [...secondOriginalString];

    // Step 5: Transform the first string's characters.
    // The characters are sorted alphabetically (ascending) and then converted
    // into a single comma-separated string representation.
    const sortedPrimaryStringRepresentation = primaryCharacterSegments
        .sort(compareStringsAscending)
        .toString(); // e.g., ['a','b','c'] becomes "a,b,c"

    // Step 6: Transform the second string's characters.
    // First, characters are sorted alphabetically (ascending).
    // Then, the array is reversed to achieve a descending order of characters.
    // Finally, it's converted into a comma-separated string representation.
    const sortedReversedSecondaryStringRepresentation = secondaryCharacterSegments
        .sort(compareStringsAscending) // Sort ascending first (e.g., ['a','b','c'])
        .reverse()                    // Then reverse the array (e.g., ['c','b','a'])
        .toString();                  // Convert to string (e.g., "c,b,a")

    // Step 7: Apply the primary comparison rule.
    // If the two original input strings are identical, the result is 'No'.
    // This is an explicit early exit condition.
    if (firstOriginalString === secondOriginalString) {
        console.log('No');
        return; // Terminate execution as this condition takes precedence.
    }

    // Step 8: Perform the main lexicographical comparison between the transformed strings.
    // The `localeCompare` method is used for robust string comparison.
    // A negative return value indicates that `sortedPrimaryStringRepresentation` comes before
    // `sortedReversedSecondaryStringRepresentation` lexicographically.
    const finalComparisonOutcome = sortedPrimaryStringRepresentation.localeCompare(sortedReversedSecondaryStringRepresentation);

    // Step 9: Output the final result based on the comparison.
    // If the first transformed string is lexicographically "smaller" (comes before)
    // the second transformed string, output 'Yes'. Otherwise, output 'No'.
    if (finalComparisonOutcome < 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Entry point for the application when executed in a Node.js environment.
// This block handles reading input from standard I/O (typically /dev/stdin in competitive programming).
try {
    // Dynamically load the 'fs' module for file system operations.
    const fileSystemUtility = require('fs');
    // Read the entire content of the standard input stream, assuming UTF-8 encoding.
    const standardInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    // Invoke the main processing function with the collected input.
    processLexicographicalComparison(standardInputContent);
} catch (executionError) {
    // Catch and report any errors that occur during the file reading or main processing.
    // Provide a fallback 'No' output in case of unhandled exceptions.
    console.error("An unexpected error occurred during program execution:", executionError.message);
    console.log('No'); // Default error handling output.
}