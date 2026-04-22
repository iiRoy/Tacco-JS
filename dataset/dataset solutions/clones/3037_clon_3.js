'use strict'; // Enforces stricter parsing and error handling for the entire script.

/**
 * Utility function designed to count the total number of times a specific
 * character appears within a given string. This provides a clear and
 * reusable mechanism for character frequency analysis.
 *
 * @param {string} sourceText - The string in which to search for the character.
 * @param {string} characterToLocate - The single character whose occurrences are to be counted.
 * @returns {number} The total count of the specified character within the sourceText.
 */
function tallyCharacterInstances(sourceText, characterToLocate) {
    let currentCount = 0; // Initialize a counter for the character.
    // Iterate through each character of the provided source string.
    for (let index = 0; index < sourceText.length; index++) {
        // If the character at the current index matches the target character, increment the counter.
        if (sourceText[index] === characterToLocate) {
            currentCount++;
        }
    }
    return currentCount; // Return the final tally.
}

/**
 * Core processing function that analyzes a multi-line input string.
 * It specifically targets the second line to find a unique pattern
 * consisting of repeating '#' and '.' sequences. Once found, it calculates
 * the minimum count between the '#' symbols and '.' symbols within that pattern.
 * Handles various edge cases like insufficient input or no pattern match.
 *
 * @param {string} rawInputBuffer - The complete string content read from the input source.
 */
function evaluateSymbolFrequencies(rawInputBuffer) {
    // Begin by sanitizing the raw input: remove any leading or trailing whitespace.
    const sanitizedContent = rawInputBuffer.trim();
    // Deconstruct the cleaned content into an array of individual lines.
    const contentLinesArray = sanitizedContent.split('\n');

    // --- Initial Input Validation ---
    // A critical check: ensure that the input contains at least two lines,
    // as the problem specifies processing the second line (index 1).
    if (contentLinesArray.length < 2) {
        console.error("Execution Error: Input data is incomplete. Expected at least two lines for processing.");
        // In cases of insufficient input, the meaningful counts are zero.
        console.log(0);
        return; // Terminate execution gracefully.
    }

    // Identify the specific line for pattern analysis, which is the second line.
    const relevantLineForAnalysis = contentLinesArray[1];

    // Define the regular expression to identify the target pattern.
    // The pattern consists of one or more '#' characters followed by one or more '.' characters,
    // and this entire sequence must repeat one or more times.
    const searchPatternRegex = /(?:#+\.+)+/;

    // Attempt to locate the defined pattern within the relevant line.
    const patternDiscoveryResult = relevantLineForAnalysis.match(searchPatternRegex);

    // --- Pattern Match Validation ---
    // If no pattern is found, or the result is empty/null, it implies no relevant data.
    if (!patternDiscoveryResult || patternDiscoveryResult.length === 0 || !patternDiscoveryResult[0]) {
        // Log a zero count as no matching pattern was identified.
        console.log(0);
        return; // Exit the function as there's nothing further to analyze.
    }

    // Extract the complete string that matched the pattern.
    // The first element of the match array ([0]) holds the full matched text.
    const identifiedPatternSegment = patternDiscoveryResult[0];

    // --- Character Counting Within Pattern ---
    // Utilize the helper function to count the occurrences of '.' characters.
    let periodCharacterCount = tallyCharacterInstances(identifiedPatternSegment, '.');

    // Utilize the helper function to count the occurrences of '#' characters.
    let hashCharacterCount = tallyCharacterInstances(identifiedPatternSegment, '#');

    // --- Final Calculation and Output ---
    // Determine the smaller of the two character counts.
    const finalMinimumCount = Math.min(periodCharacterCount, hashCharacterCount);

    // Display the computed minimum count to the standard output.
    console.log(finalMinimumCount);
}

// --- Application Entry Point ---
// This block is responsible for initiating the program by reading input
// and invoking the primary analysis function.
try {
    // Acquire a reference to Node.js's built-in file system module.
    const fileIOModule = require('fs');
    // Synchronously read all content from standard input ('/dev/stdin').
    // The content is interpreted as UTF-8 encoded text.
    const stdinContent = fileIOModule.readFileSync('/dev/stdin', 'utf8');

    // Pass the retrieved standard input content to the main processing function.
    evaluateSymbolFrequencies(stdinContent);
} catch (dataReadingError) {
    // Catch and report any errors that occur during the input reading process.
    console.error("Fatal Error: Could not read data from standard input.", dataReadingError.message);
    // As a fallback or error indicator, output 0 if input reading fails.
    console.log(0);
}