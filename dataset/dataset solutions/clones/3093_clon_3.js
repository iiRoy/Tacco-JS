"use strict";

// This module provides a utility to find the complementary DNA base for a given nucleotide.

/**
 * Processes a single nucleotide character and determines its complementary base.
 * It includes validation for the input and uses a lookup table for efficiency.
 *
 * @param {string} nucleotideInput The single-character string representing a DNA nucleotide (e.g., "A", "T", "G", "C").
 * @returns {string | null} The complementary DNA base as a string, or null if the input is invalid or unrecognized.
 */
function determineComplementaryBase(nucleotideInput) {
    let pairedBase = null; // Initialize with a default 'null' to indicate an unset or invalid state.

    // Define the base pairing rules using a Map for quick lookups.
    // This provides a clear and extensible way to store mappings,
    // which is an alternative to a switch statement.
    const dnaBasePairs = new Map([
        ["A", "T"],
        ["T", "A"],
        ["G", "C"],
        ["C", "G"]
    ]);

    // --- Input Preprocessing and Validation ---

    // First, perform a basic type check and ensure the input string is not empty
    // after trimming whitespace. This is a robust guard clause.
    if (typeof nucleotideInput !== 'string' || nucleotideInput.trim().length === 0) {
        console.error("Error: Input provided to determineComplementaryBase must be a non-empty string.");
        return null; // Exit early for clearly invalid input
    }

    // Process the input: trim any leading/trailing whitespace and convert to uppercase.
    // This makes the function more flexible by handling potential case differences
    // or accidental whitespace, which the original code did not explicitly address.
    const processedNucleotide = nucleotideInput.trim().toUpperCase();

    // Validate that the processed input is indeed a single character.
    // This prevents unexpected behavior if a longer string was passed.
    if (processedNucleotide.length !== 1) {
        console.error(`Error: Expected a single nucleotide character, but received "${nucleotideInput}".`);
        return null; // Exit early for multi-character input
    }

    // --- Core Logic: Base Pairing Lookup ---

    // Check if the processed nucleotide exists as a key in our predefined pairing rules.
    // This effectively replaces the multiple 'case' statements of the original switch.
    if (dnaBasePairs.has(processedNucleotide)) {
        pairedBase = dnaBasePairs.get(processedNucleotide);
    } else {
        // If the base is not recognized (e.g., 'X', 'U', or any other character),
        // log a warning to inform the user. The 'pairedBase' remains null.
        console.warn(`Warning: Unrecognized DNA nucleotide "${processedNucleotide}" detected. No complement found.`);
    }

    // Return the determined complementary base or null if no valid complement was found
    // due to invalid input or an unrecognized base.
    return pairedBase;
}

// --- Main execution block ---

// Read the raw input from standard input, ensuring it's interpreted as UTF-8.
// The original code used '/dev/stdin' directly, which is standard for competitive programming.
const rawInputStream = require("fs").readFileSync("/dev/stdin", "utf8");

// Call the main processing function with the raw input stream and store its result.
const finalResult = determineComplementaryBase(rawInputStream);

// Output the result to the console.
// This conditional check ensures that only valid results are printed directly.
// If 'finalResult' is null (due to validation errors or unrecognized input),
// the error/warning messages would have already been printed by the function itself.
if (finalResult !== null) {
    console.log(finalResult);
} else {
    // In cases where finalResult is null, and no specific error message was printed
    // (e.g., if we wanted a generic failure message here without console.error inside the function),
    // we could add a fallback. For this clone, relying on internal `console.error`/`console.warn` is sufficient.
    // The original code would print 'undefined' if 'answer' was not set; printing nothing or 'null' is similar.
}