// This module is designed to process textual data provided via standard input.
// Its primary function is to locate a specific character sequence within the text
// and report the length of the first occurrence of that sequence.

/**
 * A utility function responsible for securely obtaining the raw textual content
 * from the system's standard input stream. This function is synchronous.
 *
 * @returns {string} The entire content read from /dev/stdin, decoded as UTF-8.
 * @throws {Error} If there is an issue reading from the file system.
 */
const acquireStandardInputData = () => {
    // Dynamically import the Node.js 'fs' (file system) module.
    const fileSystemHandler = require('fs');

    // Attempt to read the file synchronously. '/dev/stdin' is a common path
    // for standard input on Unix-like systems.
    const rawBufferContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    return rawBufferContent;
};

/**
 * Executes the core logic: analyzes a given string for a specific pattern
 * (starting with 'A' and ending with 'Z', capturing everything between)
 * and then outputs the length of the first found sequence to the console.
 * If no such sequence is detected, it outputs 0.
 *
 * @param {string} incomingTextualPayload - The string data received for analysis.
 * @returns {void} This function performs a side effect by printing to standard output.
 */
const analyzeAndDetermineSequenceLength = (incomingTextualPayload) => {
    // Define the regular expression pattern to search for.
    // '/A.*Z/' means: match 'A', then any character ('.') zero or more times ('*'),
    // followed by 'Z'. This is a greedy match.
    const specificPatternToLocate = /A.*Z/;

    // It's crucial to clean the input by removing any leading or trailing whitespace.
    // This ensures that the pattern matching is applied only to the meaningful content.
    const processedContentString = incomingTextualPayload.trim();

    // Implement a preliminary check: if the string is empty after trimming,
    // there's no possibility of finding the sequence. Output 0 and terminate.
    if (processedContentString.length === 0) {
        console.log(0);
        return; // Early exit strategy.
    }

    // Attempt to find the specified pattern within the cleaned string.
    // The 'match()' method returns an array containing the matched substring(s)
    // if successful, or null if no match is found.
    const detectedPatternOccurrences = processedContentString.match(specificPatternToLocate);

    // Initialize a variable to hold the final length. Default to 0,
    // which is the required output if no sequence is found.
    let calculatedSequenceSpan = 0;

    // Evaluate the result of the pattern matching operation.
    if (detectedPatternOccurrences !== null && detectedPatternOccurrences.length > 0) {
        // If a match is found, the full matched string is at the first index [0]
        // of the returned array.
        const primaryMatchedSegment = detectedPatternOccurrences[0];

        // As a safeguard, confirm that the identified segment is indeed a string.
        // This defensive check adds robustness, though 'match' typically returns strings.
        if (typeof primaryMatchedSegment === 'string') {
            calculatedSequenceSpan = primaryMatchedSegment.length;
        } else {
            // Log an unexpected internal state, indicating a potential issue.
            console.error("Diagnostic: Matched segment type was unexpected.");
        }
    } else {
        // If no occurrences were detected, explicitly confirm the length remains 0.
        // This branch is technically redundant due to initialization but improves clarity.
        calculatedSequenceSpan = 0;
    }

    // Output the final calculated length to the standard output.
    console.log(calculatedSequenceSpan);
};

// This is the main entry point for script execution.
// It orchestrates the retrieval of input and the subsequent analysis.
try {
    // Fetch the raw data from the system's standard input.
    const inputDataBuffer = acquireStandardInputData();

    // Pass the acquired data to the analysis function.
    analyzeAndDetermineSequenceLength(inputDataBuffer);
} catch (operationalError) {
    // In case of any unexpected errors during input acquisition or processing,
    // log the error details for debugging purposes.
    console.error("An unrecoverable error occurred during script execution:", operationalError.message);
    // As per the problem's implicit requirement, output 0 if an error prevents
    // normal processing, to ensure consistent output format.
    console.log(0);
}