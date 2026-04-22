"use strict";

// --- Custom Babel-like helper functions for array destructuring ---
// These helpers assist in handling array-like structures for destructuring assignments,
// mimicking behavior from transpiled ES6+ code for broader compatibility.

/**
 * Checks if the provided input is an array.
 * @param {any} potentialArray - The value to check.
 * @returns {Array|undefined} The array if it's an array, otherwise undefined.
 */
function _checkIfArrayLike(potentialArray) {
  if (Array.isArray(potentialArray)) return potentialArray;
}

/**
 * Converts an iterable object into an array.
 * @param {Iterable<any>} inputIterable - The iterable to convert.
 * @returns {Array<any>|undefined} An array if the input is iterable or an arguments object, otherwise undefined.
 */
function _convertIterableToArray(inputIterable) {
  if (Symbol.iterator in Object(inputIterable) || Object.prototype.toString.call(inputIterable) === "[object Arguments]") return Array.from(inputIterable);
}

/**
 * Attempts to extract a specific number of items from an array-like structure.
 * Throws an error if the source is not iterable.
 * @param {any} sourceArray - The array-like source.
 * @param {number} itemLimit - The maximum number of items to extract.
 * @returns {Array<any>} An array containing the extracted items.
 */
function _extractSpecificItems(sourceArray, itemLimit) {
  return _checkIfArrayLike(sourceArray) || _convertIterableToLimitedArray(sourceArray, itemLimit) || _throwNonIterableError();
}

/**
 * Throws a TypeError indicating that a non-iterable instance was used for destructuring.
 * @throws {TypeError}
 */
function _throwNonIterableError() {
  throw new TypeError("Invalid attempt to destructure a non-iterable instance.");
}

/**
 * Converts an iterable into an array, limiting the number of collected items.
 * @param {Iterable<any>} inputIterable - The iterable to convert.
 * @param {number} limitCount - The maximum number of items to collect.
 * @returns {Array<any>} An array of collected items up to the limit.
 */
function _convertIterableToLimitedArray(inputIterable, limitCount) {
  const collectedItems = [];
  let iterationCompleted = false;
  let encounteredError = false;
  let caughtIterationError;

  try {
    for (var iterator = inputIterable[Symbol.iterator](), nextStep; !(iterationCompleted = (nextStep = iterator.next()).done); iterationCompleted = true) {
      collectedItems.push(nextStep.value);
      if (limitCount && collectedItems.length === limitCount) break;
    }
  } catch (error) {
    encounteredError = true;
    caughtIterationError = error;
  } finally {
    try {
      if (!iterationCompleted && iterator["return"] != null) {
        iterator["return"]();
      }
    } finally {
      if (encounteredError) {
        throw caughtIterationError;
      }
    }
  }
  return collectedItems;
}

/**
 * Collects all items from an array-like structure into a new array.
 * Throws an error if the source is not iterable.
 * @param {any} inputArray - The array-like source.
 * @returns {Array<any>} A new array containing all items.
 */
function _collectAllItems(inputArray) {
  return _checkIfArrayLike(inputArray) || _convertIterableToArray(inputArray) || _throwNonIterableError();
}
// --- End of custom helper functions ---


/**
 * Main application logic encapsulated in an immediately invoked function expression (IIFE).
 * This structure prevents global scope pollution and ensures all operations are self-contained.
 */
