"use strict";

/**
 * Processes raw string input to determine the maximum span from the first 'A' to the last 'Z'.
 * This utility identifies the length of the segment starting with the initial 'A' and
 * concluding with the final 'Z' within the primary input sequence.
 *
 * @param {string} incomingPayload - The raw string input, typically from stdin,
 *                                   expected to contain the character sequence on its first line.
 */
const processCharacterSpanAnalysis = (incomingPayload) => {
    // The 'use strict' directive is already active for the entire script.
    // This comment serves as a placeholder for potential additional strictness rules or context.

    // Deconstruct the incoming payload into individual lines.
    // We are primarily concerned with the very first line of text.
    const dataLines = incomingPayload.split('\n');
    const primarySequence = dataLines[0]; // The string containing characters for analysis.

    // Validate the primary sequence. If it's not a string or is empty,
    // a meaningful span cannot be determined. Output zero as a default.
    // This is a robust guard clause, enhancing the original's error handling.
    if (typeof primarySequence !== 'string' || primarySequence.length === 0) {
        console.log(0);
        return;
    }

    // Locate the starting boundary: the index of the first occurrence of 'A'.
    // This replaces a part of the original iterative logic for finding the start.
    const startMarkerPosition = primarySequence.indexOf('A');

    // Locate the ending boundary: the index of the last occurrence of 'Z'.
    // This replaces another part of the original iterative logic for finding the end.
    const endMarkerPosition = primarySequence.lastIndexOf('Z');

    // Determine if a valid span exists.
    // A valid span requires both 'A' and 'Z' to be present, and 'A' must precede 'Z'.
    // This check consolidates several implicit conditions from the original loop.
    if (startMarkerPosition === -1 || endMarkerPosition === -1 || startMarkerPosition > endMarkerPosition) {
        // If no valid span is found, report a length of zero.
        console.log(0);
        return;
    }

    // Calculate the total length of the identified span.
    // The length is inclusive of both the 'A' and 'Z' characters.
    // This calculation directly computes the value that the original code derived
    // through its `counter` and `Math.max` aggregation, plus the final '+1'.
    const finalSpanLength = endMarkerPosition - startMarkerPosition + 1;

    // Output the computed length to the console.
    console.log(finalSpanLength);
};

// Initiate the processing by reading the entire content from standard input.
// The 'node:fs' prefix is a modern Node.js convention for built-in modules.
processCharacterSpanAnalysis(require('node:fs').readFileSync('/dev/stdin', 'utf8'));