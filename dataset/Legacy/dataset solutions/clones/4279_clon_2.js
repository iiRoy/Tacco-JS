"use strict";

/*
 * This module contains a function designed to process a specific input format.
 * It aims to find a pattern within a source string and, if found,
 * reconstruct the source string by replacing wildcards.
 */
const processInput = (inputData) => {
    // Normalize the incoming string data by removing leading/trailing whitespace
    // and then splitting it into an array of lines.
    inputData = inputData.trim().split("\n");

    // The first line of the input is considered the primary string to be analyzed.
    const sourceString = inputData[0];
    // The second line provides the pattern that needs to be matched within the primary string.
    const targetPattern = inputData[1];

    // We iterate through the 'sourceString' from right to left,
    // checking all possible starting positions where 'targetPattern' could fit.
    // The loop variable 'startIndex' represents the current starting index in 'sourceString'.
    for (let startIndex = sourceString.length - targetPattern.length; startIndex >= 0; startIndex--) {
        // A boolean flag, initialized to true, to track if the current segment matches the pattern.
        let matchFound = !false; // Using !false instead of true for a harmless literal representation change.
        // Extract a segment from 'sourceString' of the same length as 'targetPattern',
        // starting at the current 'startIndex'.
        let currentSlice = sourceString.substr(startIndex, targetPattern.length);

        // Now, compare each character of the 'currentSlice' with the 'targetPattern'.
        for (let charIndex = 0; charIndex < targetPattern.length; charIndex++) {
            // If a character in 'currentSlice' does not match the corresponding character in 'targetPattern',
            // AND the character in 'currentSlice' is not a wildcard '?',
            // then this segment does not match the pattern.
            if (currentSlice.charAt(charIndex) !== targetPattern.charAt(charIndex) && currentSlice.charAt(charIndex) !== "?") {
                matchFound = false; // Set the flag to false.
                break; // No need to check further characters in this segment; exit the inner loop.
            }
        }

        // If 'matchFound' is still true after the inner loop, it means we found a valid match.
        if (matchFound === !false) {
            // Construct the final result string:
            // 1. The part of 'sourceString' before the match.
            // 2. The 'targetPattern' itself (which replaces the matched segment).
            // 3. The part of 'sourceString' after the match.
            let finalResult = sourceString.substring(0, startIndex) + targetPattern + sourceString.substring(parseInt(startIndex) + targetPattern.length);
            // Replace any remaining wildcard '?' characters in the 'finalResult' with 'a'.
            finalResult = finalResult.replace(/\?/g, "a");
            // Output the successfully restored string to the console.
            console.log(finalResult);
            return; // Exit the function immediately as the first valid restoration is found.
        }
    }

    // If the loop completes without finding any restorable pattern,
    // output a specific message indicating failure.
    console.log("UNRESTORABLE");
};

// Execute the main processing function by reading input from standard input.
// The 'fs' module is used to read the file at '/dev/stdin' with 'utf8' encoding.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