(() => {
  /**
   * Processes a string or an array of strings into an array of integers.
   * Filters out empty tokens and handles numeric conversion.
   * @param {string|string[]} inputContent - The string or array of strings to process.
   * @returns {number[]} An array of parsed integers.
   */
  const extractIntegersFromLine = (inputContent) => {
    // If input is already an array, use it directly.
    // Otherwise, trim, split by one or more spaces, and filter out any empty strings resulting from multiple spaces.
    const stringTokens = Array.isArray(inputContent)
      ? inputContent
      : inputContent.trim().split(/\s+/).filter(token => token.length > 0);

    // Convert each string token to a number.
    return stringTokens.map(token => {
      const parsedValue = Number(token); // Number() is generally preferred over parseInt() for consistency
      if (isNaN(parsedValue)) {
        // In a real-world scenario, this might throw an error or log a warning.
        // For competitive programming, input format is usually guaranteed.
        // console.warn(`Non-numeric token "${token}" encountered.`);
      }
      return parsedValue;
    });
  };

  /**
   * Represents the core logic for solving the switch-lamp problem.
   * It reads configurations, iterates through switch states, and counts valid combinations.
   * @param {string} rawDataInput - The complete input string from stdin.
   */
  const processSwitchLampChallenge = (rawDataInput) => {
    // Split the entire input into individual lines, filtering out any blank lines.
    const inputLinesArray = rawDataInput.split("\n").filter(line => line.trim().length > 0);

    // --- Input Validation ---
    // Minimum required lines: 1 (N M) + M (lamp configs) + 1 (parity expectations)
    // If M is 0, then 2 lines (N M, and parity).
    if (inputLinesArray.length < 2) {
      console.error("Error: Insufficient input lines provided. Expected at least N M line and parity line.");
      return;
    }

    // Parse the first line to get total switch count (N) and total lamp count (M).
    const firstLineNumericValues = extractIntegersFromLine(inputLinesArray[0]);

    // Use custom helper for destructuring [N, M] from the first line values.
    const [_firstLineSplitAll, _firstLineSplitLimited] = _extractSpecificItems(firstLineNumericValues, 2);
    const totalSwitchCount = _firstLineSplitLimited[0]; // N: total number of switches
    const totalLampCount = _firstLineSplitLimited[1];   // M: total number of lamps

    // Further validation for N and M.
    if (totalSwitchCount < 0 || totalLampCount < 0) {
      console.error("Error: Number of switches or lamps cannot be negative.");
      return;
    }
    if (totalSwitchCount === 0 && totalLampCount > 0) {
      console.error("Error: Cannot power lamps with zero switches.");
      return;
    }
    if (inputLinesArray.length < totalLampCount + 2) { // N,M line + M lamp lines + P line
        console.error(`Error: Expected ${totalLampCount + 2} lines for configuration, but received ${inputLinesArray.length}.`);
        return;
    }


    // Parse lamp configurations from subsequent lines.
    // Each lamp configuration includes the indices of switches it's connected to.
    const lampConfigurations = [];
    for (let currentLampIndex = 0; currentLampIndex < totalLampCount; ++currentLampIndex) {
      const currentLampDescriptionLine = inputLinesArray[currentLampIndex + 1]; // +1 to skip the N,M line
      const parsedSwitchIdentifiers = extractIntegersFromLine(currentLampDescriptionLine);

      // Use custom helper for destructuring [k, ...s] from lamp switch data.
      const _allLampSwitchData = _collectAllItems(parsedSwitchIdentifiers);
      // The first element 'k' (count of connected switches) is redundant as it's `s.length`.
      // We only need the switch indices 's'.
      const connectedSwitchIdentifiers = _allLampSwitchData.slice(1); // s: 1-indexed switch numbers

      // Store lamp details: only the switches it's connected to, and its original index.
      lampConfigurations.push({
        connectedSwitchIndices: connectedSwitchIdentifiers,
        lampOriginalIndex: currentLampIndex // Retain index for parity lookup
      });
    }

    // Parse the required parity states for each lamp.
    // This is the line immediately following all lamp configuration lines.
    const requiredParityStates = extractIntegersFromLine(inputLinesArray[totalLampCount + 1]);

    // Validate parity expectations array length
    if (requiredParityStates.length !== totalLampCount) {
        console.error(`Error: Mismatch in number of parity expectations. Expected ${totalLampCount}, got ${requiredParityStates.length}.`);
        return;
    }

    // Initialize counter for valid switch combinations.
    let satisfyingConfigurationsCount = 0;

    /**
     * Helper function to determine if a single lamp's current state matches its required parity.
     * @param {number} currentSwitchStateMask - A bitmask representing the state of all switches.
     * @param {object} lampDetails - An object containing `connectedSwitchIndices`.
     * @param {number} expectedParity - The required parity (0 or 1) for this lamp.
     * @returns {boolean} True if the lamp's parity matches the expectation, false otherwise.
     */
    const evaluateLampParity = (currentSwitchStateMask, lampDetails, expectedParity) => {
      let activeConnectedSwitchCount = 0;
      // Iterate through each switch connected to the current lamp.
      for (const switchID of lampDetails.connectedSwitchIndices) {
        // Check if the `switchID`-th switch (1-indexed) is 'on' in the current combination mask.
        // `(1 << (switchID - 1))` creates a bitmask for the specific switch.
        // `>>>` is unsigned right shift, then `& 1` checks the least significant bit.
        if (((currentSwitchStateMask >>> (switchID - 1)) & 1) === 1) {
          activeConnectedSwitchCount++;
        }
      }
      // Return true if the count of active switches has the expected parity.
      return (activeConnectedSwitchCount % 2) === expectedParity;
    };

    // Iterate through all possible combinations of switch states.
    // For N switches, there are 2^N combinations.
    // Using bit shift (`1 << N`) is an efficient way to calculate 2^N.
    const totalPossibleCombinations = (totalSwitchCount > 30) ? Number.MAX_SAFE_INTEGER : (1 << totalSwitchCount); // Guard against too large N

    // Outer loop: each iteration represents a unique combination of switch states.
    // The `currentSwitchStateMask` is a bitmask where each bit (0 to N-1) corresponds to a switch (0=off, 1=on).
    combinationEvaluationLoop: for (let currentSwitchStateMask = 0; currentSwitchStateMask < totalPossibleCombinations; ++currentSwitchStateMask) {
      // Assume the current combination is valid until a lamp's parity requirement is not met.
      let isCurrentCombinationValid = true;

      // Inner loop: check each lamp against the current switch combination.
      for (const lampConfig of lampConfigurations) {
        const lampIdx = lampConfig.lampOriginalIndex;
        const requiredParity = requiredParityStates[lampIdx];

        // Use the helper function to determine if this lamp is satisfied by the current switch state.
        if (!evaluateLampParity(currentSwitchStateMask, lampConfig, requiredParity)) {
          isCurrentCombinationValid = false;
          continue combinationEvaluationLoop; // If even one lamp fails, this combination is invalid. Move to the next.
        }
      }

      // If the loop completes without `isCurrentCombinationValid` becoming false,
      // it means all lamps were satisfied by this combination.
      if (isCurrentCombinationValid) {
        satisfyingConfigurationsCount++;
      }
    }

    // Output the final count of satisfying switch configurations.
    console.log(satisfyingConfigurationsCount);
  };

  // --- Input Reading and Execution ---
  // Read input from standard input (/dev/stdin) and pass it to the main processing function.
  // A try-catch block is used for robust error handling during file reading.
  try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processSwitchLampChallenge(fileContent);
  } catch (err) {
    console.error("Failed to read input from /dev/stdin:", err.message);
    // In a production environment, one might exit the process with a non-zero code.
    // process.exit(1);
  }

})(); // End of main IIFE