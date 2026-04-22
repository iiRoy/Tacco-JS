"use strict"; // Enforce strict mode for cleaner code practices

// Core module for file system operations, used for input reading
const fileSystem = require("fs");

// Input processing utilities
// Reads the entire content from standard input synchronously
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Splits the input into individual tokens using any whitespace (space or newline) as a delimiter
const tokenStream = rawInputData.split(/[\s\n]+/);
let tokenIndex = 0; // Pointer to the current token being processed in the stream

/**
 * Extracts the next token from the global input stream.
 * Advances the token pointer after extraction.
 * @param {boolean} retrieveAsString If true, the token is returned as a string; otherwise, it's parsed as a number.
 * @returns {string|number} The next token.
 * @throws {Error} If an attempt is made to read beyond the available tokens.
 */
function acquireToken(retrieveAsString = false) {
  // Ensure we don't read past the end of the token stream
  if (tokenIndex >= tokenStream.length) {
    throw new Error("Input stream exhausted. No more tokens available.");
  }
  const currentToken = tokenStream[tokenIndex++];
  // Conditional return based on the desired data type
  return retrieveAsString ? currentToken : Number(currentToken);
}

/**
 * Converts a lowercase English alphabet character to its 0-based index ('a' -> 0, 'b' -> 1, ..., 'z' -> 25).
 * @param {string} character The character to convert. Must be a single lowercase letter.
 * @returns {number} The 0-based index of the character.
 */
const getCharIndex = (character) => character.charCodeAt(0) - 97;

// Class definition for a Fenwick Tree (also known as a Binary Indexed Tree)
class IndexedCounter {
  /**
   * Constructs a new Fenwick Tree instance.
   * Fenwick Trees are 1-indexed internally, so an array of size `dataCapacity + 1` is created.
   * @param {number} dataCapacity The maximum index for which values will be stored or queried.
   * @throws {Error} If `dataCapacity` is negative.
   */
  constructor(dataCapacity) {
    if (dataCapacity < 0) {
      throw new Error("Fenwick Tree capacity cannot be negative.");
    }
    this.treeStorage = Array(dataCapacity + 1).fill(0); // Initialize all counts to zero
    this.maximumIndex = dataCapacity; // Store the maximum valid index
  }

  /**
   * Modifies the value at a specific position `index` by `deltaValue`.
   * This operation propagates the change up the tree structure.
   * @param {number} deltaValue The amount to add or subtract from the value at `index`.
   * @param {number} index The 1-based position to update.
   */
  adjustCount(deltaValue, index) {
    // Basic bounds check for the index
    if (index <= 0 || index > this.maximumIndex) {
      // In competitive programming, inputs are often guaranteed valid,
      // but for robust code, this check is beneficial.
      // console.warn(`Warning: Attempted to update out-of-bounds index: ${index}`);
      return;
    }
    // Traverse up the tree, updating relevant nodes
    for (; index <= this.maximumIndex; index += index & -index) {
      this.treeStorage[index] += deltaValue;
    }
  }

  /**
   * Computes the cumulative sum of values from the first position up to `index`.
   * This is equivalent to `sum(arr[1]...arr[index])`.
   * @param {number} index The 1-based position up to which the sum is calculated.
   * @returns {number} The prefix sum. Returns 0 for out-of-bounds or non-positive indices.
   */
  retrievePrefixSum(index) {
    // Basic bounds check for the index
    if (index < 0 || index > this.maximumIndex) {
      // console.warn(`Warning: Attempted to query out-of-bounds index: ${index}`);
      return 0; // Return zero for invalid query ranges
    }
    let cumulativeSum = 0;
    // Traverse down the tree, accumulating sums from relevant nodes
    for (; index > 0; index -= index & -index) {
      cumulativeSum += this.treeStorage[index];
    }
    return cumulativeSum;
  }
}

