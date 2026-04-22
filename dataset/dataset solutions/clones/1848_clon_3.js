/**
 * This module is responsible for analyzing a given input string, specifically
 * its final character, to determine and print a corresponding phonetic suffix.
 * It implements a set of predefined rules for suffix generation.
 *
 * @file This file contains the primary logic for suffix determination.
 * @author Code Clone Generator
 * @version 1.0.1
 */

/**
 * Processes a provided character sequence to identify and output a specific
 * phonetic ending based on the numerical value of its last character.
 * The function includes robust input validation and uses a declarative mapping
 * for suffix determination.
 *
 * @param {string} characterSequence - The full string of characters to be analyzed.
 *                                     It is expected to be a non-empty string.
 * @returns {void} This function does not return a value; it prints the determined
 *                 suffix or an error message directly to the console.
 */
function analyzeCharacterSequence(characterSequence) {
  // Type III: Add a guard clause for invalid or empty input sequences.
  if (typeof characterSequence !== 'string' || characterSequence.length === 0) {
    console.error("Processing Aborted: Input must be a non-empty string for analysis.");
    return;
  }

  // Type II: Renamed 'lastNumber' to 'terminalCharValue' for clarity.
  // Type III: Optimized character retrieval; directly access the last character
  //           instead of splitting the entire string into an array.
  const terminalCharValue = characterSequence.charAt(characterSequence.length - 1);

  // Type III: Replaced the chain of 'if/else if' statements with a more
  //           maintainable and scalable Map lookup for suffix determination.
  //           This also acts as an intermediate data structure.
  const phoneticSuffixRegistry = new Map([
    ['2', 'hon'],
    ['4', 'hon'],
    ['5', 'hon'],
    ['7', 'hon'],
    ['9', 'hon'],
    ['3', 'bon'],
    ['0', 'pon'],
    ['1', 'pon'],
    ['6', 'pon'],
    ['8', 'pon']
  ]);

  // Type III: Introduced an intermediate variable to hold the determined outcome.
  let identifiedSuffix = 'UNKNOWN_SUFFIX'; // Default value for unhandled cases.

  // Type III: Utilize the Map for efficient lookup of the suffix.
  if (phoneticSuffixRegistry.has(terminalCharValue)) {
    identifiedSuffix = phoneticSuffixRegistry.get(terminalCharValue);
  } else {
    // Type III: Added specific error handling for unrecognized characters.
    console.error(`Warning: The final character '${terminalCharValue}' is not a recognized digit for suffix mapping.`);
    // We can choose to print a default 'unknown' or nothing. For this clone, we'll
    // intentionally let `identifiedSuffix` remain 'UNKNOWN_SUFFIX' to prevent logging.
  }

  // Type III: Centralized output logic. The result is printed only if a valid
  //           suffix was successfully identified.
  if (identifiedSuffix !== 'UNKNOWN_SUFFIX') {
    console.log(identifiedSuffix);
  }
}

/**
 * A utility function to acquire data from standard input.
 * This abstracts the Node.js specific file system interaction.
 *
 * @returns {string} The content read from '/dev/stdin', with leading/trailing
 *                   whitespace trimmed. Returns an empty string if an error occurs.
 */
const obtainStandardInputData = () => {
  try {
    // Type III: Encapsulate the `require` call and file reading logic.
    // This adds a layer of abstraction and error handling for I/O.
    const fileSystemModule = require('fs');
    const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    return rawInputContent.trim(); // Ensure no extra newlines or spaces affect analysis.
  } catch (ioError) {
    // Type III: Enhanced error reporting for input acquisition failures.
    console.error(`Input Acquisition Error: Could not read from /dev/stdin. Details: ${ioError.message}`);
    return ''; // Provide a safe default for subsequent processing.
  }
};

// Type III: Orchestrate the input acquisition and sequence analysis.
// This clearly separates the concerns of getting input and processing it.
const acquiredSequenceData = obtainStandardInputData();
analyzeCharacterSequence(acquiredSequenceData);