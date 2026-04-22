"use strict";

// Entry point: Reads standard input and delegates processing.
// This setup assumes a Node.js environment where 'fs' module is available.
processInputContent(require("fs").readFileSync("/dev/stdin", "UTF-8"));

/**
 * Processes a raw text payload to identify and count anagram pairs within a list of strings.
 *
 * @param {string} rawTextPayload - The complete input string, typically from a file or stdin.
 *                                  Expected format: First line is the count of strings,
 *                                  subsequent lines are the strings themselves.
 */
function processInputContent(rawTextPayload) {
  // Define a constant for line separation for improved readability and maintainability.
  const LINE_SEPARATOR = '\n';
  // Helper function to convert a string into its canonical (sorted character) form.
  // This form serves as a unique identifier for anagrams.
  const obtainCanonicalForm = (targetString) => {
    // If the input string is not valid, return an empty string or handle error.
    // For this problem, we assume valid string inputs.
    if (typeof targetString !== 'string') {
      return '';
    }
    // Convert to an array of characters, sort them, and then join back into a string.
    return Array.from(targetString).sort().join('');
  };

  // Split the entire input payload into individual lines.
  let contentLines = rawTextPayload.split(LINE_SEPARATOR);

  // Extract the expected number of strings from the very first line.
  // Using Number() for type conversion, which handles various string representations.
  const declaredStringCount = Number(contentLines.shift());

  // --- Input Validation and Guard Clauses ---
  // Ensure the declared count is a valid non-negative number.
  if (isNaN(declaredStringCount) || declaredStringCount < 0) {
    console.error("Error: The initial line must contain a valid non-negative integer for string count.");
    return; // Exit if invalid count.
  }
  // Warn if the actual number of lines doesn't match the declared count.
  // This might indicate malformed input but doesn't necessarily prevent processing.
  if (contentLines.length < declaredStringCount) {
    console.warn(`Warning: Declared string count (${declaredStringCount}) is higher than actual lines provided (${contentLines.length}). Processing available lines.`);
  } else if (contentLines.length > declaredStringCount) {
     // If there are more lines than declared, trim the array to the declared count.
     // This ensures we only process what was promised.
     contentLines = contentLines.slice(0, declaredStringCount);
     console.warn(`Warning: Declared string count (${declaredStringCount}) is lower than actual lines provided (${contentLines.length}). Processing only the declared number of lines.`);
  }

  // --- Core Logic: Anagram Frequency Mapping ---
  // Use a Map to store the frequency of each unique canonical form (sorted string).
  // Key: Canonical string form (e.g., "aet" for "eat", "tea").
  // Value: Number of times this canonical form has appeared.
  const canonicalFormFrequencies = new Map();

  // Iterate over each string in the processed content.
  for (const currentRawLine of contentLines) {
    // Trim whitespace from the current line to ensure accurate comparisons.
    const sanitizedLine = currentRawLine.trim();

    // Skip empty lines after trimming, as they don't contribute to anagrams.
    if (sanitizedLine.length === 0) {
      continue;
    }

    // Obtain the canonical representation for the current string.
    const canonicalRepresentation = obtainCanonicalForm(sanitizedLine);

    // Update the frequency count for this canonical form in the map.
    // If the form is new, initialize its count to 1; otherwise, increment.
    canonicalFormFrequencies.set(
      canonicalRepresentation,
      (canonicalFormFrequencies.get(canonicalRepresentation) || 0) + 1
    );
  }

  // --- Calculate Total Anagram Pairs ---
  let totalAnagramCombinations = 0;

  // Iterate through the frequency counts stored in the map.
  for (const frequencyValue of canonicalFormFrequencies.values()) {
    // If a specific canonical form appeared 'N' times,
    // the number of unique pairs it forms is given by the combination formula: N * (N - 1) / 2.
    // We only consider frequencies greater than 1, as a single occurrence cannot form a pair.
    if (frequencyValue > 1) {
      totalAnagramCombinations += (frequencyValue * (frequencyValue - 1)) / 2;
    }
  }

  // Output the final computed count of anagram pairs to the console.
  console.log(totalAnagramCombinations);
}