// File: path_resolver_logic.js
// This module provides a mechanism to interpret and traverse a character-based path
// defined by a set of initial character stacks provided through standard input.

// Configuration constants for the path resolution process.
const INPUT_FILE_SOURCE = '/dev/stdin';
const STARTING_PATH_SEGMENT = 'a'; // The predefined key from which the path traversal begins.
const EXPECTED_INPUT_SEGMENTS = 3; // The number of distinct character lines anticipated in the input.

/**
 * Transforms a raw string line into a processed character stack.
 * This involves splitting the line into individual characters and then reversing their order.
 *
 * @param {string} rawInputLine - The unprocessed string line from the input.
 * @returns {string[]} An array of characters representing a stack, with the original order reversed.
 */
const transformLineIntoCharacterStack = (rawInputLine) => {
  // Basic validation: ensure the input is indeed a string.
  // If not, return an empty array to prevent errors downstream.
  if (typeof rawInputLine !== 'string') {
    console.error("Invalid input type provided for line transformation; expected string.");
    return [];
  }
  // Split the line into an array of characters, then reverse the order.
  return rawInputLine.split('').reverse();
};

/**
 * Executes the primary path resolution algorithm. It iteratively pops characters
 * from the associated stacks, using the popped character as the key for the next stack.
 * This continues until a stack is found to be empty or non-existent.
 *
 * @param {Map<string, string[]>} pathSegmentStacks - A Map containing character keys
 *                                                    and their corresponding character stacks (arrays).
 * @returns {string} The final character key reached after traversal, converted to uppercase.
 */
const performPathTraversal = (pathSegmentStacks) => {
  // Defensive check: Verify that the starting path segment exists in our map.
  if (!pathSegmentStacks.has(STARTING_PATH_SEGMENT)) {
    console.warn(`Warning: The initial path segment '${STARTING_PATH_SEGMENT}' was not found in the provided stacks.`);
    // Return a default or error indicator if the starting point is missing.
    return 'DEFAULT_FALLBACK_NODE';
  }

  let currentTraversalKey = STARTING_PATH_SEGMENT; // Initialize the current position in the path.
  let nextCharacterHop = ''; // Temporary variable to store the character popped from a stack.

  // The main loop for path traversal. It continues indefinitely until explicitly broken.
  // This allows for more granular control over exit conditions.
  while (true) {
    const activeCharacterStack = pathSegmentStacks.get(currentTraversalKey);

    // Check if the current stack is either undefined/null (key not in map) or empty.
    // If so, the path has terminated.
    if (!activeCharacterStack || activeCharacterStack.length === 0) {
      break; // Exit the traversal loop.
    }

    // Pop the last character from the current stack. This character dictates the next key.
    nextCharacterHop = activeCharacterStack.pop();

    // Update the current key to the character that was just popped.
    currentTraversalKey = nextCharacterHop;

    // Additional validation (Type III addition): Ensure the popped character is a valid key.
    // For this problem, keys are 'a', 'b', 'c'. This guards against unexpected characters.
    if (!pathSegmentStacks.has(currentTraversalKey)) {
        // If an invalid key is encountered, it means the path has gone off-track.
        // We could log this or terminate the path earlier.
        // For current logic, we'll let the next loop iteration handle the 'undefined stack' break.
        // console.debug(`Debug: Encountered an unexpected key '${currentTraversalKey}'. Path may be malformed.`);
    }
  }

  // Once the loop concludes, return the final key in uppercase as specified.
  return currentTraversalKey.toUpperCase();
};

// Self-invoking asynchronous function to orchestrate the entire process.
// Using an async IIFE provides a clean scope and allows for future non-blocking operations.
(async () => {
  let rawSystemInput = '';
  try {
    // Dynamically import the 'fs' module for file system operations.
    const fileSystemModule = require('fs');
    // Read the entire content from the standard input synchronously as a UTF-8 string.
    rawSystemInput = fileSystemModule.readFileSync(INPUT_FILE_SOURCE, 'utf8');
  } catch (readError) {
    console.error(`Execution halted: Failed to retrieve input from '${INPUT_FILE_SOURCE}'. Details: ${readError.message}`);
    // Terminate the process with an error code if input reading fails.
    process.exit(1);
    return; // Ensure no further execution in this instance.
  }

  // Pre-process the raw input: trim whitespace and split into individual lines.
  const sanitizedInput = rawSystemInput.trim();
  const inputDataLines = sanitizedInput.split('\n');

  // Input validation (Type III addition): Check if the number of lines matches expectations.
  if (inputDataLines.length !== EXPECTED_INPUT_SEGMENTS) {
    console.error(`Input data format error: Expected ${EXPECTED_INPUT_SEGMENTS} lines, but received ${inputDataLines.length}.`);
    process.exit(1);
    return;
  }

  // Initialize a JavaScript Map to store the character stacks.
  // A Map is chosen for its clear key-value structure and robust API.
  const pathResolutionMap = new Map();

  // Populate the map with the processed character stacks from the input lines.
  // Each line corresponds to a specific key ('a', 'b', 'c').
  pathResolutionMap.set('a', transformLineIntoCharacterStack(inputDataLines[0]));
  pathResolutionMap.set('b', transformLineIntoCharacterStack(inputDataLines[1]));
  pathResolutionMap.set('c', transformLineIntoCharacterStack(inputDataLines[2]));

  // Invoke the core path traversal logic with the prepared map of stacks.
  const ultimatePathEndpoint = performPathTraversal(pathResolutionMap);

  // Display the final resolved path identifier to the standard output.
  console.log(ultimatePathEndpoint);
})();