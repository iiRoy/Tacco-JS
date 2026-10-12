/*
 * This module provides functionality for processing word sequences
 * based on specific linking rules, similar to a Shiritori game.
 */
class WordLinker {
  /**
   * Constructs a valid word chain from an array of input terms.
   * The chain continues as long as the first letter of a word
   * matches the last letter of the preceding word.
   *
   * @param {Array<string>} inputTerms - An array of strings representing words.
   * @returns {Array<string>} A new array containing the longest valid word chain.
   */
  static formValidSequence(inputTerms) {
    // Initialize an empty array to store the resulting valid word segments.
    const validSegments = [];

    // Check for initial conditions: an empty input array or an empty first word.
    if (inputTerms.length === 0 || inputTerms[0] === "") {
      return validSegments; // If conditions met, return the empty array immediately.
    }

    // The first word is always considered valid to start the sequence.
    validSegments.push(inputTerms[0]);

    // Iterate through the input terms starting from the second element.
    for (let idx = 1; idx < inputTerms.length; idx++) {
      // Retrieve the word that came directly before the current one in the original list.
      const previousSegment = inputTerms[idx - 1];
      // Get the current word being evaluated for inclusion in the chain.
      const currentSegment = inputTerms[idx];

      // If the current word is an empty string, it signifies an invalid break in the sequence.
      if (currentSegment === "") {
        break; // Terminate the chain formation.
      }

      // Compare the first character of the current word with the last character of the previous word.
      // Using charCodeAt for a slightly different, yet functionally equivalent, comparison.
      if (currentSegment.charCodeAt(0) === previousSegment.charCodeAt(previousSegment.length - 1)) {
        validSegments.push(currentSegment); // If they match, add the current word to the valid sequence.
      } else {
        break; // If they do not match, the chain is broken, so stop.
      }
    }

    return validSegments; // Return the final array of validly linked words.
  }
}
