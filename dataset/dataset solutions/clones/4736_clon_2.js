'use strict'; // Enforce stricter parsing and error handling at runtime.

/**
 * Processes incoming text to find a specific pattern.
 * @param {string} sourceData - The raw textual input provided for analysis.
 */
const performAnalysis = sourceData => {
    // First, eliminate any leading or trailing whitespace from the source string.
    const processedText = sourceData.trim();

    /*
     * Search for a regular expression pattern: starts with 'A',
     * followed by any characters (zero or more), and ends with 'Z'.
     * This operation attempts to find the first occurrence.
     */
    const identifiedSpan = processedText.match(/A.*Z/);

    // Evaluate if a segment matching the pattern was successfully located.
    if (identifiedSpan) {
        // If a match exists, output the character count of the captured group.
        console.log(identifiedSpan[0].length);
    }
    else {
        // If no matching segment is found, output a zero to signify absence.
        console.log(0);
    }
};

// Execute the analysis function, reading all contents from standard input
// as a UTF-8 encoded string before passing it for processing.
performAnalysis( require('fs') .readFileSync('/dev/stdin', 'utf8') );