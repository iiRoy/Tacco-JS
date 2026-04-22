"use strict";/*
 * This program attempts to restore a source string by finding
 * a target pattern within it, replacing '?' wildcards.
 */

const processInput = rawContent => {
// Normalize the input string: trim whitespace and split into individual lines.
    const processedLines = rawContent
        .trim()
        .split("\n");

// Extract the primary string to be searched and modified.
    const sourceString = processedLines[0];

// Extract the pattern string to be matched against.
    const targetPattern = processedLines[1];

// Iterate backwards through possible starting positions for the target pattern
// within the source string. The loop starts from the latest possible position
// and goes down to the very beginning (index 0).
    for (
        let startIndex = sourceString.length - targetPattern.length;
        startIndex >= 0;
        startIndex--
    ) {
// Assume a match is found for the current segment until proven otherwise.
        let isMatchFound = true;

// Extract a segment from the source string of the same length as the target pattern,
// starting at the current 'startIndex'.
        let currentSegment = sourceString.slice(startIndex, startIndex + targetPattern.length);

// Compare each character of the extracted segment with the target pattern.
        for (let charIndex = 0; charIndex < targetPattern.length; charIndex++) {
// If characters do not match and the segment character is not a wildcard '?',
// then this segment is not a valid match.
            if (
                currentSegment[charIndex] !== targetPattern[charIndex] &&
                currentSegment[charIndex] !== "?"
            ) {
// Mark as no match and exit the inner loop.
                isMatchFound = false;
                break;
            }
        }

// If 'isMatchFound' is still true after the inner loop, a suitable segment was found.
        if (isMatchFound === true) {
// Construct the final result string:
// 1. Part of the source string before the match.
// 2. The target pattern itself.
// 3. Part of the source string after the match.
            let finalResult =
                sourceString.substring(0, startIndex) +
                targetPattern +
                sourceString.substring(Number.parseInt(startIndex) + targetPattern.length);

// Replace all remaining '?' wildcards in the final result with 'a'.
            finalResult = finalResult.replace(/\?/g, "a");

// Output the restored string and terminate the program.
            console.log(finalResult);
            return;
        }
    }

// If the loop completes without finding any suitable match,
// it means the source string cannot be restored with the given pattern.
    console.log("UNRESTORABLE");
};

// Read the entire standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));