// Main execution routine
// This function encapsulates the primary logic of processing all queries.
const programOutput = processQuerySequence();

// Output the collected results if any were generated.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Orchestrates the processing of all input queries.
 * It initializes Fenwick Trees based on an initial string, then processes
 * character update queries and distinct character count queries.
 * @returns {string} A newline-separated string of results from distinct character count queries.
 */
function processQuerySequence() {
  const stringLength = acquireToken(); // Get the length of the initial string
  // Convert the initial string into a mutable array of characters for easier updates.
  const charArray = acquireToken(true).split('');
  const numberOfQueries = acquireToken(); // Get the total number of queries to process

  // Create an array of 26 Fenwick Trees, one for each letter of the alphabet ('a' through 'z').
  // Each tree will track the frequency of its corresponding character at various positions.
  const characterFrequencyTrackers = Array.from({
    length: 26
  }, () => new IndexedCounter(stringLength));

  // Initialize all Fenwick Trees based on the characters in the initial string.
  // Each character's count is incremented at its respective 1-based position in its dedicated tree.
  for (let currentPos = 0; currentPos < stringLength; ++currentPos) {
    const charIdentifier = getCharIndex(charArray[currentPos]);
    characterFrequencyTrackers[charIdentifier].adjustCount(1, currentPos + 1);
  }

  const collectedResults = []; // An array to store the results of "count distinct characters" queries

  // Loop through and process each query
  for (let queryCounter = 0; queryCounter < numberOfQueries; ++queryCounter) {
    const currentQueryType = acquireToken(); // Read the type of the current query

    if (currentQueryType === 1) {
      // Query Type 1: Update a character at a specific position
      const targetPosition = acquireToken(); // 1-based index for the position to update
      const newCharValue = acquireToken(true); // The new character to set

      // Retrieve the character currently at the target position (0-based for array access)
      const oldCharValue = charArray[targetPosition - 1];

      // Update the Fenwick Trees to reflect the character change:
      // 1. Decrement the count for the old character at this position in its tree.
      const oldCharIdentifier = getCharIndex(oldCharValue);
      characterFrequencyTrackers[oldCharIdentifier].adjustCount(-1, targetPosition);

      // 2. Increment the count for the new character at this position in its tree.
      const newCharIdentifier = getCharIndex(newCharValue);
      characterFrequencyTrackers[newCharIdentifier].adjustCount(1, targetPosition);

      // 3. Crucially, update the underlying character array itself.
      // This ensures consistency between the string representation and the Fenwick Trees.
      charArray[targetPosition - 1] = newCharValue;

    } else if (currentQueryType === 2) {
      // Query Type 2: Count distinct characters within a specified range
      const rangeStart = acquireToken(); // Start of the range (1-based index)
      const rangeEnd = acquireToken(); // End of the range (1-based index)

      let distinctCharacterCount = 0;
      // Iterate through all 26 possible character types ('a' through 'z')
      for (let charIdx = 0; charIdx < 26; ++charIdx) {
        // Calculate the frequency of the current character within the given range [rangeStart, rangeEnd].
        // This is achieved by subtracting the prefix sum up to (rangeStart - 1) from the prefix sum up to rangeEnd.
        const charOccurrencesInRange =
          characterFrequencyTrackers[charIdx].retrievePrefixSum(rangeEnd) -
          characterFrequencyTrackers[charIdx].retrievePrefixSum(rangeStart - 1);

        // If the character appears at least once in the range, increment the distinct count.
        if (charOccurrencesInRange > 0) {
          distinctCharacterCount++;
        }
      }
      collectedResults.push(distinctCharacterCount); // Store the result
    } else {
      // Handle unexpected query types (a guard clause for robustness)
      console.warn(`Warning: Unrecognized query type encountered: ${currentQueryType}. Skipping this query.`);
    }
  }

  // Join all the collected results with newline characters to form the final output string.
  return collectedResults.join("\n");
}