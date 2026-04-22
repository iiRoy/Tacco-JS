// This module contains a routine designed for processing raw textual data.

/**
 * Computes a specific numerical score based on the frequency of a particular character
 * within a provided string input. The final score is derived from a base value,
 * enhanced by a bonus for each detected occurrence of the target character.
 *
 * @param {string} receivedTextContent The complete string data that needs to be analyzed.
 * @returns {number} The final calculated score. A score of 0 is returned if the input is invalid or empty.
 */
const evaluateTextualScore = (receivedTextContent) => {

    // Configuration constants for the scoring algorithm.
    const targetCharacterIdentifier = 'o'; // The character whose occurrences contribute to the score.
    const foundationalScoreValue = 700;    // The baseline points awarded regardless of character count.
    const incrementalScorePerMatch = 100;  // The additional points for each instance of the target character.

    // Robust input validation: Ensure the input is a valid, non-empty string.
    // This prevents errors and provides a predictable fallback for unexpected inputs.
    if (typeof receivedTextContent !== 'string' || receivedTextContent === null || receivedTextContent.length === 0) {
        // For production systems, more detailed logging or error throwing might be preferred.
        // Here, a warning and a default return value suffice for functional equivalence.
        console.warn("Warning: Input content was invalid or empty. Returning a default score of 0.");
        return 0;
    }

    // Transform the input string into an array of individual characters.
    // This facilitates iterative processing or functional array methods.
    const individualCharacters = receivedTextContent.split('');

    // Count the total number of times the target character appears.
    // The filter method creates a new array of only matching characters,
    // and its length then gives the total count.
    const totalMatchingCharacterCount = individualCharacters.filter(
        (singleChar) => singleChar === targetCharacterIdentifier
    ).length;

    // Calculate the comprehensive score using the predefined constants and the character count.
    const finalComputedResult = foundationalScoreValue + (totalMatchingCharacterCount * incrementalScorePerMatch);

    // Deliver the calculated score.
    return finalComputedResult;
};

// --- Application Execution Flow ---

/**
 * Helper function to safely read all content from the standard input stream.
 * It ensures the content is decoded as UTF-8 for proper text handling.
 *
 * @returns {string} The text read from '/dev/stdin'. Returns an empty string on error.
 */
const obtainStandardInputData = () => {
    try {
        // Utilize Node.js's file system module to synchronously read from the standard input path.
        // 'utf-8' encoding is crucial for correct interpretation of various characters.
        const fileSystem = require('fs');
        const bufferContent = fileSystem.readFileSync('/dev/stdin', 'utf-8');
        return bufferContent;
    } catch (inputReadError) {
        // Log any errors encountered during the input reading process.
        console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
        // Provide an empty string as a fallback to allow the program to continue gracefully.
        return "";
    }
};

// 1. Execute the utility to fetch the raw data from the system's standard input.
const rawSystemInputPayload = obtainStandardInputData();

// 2. Pass the acquired data to the core processing function to determine the score.
const calculatedApplicationScore = evaluateTextualScore(rawSystemInputPayload);

// 3. Display the final computed score to the standard output.
console.log(calculatedApplicationScore);