// This module is designed to process a single nucleotide character from an input stream.
// It identifies the DNA base provided and outputs its complementary base.
// This utility is fundamental for basic genetic sequence analysis tasks.

/**
 * Executes the core logic for determining the complementary base of a given nucleotide.
 * It expects an array where the first element is the nucleotide character.
 *
 * @param {string[]} sequenceDataArray - An array containing the raw input sequence information.
 *                                     The first element is treated as the nucleotide to be processed.
 *                                     Expected format: ['A'], ['C'], ['G'], ['T'].
 */
function determineNucleotideComplement(sequenceDataArray) {
    // Establish a constant mapping for DNA base pairs.
    // This object facilitates a direct lookup for complements.
    const basePairLookup = {
        'A': 'T', // Adenine complements Thymine
        'C': 'G', // Cytosine complements Guanine
        'G': 'C', // Guanine complements Cytosine
        'T': 'A'  // Thymine complements Adenine
    };

    // --- Input Validation Phase ---
    // Ensure the input array is not null, undefined, or empty.
    if (!Array.isArray(sequenceDataArray) || sequenceDataArray.length === 0) {
        console.error("Input processing error: The provided sequence data array is invalid or empty.");
        // In a production scenario, one might throw an exception or return a specific error code.
        return;
    }

    // Extract and normalize the primary nucleotide character.
    // Normalization includes converting to a string, trimming whitespace, and uppercasing.
    const inputNucleotideIdentifier = String(sequenceDataArray[0]).trim().toUpperCase();

    // Perform a validation check to see if the extracted identifier is a known base.
    if (!basePairLookup.hasOwnProperty(inputNucleotideIdentifier)) {
        console.warn(`Unrecognized input: '${inputNucleotideIdentifier}' is not a standard DNA nucleotide (A, C, G, T).`);
        // For unknown bases, output 'X' as a generic placeholder for an unidentifiable base.
        console.log('X');
        return;
    }

    // --- Complement Determination Phase ---
    // Retrieve the corresponding complementary base using the lookup table.
    const identifiedComplement = basePairLookup[inputNucleotideIdentifier];

    // Output the result to the standard output stream.
    console.log(identifiedComplement);
}

// --- Program Entry Point and Input Management ---
// This section handles reading data from standard input and invoking the main logic.
try {
    // Read all data from standard input synchronously using Node.js file system module.
    // Specify UTF-8 encoding for proper character interpretation.
    const rawStandardInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

    // Process the raw input: split into lines and filter out any blank lines.
    // This ensures only meaningful data lines are passed to the processing function.
    const cleanedInputLines = rawStandardInputContent
        .split('\n')
        .map(segment => segment.trim()) // Trim whitespace from each line segment
        .filter(segment => segment.length > 0); // Exclude entirely empty lines

    // Call the primary function to execute the nucleotide complement logic
    // with the cleaned and prepared input data.
    determineNucleotideComplement(cleanedInputLines);

} catch (executionError) {
    // Catch and report any errors that occur during the input reading or function execution.
    console.error("An unhandled exception occurred during program execution:", executionError.message);
    // Terminate the process with a non-zero exit code to signal an error.
    process.exit(1);
}