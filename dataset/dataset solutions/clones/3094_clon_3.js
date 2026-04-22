/*
 * This module serves to identify the corresponding complementary nucleic acid base
 * for a provided single-character input, typically representing a DNA or RNA nucleotide.
 * It processes raw string data and outputs the determined complement to standard output.
 */

/**
 * Determines and outputs the complementary base for a given nucleotide character.
 * The function performs input validation and normalization before lookup.
 *
 * @param {string | null | undefined} rawInputString - The raw string data received,
 *                                                     expected to contain a single nucleotide base.
 * @returns {void} This function does not return a value; it prints the result
 *                 or an error/warning message directly to the console.
 */
function processNucleotideComplement(rawInputString) {
  // Establish a comprehensive lookup table for base pairing rules.
  // Using a JavaScript Map ensures efficient access and clear definition of pairs.
  const basePairingScheme = new Map();
  basePairingScheme.set('A', 'T'); // Adenine pairs with Thymine
  basePairingScheme.set('T', 'A'); // Thymine pairs with Adenine
  basePairingScheme.set('C', 'G'); // Cytosine pairs with Guanine
  basePairingScheme.set('G', 'C'); // Guanine pairs with Cytosine

  // --- Input Pre-processing and Validation ---

  // Initial check for null or undefined input to prevent subsequent errors.
  if (rawInputString === null || rawInputString === undefined) {
    console.error("Input Processing Error: No data provided for complement determination.");
    return; // Terminate execution for invalid input.
  }

  // Normalize the input string:
  // 1. Convert to string explicitly (handles non-string inputs gracefully).
  // 2. Remove leading/trailing whitespace using .trim().
  // 3. Convert all characters to uppercase to ensure case-insensitivity during lookup.
  const normalizedBaseIdentifier = String(rawInputString).trim().toUpperCase();

  // Validate the length of the processed input.
  // The function is designed for single-character nucleotide inputs.
  if (normalizedBaseIdentifier.length !== 1) {
    console.error(`Input Validation Failed: Expected a single character nucleotide, but received '${normalizedBaseIdentifier}' (length: ${normalizedBaseIdentifier.length}).`);
    return; // Terminate execution due to invalid input format.
  }

  // --- Complement Determination ---

  // Attempt to retrieve the complementary base using the prepared lookup table.
  let identifiedComplement = basePairingScheme.get(normalizedBaseIdentifier);

  // Check if a complement was found. If not, the input was an unrecognized base.
  if (identifiedComplement === undefined) {
    console.warn(`Unrecognized Base Warning: The input '${normalizedBaseIdentifier}' is not a standard DNA/RNA base (A, T, C, G). No complement can be determined.`);
    // As a fallback or error indicator, a placeholder can be used.
    identifiedComplement = '?';
  }

  // --- Output Result ---

  // Print the determined complement to standard output.
  // Using a template literal for potential future expansion of output formatting.
  console.log(`${identifiedComplement}`);
}

// --- Application Entry Point ---
// This block handles reading the input from the operating system's standard input
// and orchestrates the call to the main processing function.
try {
  // Utilize Node.js 'fs' module to synchronously read data from /dev/stdin.
  // '/dev/stdin' is a common Unix-like path for standard input.
  // The input is expected to be UTF-8 encoded.
  const systemProvidedData = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Invoke the primary function to process the data obtained from standard input.
  processNucleotideComplement(systemProvidedData);

} catch (runtimeError) {
  // Catch and report any exceptions that occur during file reading or function execution.
  console.error(`Application Execution Failure: An unhandled error occurred: ${runtimeError.message}`);
  // In a robust application, one might also log the stack trace for debugging:
  // console.error(runtimeError.stack);
  // Optionally, exit the process with an error code to signal failure to the environment.
  // process.exit(1);
}