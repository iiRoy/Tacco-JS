"use strict";

/**
 * @fileoverview This module provides functionality to analyze a sequence of characters
 *               and determine if it contains any adjacent identical characters.
 *               It reads input from standard input, processes it, and outputs a verdict.
 */

/**
 * Verifies if any two adjacent characters in a given sequence are identical.
 * This function acts as a core logic component, abstracted from input/output.
 *
 * @param {Array<string>} sequenceElements - An array of individual characters to inspect.
 * @returns {boolean} True if at least one pair of adjacent identical characters is found, false otherwise.
 */
const verifyAdjacentCharacters = (sequenceElements) => {
  // Guard clause: If the sequence is null/undefined, or has fewer than 2 elements,
  // it's impossible to have adjacent duplicates. Return false immediately.
  if (!sequenceElements || sequenceElements.length < 2) {
    return false;
  }

  let hasConsecutiveMatches = false; // Flag to track if a problematic pair is identified.

  // Iterate through the sequence. The loop runs up to the second-to-last element
  // to ensure that `sequenceElements[currentIdx + 1]` is always a valid index.
  for (let currentIdx = 0; currentIdx < sequenceElements.length - 1; ++currentIdx) {
    const currentCharacter = sequenceElements[currentIdx];
    const nextCharacter = sequenceElements[currentIdx + 1];

    // Use strict equality (===) for robust type and value comparison.
    if (currentCharacter === nextCharacter) {
      hasConsecutiveMatches = true; // Found an adjacent match.
      break; // Optimization: No need to check further, the condition is met.
    }
  }

  return hasConsecutiveMatches; // Return the final status of the check.
};

/**
 * Orchestrates the evaluation of an input string payload for adjacent character stability.
 * It takes a raw string, converts it to a character array, and then uses the verification logic.
 *
 * @param {string} inputPayload - The raw string data received for analysis.
 * @returns {string} "Bad" if adjacent identical characters are found, "Good" otherwise.
 */
const evaluatePayloadStability = (inputPayload) => {
  // Convert the input string into an array of its constituent characters.
  // This step facilitates easier element-by-element access and iteration.
  const individualCharacters = inputPayload.split("");

  // Invoke the helper function to perform the core verification logic.
  const containsDuplicates = verifyAdjacentCharacters(individualCharacters);

  // Based on the boolean result from verification, formulate the final verdict message.
  const outcomeMessage = containsDuplicates ? "Bad" : "Good";

  return outcomeMessage; // Deliver the generated message.
};

/**
 * The primary execution flow of the application.
 * This function handles reading input, calling the processing logic, and outputting results.
 * It also includes error handling for robustness.
 */
const mainExecutionFlow = () => {
  try {
    // Attempt to read all data from the standard input stream, assuming UTF-8 encoding.
    // This is typically used for command-line piped input.
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim any leading or trailing whitespace from the raw input to prevent
    // unintended effects on character sequence analysis.
    const trimmedInput = rawInputData.trim();

    // Call the main evaluation function with the cleaned input data.
    // This function returns the final string verdict ("Good" or "Bad").
    const finalResult = evaluatePayloadStability(trimmedInput);

    // Output the conclusive result to the standard output.
    console.log(finalResult);

  } catch (error) {
    // If any error occurs during file reading or processing, catch it here.
    // Log the error message to standard error for debugging purposes.
    console.error("An unexpected error occurred during application execution:", error.message);
    // Exit the process with a non-zero status code to indicate that the program terminated with an error.
    process.exit(1);
  }
};

// Initiate the application by calling the main execution flow function.
// This is the entry point that kicks off all subsequent operations.
mainExecutionFlow();