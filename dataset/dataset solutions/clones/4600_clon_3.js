const analyzeSequenceConnectivity = (sourceDataPayload) => {
    /*
     * This function determines if a specific character-linking pattern
     * exists across three distinct string segments provided in the input payload.
     * The expected input format is a single string containing three
     * space-separated words or phrases.
     *
     * The pattern checks if:
     * 1. The last character of the first segment matches the first character of the second segment.
     * 2. The last character of the second segment matches the first character of the third segment.
     *
     * Returns 'YES' if both conditions are met, otherwise 'NO'.
     */

    const trimAndSplit = (inputStr) => {
        // Helper function to handle trimming and splitting, with basic validation
        const cleanedString = inputStr.trim();
        if (cleanedString.length === 0) {
            console.error("Input data is empty after trimming.");
            return []; // Return an empty array to indicate failure
        }
        return cleanedString.split(' ');
    };

    const retrieveCharacter = (targetString, positionIndicator) => {
        // Helper to safely get a character, using charAt for robustness
        if (!targetString || targetString.length === 0) {
            return undefined; // Indicate no character available
        }
        if (positionIndicator === 'first') {
            return targetString.charAt(0);
        } else if (positionIndicator === 'last') {
            return targetString.charAt(targetString.length - 1);
        }
        return undefined; // Invalid position indicator
    };

    const processedSegments = trimAndSplit(sourceDataPayload);

    // Initial validation: ensure we have exactly three components
    if (processedSegments.length !== 3) {
        console.log('NO');
        return;
    }

    // Assign components to more descriptive variables
    const primaryComponent = processedSegments[0];
    const intermediaryComponent = processedSegments[1];
    const tertiaryComponent = processedSegments[2];

    // Further validation: check for empty components
    if (primaryComponent.length === 0 || intermediaryComponent.length === 0 || tertiaryComponent.length === 0) {
        console.log('NO');
        return;
    }

    // Extract relevant characters using the helper function
    const primaryComponentLastChar = retrieveCharacter(primaryComponent, 'last');
    const intermediaryComponentFirstChar = retrieveCharacter(intermediaryComponent, 'first');
    const intermediaryComponentLastChar = retrieveCharacter(intermediaryComponent, 'last');
    const tertiaryComponentFirstChar = retrieveCharacter(tertiaryComponent, 'first');

    // Check if all character retrievals were successful (i.e., not undefined)
    if ([primaryComponentLastChar, intermediaryComponentFirstChar, intermediaryComponentLastChar, tertiaryComponentFirstChar].includes(undefined)) {
        console.error("Failed to retrieve necessary characters from components.");
        console.log('NO'); // Should not happen with prior length checks, but good for robustness
        return;
    }

    // Evaluate the first linking condition
    const isFirstLinkValid = (primaryComponentLastChar === intermediaryComponentFirstChar);

    // Evaluate the second linking condition
    const isSecondLinkValid = (intermediaryComponentLastChar === tertiaryComponentFirstChar);

    let finalResultIdentifier; // Declare a variable to hold the outcome message

    // Determine the overall outcome based on both conditions
    if (isFirstLinkValid) {
        if (isSecondLinkValid) {
            finalResultIdentifier = 'YES'; // Both conditions are true
        } else {
            finalResultIdentifier = 'NO'; // First true, second false
        }
    } else {
        finalResultIdentifier = 'NO'; // First condition is false
    }

    console.log(finalResultIdentifier); // Output the final determined result
};

// --- Execution Entry Point for Standard Input ---
// This section handles reading data from standard input and passing it
// to the main processing function. Includes basic error handling.

try {
    const fileSystemHandler = require("fs");
    const standardInputPath = "/dev/stdin";
    const contentEncoding = "utf8";

    const rawInputBuffer = fileSystemHandler.readFileSync(standardInputPath, contentEncoding);

    // Call the primary analysis function with the obtained data
    analyzeSequenceConnectivity(rawInputBuffer);

} catch (executionError) {
    // Log any errors encountered during file reading or initial processing
    console.error("An operational error occurred:", executionError.message);
    // In case of an error, it's often safer to output 'NO' for competitive programming
    console.log('NO');
}