// This program processes text input from standard input to find all
// occurrences of a specific pattern string within a larger main string.
// It is designed to correctly identify overlapping matches.

// Essential Node.js module for file system operations.
const fileSystemHandler = require('fs');

// Standard path for reading input in a Unix-like environment.
const inputSourceIdentifier = '/dev/stdin';

// A variable to temporarily hold the raw data read from the input source.
let collectedRawData;

try {
    // Attempt to synchronously read all data from the specified input path.
    // The data is expected to be encoded in UTF-8.
    collectedRawData = fileSystemHandler.readFileSync(inputSourceIdentifier, 'utf8');
} catch (dataReadError) {
    // If any error occurs during the read operation, log the issue and terminate.
    console.error("Failed to retrieve input data:", dataReadError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Pre-process the collected raw data:
// 1. Remove any leading or trailing whitespace characters.
// 2. Split the cleaned string into an array of individual lines.
const parsedInputLines = collectedRawData.trim().split('\n');

// Input validation: Ensure that at least two lines of input are provided.
// The first line is expected to be the main text, and the second the search pattern.
if (parsedInputLines.length < 2) {
    console.error("Insufficient input provided. Expected at least two lines: the primary text followed by the search pattern.");
    process.exit(1);
}

// Assign the first line as the primary text (the string to be searched).
const mainContentString = parsedInputLines[0];

// Assign the second line as the pattern string (the substring to find).
const targetSearchPattern = parsedInputLines[1];

// Edge case validation: If the search pattern is empty, no matches can logically exist.
if (targetSearchPattern.length === 0) {
    console.log("The search pattern is empty. No matching occurrences can be found.");
    process.exit(0);
}

// Create a regular expression object from the target pattern.
// The 'g' (global) flag is crucial for the 'exec' method to find all matches
// and to correctly manage the 'lastIndex' property for subsequent searches.
// The pattern itself is escaped to ensure it's treated as a literal string,
// preventing special regex characters from being interpreted.
const patternMatcherRegExp = new RegExp(
    targetSearchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'g'
);

// An array to store the 0-based starting indices of all identified matches.
const discoveredMatchIndices = [];

// A variable to hold the result object returned by 'exec()' for each match.
let currentMatchResult;

// Loop to find all occurrences of the pattern within the main content string.
// The 'exec()' method returns an array containing match details or `null` if no match is found.
// With the 'g' flag, 'exec()' automatically updates 'patternMatcherRegExp.lastIndex'
// to the position immediately after the current match, allowing it to continue searching.
while ((currentMatchResult = patternMatcherRegExp.exec(mainContentString)) !== null) {
    // Add the starting index of the current match to our results array.
    discoveredMatchIndices.push(currentMatchResult.index);

    // Crucial step for finding overlapping matches:
    // After finding a match, we manually adjust 'lastIndex' to one character
    // past the *start* of the current match. This forces the regex engine
    // to reconsider characters that were part of the previous match for a
    // new match, enabling detection of overlaps (e.g., "aa" in "aaaa" at indices 0, 1, 2).
    patternMatcherRegExp.lastIndex = currentMatchResult.index + 1;

    // Safety guard: If an extremely large number of matches are found (e.g., more than
    // twice the length of the main text), it might indicate an unexpected infinite loop
    // or an extremely dense pattern. This provides a graceful exit.
    if (discoveredMatchIndices.length > mainContentString.length * 2) {
        console.warn("Abnormal number of matches detected; potential issue or extremely dense pattern. Terminating search early.");
        break;
    }
}

// Final output based on whether any matches were found.
if (discoveredMatchIndices.length > 0) {
    // If matches were found, print each starting index on a new line.
    console.log(discoveredMatchIndices.join('\n'));
} else {
    // If no matches were found, provide a clear message.
    console.log("No occurrences of the specified pattern were found in the provided text.");
}