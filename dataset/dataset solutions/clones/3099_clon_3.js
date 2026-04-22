"use strict";

/**
 * Utility function to securely fetch raw data from the designated input source.
 * This simulates reading from standard input in a production environment.
 * @returns {string} The complete raw data as a string.
 */
function acquireInputPayload() {
    // Define the standard input file path, typically used in competitive programming.
    const sourceFilePath = "/dev/stdin";

    // Attempt to read the file contents using Node.js's file system module.
    // The 'utf8' encoding ensures proper character interpretation.
    const bufferContents = require("fs").readFileSync(sourceFilePath, "utf8");

    // Return the collected data for further processing.
    return bufferContents;
}

/**
 * Determines if a given character represents a valid DNA nucleotide base.
 * Valid bases are Adenine (A), Cytosine (C), Guanine (G), and Thymine (T).
 * @param {string} characterCandidate The character to be validated.
 * @returns {boolean} True if the character is a valid DNA base, otherwise false.
 */
function checkNucleotideValidity(characterCandidate) {
    // For efficient lookups, a Set containing all valid DNA bases is utilized.
    // This provides O(1) average time complexity for checking membership.
    const acceptableBases = new Set(['A', 'C', 'T', 'G']);

    // Verify if the provided character is present within the set of acceptable bases.
    return acceptableBases.has(characterCandidate);
}

/**
 * Analyzes a given sequence of characters to find the longest contiguous segment
 * composed exclusively of valid DNA nucleotide bases.
 * @param {string} rawInputBundle The raw string input, potentially containing multiple lines or whitespace.
 * @returns {number} The maximum length of a consecutive DNA base segment found.
 */
function processDnaSequenceForMaxSegment(rawInputBundle) {
    // Essential validation: ensure the input is a non-empty string.
    // This guards against unexpected input types or null/undefined values.
    if (!rawInputBundle || typeof rawInputBundle !== 'string') {
        // In a real-world scenario, one might throw an error or log a warning.
        // For this context, returning 0 indicates no valid segment could be found.
        console.error("Warning: Received invalid or empty input bundle for analysis.");
        return 0;
    }

    // Extract the primary sequence line and remove leading/trailing whitespace.
    // This ensures only the relevant data from the first line is considered.
    const dnaStringCandidate = rawInputBundle.split('\n')[0].trim();

    // If, after trimming, the sequence is empty, there are no bases to analyze.
    if (dnaStringCandidate.length === 0) {
        return 0;
    }

    // Initialize variables to track the maximum length found and the current segment's length.
    let peakSegmentLength = 0;        // Stores the longest valid segment encountered so far.
    let activeSegmentCounter = 0;     // Tracks the length of the current consecutive valid segment.

    // Iterate through each character of the cleaned DNA string.
    for (let currentPosition = 0; currentPosition < dnaStringCandidate.length; currentPosition++) {
        // Retrieve the character at the current index for evaluation.
        const observedCharacter = dnaStringCandidate.charAt(currentPosition);

        // Utilize the helper function to determine if the character is a valid DNA base.
        if (checkNucleotideValidity(observedCharacter)) {
            // If valid, increment the counter for the current consecutive segment.
            activeSegmentCounter++;
        } else {
            // If an invalid character is found, the current segment is broken.
            // Update the peak length if the just-ended segment was longer.
            peakSegmentLength = Math.max(peakSegmentLength, activeSegmentCounter);
            // Reset the counter for the next potential segment.
            activeSegmentCounter = 0;
        }
    }

    // After the loop, a final check is necessary.
    // This accounts for cases where the sequence ends with a valid DNA segment,
    // ensuring that its length is also considered for the peak segment.
    peakSegmentLength = Math.max(peakSegmentLength, activeSegmentCounter);

    // Return the ultimate maximum length determined.
    return peakSegmentLength;
}

/**
 * The primary execution orchestrator for the DNA sequence analysis application.
 * It coordinates input acquisition, processing, and output display.
 */
function initiateSequenceProcessor() {
    // First, obtain the raw input string from the system's standard input.
    const acquiredRawData = acquireInputPayload();

    // Then, pass this raw data to the core processing function to compute the result.
    const computedMaxLength = processDnaSequenceForMaxSegment(acquiredRawData);

    // Finally, output the calculated maximum length to the console.
    console.log(computedMaxLength);
}

// Begin the execution flow by invoking the main orchestrator function.
initiateSequenceProcessor();