'use strict'; // Enforce stricter parsing and error handling for the script

/**
 * Orchestrates the analysis of an input string to determine if it exhibits character diversity.
 * This routine checks for heterogeneity across the character set derived from the provided text.
 *
 * @param {string} sourceText - The original string data provided for processing.
 */
function analyzeStringHomogeneity(sourceText) {

  // --- Input Validation and Pre-processing ---

  // Defensive programming: Ensure the input is indeed a string.
  // Non-string inputs cannot logically contain diverse characters in this context.
  if (typeof sourceText !== 'string') {
    // If input is not a string, we conclude no diversity can be found.
    reportOutcome(false); // Helper call for consistent output.
    return;
  }

  // Convert the source string into an array of individual character segments.
  // Array.from is a modern alternative to String.prototype.split('').
  let rawCharacterUnits = Array.from(sourceText);

  // Normalize all character units to a consistent case (uppercase) for comparison.
  // This step ensures that 'a' and 'A' are treated as identical for diversity checks.
  const normalizedUnits = rawCharacterUnits.map(charVal => charVal.toUpperCase());

  // Ascertain the total count of normalized character units available.
  const unitCount = normalizedUnits.length;

  // --- Early Exit Condition (Guard Clause) ---

  // If there are fewer than two character units, it's impossible to establish
  // any form of diversity as there aren't two distinct elements to compare.
  if (unitCount < 2) {
    reportOutcome(false); // No two distinct characters can exist.
    return;
  }

  // --- Core Diversity Detection Logic ---

  // Initialize a boolean flag; it will be set to true if any heterogeneity is discovered.
  // The default assumption is homogeneity until a difference is explicitly found.
  let containsVariations = false;

  // A control flag to allow for early termination of the outer loop once diversity is confirmed.
  let stopProcessingDueToDiversity = false;

  // Commence a series of nested iterations to exhaustively compare every unit with every other unit.
  // The outer loop selects the primary unit for comparison.
  for (let primaryUnitIndex = 0; primaryUnitIndex < unitCount; ++primaryUnitIndex) {

    // If diversity has already been positively identified, there's no further need to iterate.
    if (stopProcessingDueToDiversity) {
      break; // Exit the outer loop prematurely.
    }

    // The inner loop selects a secondary unit to compare against the primary unit.
    for (let secondaryUnitIndex = 0; secondaryUnitIndex < unitCount; ++secondaryUnitIndex) {

      // Skip comparing a unit with itself; such a comparison would never reveal diversity.
      if (primaryUnitIndex === secondaryUnitIndex) {
        continue; // Move to the next secondary unit without comparison.
      }

      // Execute the actual comparison between two distinct units.
      // If a discrepancy is found, heterogeneity is confirmed.
      if (normalizedUnits[primaryUnitIndex] !== normalizedUnits[secondaryUnitIndex]) {
        containsVariations = true; // Update the main diversity flag.
        stopProcessingDueToDiversity = true; // Signal that all loops can now terminate.
        break; // Exit the current inner loop immediately.
      }
    }
  }

  // --- Result Reporting ---

  // Invoke a dedicated function to present the final analysis outcome.
  reportOutcome(containsVariations);
}

/**
 * A utility function responsible for formatting and displaying the final result.
 *
 * @param {boolean} isDiversePresent - True if diverse elements were found, false otherwise.
 */
function reportOutcome(isDiversePresent) {
  // Based on the boolean flag, construct the appropriate textual response.
  const finalMessage = isDiversePresent ? 'Yes' : 'No';
  // Output the determined message to the standard console.
  console.log(finalMessage);
}

// --- Script Entry Point and Environment Interaction ---

// Obtain a reference to the Node.js file system module for input operations.
const fileSystemOperations = require("fs");

// Define the standard input file path, common in competitive programming environments.
const standardInputPath = "/dev/stdin";

// Read the entire content from the standard input file, decoding it as UTF-8 text.
const receivedInputPayload = fileSystemOperations.readFileSync(standardInputPath, "utf8");

// Initiate the character diversity analysis process with the acquired input.
analyzeStringHomogeneity(receivedInputPayload);